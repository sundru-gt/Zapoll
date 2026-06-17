const Razorpay = require('razorpay')
const crypto = require('crypto')
const User = require('../models/User')
const Payment = require('../models/Payment')
const { createError } = require('../middleware/errorHandler')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Check if user can create quiz
const canCreateQuiz = async (req, res, next) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    if (!user) {
      return next(createError('User not found', 404))
    }

    const FREE_QUIZ_LIMIT = 3
    const totalQuizzesAllowed = FREE_QUIZ_LIMIT + user.quizzesPaid
    const canCreate = user.quizzesCreated < totalQuizzesAllowed
    const quizzesRemaining = totalQuizzesAllowed - user.quizzesCreated

    console.log(`📊 User ${user.email}: ${user.quizzesCreated}/${totalQuizzesAllowed} quizzes`)

    res.status(200).json({
      success: true,
      canCreate,
      quizzesRemaining,
      quizzesCreated: user.quizzesCreated,
      quizzesPaid: user.quizzesPaid,
      totalAllowed: totalQuizzesAllowed,
      FREE_QUIZ_LIMIT,
      message: canCreate
        ? `You can create ${quizzesRemaining} more quiz(zes)`
        : 'You have reached your quiz limit. Please upgrade.',
    })
  } catch (error) {
    next(error)
  }
}

// Create Razorpay order
const createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.userId
    const { quizzesToUnlock } = req.body

    if (!quizzesToUnlock || quizzesToUnlock < 1) {
      return next(createError('Invalid number of quizzes to unlock', 400))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError('User not found', 404))
    }

    const PRICE_PER_10_QUIZZES = 99 // ₹99
    const amount = Math.round((quizzesToUnlock / 10) * PRICE_PER_10_QUIZZES * 100) // paise

    console.log(`💳 Creating order for ${user.email}: ${quizzesToUnlock} quizzes (₹${(amount / 100).toFixed(2)})`)

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `${userId.slice(-8)}_${Date.now().toString().slice(-8)}`,  //reduce receipt length
      //description: `${quizzesToUnlock} quiz unlocks for ${user.email}`,
      //customer_notify: 1,
    }

    const order = await razorpay.orders.create(options)

    const payment = await Payment.create({
      user: userId,
      razorpayOrderId: order.id,
      amount: amount / 100,
      currency: 'INR',
      status: 'pending',
      quizzesUnlocked: quizzesToUnlock,
      description: `${quizzesToUnlock} quiz unlocks`,
      metadata: { userId: userId.toString(), quizzesToUnlock },
    })

    console.log(`✅ Order created: ${order.id}`)

    res.status(200).json({
      success: true,
      message: 'Payment order created',
      orderId: order.id,
      amount: amount / 100,
      currency: 'INR',
      quizzesToUnlock,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Razorpay error:', JSON.stringify(error, null, 2))
    next(error)
  }
}

// Verify payment signature
const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.userId
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(createError('Missing payment details', 400))
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (razorpaySignature !== expectedSignature) {
      console.error('❌ Invalid signature for order:', razorpayOrderId)
      return next(createError('Invalid payment signature', 400))
    }

    console.log(`✅ Signature verified for order: ${razorpayOrderId}`)

    const payment = await Payment.findOne({
      razorpayOrderId: razorpayOrderId,
      user: userId,
    })

    if (!payment) {
      return next(createError('Payment record not found', 404))
    }

    payment.status = 'succeeded'
    payment.razorpayPaymentId = razorpayPaymentId
    payment.razorpaySignature = razorpaySignature
    await payment.save()

    const user = await User.findById(userId)
    user.quizzesPaid += payment.quizzesUnlocked
    await user.save()

    console.log(`✅ ${user.email} unlocked ${payment.quizzesUnlocked} more quizzes`)

    res.status(200).json({
      success: true,
      message: 'Payment successful! Your quizzes have been unlocked.',
      quizzesUnlocked: payment.quizzesUnlocked,
      newTotal: user.quizzesPaid,
      paymentId: razorpayPaymentId,
    })
  } catch (error) {
    console.error('Error verifying payment:', error.message)
    next(error)
  }
}

// Handle webhook
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const body = req.rawBody || JSON.stringify(req.body)

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature')
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const event = req.body.event
    const eventData = req.body.payload.payment.entity

    console.log(`🔔 Webhook received: ${event}`)

    if (event === 'payment.authorized' || event === 'payment.captured') {
      const payment = await Payment.findOne({
        razorpayOrderId: eventData.order_id,
      })

      if (payment && payment.status === 'pending') {
        payment.status = 'succeeded'
        payment.razorpayPaymentId = eventData.id
        await payment.save()

        const user = await User.findById(payment.user)
        user.quizzesPaid += payment.quizzesUnlocked
        await user.save()

        console.log(`✅ Webhook: Payment confirmed for order ${eventData.order_id}`)
      }
    } else if (event === 'payment.failed') {
      const payment = await Payment.findOne({
        razorpayOrderId: eventData.order_id,
      })

      if (payment) {
        payment.status = 'failed'
        await payment.save()
        console.log(`❌ Webhook: Payment failed for order ${eventData.order_id}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// Get payment history
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.userId
    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments.map((p) => ({
        _id: p._id,
        orderId: p.razorpayOrderId,
        paymentId: p.razorpayPaymentId,
        amount: `₹${p.amount}`,
        status: p.status,
        quizzesUnlocked: p.quizzesUnlocked,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  canCreateQuiz,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
}