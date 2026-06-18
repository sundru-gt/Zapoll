const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const {
  canCreateQuiz,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
  cancelPayment,
} = require('../controllers/paymentController')

router.get('/can-create-quiz', authMiddleware, canCreateQuiz)
router.post('/create-order', authMiddleware, createPaymentOrder)
router.post('/verify-payment', authMiddleware, verifyPayment)
router.get('/history', authMiddleware, getPaymentHistory)
router.get('/order/:orderId', authMiddleware, getPaymentDetails)
router.post('/cancel/:orderId', authMiddleware, cancelPayment)

// Public routes (signature verified)
router.post('/webhook', handleWebhook)

module.exports = router