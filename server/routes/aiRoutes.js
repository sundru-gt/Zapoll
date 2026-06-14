const express = require('express')
const router = express.Router()
const multer = require('multer')
const authMiddleware = require('../middleware/authMiddleware')
const { generateFromPDF } = require('../controllers/aiController')

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'), false)
    }
  }
})

// Protected route for generating questions from PDF
router.post('/generate-from-pdf', authMiddleware, upload.single('pdf'), generateFromPDF)

module.exports = router