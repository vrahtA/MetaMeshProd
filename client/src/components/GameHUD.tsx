import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LightModeIcon from '@mui/icons-material/LightMode'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import LogoutIcon from '@mui/icons-material/Logout'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { BackgroundMode } from '../../../types/BackgroundMode'
import { useAppDispatch, useAppSelector } from '../hooks'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { setLoggedIn, toggleBackgroundMode } from '../stores/UserStore'
import { getAvatarString, getColorByString } from '../util'
import ProfileDialog from './ProfileDialog'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`

const TopBar = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: auto;
  animation: ${fadeIn} 0.5s ease-out;
`

const RoomInfoCard = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  span {
    font-size: 0.8rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
`

const UserControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const ControlButton = styled(IconButton)`
  && {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    
    &:hover {
      background: rgba(51, 65, 85, 0.9);
    }
    
    &.active {
      background: #6366f1;
      border-color: #6366f1;
      
      &:hover {
        background: #4f46e5;
      }
    }
    
    &.danger {
      background: #ef4444;
      border-color: #ef4444;
      
      &:hover {
        background: #dc2626;
      }
    }
  }
`

const ProfileCard = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  padding: 8px 16px 8px 8px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(51, 65, 85, 0.9);
  }
  
  .info {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .status {
      font-size: 0.75rem;
      color: #10b981;
    }
  }
`

const NotificationBadge = styled(Badge)`
  .MuiBadge-badge {
    background-color: #ef4444;
  }
`

const ControlsDialog = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 41, 59, 0.95);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 300px;
  animation: ${fadeIn} 0.3s ease-out;
  pointer-events: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  
  h3 {
    margin-top: 0;
    color: #818cf8;
  }

  ul {
    padding-left: 20px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #94a3b8;
  }
`

export default function GameHUD() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const room = useAppSelector((state) => state.room)

  const [showHelp, setShowHelp] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setShowProfile(true)
  }
  
  const handleClose = () => {
    setAnchorEl(null)
  }
  
  const handleLogout = () => {
    handleClose()
    const game = phaserGame.scene.keys.game as Game
    game.network.disconnect()
    dispatch(setLoggedIn(false))
  }

  return (
    <HUDContainer>
      <TopBar>
        <RoomInfoCard>
          <h3>{room.roomName || 'MetaMesh Lobby'}</h3>
          <span>
            <PeopleIcon fontSize="small" />
            {room.roomId ? `ID: ${room.roomId}` : 'Public Space'}
          </span>
        </RoomInfoCard>

        <UserControls>
          {/* Theme Toggle */}
          <Tooltip title="Switch Theme">
            <ControlButton onClick={() => dispatch(toggleBackgroundMode())}>
              {user.backgroundMode === BackgroundMode.DAY ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </ControlButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Controls Guide">
            <ControlButton onClick={() => setShowHelp(true)}>
              <HelpOutlineIcon fontSize="small" />
            </ControlButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Leave Room */}
          <Tooltip title="Leave Room">
            <ControlButton onClick={handleLogout} className="danger">
              <ExitToAppIcon fontSize="small" />
            </ControlButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Quick Actions */}
          <Tooltip title="Notifications">
            <ControlButton>
              <NotificationBadge badgeContent={2} variant="dot">
                <NotificationsIcon fontSize="small" />
              </NotificationBadge>
            </ControlButton>
          </Tooltip>

          {/* Profile */}
          <ProfileCard onClick={handleProfileClick}>
            <Avatar 
              src={user.avatarUrl || ''} 
              style={{ background: getColorByString(user.username || '') }}
            >
              {getAvatarString(user.username || '')}
            </Avatar>
            <div className="info">
              <span className="name">{user.username || 'Guest'}</span>
              <span className="status">Online</span>
            </div>
          </ProfileCard>
        </UserControls>
      </TopBar>
      
      {showHelp && (
        <ControlsDialog>
           <IconButton className="close-btn" onClick={() => setShowHelp(false)}>
             <CloseIcon />
           </IconButton>
           <h3>Controls Guide</h3>
           <ul>
             <li><strong>W, A, S, D</strong> to move</li>
             <li><strong>E</strong> to sit down</li>
             <li><strong>R</strong> to use computer</li>
             <li><strong>Enter</strong> to open chat</li>
           </ul>
        </ControlsDialog>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            background: '#1e293b',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 150
          }
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon style={{ color: '#cbd5e1' }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleLogout} style={{ color: '#ef4444' }}>
          <ListItemIcon style={{ color: '#ef4444' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <ProfileDialog open={showProfile} onClose={() => setShowProfile(false)} />
    </HUDContainer>
  )
}
