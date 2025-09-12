import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { configs } from '../config/_config'

export interface AuthRequest extends Request {
  userId: string
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')

  if (!token) {
    return next(createHttpError(401, 'Authorization token is required'))
  }

  // parse the token

  const parsedToken = token.split(' ')[1]

  // Decode the token
  const decoded = jwt.verify(parsedToken, configs.JWT_SECRET as string)

  console.log(`decoded`, decoded)

  const _req = req as AuthRequest
  req.userId = decoded.userId
  next() // pass to the next handler
}

export default authenticate
