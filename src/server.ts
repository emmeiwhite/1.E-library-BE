import app from './app'
import { configs } from './config/_config'

const PORT = configs.PORT || 3000

function start() {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
  })
}

start()
