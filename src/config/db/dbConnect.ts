import mongoose from 'mongoose'
import { configs } from '../_config'

async function connectDB() {
  await mongoose.connect(configs.MONGO_URI as string)
}
