import mongoose from 'mongoose'
import type { User } from '../types/types'

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

// users ---> collection name will be automatically created
const User = mongoose.model<User>('User', userSchema)
export default User
