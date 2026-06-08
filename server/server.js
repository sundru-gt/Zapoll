require('dotenv').config()
const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const httpServer = http.createServer(app)

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()