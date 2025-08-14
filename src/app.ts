import express, { NextFunction, Request, Response } from 'express'

const app = express()

// Global Error Handler
app.use((err, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
})

export default app

// To keep the app clean and to test the app!
