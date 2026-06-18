import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'

import { useAppSelector, useAppDispatch } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  background: #1e293b;
  color: #f1f5f9;
`

const Sidebar = styled.div`
  width: 250px;
  background: rgba(15, 23, 42, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
`

const SidebarItem = styled.div<{ active?: boolean }>`
  padding: 12px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.active ? '#6366f1' : '#94a3b8'};
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#6366f1' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
  }
`

const Content = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`

const SectionTitle = styled.h2`
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
`

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
`

const AvatarWrapper = styled.div`
  position: relative;
  
  .avatar {
    width: 100px;
    height: 100px;
    font-size: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
  }

  .edit-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #6366f1;
    color: white;
    &:hover {
      background: #4f46e5;
    }
  }
`

const FormGrid = styled.div`
  display: grid;
  gap: 24px;
  max-width: 600px;
`

interface ProfileDialogProps {
  open: boolean
  onClose: () => void
}

export default function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const user = useAppSelector((state) => state.user)
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState(user.username || '')

  const handleSave = () => {
    // Implement save logic (API call)
    // For now, just exit edit mode
    setEditMode(false)
    const game = phaserGame.scene.keys.game as Game
    game.myPlayer.setPlayerName(username)
    game.network.updatePlayerName(username)
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        style: { background: '#1e293b' }
      }}
    >
      <Wrapper>
        <Sidebar>
          <div style={{ padding: '0 24px 24px', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Settings
          </div>
          <SidebarItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <PersonIcon /> Profile
          </SidebarItem>
          <SidebarItem active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
            <SecurityIcon /> Account
          </SidebarItem>
          <SidebarItem active={activeTab === 'app'} onClick={() => setActiveTab('app')}>
            <SettingsIcon /> Application
          </SidebarItem>
        </Sidebar>

        <Content>
          <div style={{ position: 'absolute', top: 24, right: 24 }}>
             <IconButton onClick={onClose} style={{ color: '#94a3b8' }}>
               <CloseIcon />
             </IconButton>
          </div>

          {activeTab === 'profile' && (
            <>
              <SectionTitle>
                <PersonIcon /> Public Profile
              </SectionTitle>
              
              <ProfileHeader>
                <AvatarWrapper>
                  <Avatar 
                    className="avatar"
                    src={user.avatarUrl || ''} 
                    style={{ background: getColorByString(username) }}
                  >
                    {getAvatarString(username)}
                  </Avatar>
                  <IconButton className="edit-btn" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </AvatarWrapper>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{username}</h3>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8' }}>Customize how others see you in MetaMesh</p>
                </div>
              </ProfileHeader>

              <FormGrid>
                <TextField 
                  label="Display Name" 
                  variant="outlined" 
                  value={username}
                  disabled={!editMode}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    style: { color: '#f1f5f9' },
                  }}
                  InputLabelProps={{
                    style: { color: '#94a3b8' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    }
                  }}
                />
                
                <div style={{ display: 'flex', gap: 16 }}>
                  {editMode ? (
                    <>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ background: '#6366f1', '&:hover': { background: '#4f46e5' } }}
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setEditMode(false)
                          setUsername(user.username || '')
                        }}
                        sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      sx={{ background: 'rgba(255,255,255,0.05)', color: '#f1f5f9' }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </FormGrid>
            </>
          )}

          {activeTab === 'account' && (
             <>
               <SectionTitle><SecurityIcon /> Account Security</SectionTitle>
               <p style={{ color: '#94a3b8' }}>Password change and email settings coming soon.</p>
             </>
          )}

          {activeTab === 'app' && (
             <>
               <SectionTitle><SettingsIcon /> Application Settings</SectionTitle>
               <p style={{ color: '#94a3b8' }}>Audio and video settings coming soon.</p>
             </>
          )}
        </Content>
      </Wrapper>
    </Dialog>
  )
}
