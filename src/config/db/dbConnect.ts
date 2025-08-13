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

async function connectDB() {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Connected to DB successfully!')
    })

    //   In future if we get any error
    mongoose.connection.on('error', () => {
      console.log('Error in connecting to the database')
    })
    await mongoose.connect(configs.MONGO_URI as string)
  } catch (error) {
    console.log('Failed to establish database connection', error)

    //   Stop the application (server), if we fail to connect to the databse
    process.exit(1)
  }
}

export default connectDB
