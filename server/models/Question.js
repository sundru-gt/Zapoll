const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Question = mongoose.model('Question', questionSchema)
module.exports = Question