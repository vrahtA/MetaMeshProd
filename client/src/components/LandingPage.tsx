import React from 'react'
import styled, { keyframes } from 'styled-components'
import Button from '@mui/material/Button'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GroupsIcon from '@mui/icons-material/Groups'
import VideocamIcon from '@mui/icons-material/Videocam'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'

import Logo from '../images/logo.png'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
  100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
`

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  color: white;
  padding: 20px;
`

const BackgroundOrb = styled.div<{ size: string; top: string; left: string; color: string; delay: string }>`
  position: absolute;
  width: ${props => props.size};
  height: ${props => props.size};
  top: ${props => props.top};
  left: ${props => props.left};
  background: ${props => props.color};
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.4;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  z-index: 1;
`

const Content = styled.div`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  animation: ${fadeIn} 0.8s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`

const LogoImg = styled.img`
  width: 280px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
  animation: ${float} 4s ease-in-out infinite;
`

const Title = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  text-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #cbd5e1;
  margin: 0 0 40px 0;
  max-width: 600px;
  line-height: 1.6;
  opacity: 0.9;
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const FeatureCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  svg {
    font-size: 32px;
    color: #818cf8;
  }
  
  div {
    text-align: left;
    
    h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }
  }
`

const StartButton = styled(Button)`
  && {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 16px 48px;
    font-size: 1.2rem;
    font-weight: 700;
    border-radius: 50px;
    text-transform: none;
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    animation: ${glow} 3s infinite;
    
    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.6);
    }
    
    &:active {
      transform: translateY(0);
    }

    svg {
      margin-left: 8px;
    }
  }
`

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <Wrapper>
      {/* Animated Background Elements */}
      <BackgroundOrb size="400px" top="-100px" left="-100px" color="#4f46e5" delay="0s" />
      <BackgroundOrb size="300px" top="50%" left="80%" color="#ec4899" delay="2s" />
      <BackgroundOrb size="250px" top="80%" left="20%" color="#8b5cf6" delay="4s" />

      <Content>
        <LogoImg src={Logo} alt="MetaMesh Logo" />
        <Title>MetaMesh</Title>
        <Subtitle>
          Your immersive virtual workspace. Connect, collaborate, and create in a 
          spatial environment designed for remote teams and communities.
        </Subtitle>

        <FeatureGrid>
          <FeatureCard>
            <GroupsIcon />
            <div>
              <h3>Virtual Interaction</h3>
              <p>Walk up to talk, move away to mute</p>
            </div>
          </FeatureCard>
          <FeatureCard>
            <VideocamIcon />
            <div>
              <h3>Video & Audio</h3>
              <p>Crystal clear communication</p>
            </div>
          </FeatureCard>
          <FeatureCard>
            <ScreenShareIcon />
            <div>
              <h3>Collaboration</h3>
              <p>Screen sharing and whiteboards</p>
            </div>
          </FeatureCard>
          <FeatureCard>
            <ChatBubbleIcon />
            <div>
              <h3>Real-time Chat</h3>
              <p>Instant messaging and emojis</p>
            </div>
          </FeatureCard>
        </FeatureGrid>

        <StartButton 
          variant="contained" 
          onClick={onGetStarted}
          endIcon={<ArrowForwardIcon />}
        >
          Enter Workspace
        </StartButton>
      </Content>
    </Wrapper>
  )
}
