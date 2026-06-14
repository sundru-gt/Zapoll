const pdfParse = require('pdf-parse')
const { generateQuestionsFromPDF } = require('../services/aiService')
const { createError } = require('../middleware/errorHandler')

console.log(pdfParse);
// -------------------------------------------------------
// @desc    Extract text from PDF and generate questions
// @route   POST /api/ai/generate-from-pdf
// @access  Private
// -------------------------------------------------------
const generateFromPDF = async (req, res, next) => {
  try {
    // 1. Check if file was uploaded
    if (!req.file) {
      return next(createError('No PDF file provided', 400))
    }

    // 2. Check if file is PDF
    if (req.file.mimetype !== 'application/pdf') {
      return next(createError('File must be a PDF', 400))
    }

    // 3. Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (req.file.size > maxSize) {
      return next(createError('PDF must be under 5MB', 400))
    }

    console.log('📄 Processing PDF:', req.file.originalname)

    // 4. Parse PDF and extract text
    const data = await pdfParse(req.file.buffer)
    let extractedText = data.text

    // 5. Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      return next(createError('Could not extract text from PDF. It may be a scanned image.', 400))
    }

    console.log(`✅ Extracted ${extractedText.length} characters from PDF`)

    // 6. Limit text to avoid API limits (Gemini has token limits)
    // Keep first 10,000 characters
    const maxChars = 10000
    if (extractedText.length > maxChars) {
      extractedText = extractedText.substring(0, maxChars) + '...'
    }

    // 7. Get number of questions to generate (from query or default to 5)
    const count = parseInt(req.query.count) || 5
    if (count < 1 || count > 20) {
      return next(createError('Question count must be between 1 and 20', 400))
    }

    console.log(`🤖 Generating ${count} questions...`)

    // 8. Generate questions using Gemini
    const questions = await generateQuestionsFromPDF(extractedText, count)

    console.log(`✨ Generated ${questions.length} questions`)

    // 9. Return questions
    res.status(200).json({
      success: true,
      message: `Generated ${questions.length} questions from PDF`,
      fileName: req.file.originalname,
      textLength: data.text.length,
      questions,
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    next(error)
  }
}

module.exports = { generateFromPDF }