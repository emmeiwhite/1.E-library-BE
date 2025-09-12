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

  try {
    const user = await User.findOne({ email })

    if (user) {
      const error = createHttpError(400, 'User already exist with this email ')
      return next(error)
    }
  } catch (error) {
    return next(createHttpError(500, 'Error while getting user'))
  }

  // 3. Store user in the Database: hashed password with salted
  const hashedPassword = await bcrypt.hash(password, 10)

  let newUser: User
  try {
    newUser = await User.create({
      name,
      email,
      password: hashedPassword
    })
  } catch (error) {
    return next(createHttpError(500, 'Error while creating user.'))
  }

  // 4. Token Generation (Very Important). JWT token

  try {
    const token = jwt.sign({ email: newUser.email }, configs.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.status(201).json({ token })
  } catch (error) {
    return next(createHttpError(500, 'Error while signing the JWT token'))
  }
}

// 2. Login User
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Always validate data coming from the Client
  const { email, password } = req.body

  if (!email || !password) {
    return next(createHttpError(400, 'Provide email & password'))
  }

  // 2. Check whether email exists
  let user: User | null
  try {
    user = await User.findOne({ email })

    if (!user) {
      return next(createHttpError(404, 'User with email not found'))
    }
  } catch (error) {
    return next(createHttpError(500, 'Error while getting user'))
  }

  // 3. Compare password with DB password

  try {
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return next(createHttpError(400, 'Password is incorrect'))
    }
  } catch (error) {
    return next(createHttpError(500, 'Error while comparing password'))
  }

  try {
    const token = jwt.sign({ email: user.email }, configs.JWT_SECRET as string, {
      expiresIn: '1h'
    })

    res.status(201).json({ token, message: 'User loggen in successfully' })
  } catch (error) {
    return next(createHttpError(500, 'Error while signing the JWT token'))
  }
}

// 3. Get All users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({})
    console.log(users)
    res.json({
      message: 'users fetched successfully',
      users
    })
  } catch (error) {
    return next(createHttpError(500, 'Error while fetching users'))
  }
}

// 4. Delete User
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  try {
    const result = await User.deleteOne({ _id: id })
    console.log(result)
    res.json({
      message: 'users deleted successfully',
      id
    })
  } catch (error) {
    return next(createHttpError(500, 'Error while fetching users'))
  }
}
