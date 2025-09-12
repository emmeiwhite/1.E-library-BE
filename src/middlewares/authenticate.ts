import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { configs } from '../config/_config'

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

  next() // pass to the next handler
  //   req.userId = decoded.sub
}

export default authenticate
