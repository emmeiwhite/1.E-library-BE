import express from 'express'
import { createUser } from '../controllers/userController'

const userRouter = express.Router()

// ROUTES

// 1. Register the user
userRouter.post('/register', createUser)

export default userRouter
