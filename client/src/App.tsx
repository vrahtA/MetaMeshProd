import React from 'react'
import styled from 'styled-components'

import { useAppSelector } from './hooks'

import Chat from './components/Chat'
import ComputerDialog from './components/ComputerDialog'
import LoginDialog from './components/LoginDialog'
import RoomSelectionDialog from './components/RoomSelectionDialog'
import VideoConnectionDialog from './components/VideoConnectionDialog'
import WhiteboardDialog from './components/WhiteboardDialog'

import GameHUD from './components/GameHUD'
import LandingPage from './components/LandingPage'

const Backdrop = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`

function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  
  const [showLanding, setShowLanding] = React.useState(true)

  let ui: JSX.Element
  if (showLanding) {
    ui = <LandingPage onGetStarted={() => setShowLanding(false)} />
  } else if (loggedIn) {
    if (computerDialogOpen) {
      /* Render ComputerDialog if user is using a computer. */
      ui = <ComputerDialog />
    } else if (whiteboardDialogOpen) {
      /* Render WhiteboardDialog if user is using a whiteboard. */
      ui = <WhiteboardDialog />
    } else {
      ui = (
        /* Render Chat + VideoConnectionDialog when no dialogs are open */
        <>
          <Chat />
          <VideoConnectionDialog />
        </>
      )
    }
  } else if (roomJoined) {
    /* Render LoginDialog if not logged in but selected a room. */
    ui = <LoginDialog />
  } else {
    /* Render RoomSelectionDialog if yet selected a room. */
    ui = <RoomSelectionDialog />
  }

  return (
    <Backdrop>
      {ui}
      {/* Render GameHUD (which includes controls) if no dialogs are opened. */ }
      {!computerDialogOpen && !whiteboardDialogOpen && !showLanding && <GameHUD />}
    </Backdrop>
  )
}

export default App
