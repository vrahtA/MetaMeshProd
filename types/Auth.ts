export interface AuthRequest {
  email: string
  password: string
  username?: string
  avatar?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    email: string
    username: string
    avatar: string
  }
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  username: string
  avatar: string
}
