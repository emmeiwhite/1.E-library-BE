import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import User from '../models/User'

// 1. Create User
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Validate the user & Sanitize
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    const error = createHttpError(400, 'All fields are required ')
    return next(error)
  }

  // 2. Check whether the email exist in the database

  const user = await User.findOne({ email })

  if (user) {
    const error = createHttpError(400, 'User already exist with this email ')
    return next(error)
  }

  res.status(201).json({ message: 'User created successfully!' })
}
