import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
    }

    req.userId = decoded.userId
    req.userEmail = decoded.email

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
