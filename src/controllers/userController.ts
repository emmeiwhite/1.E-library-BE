import { Response, Request, NextFunction } from 'express'

// 1. Create User
export const createUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(201).json({ message: 'User created successfully!' })
}
