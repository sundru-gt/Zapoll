const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true, // in rupees (₹)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'canceled'],
      default: 'pending',
    },
    quizzesUnlocked: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
      default: '10 more quizzes',
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

paymentSchema.index({ user: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ razorpayOrderId: 1 })

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment