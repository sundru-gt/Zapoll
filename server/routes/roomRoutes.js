const express = require('express')
const router = express.Router()
const multer = require('multer')
const authMiddleware = require('../middleware/authMiddleware')
const {createRoom,getMyRooms,getRoomByCode,getRoomById,updateRoom,deleteRoom,joinRoom,} = require('../controllers/roomController')

// Multer setup for PDF uploads
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

// Protected routes (require auth)
router.post('/', authMiddleware, upload.single('pdf'), createRoom)
router.get('/', authMiddleware, getMyRooms)
router.get('/:id', authMiddleware, getRoomById)
router.put('/:id', authMiddleware, updateRoom)
router.delete('/:id', authMiddleware, deleteRoom)

// Public routes (no auth needed)
router.get('/code/:code', getRoomByCode)
router.post('/code/:code/join', joinRoom)

module.exports = router