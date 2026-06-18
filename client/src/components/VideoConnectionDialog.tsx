import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setFullscreenPeer } from '../stores/VideoStore'
import { PeerStream } from '../stores/VideoStore'

// ─── animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); }`
const slideIn = keyframes`from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); }`

// ─── panel container (right-side column) ─────────────────────────────────────
const PanelRoot = styled.div`
  position: fixed;
  top: 80px;
  right: 16px;
  bottom: 16px;
  width: 220px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
`

// ─── single video tile ────────────────────────────────────────────────────────
const TileWrap = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  border: 1.5px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: ${slideIn} 0.3s ease-out;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.7);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(0, 0, 0, 0.6);
  }

  ${({ $fullscreen }) =>
    $fullscreen &&
    css`
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      border-radius: 0 !important;
      z-index: 200 !important;
      border: none !important;
      animation: ${fadeIn} 0.25s ease-out;
    `}
`

const StyledVideo = styled.video<{ $fullscreen?: boolean }>`
  width: 100%;
  display: block;
  aspect-ratio: ${({ $fullscreen }) => ($fullscreen ? 'unset' : '4/3')};
  height: ${({ $fullscreen }) => ($fullscreen ? '100vh' : 'auto')};
  object-fit: cover;
  background: #0a0f1e;
`

const TileLabel = styled.div`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #e2e8f0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  padding: 2px 7px;
  border-radius: 8px;
  pointer-events: none;
  letter-spacing: 0.02em;
`

const TileControls = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  ${TileWrap}:hover & {
    opacity: 1;
  }
`

const TileBtn = styled(IconButton)`
  && {
    width: 28px;
    height: 28px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px;
    &:hover { background: rgba(99, 102, 241, 0.8); }
  }
`

const NoVideoBox = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #475569;
  font-size: 0.75rem;
  svg { font-size: 2rem; opacity: 0.4; }
`

// ─── bottom connect prompt (shown before camera is connected) ─────────────────
const ConnectCard = styled.div`
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${fadeIn} 0.3s ease-out;
`

const ConnectBtn = styled.button`
  width: 100%;
  padding: 9px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
  }
`

// ─── fullscreen overlay backdrop ──────────────────────────────────────────────
const FullscreenBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 199;
  backdrop-filter: blur(4px);
`

const FullscreenBar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 201;
  display: flex;
  gap: 12px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 40px;
  padding: 10px 20px;
  backdrop-filter: blur(12px);
`

const MeetBtn = styled(IconButton)<{ $danger?: boolean }>`
  && {
    background: ${({ $danger }) => ($danger ? 'rgba(239,68,68,0.85)' : 'rgba(99,102,241,0.85)')};
    color: white;
    width: 44px;
    height: 44px;
    transition: all 0.2s ease;
    &:hover {
      background: ${({ $danger }) => ($danger ? '#dc2626' : '#4f46e5')};
      transform: scale(1.1);
    }
  }
