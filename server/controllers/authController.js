const User = require('../models/User')
const { createError } = require('../middleware/errorHandler')

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // 1. Validate input
    if (!name || !email || !password) {
      return next(createError('Please provide name, email and password', 400))
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(createError('Email already registered', 409))
    }

    // 3. Create user 
    const user = await User.create({ name, email, password })

    // 4. Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        quizzesCreated: user.quizzesCreated,
        quizzesPaid: user.quizzesPaid,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register }