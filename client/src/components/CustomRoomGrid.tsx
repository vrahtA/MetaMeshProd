import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import LockIcon from '@mui/icons-material/Lock'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'

import { useAppSelector } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }
`

const RoomCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeIn} 0.5s ease-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #ec4899);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const RoomAvatar = styled(Avatar)`
  width: 48px;
  height: 48px;
  font-size: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
`

const RoomInfo = styled.div`
  overflow: hidden;
  
  h3 {
    margin: 0;
    color: #f1f5f9;
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
`

const UserCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.9rem;
  
  svg {
    font-size: 18px;
  }
`

const StyledSearchBar = styled(TextField)`
  margin-bottom: 24px;
  width: 100%;

  .MuiOutlinedInput-root {
    background: rgba(30, 41, 59, 0.4);
    border-radius: 12px;
    color: #f1f5f9;
    
    fieldset {
      border-color: rgba(148, 163, 184, 0.2);
    }
    
    &:hover fieldset {
      border-color: rgba(99, 102, 241, 0.5);
    }
    
    &.Mui-focused fieldset {
      border-color: #6366f1;
    }
  }
  
  .MuiInputLabel-root {
    color: #94a3b8;
    &.Mui-focused {
      color: #6366f1;
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  grid-column: 1 / -1;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 1.1rem;
  }
`

const PasswordDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    color: #f1f5f9;
  }
  
  .MuiDialogContent-root {
    padding: 24px;
  }
  
  .MuiDialogActions-root {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`

export default function CustomRoomGrid() {
  const [password, setPassword] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const availableRooms = useAppSelector((state) => state.room.availableRooms)

  const handleJoinClick = (roomId: string, password: string | null) => {
    if (!lobbyJoined) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network
      .joinCustomById(roomId, password)
      .then(() => bootstrap.launchGame())
      .catch((error) => {
        console.error(error)
        if (password) setShowPasswordError(true)
      })
  }

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password) handleJoinClick(selectedRoom, password)
  }

  const onRoomClick = (roomId: string, hasPassword: boolean) => {
    if (hasPassword) {
      setSelectedRoom(roomId)
      setShowPasswordDialog(true)
      setPassword('')
      setShowPasswordError(false)
    } else {
      handleJoinClick(roomId, null)
    }
  }

  const filteredRooms = availableRooms.filter(room => 
    room.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomId.includes(searchQuery)
  )

  return (
    <>
      <StyledSearchBar
        placeholder="Search rooms by name or ID..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon style={{ color: '#94a3b8' }} />
            </InputAdornment>
          ),
        }}
      />
      
      <GridContainer>
        {filteredRooms.length === 0 ? (
          <EmptyState>
            <MeetingRoomIcon />
            <p>No rooms found. Create one to get started!</p>
          </EmptyState>
        ) : (
          filteredRooms.map((room) => {
            const { roomId, metadata, clients } = room
            const { name, description, hasPassword } = metadata
            
            return (
              <RoomCard key={roomId} onClick={() => onRoomClick(roomId, hasPassword)}>
                <CardHeader>
                  <RoomAvatar style={{ background: getColorByString(name) }}>
                    {getAvatarString(name)}
                  </RoomAvatar>
                  <RoomInfo>
                    <h3>{name}</h3>
                    <Tooltip title={description} placement="top">
                      <p>{description || 'No description'}</p>
                    </Tooltip>
                  </RoomInfo>
                </CardHeader>
                
                <CardFooter>
                  <UserCount>
                    <PeopleAltIcon />
                    {clients} / {metadata.maxClients || 'Inf'}
                  </UserCount>
                  {hasPassword && (
                    <Tooltip title="Password Protected">
                      <LockIcon style={{ color: '#ec4899', fontSize: 18 }} />
                    </Tooltip>
                  )}
                </CardFooter>
              </RoomCard>
            )
          })
        )}
      </GridContainer>

      <PasswordDialog 
        open={showPasswordDialog} 
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent>
            <h3 style={{ margin: '0 0 16px 0', color: '#f1f5f9' }}>Password Required</h3>
            <TextField
              autoFocus
              fullWidth
              value={password}
              label="Enter Room Password"
              type="password"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              error={showPasswordError}
              helperText={showPasswordError ? 'Incorrect Password' : ''}
              InputProps={{
                style: { color: '#f1f5f9' }
              }}
              InputLabelProps={{
                style: { color: '#94a3b8' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)} style={{ color: '#94a3b8' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Join Room
            </Button>
          </DialogActions>
        </form>
      </PasswordDialog>
    </>
  )
}
