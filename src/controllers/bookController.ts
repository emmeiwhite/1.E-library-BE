import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import fs from 'node:fs'
import cloudinary from '../config/cloudinary'
import path from 'node:path'
import Book from '../models/Book'
import { AuthRequest } from '../middlewares/authenticate'

/** 1. Create Book */
export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body
  console.log('title: ', title)
  if (!title || !genre) {
    return next(createHttpError(400, 'title, genre required'))
  }

  // console.log('Files', req.files)

  if (!req.files || !('coverImage' in req.files)) {
    return next(createHttpError(400, 'Cover image is required'))
  }

  /** 1. Uploading coverImage */
  const coverImage = (req.files as { [fieldname: string]: Express.Multer.File[] }).coverImage[0]
  let coverImageMimeType = coverImage.mimetype.split('/')[1] // png
  console.log('mimetype :', coverImageMimeType)

  let fileName = req.files.coverImage[0].filename
  console.log('Cover Image file name', fileName)

  let filePath = path.resolve(__dirname, '../../public/data/uploads', fileName)
  // So filePath is basically the path in our server which cloudinary uses to take our files and upload onto the cloudinary server

  let uploadBookResult
  try {
    uploadBookResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: 'book-covers',
      format: coverImageMimeType
    })

    console.log(uploadBookResult.url)
  } catch (error) {
    console.log(error)
    next(createHttpError(500, 'Error while uploading book coverImage'))
  }

  /** 2. Uploading PDF */
  let bookFileName = req.files.file[0].filename

  console.log('Book File Name pdf', bookFileName)
  let bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName)
  let pdfUploadResult
  try {
    pdfUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: 'raw',
      filename_override: bookFileName,
      folder: 'book-pdfs',
      format: 'pdf'
    })
    console.log(pdfUploadResult.url)
  } catch (error) {
    console.log(error)
    next(createHttpError(500, 'Error while uploading pdf'))
  }

  // After receving Book details (title, genre, author[handle in JWT], & 2 files --- urls), time to create the resource in DB

  // @ts-ignore
  console.log('useriD', req.userId)

  // Typecast to fix the TS Error in Book.create({author:req.userId})
  const _req = req as AuthRequest

  const newBook = Book.create({
    title,
    genre,
    author: _req.userId,
    coverImage: uploadBookResult?.secure_url,
    file: pdfUploadResult?.secure_url
  })

  console.log(newBook)
  // DELETE Temp file on Server --- Use Node's fs module
  await fs.promises.unlink(filePath)
  await fs.promises.unlink(bookFilePath)

  res.status(201).json({ bookID: _req.userId })
}

/** 2. Update Book */
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body

  if (!title || !genre) {
    return next(createHttpError(400, 'No changes to update'))
  }

  const bookID = req.params.bookId

  // First we'll check whether the book exists in the database
  const book = await Book.findOne({ _id: bookID })

  if (!book) {
    return next(createHttpError(404, 'Book not found'))
  }

  // Check Access - The one updating the book is correct uploader of the book
  const _req = req as AuthRequest
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, 'You are not authorized to update the book of other User'))
  }

  /** 1. Now if User has sent a new coverImage to update, only in that case we have to update the coverImage  */

  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  /** 1. Uploading coverImage */
  let completeCoverImage: string | undefined = ''

  if (files.coverImage) {
    let fileName = files.coverImage[0].filename

    let coverImageMimeType = files.coverImage[0].mimetype.split('/')[1] // png

    let filePath = path.resolve(__dirname, '../../public/data/uploads', fileName)
    // So filePath is basically the path in our server which cloudinary uses to take our files and upload onto the cloudinary server

    let uploadBookResult
    try {
      uploadBookResult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: 'book-covers',
        format: coverImageMimeType
      })
      console.log(uploadBookResult.secure_url)
    } catch (error) {
      console.log(error)
      next(createHttpError(500, 'Error while uploading book coverImage'))
    }

    completeCoverImage = uploadBookResult?.secure_url
    await fs.promises.unlink(filePath)
  }

  // Check if fileName exists (whether new pdf is sent by the User to be updated)

  let completePdf: string | undefined = ''

  if (files.file) {
    const bookFileName = files.file[0].filename
    const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName)

    let pdfUploadResult
    try {
      pdfUploadResult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: 'raw',
        filename_override: bookFileName,
        folder: 'book-pdfs',
        format: 'pdf'
      })
      console.log(pdfUploadResult.url)
    } catch (error) {
      console.log(error)
      next(createHttpError(500, 'Error while uploading pdf'))
    }
    completePdf = pdfUploadResult?.secure_url

    await fs.promises.unlink(bookFilePath)
  }

  // Notice that we have now access to both secure_url's in completeCoverImage and completePdf

  /** --- Query Database to update the Book --- */
  const updateBook = await Book.findOneAndUpdate(
    { _id: bookID },
    {
      title: title ? title : book.title,
      genre: genre ? genre : book.genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completePdf ? completePdf : book.file
    },
    { new: true }
  )

  res.json(updateBook)
}

/** 3. Get listOfBooks */
export const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Todo: Perform Pagination, since we should not fetch all the list of users
    const books = await Book.find({})

    res.json({
      message: 'books fetched successfully',
      books
    })
  } catch (error) {
    return next(createHttpError(500, 'Cannot fetch the list of books'))
  }
}

/** 4. Get Single Book */
export const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId } = req.params
  try {
    // Todo: Perform Pagination, since we should not fetch all the list of users
    const book = await Book.findOne({ _id: bookId })

    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }

    res.json({
      message: 'book fetched successfully',
      book
    })
  } catch (error) {
    return next(createHttpError(500, 'Cannot find book'))
  }
}

/** 5. Delete Single Book */
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId } = req.params
  try {
    // Todo: Perform Pagination, since we should not fetch all the list of users
    const book = await Book.findOne({ _id: bookId })

    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }

    // Check Access - The one updating the book is correct uploader of the book
    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, 'You are not authorized to update the book of other User'))
    }

    res.json({
      message: 'book fetched successfully',
      book
    })
  } catch (error) {
    return next(createHttpError(500, 'Cannot find book'))
  }
}
