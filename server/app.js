const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const multer = require('multer') // For handling file uploads
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


// Multer setup for file uploads (used in AI routes for PDF uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'), false)
    }
  }
})
app.locals.upload = upload


// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/rooms', require('./routes/roomRoutes'))
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/payments', require('./routes/paymentRoutes')) 

// Test route — confirms server is alive
app.get('/api/health', (req, res) => {
  res.json({ message: 'Zappoll server is running!' })
})

// Global error handler 
app.use(errorHandler)

module.exports = app