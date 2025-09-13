import express from 'express'
import errorHandler from './middlewares/globalErrorHandler'
import userRouter from './routes/userRouter'
import bookRouter from './routes/bookRouter'
import cors from 'cors'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000'
  })
)
app.use(express.json()) // To parse req.body

// A) Register the userRouter
app.use('/api/users', userRouter)

// B) REgister bookRouter
app.use('/api/books', bookRouter)

app.get('/', (req, res, next) => {
  res.json({ message: 'Welcome to e-library apis' })
})

// Global Error Handler
app.use(errorHandler)

export default app
