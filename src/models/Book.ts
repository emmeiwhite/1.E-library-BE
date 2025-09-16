import mongoose from 'mongoose'
import type { Book } from '../types/types'
// 1. Create Book Schema
const bookSchema = new mongoose.Schema<Book>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverImage: {
      type: String,
      required: true
    },
    file: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

// 2. Create the Model

const Book = mongoose.model<Book>('Book', bookSchema)
export default Book
