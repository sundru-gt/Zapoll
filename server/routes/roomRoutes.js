const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const {createRoom,getMyRooms,getRoomByCode,getRoomById,updateRoom,deleteRoom,joinRoom,} = require('../controllers/roomController')

// Protected routes (require auth)
router.post('/', authMiddleware, createRoom)
router.get('/', authMiddleware, getMyRooms)
router.get('/:id', authMiddleware, getRoomById)
router.put('/:id', authMiddleware, updateRoom)
router.delete('/:id', authMiddleware, deleteRoom)

// Public routes (no auth needed)
router.get('/code/:code', getRoomByCode)
router.post('/code/:code/join', joinRoom)

module.exports = router