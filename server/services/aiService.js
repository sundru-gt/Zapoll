const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Generate MCQ questions from PDF text
const generateQuestionsFromPDF = async (pdfText, count = 5) => {
  try {
    const prompt = `You are an expert quiz creator. Based on the following text, generate exactly ${count} multiple-choice questions.

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer
4. A brief explanation

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "text": "Question here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "correctAnswer": "Option B",
      "explanation": "Explanation here."
    }
  ]
}

TEXT:
${pdfText}

Generate the questions now:`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.questions
  } catch (error) {
    console.error('Error generating questions:', error)
    throw error
  }
}

// Generate explanation for an answer
const generateExplanation = async (question, selectedAnswer, correctAnswer) => {
  try {
    const prompt = `Question: ${question}
Selected Answer: ${selectedAnswer}
Correct Answer: ${correctAnswer}

Provide a brief one-sentence explanation of why the correct answer is right. Keep it under 50 words.`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error generating explanation:', error)
    throw error
  }
}

module.exports = { generateQuestionsFromPDF, generateExplanation }