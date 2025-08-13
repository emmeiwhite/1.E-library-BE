import app from './app'
import { configs } from './config/_config'
import connectDB from './config/db/dbConnect'

const PORT = configs.PORT || 3000
connectDB()
function start() {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
  })
}

start()
