import React, { useState } from 'react'
import logo from '../images/logo.png'
import styled, { keyframes } from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'

import CustomRoomGrid from './CustomRoomGrid'
import { CreateRoomForm } from './CreateRoomForm'
import { useAppSelector } from '../hooks'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

const Backdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 60px;
  align-items: center;
  z-index: 100;
  width: 100%;
  pointer-events: none;
`

const Wrapper = styled.div`
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  color: #eeeeee;
  width: 90%;
  max-width: 900px; /* Increased width for grid */
  pointer-events: auto;
  animation: ${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const CustomRoomWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;

  .left-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`

const Title = styled.h1`
  font-size: 28px;
  color: #f1f5f9;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const SubTitle = styled.h2`
  font-size: 20px;
  color: #cbd5e1;
  font-weight: 500;
  margin: 0 0 24px 0;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    height: 80px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.3));
  }
`

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30, 41, 59, 0.9);
  padding: 20px 40px;
  border-radius: 16px;
  pointer-events: auto;
  border: 1px solid rgba(255,255,255,0.1);

  h3 {
    color: #818cf8;
    margin: 0 0 10px 0;
  }
`

const ProgressBar = styled(LinearProgress)`
  width: 300px;
  height: 8px !important;
  border-radius: 4px;
  
  .MuiLinearProgress-bar {
    background-color: #6366f1;
  }
  
  background-color: rgba(255,255,255,0.1) !important;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const ActionButton = styled(Button)`
  && {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    font-size: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    
    &.primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      &:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
      }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.05);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
`

export default function RoomSelectionDialog() {
  const [showCustomRoom, setShowCustomRoom] = useState(false)
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)

  const handleConnect = () => {
    if (lobbyJoined) {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.network
        .joinOrCreatePublic()
        .then(() => bootstrap.launchGame())
        .catch((error) => console.error(error))
    } else {
      setShowSnackbar(true)
    }
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert
          severity="error"
          variant="filled"
          style={{ 
            background: '#ef4444', 
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)'
          }}
        >
          Connecting to server... Please wait!
        </Alert>
      </Snackbar>
      <Backdrop>
        <Wrapper>
          {showCreateRoomForm ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <div className="left-section">
                  <IconButton 
                    onClick={() => setShowCreateRoomForm(false)}
                    style={{ color: '#94a3b8' }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Title>Create New Room</Title>
                </div>
              </TitleWrapper>
              <CreateRoomForm />
            </CustomRoomWrapper>
          ) : showCustomRoom ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <div className="left-section">
                  <IconButton 
                    onClick={() => setShowCustomRoom(false)}
                    style={{ color: '#94a3b8' }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Title>
                    Public Rooms
                    <Tooltip title="Real-time updates" placement="top">
                      <IconButton size="small" style={{ color: '#6366f1' }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Title>
                </div>
                <ActionButton
                  className="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCreateRoomForm(true)}
                >
                  Create Room
                </ActionButton>
              </TitleWrapper>
              <CustomRoomGrid />
            </CustomRoomWrapper>
          ) : (
            <Content>
              <img src={logo} alt="MetaMesh" />
              <div style={{ textAlign: 'center' }}>
                <Title style={{ justifyContent: 'center', marginBottom: 8 }}>MetaMesh Lobby</Title>
                <SubTitle>Where would you like to go today?</SubTitle>
              </div>
              
              <ButtonGroup>
                <ActionButton 
                  className="primary" 
                  onClick={handleConnect}
                  startIcon={<LoginIcon />}
                  size="large"
                >
                  Join Public Lobby
                </ActionButton>
                <ActionButton
                  className="secondary"
                  onClick={() => (lobbyJoined ? setShowCustomRoom(true) : setShowSnackbar(true))}
                  startIcon={<AddIcon />}
                  size="large"
                >
                  Browse Custom Rooms
                </ActionButton>
              </ButtonGroup>
            </Content>
          )}
        </Wrapper>
        {!lobbyJoined && (
          <ProgressBarWrapper>
            <h3>Connecting to server...</h3>
            <ProgressBar />
          </ProgressBarWrapper>
        )}
      </Backdrop>
    </>
  )
}
