const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { register,login,refreshAccessToken } = require('../controllers/authController')

// POST /api/auth/register
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshAccessToken)

//protected route currently for testing purposes....
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    userId: req.userId,
  })
})

// Placeholder test route 
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' })
})

module.exports = router