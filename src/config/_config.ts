import dotenv from 'dotenv'
dotenv.config()

const _config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV
}

export const configs = Object.freeze(_config)
