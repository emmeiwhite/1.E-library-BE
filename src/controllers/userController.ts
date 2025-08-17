import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/User'
import { configs } from '../config/_config'

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

  // 3. Store user in the Database: hashed password with salted
  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword
  })

  // 4. Token Generation (Very Important). JWT token
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email },
    configs.JWT_SECRET as string,
    {
      expiresIn: '1h'
    }
  )

  res.status(201).json({ token })
}
