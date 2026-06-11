const crypto = require('crypto')
const Room = require('../models/Room')

// Generate a random 6-digit code (000000 - 999999)
const generateRandomCode = () => {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0')
}
// checking DB to ensure uniqueness
const generateUniqueCode = async () => {
  let code
  let isUnique = false

  // Keep generating until we find a unique one
  while (!isUnique) {
    code = generateRandomCode()
    const existingRoom = await Room.findOne({ code })
    if (!existingRoom) {
      isUnique = true
    }
  }

  return code
}

module.exports = { generateRandomCode, generateUniqueCode }