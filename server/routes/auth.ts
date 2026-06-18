import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User, { IUser } from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

dotenv.config()

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this'
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  )
}

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  return { valid: true }
}

// POST /auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, avatar } = req.body

    // Validation
    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password, and username are required' })
      return
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' })
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.message })
      return
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' })
      return
    }

    // Create new user
    const user: IUser = new User({
      email,
      password,
      username,
      avatar: avatar || 'adam',
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id.toString(), user.email)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Server error during registration' })
  }
})

// POST /auth/login - Login existing user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
})

// GET /auth/verify - Verify JWT token
router.get('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Server error during verification' })
  }
})

// GET /auth/user/:id - Get user profile (protected)
router.get('/user/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
