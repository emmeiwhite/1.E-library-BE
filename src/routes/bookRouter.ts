import express from 'express'
import { createBook } from '../controllers/bookController'

const bookRouter = express.Router()

// Book APIs

// 1. /api/books

bookRouter.post('/', createBook)
export default bookRouter