`

// ─── video tile component ─────────────────────────────────────────────────────
interface VideoTileProps {
  stream: MediaStream
  label: string
  muted?: boolean
  peerId: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

function VideoTile({ stream, label, muted = false, peerId, isFullscreen, onToggleFullscreen }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
  }, [stream])

  return (
    <>
      {isFullscreen && <FullscreenBackdrop onClick={onToggleFullscreen} />}
      <TileWrap $fullscreen={isFullscreen} onClick={!isFullscreen ? onToggleFullscreen : undefined}>
        <StyledVideo
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          $fullscreen={isFullscreen}
        />
        <TileLabel>{label}</TileLabel>
        <TileControls>
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <TileBtn size="small" onClick={(e) => { e.stopPropagation(); onToggleFullscreen() }}>
              {isFullscreen ? <FullscreenExitIcon style={{ fontSize: 16 }} /> : <FullscreenIcon style={{ fontSize: 16 }} />}
            </TileBtn>
          </Tooltip>
        </TileControls>
      </TileWrap>

      {isFullscreen && (
        <FullscreenBar>
          <Tooltip title="Exit fullscreen">
            <MeetBtn onClick={onToggleFullscreen}>
              <FullscreenExitIcon />
            </MeetBtn>
          </Tooltip>
        </FullscreenBar>
      )}
    </>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VideoConnectionDialog() {
  const dispatch = useAppDispatch()
  const myStream = useAppSelector((state) => state.video.myStream)
  const peers = useAppSelector((state) => state.video.peers)
  const fullscreenPeerId = useAppSelector((state) => state.video.fullscreenPeerId)

  // Use myStream presence as the truth — avoids stale videoConnected flag
  const videoConnected = myStream !== null

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [warnDismissed, setWarnDismissed] = useState(false)

  const getStream = useCallback((): MediaStream | undefined => {
    try {
      const game = phaserGame.scene.keys.game as Game
      return (game?.network?.webRTC as any)?.myStream as MediaStream | undefined
    } catch { return undefined }
  }, [])

  const handleMicToggle = () => {
    const stream = getStream()
    if (stream) {
      const track = stream.getAudioTracks()[0]
      if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); return }
    }
    setMicOn((p) => !p)
  }

  const handleCamToggle = () => {
    const stream = getStream()
    if (stream) {
      const track = stream.getVideoTracks()[0]
      if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); return }
    }
    setCamOn((p) => !p)
  }

  const toggleFullscreen = (peerId: string) => {
    dispatch(setFullscreenPeer(fullscreenPeerId === peerId ? null : peerId))
  }

  // ── connected state ─────────────────────────────────────────────────────────
  if (videoConnected) {
    return (
      <PanelRoot>
        {/* Own video tile */}
        {myStream && (
          <VideoTile
            stream={myStream}
            label="You"
            muted
            peerId="self"
            isFullscreen={fullscreenPeerId === 'self'}
            onToggleFullscreen={() => toggleFullscreen('self')}
          />
        )}

        {/* Remote peer tiles */}
        {peers.map((peer: PeerStream) => (
          <VideoTile
            key={peer.peerId}
            stream={peer.stream}
            label={peer.label}
            muted={false}
            peerId={peer.peerId}
            isFullscreen={fullscreenPeerId === peer.peerId}
            onToggleFullscreen={() => toggleFullscreen(peer.peerId)}
          />
        ))}



        {/* Mic / cam controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
          <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
            <MeetBtn $danger={!micOn} size="small" onClick={handleMicToggle} style={{ width: 36, height: 36 }}>
              {micOn ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
            </MeetBtn>
          </Tooltip>
          <Tooltip title={camOn ? 'Camera off' : 'Camera on'}>
            <MeetBtn $danger={!camOn} size="small" onClick={handleCamToggle} style={{ width: 36, height: 36 }}>
              {camOn ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
            </MeetBtn>
          </Tooltip>
        </div>
      </PanelRoot>
    )
  }

  // ── not yet connected ───────────────────────────────────────────────────────
  return (
    <PanelRoot>
      <ConnectCard>
        {!warnDismissed && (
          <Alert
            severity="warning"
            onClose={() => setWarnDismissed(true)}
            style={{
              borderRadius: 10,
              background: 'rgba(30,41,59,0.95)',
              border: '1px solid rgba(234,179,8,0.3)',
              color: '#fef08a',
              fontSize: '0.78rem',
              padding: '4px 10px',
            }}
          >
            <AlertTitle style={{ fontSize: '0.82rem', color: '#fde047' }}>No webcam</AlertTitle>
            Connect for proximity video chat!
          </Alert>
        )}

        <NoVideoBox>
          <PersonIcon />
          <span>Camera not connected</span>
        </NoVideoBox>

        <ConnectBtn
          onClick={() => {
            const game = phaserGame.scene.keys.game as Game
            game.network.webRTC?.getUserMedia()
          }}
        >
          Connect Webcam
        </ConnectBtn>
      </ConnectCard>
    </PanelRoot>
  )
}
