import express, { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { configs } from './config/_config'

const app = express()

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
