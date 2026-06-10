const express = require('express')
const router = express.Router()
const { register } = require('../controllers/authController')

// POST /api/auth/register
router.post('/register', register)

// Placeholder test route 
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' })
})

module.exports = router