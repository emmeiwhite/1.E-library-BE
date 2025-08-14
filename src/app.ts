import express from 'express'
import errorHandler from './middlewares/globalErrorHandler'
import userRouter from './routes/userRouter'

const app = express()

// A) Register the userRouter
app.use('/api/users', userRouter)

app.get('/', (req, res, next) => {
  res.json({ message: 'Welcome to e-library apis' })
})

// Global Error Handler
app.use(errorHandler)

export default app
