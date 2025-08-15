import dotenv from 'dotenv'
dotenv.config()

const _config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET
}

export const configs = Object.freeze(_config)
