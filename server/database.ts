import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/metamesh'

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    // Retry connection after 5 seconds
    setTimeout(connectDatabase, 5000)
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...')
})

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error)
})

export default mongoose
