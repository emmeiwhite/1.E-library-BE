import express from 'express'
import { createUser, loginUser } from '../controllers/userController'

const userRouter = express.Router()

// ROUTES

// 1. Register  user
userRouter.post('/register', createUser)
// 2. Login User
userRouter.post('/login', loginUser)

export default userRouter
