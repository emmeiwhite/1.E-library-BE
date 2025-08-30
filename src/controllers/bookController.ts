import { Response, Request, NextFunction } from 'express'
import createHttpError from 'http-errors'
import cloudinary from '../config/cloudinary'
import path from 'node:path'

// We'll need to perform all the CRUD Operations on Book itself
export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Files', req.files)

  if (!req.files || !('coverImage' in req.files)) {
    return next(createHttpError(400, 'Cover image is required'))
  }

  /** 1. Uploading coverImage */
  const coverImage = (req.files as { [fieldname: string]: Express.Multer.File[] }).coverImage[0]
  let coverImageMimeType = coverImage.mimetype.split('/')[1] // png

  console.log('mimetype :', coverImageMimeType)

  let fileName = req.files.coverImage[0].filename

  let filePath = path.resolve(__dirname, '../../public/data/uploads', fileName)
  // So filePath is basically the path in our server which cloudinary uses to take our files and upload onto the cloudinary server

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    filename_override: fileName,
    folder: 'book-covers',
    format: coverImageMimeType
  })

  /** 2. Uploading PDF */
  let bookFileName = req.files.file[0].filename
  let bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName)
  try {
    const pdfUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: 'raw',
      filename_override: bookFileName,
      folder: 'book-pdfs',
      format: 'pdf'
    })
    console.log(pdfUploadResult)
  } catch (error) {
    console.log(error)
  }

  res.send({ message: 'Testing' })
}
