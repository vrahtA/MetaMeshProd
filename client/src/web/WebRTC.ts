import Peer from 'peerjs'
import Network from '../services/Network'
import store from '../stores'
import { setVideoConnected } from '../stores/UserStore'
import { setMyStream, addPeerStream, removePeerStream } from '../stores/VideoStore'

export default class WebRTC {
  private myPeer: Peer
  private peers = new Map<string, Peer.MediaConnection>()
  private onCalledPeers = new Map<string, Peer.MediaConnection>()
  // Incoming calls received before getUserMedia resolved — answered once stream is ready
  private pendingCalls = new Map<string, Peer.MediaConnection>()
  // Dedicated audio elements for remote streams so audio plays even when
  // the video element is unmounted or off-screen
  private audioElements = new Map<string, HTMLAudioElement>()
  // True once the PeerJS signaling WebSocket is open (and false while reconnecting).
  // Checked before every outgoing call to prevent the 60fps error flood.
  private peerReady = false
  myStream?: MediaStream
  private network: Network

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId)
    this.myPeer = new Peer(sanitizedId, this.buildPeerConfig())
    this.network = network
    console.log('userId:', userId, '→ sanitizedId:', sanitizedId)

    // Mark ready when the signaling WebSocket opens (or reopens after reconnect)
    this.myPeer.on('open', () => {
      this.peerReady = true
      console.log('PeerJS signaling connected')
    })

    // Auto-reconnect when the signaling WebSocket drops.
    // This is common on free hosting (Render, Railway) where the server
    // idles / restarts. Without this, every proximity call throws
    // "Cannot connect to new Peer after disconnecting from server" at 60 fps.
    this.myPeer.on('disconnected', () => {
      this.peerReady = false
      console.warn('PeerJS signaling disconnected — reconnecting in 1 s...')
      setTimeout(() => {
        if (!this.myPeer.destroyed) {
          this.myPeer.reconnect()
        }
      }, 1000)
    })

    this.myPeer.on('error', (err) => {
      console.error('PeerJS error:', err.type, err)
      // 'disconnected' errors fire before the 'disconnected' event; mark not-ready.
      if (err.type === 'disconnected' || err.type === 'server-error') {
        this.peerReady = false
      }
    })

    this.initialize()
  }

  /**
   * Build PeerJS config pointing to our self-hosted /peerjs server.
   * In production, derive host/port from VITE_SERVER_URL.
   * In development, fall back to localhost:2567.
   */
  private buildPeerConfig(): Peer.PeerJSOption {
    const serverUrl = import.meta.env.VITE_SERVER_URL as string | undefined

    // Public STUN servers for basic NAT discovery.
    // TURN servers relay media when direct P2P fails (symmetric NAT, strict firewall).
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Free open-relay TURN servers — replace with your own for high-traffic production
      { urls: 'turn:openrelay.metered.ca:80',        username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443',       username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
    ]

    if (serverUrl) {
      try {
        const url = new URL(serverUrl)
        return {
          host: url.hostname,
          port: url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : 80),
          path: '/peerjs',
          secure: url.protocol === 'https:' || url.protocol === 'wss:',
          config: { iceServers },
        }
      } catch (e) {
        console.warn('WebRTC: Could not parse VITE_SERVER_URL, falling back to defaults', e)
      }
    }

    // Development fallback
    return {
      host: window.location.hostname,
      port: 2567,
      path: '/peerjs',
      secure: false,
      config: { iceServers },
    }
  }

  // PeerJS throws invalid_id if the id contains characters colyseus generates
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G')
  }

  initialize() {
    // Answer incoming calls
    this.myPeer.on('call', (call) => {
      if (this.onCalledPeers.has(call.peer)) return // already connected

      if (this.myStream) {
        // Stream is ready — answer immediately
        this.answerCall(call)
      } else {
        // Stream not yet acquired — buffer the call; we'll answer once getUserMedia resolves
        console.log('Buffering incoming call from', call.peer, '(stream not ready yet)')
        this.pendingCalls.set(call.peer, call)
      }
    })
  }

  /** Wire up and answer a single incoming call with our stream. */
  private answerCall(call: Peer.MediaConnection) {
    call.answer(this.myStream)
    this.onCalledPeers.set(call.peer, call)

    call.on('stream', (remoteStream) => {
      this.addRemoteStream(call.peer, remoteStream)
    })
    call.on('close', () => {
      this.cleanupPeer(call.peer, false)
    })
    call.on('error', (err) => {
      console.error('incoming call error:', err)
      this.cleanupPeer(call.peer, false)
    })
  }

  // ── permissions ────────────────────────────────────────────────────────────

  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false)
    })
  }

  getUserMedia(alertOnError = true) {
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.myStream = stream
        store.dispatch(setMyStream(stream))
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected()

        // Flush any calls that arrived before we had a stream
        this.pendingCalls.forEach((call) => {
          if (!this.onCalledPeers.has(call.peer)) {
            console.log('Answering buffered call from', call.peer)
            this.answerCall(call)
          }
        })
        this.pendingCalls.clear()
      })
      .catch(() => {
        if (alertOnError)
          window.alert('No webcam or microphone found, or permission is blocked')
      })
  }

  // ── outgoing call ──────────────────────────────────────────────────────────

  connectToNewUser(userId: string): boolean {
    if (!this.myStream) return false
    // Skip entirely if the signaling WebSocket is down — prevents the 60fps
    // "Cannot connect to new Peer after disconnecting" error flood.
    if (!this.peerReady || this.myPeer.destroyed) return false
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.peers.has(sanitizedId)) return false // we already placed a call to this peer
    if (this.onCalledPeers.has(sanitizedId)) {
      // The remote peer already called us — we're already receiving their stream.
      // Signal 'connected' without placing a redundant outgoing call.
      return true
    }
    console.log('Calling peer:', sanitizedId)
    try {
      const call = this.myPeer.call(sanitizedId, this.myStream)
      if (!call) return false // peer not yet ready
      this.peers.set(sanitizedId, call)

      call.on('stream', (remoteStream) => {
        this.addRemoteStream(sanitizedId, remoteStream)
      })
      call.on('close', () => {
        this.cleanupPeer(sanitizedId, true)
      })
      call.on('error', (err) => {
        console.error('outgoing call error:', err)
        this.cleanupPeer(sanitizedId, true)
      })
      return true
    } catch (err) {
      console.error('connectToNewUser failed:', err)
      return false
    }
  }

  // ── stream management ──────────────────────────────────────────────────────

  private addRemoteStream(peerId: string, stream: MediaStream) {
    // Dispatch to Redux so React renders the video tile
    store.dispatch(
      addPeerStream({
        peerId,
        stream,
        label: peerId.slice(0, 6),
      })
    )

    // Dedicated <audio> element guarantees audio even when the video tile is
    // off-screen.  We always create one; the React <video> element will handle
    // the visual.
    if (!this.audioElements.has(peerId)) {
      const audio = document.createElement('audio')
      audio.srcObject = stream
      audio.autoplay = true
      audio.playsInline = true
      // Don't set audio.muted — we want the remote user's audio!
      document.body.appendChild(audio)
      this.audioElements.set(peerId, audio)
    }
  }

  private cleanupPeer(peerId: string, isOutgoing: boolean) {
    store.dispatch(removePeerStream(peerId))
    const audio = this.audioElements.get(peerId)
    if (audio) {
      audio.srcObject = null
      audio.remove()
      this.audioElements.delete(peerId)
    }
    if (isOutgoing) this.peers.delete(peerId)
    else this.onCalledPeers.delete(peerId)
  }

  // ── public cleanup ─────────────────────────────────────────────────────────

  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    // Also remove from pendingCalls so we don't answer a dead call later
    this.pendingCalls.delete(sanitizedId)
    const call = this.peers.get(sanitizedId)
    if (call) {
      call.close()
      this.cleanupPeer(sanitizedId, true)
    }
  }

  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    // Also remove from pendingCalls
    this.pendingCalls.delete(sanitizedId)
    const call = this.onCalledPeers.get(sanitizedId)
    if (call) {
      call.close()
      this.cleanupPeer(sanitizedId, false)
    }
  }

  // Legacy — kept for backward-compat; React UI handles controls now
  setUpButtons() {}
}
