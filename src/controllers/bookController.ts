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

  const newBook = await Book.create({
    title,
    genre,
    author: _req.userId,
    coverImage: uploadBookResult?.secure_url,
    file: pdfUploadResult?.secure_url
  })

  console.log('Book Created: ', newBook)
  // DELETE Temp file on Server --- Use Node's fs module
  await fs.promises.unlink(filePath)
  await fs.promises.unlink(bookFilePath)

  res.status(201).json({ book: newBook })
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
    const books = await Book.find().populate('author', 'name email')

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
    const book = await Book.findOne({ _id: bookId }).populate('author', 'name email')

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

  // Now first delete the files associated with the book on Cloudinary
  /** await cloudinary.uploader.destroy(public_id); 

    So, We require public_id and we'll get the public_id from our secure_url last part.
    For CoverImage it looks like this:  "book-covers/jeaangub4aplyggmqicm" & we can get it from the public_url

     */

  // 1. coverImage public_id derivation: book-covers/jeaangub4aplyggmqicm
  const coverImageSplits: string[] = book.coverImage.split('/')
  console.log(coverImageSplits)

  const imagelength = coverImageSplits.length
  const coverImagePublicID =
    coverImageSplits[imagelength - 2] + '/' + coverImageSplits[imagelength - 1].split('.')[0]

  console.log('coverImagePublicID:', coverImagePublicID)
  // await cloudinary.uploader.destroy()

  // 2. pdf public_id derivation: book-pdfs/kuj1uzmnljkujp5muouk.pdf
  const pdfSplits = book.file.split('/')
  const pdfArrayLength = pdfSplits.length
  const pdfPublicID = pdfSplits[pdfArrayLength - 2] + '/' + pdfSplits[pdfArrayLength - 1]

  console.log('pdfPublicID:', pdfPublicID)

  // 3. delete both image and pdf from cloudinary

  try {
    await cloudinary.uploader.destroy(coverImagePublicID)
    await cloudinary.uploader.destroy(pdfPublicID, {
      resource_type: 'raw'
    })
  } catch (error) {
    next(createHttpError(500, 'Could not delete the coverImage or pdf'))
  }

  // 4. Delete book from the Database

  try {
    await Book.deleteOne({ _id: bookId })
    res.sendStatus(204)
  } catch (error) {
    next(createHttpError(403, 'Could not delete the book'))
  }
}
