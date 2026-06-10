const jwt = require('jsonwebtoken')
const { createError } = require('./errorHandler')

// Middleware to verify JWT access token

const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return next(createError('No token provided', 401))
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 3. Attach user ID to the request object
    req.userId = decoded.id
    
    // 4. Continue to the next middleware/route handler
    next()
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired', 401))
    }
    next(createError('Invalid token', 401))
  }
}

module.exports = authMiddleware