import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { getColorByString } from '../util'
import { useAppDispatch, useAppSelector } from '../hooks'
import { MessageType, setFocused, setShowChat } from '../stores/ChatStore'

import SendIcon from '@mui/icons-material/Send'

// Root container always at bottom-left
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`

// The chat panel (only visible when open)
const ChatPanel = styled.div`
  width: 360px;
  height: 400px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: chatFadeIn 0.3s ease-out;

  @keyframes chatFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const ChatHeader = styled.div`
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    color: #f1f5f9;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
  }

  .close {
    color: #94a3b8;
    &:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
  }
`

const ChatBox = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  
  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #e2e8f0;
    word-break: break-word;
  }
  
  .author {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 2px;
    opacity: 0.9;
  }
  
  .timestamp {
    font-size: 0.7rem;
    color: #64748b;
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .timestamp {
    opacity: 1;
  }

  .notification {
    color: #94a3b8;
    font-style: italic;
    font-size: 0.85rem;
    text-align: center;
    margin: 8px 0;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 12px;
    border-radius: 12px;
    align-self: center;
  }
`

const InputWrapper = styled.form`
  padding: 12px;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 8px;
  align-items: center;
`

const InputTextField = styled(InputBase)`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 4px 16px;
  transition: all 0.2s;
  color: #f1f5f9;
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
  
  input {
    padding: 8px 0;
    &::placeholder {
      color: #64748b;
    }
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 70px;
  right: 16px;
  z-index: 10;
  
  .emoji-mart {
    background-color: #1e293b !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    
    .emoji-mart-category-label span {
      background-color: #1e293b !important;
      color: #94a3b8 !important;
    }
    
    .emoji-mart-search input {
      background-color: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: white !important;
    }

    button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
`

const ChatFab = styled(Fab)`
  && {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.5);
      transform: scale(1.05);
    }
    transition: all 0.2s ease;
  }
`

const dateFormatter = new Intl.DateTimeFormat('en', {
  timeStyle: 'short',
})

const Message = ({ chatMessage, messageType }) => {
  return (
    <MessageWrapper>
      {messageType === MessageType.REGULAR_MESSAGE ? (
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="author" style={{ color: getColorByString(chatMessage.author) }}>
              {chatMessage.author}
            </span>
            <span className="timestamp">{dateFormatter.format(chatMessage.createdAt)}</span>
          </div>
          <p>{chatMessage.content}</p>
        </div>
      ) : (
        <span className="notification">
          {chatMessage.author} {chatMessage.content}
        </span>
      )}
    </MessageWrapper>
  )
}

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [readyToSubmit, setReadyToSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(setShowChat(false))
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!readyToSubmit) {
      setReadyToSubmit(true)
      return
    }
    inputRef.current?.blur()

    const val = inputValue.trim()
    setInputValue('')
    if (val) {
      game.network.addChatMessage(val)
      game.myPlayer.updateDialogBubble(val)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, showChat])

  return (
    <ChatContainer>
      {/* Chat panel — only rendered when open */}
      {showChat && (
        <ChatPanel>
          <ChatHeader>
            <h3>Chat</h3>
            <IconButton
              aria-label="close dialog"
              className="close"
              onClick={() => dispatch(setShowChat(false))}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </ChatHeader>
          <ChatBox>
            {chatMessages.map(({ messageType, chatMessage }, index) => (
              <Message chatMessage={chatMessage} messageType={messageType} key={index} />
            ))}
            <div ref={messagesEndRef} />
            {showEmojiPicker && (
              <EmojiPickerWrapper>
                <Picker
                  theme="dark"
                  showSkinTones={false}
                  showPreview={false}
                  onSelect={(emoji) => {
                    setInputValue(inputValue + emoji.native)
                    setShowEmojiPicker(!showEmojiPicker)
                    dispatch(setFocused(true))
                  }}
                  exclude={['recent', 'flags']}
                />
              </EmojiPickerWrapper>
            )}
          </ChatBox>
          <InputWrapper onSubmit={handleSubmit}>
            <InputTextField
              inputRef={inputRef}
              autoFocus={focused}
              fullWidth
              placeholder="Press Enter to chat"
              value={inputValue}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              onFocus={() => {
                if (!focused) {
                  dispatch(setFocused(true))
                  setReadyToSubmit(true)
                }
              }}
              onBlur={() => {
                dispatch(setFocused(false))
                setReadyToSubmit(false)
              }}
            />
            <IconButton aria-label="emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ color: '#94a3b8' }}>
              <InsertEmoticonIcon />
            </IconButton>
            <IconButton type="submit" aria-label="send" style={{ color: '#6366f1' }}>
              <SendIcon />
            </IconButton>
          </InputWrapper>
        </ChatPanel>
      )}

      {/* FAB is always shown when chat is closed */}
      {!showChat && (
        <Tooltip title="Open Chat" placement="right">
          <ChatFab
            color="secondary"
            aria-label="showChat"
            onClick={() => {
              dispatch(setShowChat(true))
              dispatch(setFocused(true))
            }}
          >
            <ChatBubbleOutlineIcon />
          </ChatFab>
        </Tooltip>
      )}
    </ChatContainer>
  )
}
