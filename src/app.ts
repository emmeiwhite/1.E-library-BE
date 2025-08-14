import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import { configs } from './config/_config'

const app = express()

// Routes: https Methods ---> GET, POST, PUT, PATCH, DELETE
app.get('/', (req, res, next) => {
  const error = createHttpError(400, 'something went wrong')
  throw error
  res.json({ message: 'Welcome to e-library apis' })
})

// Global Error Handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    message: err.message,
    errorStack: configs.NODE_ENV === 'development' ? err.stack : ''
  })
})

export default app

// To keep the app clean and to test the app!
