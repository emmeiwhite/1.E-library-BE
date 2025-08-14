import express from 'express'

const userRouter = express.Router()

// ROUTES

// 1. Register the user
userRouter.post('/register', (req, res) => {
  res.status(201).json({ message: 'User created successfully!' })
})

export default userRouter
