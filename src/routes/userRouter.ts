import express from 'express'
import { createUser, getUsers, loginUser } from '../controllers/userController'

const userRouter = express.Router()

// ROUTES

// 1. Register  user
userRouter.post('/register', createUser)
// 2. Login User
userRouter.post('/login', loginUser)

// 3. Get All Users
userRouter.get('/', getUsers)

export default userRouter
