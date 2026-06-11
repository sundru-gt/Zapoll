const Room = require('../models/Room')
const Question = require('../models/Question')
const { createError } = require('../middleware/errorHandler')
const { generateUniqueCode } = require('../utils/generateCode')

const createRoom = async (req, res, next) => {
  try {
    const { title, description, questions, accessType, allowedEmails } = req.body
    const hostId = req.userId

    // 1. Validate input
    if (!title) {
      return next(createError('Quiz title is required', 400))
    }

    // 2. Validate accessType
    if (accessType && !['public', 'whitelist'].includes(accessType)) {
      return next(createError('Invalid accessType. Must be "public" or "whitelist"', 400))
    }

    // 3. If whitelist mode, validate emails provided
    if (accessType === 'whitelist' && (!allowedEmails || allowedEmails.length === 0)) {
      return next(createError('Whitelist mode requires at least one email', 400))
    }

    // 4. Generate unique 6-digit code
    const code = await generateUniqueCode()

    // 5. Create room
    const room = await Room.create({
      host: hostId,
      title,
      description: description || '',
      code,
      accessType: accessType || 'public',
      allowedEmails: accessType === 'whitelist' ? allowedEmails : [],
    })

    // 6. If questions provided, create them and link to room
    if (questions && questions.length > 0) {
      const createdQuestions = await Question.insertMany(
        questions.map((q, index) => ({
          room: room._id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          order: index,
        }))
      )

      // Update room with question IDs
      room.questions = createdQuestions.map((q) => q._id)
      await room.save()
    }

    // 7. Return room with populated questions
    await room.populate('host', 'name email')
    await room.populate('questions')

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    })
  } catch (error) {
    next(error)
  }
}

const getMyRooms = async (req, res, next) => {
  try {
    const hostId = req.userId

    const rooms = await Room.find({ host: hostId })
      .populate('host', 'name email')
      .populate('questions')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    })
  } catch (error) {
    next(error)
  }
}

const getRoomByCode = async (req, res, next) => {
  try {
    const { code } = req.params

    // Validate code format
    if (!code || code.length !== 6) {
      return next(createError('Invalid room code', 400))
    }

    const room = await Room.findOne({ code })
      .populate('host', 'name email')
      .populate('questions')

    if (!room) {
      return next(createError('Room not found', 404))
    }

    res.status(200).json({
      success: true,
      room,
    })
  } catch (error) {
    next(error)
  }
}

const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params

    const room = await Room.findById(id)
      .populate('host', 'name email')
      .populate('questions')
      .populate('participants', 'name email')

    if (!room) {
      return next(createError('Room not found', 404))
    }

    res.status(200).json({
      success: true,
      room,
    })
  } catch (error) {
    next(error)
  }
}

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params
    const hostId = req.userId
    const { title, description, status, isLive, currentQuestionIndex } = req.body

    const room = await Room.findById(id)

    if (!room) {
      return next(createError('Room not found', 404))
    }

    // Check if user is the host
    if (room.host.toString() !== hostId) {
      return next(createError('Not authorized to update this room', 403))
    }

    // Update allowed fields
    if (title) room.title = title
    if (description !== undefined) room.description = description
    if (status) room.status = status
    if (isLive !== undefined) room.isLive = isLive
    if (currentQuestionIndex !== undefined) room.currentQuestionIndex = currentQuestionIndex

    await room.save()
    await room.populate('host', 'name email')
    await room.populate('questions')

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room,
    })
  } catch (error) {
    next(error)
  }
}

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params
    const hostId = req.userId

    const room = await Room.findById(id)

    if (!room) {
      return next(createError('Room not found', 404))
    }

    // Check if user is the host
    if (room.host.toString() !== hostId) {
      return next(createError('Not authorized to delete this room', 403))
    }

    // Delete all questions in this room
    await Question.deleteMany({ room: id })

    // Delete the room
    await Room.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

const joinRoom = async (req, res, next) => {
  try {
    const { code } = req.params
    const { participantName, participantEmail } = req.body

    // 1. Validate participant name
    if (!participantName) {
      return next(createError('Participant name is required', 400))
    }

    // 2. Find room by code
    const room = await Room.findOne({ code })

    if (!room) {
      return next(createError('Room not found', 404))
    }

    // 3. Check access control based on accessType
    if (room.accessType === 'whitelist') {
      // For whitelist mode, email is required
      if (!participantEmail) {
        return next(createError('Email is required for this quiz', 400))
      }

      // Check if email is in allowed list (case-insensitive)
      const isAllowed = room.allowedEmails.some(
        (email) => email.toLowerCase() === participantEmail.toLowerCase()
      )

      if (!isAllowed) {
        return next(
          createError('Your email is not whitelisted for this quiz', 403)
        )
      }
    }
    // If public, anyone can join (no email check needed)

    // 4. Participant is allowed, return room
    await room.populate('host', 'name email')
    await room.populate('questions')

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      room,
      participantName,
      participantEmail: participantEmail || null,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createRoom,
  getMyRooms,
  getRoomByCode,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
}