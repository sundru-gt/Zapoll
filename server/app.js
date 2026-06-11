const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// Security + utility middleware
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true  // allows cookies to be sent cross-origin
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/rooms', require('./routes/roomRoutes'))

// Test route — confirms server is alive
app.get('/api/health', (req, res) => {
  res.json({ message: 'Zappoll server is running!' })
})

// Global error handler 
app.use(errorHandler)

module.exports = app