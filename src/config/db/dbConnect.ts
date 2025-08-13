import mongoose from 'mongoose'
import { configs } from '../_config'

// optional: helpful in dev
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true)
}

// Register runtime listeners ONCE (module scope)
mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err)
})
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected')
})
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected')
})
// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed on app termination')
  process.exit(0)
})

let isConnected = false

async function connectDB() {
  if (isConnected) return mongoose

  try {
    const conn = await mongoose.connect(configs.MONGO_URI as string, {
      // tweak as you like
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
      dbName: 'e-library' // if your URI doesn't include it
    })

    isConnected = true
    console.log(`Connected to DB successfully: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error('Failed to establish database connection', error)
    // In long-running servers, exiting is fine (nodemon/PM2 will restart).
    // In serverless, don't call process.exit().
    process.exit(1)
  }
}
export default connectDB
