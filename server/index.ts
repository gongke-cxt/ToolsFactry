import { startServer } from './routes.js'

const PORT = parseInt(process.env.PORT || '3001', 10)

startServer(PORT).catch((err) => {
  console.error('[server] Failed to start:', err)
  process.exit(1)
})
