require('dotenv').config()
const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')
const { Server } = require('socket.io')
const { setupQuizNamespace } = require('./sockets/quizNamespace')
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const httpServer = http.createServer(app)

    const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ||'http://localhost:5173',
      credentials: true,
    },
  })

  // Setup quiz namespace
  setupQuizNamespace(io)

  // Connection event
  io.on('connection', (socket) => {
    console.log('🔌 User connected via Socket.io:', socket.id)

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id)
    })
  })

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Socket.io running `)
  })
}

startServer()