const express = require('express')
const router = express.Router()

//current placeholder route to test auth routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' })
})

module.exports = router