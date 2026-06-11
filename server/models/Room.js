const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 6,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'ended'],
      default: 'draft',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    participantCount: {
      type: Number,
      default: 0,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    accessType: {
      type: String,
      enum: ['public', 'whitelist'],
      default: 'public',
    },
    allowedEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster lookups by code
roomSchema.index({ code: 1 })
roomSchema.index({ host: 1 })

const Room = mongoose.model('Room', roomSchema)
module.exports = Room