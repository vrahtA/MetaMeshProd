import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { EffectCoverflow, Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'

import { useAppDispatch, useAppSelector } from '../hooks'
import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import authService from '../services/authService'
import { setAuthData, setLoggedIn } from '../stores/UserStore'
import { getAvatarString, getColorByString } from '../util'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255,0.1);
  max-height: 90vh;
  overflow-y: auto;
  max-width: 600px;
  width: 90%;
  animation: ${scaleIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(148, 163, 184, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(99, 102, 241, 0.7);
    }
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.5s ease-out 0.1s both;
`

const Title = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
`

const Subtitle = styled.p`
  color: #cbd5e1;
  font-size: 14px;
  margin: 0;
`

const RoomInfo = styled.div`
  background: rgba(51, 65, 85, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`

const RoomName = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
`

const RoomDescription = styled.div`
  font-size: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

const Content = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  animation: ${slideIn} 0.5s ease-out 0.3s both;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 24px;
  }
`

const AvatarSection = styled.div`
  flex: 0 0 auto;
  
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

const AvatarTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  text-align: center;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const AvatarCarousel = styled.div`
  --swiper-navigation-size: 20px;
  --swiper-navigation-color: #6366f1;

  .swiper {
    width: 180px;
    height: 240px;
    border-radius: 16px;
    overflow: hidden;
  }

  .swiper-slide {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid rgba(99, 102, 241, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .swiper-slide-active {
    border-color: #6366f1;
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
    transform: scale(1.05);
  }

  .swiper-slide img {
    display: block;
    width: 110px;
    height: 150px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  .swiper-button-prev,
  .swiper-button-next {
    background: rgba(99, 102, 241, 0.2);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    
    &:hover {
      background: rgba(99, 102, 241, 0.4);
    }
    
    &::after {
      font-size: 14px;
    }
  }
`

const FormSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const StyledTextField = styled(TextField)`
  && {
    .MuiOutlinedInput-root {
      background: rgba(51, 65, 85, 0.5);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(51, 65, 85, 0.7);
      }
      
      &.Mui-focused {
        background: rgba(51, 65, 85, 0.8);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
      
      fieldset {
        border-color: rgba(148, 163, 184, 0.2);
      }
      
      &:hover fieldset {
        border-color: rgba(99, 102, 241, 0.4);
      }
      
      &.Mui-focused fieldset {
        border-color: #6366f1;
        border-width: 2px;
      }
    }
    
    .MuiInputLabel-root {
      color: #94a3b8;
      
      &.Mui-focused {
        color: #6366f1;
      }
    }
    
    .MuiInputBase-input {
      color: #f1f5f9;
    }
    
    .MuiFormHelperText-root {
      margin-left: 4px;
    }
  }
`

const PasswordStrength = styled.div`
  margin-top: -12px;
  margin-bottom: 8px;
`

const StrengthBar = styled.div`
  height: 4px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
  
  .fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 2px;
  }
`

const StrengthText = styled.p`
  font-size: 12px;
  margin: 0;
  color: ${props => props.color || '#94a3b8'};
`

const ActionButton = styled(Button)`
  && {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    text-transform: none;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background: rgba(148, 163, 184, 0.2);
      color: rgba(148, 163, 184, 0.5);
      box-shadow: none;
    }
  }
`

const ToggleText = styled.p`
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  margin: 16px 0 0 0;

  span {
    color: #6366f1;
    cursor: pointer;
    font-weight: 600;
    transition: color 0.2s ease;
    
    &:hover {
      color: #8b5cf6;
      text-decoration: underline;
    }
  }
`

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #10b981;
  animation: ${fadeIn} 0.3s ease-out;
  
  svg {
    font-size: 24px;
  }
