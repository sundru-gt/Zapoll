const Razorpay = require('razorpay')
const crypto = require('crypto')
const User = require('../models/User')
const Payment = require('../models/Payment')
const { createError } = require('../middleware/errorHandler')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

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
const createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.userId
    const { quizzesToUnlock } = req.body

    // Validation
    if (!quizzesToUnlock || quizzesToUnlock < 1) {
      return next(createError('Invalid number of quizzes to unlock', 400))
    }

    if (quizzesToUnlock > 100) {
      return next(createError('Cannot unlock more than 100 quizzes at once', 400))
    }

    const user = await User.findById(userId)
    if (!user) {
      return next(createError('User not found', 404))
    }
    // Check for duplicate pending orders (Edge Case 1)
    const pendingPayment = await Payment.findOne({
      user: userId,
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
    })

    if (pendingPayment) {
      console.warn(`⚠️ Duplicate order attempt by ${user.email}`)
      return next(
        createError(
          'You have a pending payment. Please complete or cancel it before creating a new one.',
          409
        )
      )
    }

    // Calculate amount
    const PRICE_PER_10_QUIZZES = 99 // ₹99
    const amount = Math.round((quizzesToUnlock / 10) * PRICE_PER_10_QUIZZES * 100) // paise

    console.log(`💳 Creating order for ${user.email}: ${quizzesToUnlock} quizzes (₹${(amount / 100).toFixed(2)})`)

    // Create Razorpay order
    const receiptId = `${userId.slice(-8)}_${Date.now().toString().slice(-8)}`

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: receiptId,
    }

    let order
    try {
      order = await razorpay.orders.create(options)
    } catch (razorpayError) {
      console.error('❌ Razorpay API error:', razorpayError.message)
      return next(
        createError(
          `Payment service error: ${razorpayError.message}. Please try again.`,
          503
        )
      )
    }

    // Save payment record
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
    console.error('Error creating payment order:', error.message)
    next(error)
  }
}


