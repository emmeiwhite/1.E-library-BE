import express from 'express'
import { createBook } from '../controllers/bookController'
import multer from 'multer'
import path from 'node:path'

const bookRouter = express.Router()

/** 1. multer: handles file uploads:
 * - First uploads file locally which we need to mention in the code
 * - Then we take the uploaded file and store it in the cloudnery
 *  */

// Book APIs

console.log(path.resolve(__dirname))

const upload = multer({
  dest: path.resolve(__dirname, '../../public/data/uploads'),
  limits: { fileSize: 3e7 } // 30 MB
})

// 1. /api/books

bookRouter.post(
  '/',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  createBook
)
export default bookRouter
