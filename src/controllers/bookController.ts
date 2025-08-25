import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'

// We'll need to perform all the CRUD Operations on Book itself
export const createBook = async (req: Request, res: Response, next: NextFunction) => {}
