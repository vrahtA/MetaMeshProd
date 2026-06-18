import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  password: string
  username: string
  avatar: string
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    default: 'adam',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)

export default User
