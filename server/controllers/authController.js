const User = require('../models/User')
const { createError } = require('../middleware/errorHandler')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const jwt = require('jsonwebtoken')

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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. Validate input
    if (!email || !password) {
      return next(createError('Please provide email and password', 400))
    }

    // 2. Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return next(createError('Invalid email or password', 401))
    }

    // 3. Compare passwords — uses the comparePassword method from User model
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return next(createError('Invalid email or password', 401))
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // 5. Save refresh token to database
    user.refreshToken = refreshToken
    await user.save()

    // 6. Set refresh token in httpOnly cookie (can't be accessed by JavaScript)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    })

    // 7. Send response with access token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
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

const refreshAccessToken = async (req, res, next) => {
  try {
    // 1. Get refresh token from cookie
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return next(createError('No refresh token provided', 401))
    }

    // 2. Verify the refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return next(createError('Invalid or expired refresh token', 401))
    }

    // 3. Find user and verify the refresh token matches what we stored
    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      return next(createError('Refresh token does not match', 401))
    }

    // 4. Generate new access token
    const newAccessToken = generateAccessToken(user._id)

    // 5. Return new access token
    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      accessToken: newAccessToken,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, refreshAccessToken }