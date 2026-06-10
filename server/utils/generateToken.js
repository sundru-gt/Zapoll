const jwt = require('jsonwebtoken')

// Generate ACCESS TOKEN (short-lived,for 15 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

// Generate REFRESH TOKEN (long-lived,for 7 days)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { generateAccessToken, generateRefreshToken }