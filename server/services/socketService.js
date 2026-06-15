const rooms = {}

class QuizRoom {
  constructor(roomCode, roomId, title, hostSocketId) {
    this.roomCode = roomCode
    this.roomId = roomId
    this.title = title
    this.hostSocketId = hostSocketId
    this.status = 'draft'
    this.currentQuestionIndex = 0
    this.totalQuestions = 0
    this.questionStartTime = null
    this.questionDuration = 30
    this.participants = {}
    this.currentQuestionAnswers = {}
  }

  addParticipant(socketId, name, email) {
    this.participants[socketId] = {
      socketId,
      name,
      email,
      score: 0,
      answers: [],
      joinedAt: Date.now(),
    }
  }

  removeParticipant(socketId) {
    delete this.participants[socketId]
  }

  getParticipantCount() {
    return Object.keys(this.participants).length
  }

  getLeaderboard() {
    return Object.values(this.participants)
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        name: p.name,
        score: p.score.toFixed(2),
        correct: p.answers.filter(a => a.correct).length,
      }))
  }

  recordAnswer(socketId, selectedAnswer, correctAnswer, timeToAnswer) {
    const participant = this.participants[socketId]
    if (!participant) return null

    const isCorrect = selectedAnswer === correctAnswer
    const pointsForCorrectness = isCorrect ? 100 : 0
    const pointsForSpeed = Math.max(0, (this.questionDuration - timeToAnswer) / this.questionDuration * 10)
    const totalPoints = pointsForCorrectness + pointsForSpeed

    participant.answers.push({
      questionIndex: this.currentQuestionIndex,
      selected: selectedAnswer,
      correct: isCorrect,
      timeToAnswer,
      points: totalPoints,
    })

    participant.score += totalPoints

    if (!this.currentQuestionAnswers[selectedAnswer]) {
      this.currentQuestionAnswers[selectedAnswer] = []
    }
    this.currentQuestionAnswers[selectedAnswer].push(socketId)

    return {
      isCorrect,
      pointsEarned: totalPoints,
      newTotalScore: participant.score,
    }
  }

  getResponseStats(correctAnswer) {
    const totalAnswers = Object.values(this.currentQuestionAnswers).flat().length
    const stats = {}

    for (const [answer, socketIds] of Object.entries(this.currentQuestionAnswers)) {
      const count = socketIds.length
      const percentage = totalAnswers > 0 ? (count / totalAnswers * 100).toFixed(1) : 0
      stats[answer] = {
        count,
        percentage: parseFloat(percentage),
        isCorrect: answer === correctAnswer,
      }
    }

    return {
      total: totalAnswers,
      stats,
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++
      this.currentQuestionAnswers = {}
      this.questionStartTime = Date.now()
      return true
    }
    return false
  }

  endQuiz() {
    this.status = 'ended'
  }
}

const createRoom = (roomCode, roomId, title, hostSocketId, totalQuestions) => {
  const room = new QuizRoom(roomCode, roomId, title, hostSocketId)
  room.totalQuestions = totalQuestions
  rooms[roomCode] = room
  console.log(`✅ Room created: ${roomCode}`)
  return room
}

const getRoom = (roomCode) => {
  return rooms[roomCode]
}

const deleteRoom = (roomCode) => {
  delete rooms[roomCode]
  console.log(`🗑️ Room deleted: ${roomCode}`)
}

const getAllRooms = () => {
  return rooms
}

module.exports = {
  createRoom,
  getRoom,
  deleteRoom,
  getAllRooms,
  QuizRoom,
}