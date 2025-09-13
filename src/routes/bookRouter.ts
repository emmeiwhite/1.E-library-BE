import express from 'express'
import {
  createBook,
  updateBook,
  listBooks,
  getSingleBook,
  deleteBook
} from '../controllers/bookController'
import multer from 'multer'
import path from 'node:path'
import authenticate from '../middlewares/authenticate'

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
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  createBook
)

// 2. Update Book /api/books/:id
bookRouter.patch(
  '/:bookId',
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  updateBook
)

// 3. List books GET /api/books
bookRouter.get('/', listBooks)

// 4. Get Single Book
bookRouter.get('/:bookId', getSingleBook)

// 5. Delete Book
bookRouter.get('/:bookId', authenticate, deleteBook)

export default bookRouter
