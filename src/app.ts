import express from 'express'
import createHttpError from 'http-errors'
import errorHandler from './middlewares/globalErrorHandler'

const app = express()

// Routes: https Methods ---> GET, POST, PUT, PATCH, DELETE
app.get('/', (req, res, next) => {
  const error = createHttpError(400, 'something went wrong')
  throw error
  res.json({ message: 'Welcome to e-library apis' })
})

// Global Error Handler
app.use(errorHandler)

export default app

// To keep the app clean and to test the app!
