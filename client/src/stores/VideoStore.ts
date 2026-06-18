import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PeerStream {
  peerId: string
  stream: MediaStream
  label: string // display name or peer ID abbreviation
}

interface VideoState {
  myStream: MediaStream | null
  peers: PeerStream[]
  fullscreenPeerId: string | null // null = no fullscreen, 'self' = own stream
}

const initialState: VideoState = {
  myStream: null,
  peers: [],
  fullscreenPeerId: null,
}

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setMyStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.myStream = action.payload
    },
    addPeerStream: (state, action: PayloadAction<PeerStream>) => {
      const existing = state.peers.findIndex((p) => p.peerId === action.payload.peerId)
      if (existing >= 0) {
        state.peers[existing] = action.payload
      } else {
        state.peers.push(action.payload)
      }
    },
    removePeerStream: (state, action: PayloadAction<string>) => {
      state.peers = state.peers.filter((p) => p.peerId !== action.payload)
    },
    clearAllStreams: (state) => {
      state.myStream = null
      state.peers = []
      state.fullscreenPeerId = null
    },
    setFullscreenPeer: (state, action: PayloadAction<string | null>) => {
      state.fullscreenPeerId = action.payload
    },
  },
})

export const {
  setMyStream,
  addPeerStream,
  removePeerStream,
  clearAllStreams,
  setFullscreenPeer,
} = videoSlice.actions

export default videoSlice.reducer
