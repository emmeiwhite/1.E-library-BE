import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import fs from 'node:fs'
import cloudinary from '../config/cloudinary'
import path from 'node:path'
import Book from '../models/Book'
import { AuthRequest } from '../middlewares/authenticate'

// We'll need to perform all the CRUD Operations on Book itself
export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, author, genre } = req.body
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

  res.status(201).json({ bookID: 'Files Uploaded!' })
}