`

const avatars = [
  { name: 'adam', img: Adam },
  { name: 'ash', img: Ash },
  { name: 'lucy', img: Lucy },
  { name: 'nancy', img: Nancy },
]

for (let i = avatars.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[avatars[i], avatars[j]] = [avatars[j], avatars[i]]
}

export default function LoginDialog() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [avatarIndex, setAvatarIndex] = useState<number>(0)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false)
const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)

  const dispatch = useAppDispatch()
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const game = phaserGame.scene.keys.game as Game

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 10) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10
    
    setPasswordStrength(Math.min(strength, 100))
  }, [password])

  const getStrengthColor = () => {
    if (passwordStrength < 30) return '#ef4444'
    if (passwordStrength < 60) return '#f59e0b'
    if (passwordStrength < 80) return '#3b82f6'
    return '#10b981'
  }

  const getStrengthText = () => {
    if (passwordStrength < 30) return 'Weak'
    if (passwordStrength < 60) return 'Fair'
    if (passwordStrength < 80) return 'Good'
    return 'Strong'
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (isRegisterMode && name.trim() === '') {
      newErrors.name = 'Name is required'
    }

    if (email.trim() === '') {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (password === '') {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (isRegisterMode) {
      if (confirmPassword === '') {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!roomJoined) {
      setErrors({ general: 'Please join a room first' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      let response

      if (isRegisterMode) {
        response = await authService.register({
          email,
          password,
          username: name,
          avatar: avatars[avatarIndex].name,
        })
      } else {
        response = await authService.login({
          email,
          password,
        })
      }

      dispatch(
        setAuthData({
          token: response.token,
          userId: response.user.id,
          email: response.user.email,
          username: response.user.username,
        })
      )

      setSuccess(true)
      
      setTimeout(() => {
        game.registerKeys()
        game.myPlayer.setPlayerName(response.user.username)
        game.myPlayer.setPlayerTexture(response.user.avatar)
        game.network.readyToConnect()
        dispatch(setLoggedIn(true))
      }, 800)
    } catch (error: any) {
      setErrors({ general: error.message || 'Authentication failed' })
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setErrors({})
    setPassword('')
    setConfirmPassword('')
  }

  if (success) {
    return (
      <Wrapper onSubmit={(e) => e.preventDefault()}>
        <SuccessMessage>
          <CheckCircleIcon />
          <div>
            <strong>Success!</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
              Entering MetaMesh...
            </p>
          </div>
        </SuccessMessage>
      </Wrapper>
    )
  }

  return (
    <Wrapper onSubmit={handleSubmit}>
      <Header>
        <Title>{isRegisterMode ? 'Join MetaMesh' : 'Welcome Back'}</Title>
        <Subtitle>
          {isRegisterMode
            ? 'Create your account to get started'
            : 'Sign in to continue your journey'}
        </Subtitle>
      </Header>

      <RoomInfo>
        <RoomName>
          <Avatar style={{ background: getColorByString(roomName) }}>
            {getAvatarString(roomName)}
          </Avatar>
          <h3>{roomName}</h3>
        </RoomName>
        <RoomDescription>
          <ArrowRightIcon fontSize="small" />
          {roomDescription}
        </RoomDescription>
      </RoomInfo>

      <Content>
        {isRegisterMode && (
          <AvatarSection>
            <AvatarTitle>Choose Avatar</AvatarTitle>
            <AvatarCarousel>
              <Swiper
                modules={[Navigation, EffectCoverflow]}
                navigation
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={1}
                coverflowEffect={{
                  rotate: 50,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: false,
                }}
                onSlideChange={(swiper) => {
                  setAvatarIndex(swiper.activeIndex)
                }}
              >
                {avatars.map((avatar) => (
                  <SwiperSlide key={avatar.name}>
                    <img src={avatar.img} alt={avatar.name} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </AvatarCarousel>
          </AvatarSection>
        )}

        <FormSection>
          {isRegisterMode && (
            <StyledTextField
              fullWidth
              label="Display Name"
              variant="outlined"
              color="secondary"
              error={!!errors.name}
              helperText={errors.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          )}

          <StyledTextField
            fullWidth
            label="Email Address"
            variant="outlined"
            color="secondary"
            type="email"
            error={!!errors.email}
            helperText={errors.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <StyledTextField
            fullWidth
            label="Password"
            variant="outlined"
            color="secondary"
            type={showPassword ? 'text' : 'password'}
            error={!!errors.password}
            helperText={errors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    style={{ color: '#94a3b8' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {isRegisterMode && password && (
            <PasswordStrength>
              <StrengthBar>
                <div
                  className="fill"
                  style={{
                    width: `${passwordStrength}%`,
                    background: getStrengthColor(),
                  }}
                />
              </StrengthBar>
              <StrengthText color={getStrengthColor()}>
                Password strength: {getStrengthText()}
              </StrengthText>
            </PasswordStrength>
          )}

          {isRegisterMode && (
            <StyledTextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              color="secondary"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          )}

          {errors.general && (
            <Alert severity="error" style={{ borderRadius: '12px' }}>
              <AlertTitle>Error</AlertTitle>
              {errors.general}
            </Alert>
          )}

          {!videoConnected && !isRegisterMode && (
            <Alert
              severity="warning"
              variant="outlined"
              style={{ borderRadius: '12px' }}
            >
              <AlertTitle>No Webcam Detected</AlertTitle>
              Connect a webcam for the best experience
              <Button
                variant="outlined"
                size="small"
                color="warning"
                onClick={() => {
                  game.network.webRTC?.getUserMedia()
                }}
                style={{ marginTop: 8 }}
              >
                Connect Webcam
              </Button>
            </Alert>
          )}

          {videoConnected && (
            <Alert
              severity="success"
              variant="outlined"
              style={{ borderRadius: '12px' }}
            >
              Webcam connected!
            </Alert>
          )}

          <ActionButton
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={20} style={{ marginRight: 8, color: 'white' }} />
                Please wait...
              </>
            ) : isRegisterMode ? (
              'Create Account & Join'
            ) : (
              'Sign In & Join'
            )}
          </ActionButton>

          <ToggleText>
            {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={toggleMode}>
              {isRegisterMode ? 'Sign in' : 'Create one'}
            </span>
          </ToggleText>
        </FormSection>
      </Content>
    </Wrapper>
  )
}
