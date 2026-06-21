import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
const TOKEN_KEY = 'metamesh_auth_token'

export interface RegisterData {
  email: string
  password: string
  username: string
  avatar: string
}

export interface LoginData {
  email: string
  password: string
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

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data)
      if (response.data.token) {
        this.setStoredToken(response.data.token)
      }
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  // Login existing user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, data)
      if (response.data.token) {
        this.setStoredToken(response.data.token)
      }
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  // Verify token
  async verifyToken(): Promise<AuthResponse['user'] | null> {
    try {
      const token = this.getStoredToken()
      if (!token) return null

      const response = await axios.get<{ success: boolean; user: AuthResponse['user'] }>(
        `${API_BASE_URL}/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data.user
    } catch (error) {
      this.clearStoredToken()
      return null
    }
  }

  // Logout
  logout(): void {
    this.clearStoredToken()
  }

  // Get stored JWT token
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  // Set JWT token in localStorage
  setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  // Clear JWT token from localStorage
  clearStoredToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export default new AuthService()
