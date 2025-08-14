import { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { configs } from '../config/_config'

const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    message: err.message,
    errorStack: configs.NODE_ENV === 'development' ? err.stack : ''
  })
}

export default errorHandler