const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.userId
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body


    // Validation

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(createError('Missing payment details', 400))
    }

    if (razorpayOrderId.length < 10 || razorpayPaymentId.length < 10) {
      return next(createError('Invalid payment or order ID format', 400))
    }

    // Find payment record (Edge Case 2: Payment not found)
    const payment = await Payment.findOne({
      razorpayOrderId: razorpayOrderId,
      user: userId,
    })

    if (!payment) {
      console.error(`❌ Payment not found for order: ${razorpayOrderId}`)
      return next(createError('Payment record not found. Invalid order ID.', 404))
    }

    // Check if already processed (Edge Case 3: Duplicate verification)
    if (payment.status === 'succeeded') {
      console.warn(`⚠️ Duplicate verification attempt for order: ${razorpayOrderId}`)
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        quizzesUnlocked: payment.quizzesUnlocked,
        newTotal: (await User.findById(userId)).quizzesPaid,
        paymentId: payment.razorpayPaymentId,
      })
    }

    if (payment.status === 'failed') {
      return next(createError('This payment has already failed. Please create a new order.', 400))
    }

    // Verify signature (Edge Case 4: Invalid signature)
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (razorpaySignature !== expectedSignature) {
      console.error(`❌ Invalid signature for order: ${razorpayOrderId}`)

      // Mark as suspicious
      payment.status = 'failed'
      payment.metadata.failureReason = 'Invalid signature'
      await payment.save()

      return next(createError('Invalid payment signature. Payment marked as failed.', 400))
    }

    console.log(`✅ Signature verified for order: ${razorpayOrderId}`)

    // Update payment status
    payment.status = 'succeeded'
    payment.razorpayPaymentId = razorpayPaymentId
    payment.razorpaySignature = razorpaySignature
    payment.metadata.verifiedAt = new Date()
    await payment.save()


    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { quizzesPaid: payment.quizzesUnlocked } },
      { new: true }
    )

    if (!user) {
      console.error(`❌ User not found during payment verification: ${userId}`)
      // Rollback payment status
      payment.status = 'pending'
      await payment.save()
      return next(createError('User not found', 404))
    }

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

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const body = req.rawBody || JSON.stringify(req.body)

    // Verify webhook signature
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

    console.log(`🔔 Webhook received: ${event} for order ${eventData.order_id}`)

    // Handle payment success events
    if (event === 'payment.authorized' || event === 'payment.captured') {
      const payment = await Payment.findOne({
        razorpayOrderId: eventData.order_id,
      })

      if (!payment) {
        console.warn(`⚠️ Webhook: Payment record not found for order ${eventData.order_id}`)
        return res.status(200).json({ success: true })
      }

      // Check if already processed (Edge Case 6: Duplicate webhook)
      if (payment.status === 'succeeded') {
        console.warn(`⚠️ Webhook: Duplicate payment notification for order ${eventData.order_id}`)
        return res.status(200).json({ success: true })
      }

      // Update payment
      payment.status = 'succeeded'
      payment.razorpayPaymentId = eventData.id
      payment.metadata.webhookProcessedAt = new Date()
      await payment.save()

      // Update user (atomic operation)
      await User.findByIdAndUpdate(
        payment.user,
        { $inc: { quizzesPaid: payment.quizzesUnlocked } },
        { new: true }
      )

      console.log(`✅ Webhook: Payment confirmed for order ${eventData.order_id}`)
    }

    // Handle payment failure events
    else if (event === 'payment.failed') {
      const payment = await Payment.findOne({
        razorpayOrderId: eventData.order_id,
      })

      if (payment && payment.status !== 'failed') {
        payment.status = 'failed'
        payment.metadata.failureReason = eventData.description
        payment.metadata.failedAt = new Date()
        await payment.save()
        console.log(`❌ Webhook: Payment failed for order ${eventData.order_id}`)
      }
    }

    // Handle payment timeout (Edge Case 7: Abandoned payments)
    else if (event === 'payment.timeout') {
      const payment = await Payment.findOne({
        razorpayOrderId: eventData.order_id,
      })

      if (payment && payment.status === 'pending') {
        payment.status = 'canceled'
        payment.metadata.cancelReason = 'Payment timeout'
        payment.metadata.canceledAt = new Date()
        await payment.save()
        console.log(`⏱️ Webhook: Payment timeout for order ${eventData.order_id}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error.message)
    // Always return 200 to Razorpay to prevent retries
    res.status(200).json({ success: false, error: error.message })
  }
}


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

const getPaymentDetails = async (req, res, next) => {
  try {
    const userId = req.userId
    const { orderId } = req.params

    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      user: userId,
    })

    if (!payment) {
      return next(createError('Payment not found', 404))
    }

    res.status(200).json({
      success: true,
      payment: {
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: `₹${payment.amount}`,
        status: payment.status,
        quizzesUnlocked: payment.quizzesUnlocked,
        createdAt: payment.createdAt,
        metadata: payment.metadata,
      },
    })
  } catch (error) {
    next(error)
  }
}


const cancelPayment = async (req, res, next) => {
  try {
    const userId = req.userId
    const { orderId } = req.params

    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      user: userId,
    })

    if (!payment) {
      return next(createError('Payment not found', 404))
    }

    if (payment.status === 'succeeded') {
      return next(createError('Cannot cancel a completed payment', 400))
    }

    if (payment.status === 'canceled') {
      return next(createError('Payment already canceled', 400))
    }

    // Cancel in Razorpay
    try {
      await razorpay.orders.close(orderId)
    } catch (razorpayError) {
      console.warn(`⚠️ Failed to close order in Razorpay: ${razorpayError.message}`)
      // Continue anyway - update local record
    }

    // Update local record
    payment.status = 'canceled'
    payment.metadata.canceledAt = new Date()
    payment.metadata.canceledBy = 'user'
    await payment.save()

    console.log(`✅ Payment canceled: ${orderId}`)

    res.status(200).json({
      success: true,
      message: 'Payment canceled successfully',
      orderId: orderId,
    })
  } catch (error) {
    console.error('Error canceling payment:', error.message)
    next(error)
  }
}

module.exports = {
  canCreateQuiz,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
  cancelPayment,
}