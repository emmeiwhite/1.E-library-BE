import mongoose from 'mongoose'

type User = {
  _id: string
  name: string
  email: string
  password: string
}
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

const User = mongoose.model('User', userSchema)
export default User
