const { createRoom, getRoom, deleteRoom, getAllRooms } = require('../services/socketService')
const Room = require('../models/Room')

const setupQuizNamespace = (io) => {
  const quizNamespace = io.of('/quiz')

  quizNamespace.on('connection', (socket) => {
    console.log(`📱 User connected: ${socket.id}`)

    // EVENT: Host creates/starts a quiz
    socket.on('hostStartQuiz', async (data) => {
      try {
        const { roomCode, roomId, title, totalQuestions, hostId } = data

        console.log(`🚀 Host starting quiz: ${roomCode}`)

        const quizRoom = createRoom(roomCode, roomId, title, socket.id, totalQuestions)
        socket.join(roomCode)

        const dbRoom = await Room.findById(roomId).populate('questions')

        socket.emit('quizReady', {
          code: roomCode,
          title: quizRoom.title,
          totalQuestions: quizRoom.totalQuestions,
          firstQuestion: dbRoom.questions[0],
        })

        console.log(`✅ Quiz ready: ${roomCode}`)
      } catch (error) {
        console.error('Error starting quiz:', error)
        socket.emit('error', { message: 'Failed to start quiz' })
      }
    })

    // EVENT: Participant joins quiz
    socket.on('joinQuiz', (data) => {
      try {
        const { roomCode, participantName, participantEmail } = data

        console.log(`👤 Participant joining: ${participantName} to room ${roomCode}`)

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        quizRoom.addParticipant(socket.id, participantName, participantEmail)
        socket.join(roomCode)

        socket.emit('joinSuccess', {
          roomCode,
          title: quizRoom.title,
          participantCount: quizRoom.getParticipantCount(),
          status: quizRoom.status,
        })

        quizNamespace.to(roomCode).emit('participantJoined', {
          name: participantName,
          count: quizRoom.getParticipantCount(),
          leaderboard: quizRoom.getLeaderboard(),
        })

        console.log(`✅ ${participantName} joined. Total: ${quizRoom.getParticipantCount()}`)
      } catch (error) {
        console.error('Error joining quiz:', error)
        socket.emit('error', { message: 'Failed to join quiz' })
      }
    })


    // EVENT: Host displays question
    socket.on('displayQuestion', async (data) => {
      try {
        const { roomCode, questionIndex } = data

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        const dbRoom = await Room.findById(quizRoom.roomId).populate('questions')
        const question = dbRoom.questions[questionIndex]

        if (!question) {
          socket.emit('error', { message: 'Question not found' })
          return
        }

        quizRoom.status = 'active'
        quizRoom.currentQuestionIndex = questionIndex
        quizRoom.questionStartTime = Date.now()
        quizRoom.currentQuestionAnswers = {}

        console.log(`📝 Displaying question ${questionIndex + 1}/${quizRoom.totalQuestions}`)

        quizNamespace.to(roomCode).emit('questionDisplayed', {
          questionIndex,
          questionNumber: questionIndex + 1,
          totalQuestions: quizRoom.totalQuestions,
          question: {
            text: question.text,
            options: question.options.map(opt => opt.text),
          },
          duration: quizRoom.questionDuration,
          startTime: quizRoom.questionStartTime,
        })

        console.log(`✅ Question displayed to room ${roomCode}`)
      } catch (error) {
        console.error('Error displaying question:', error)
        socket.emit('error', { message: 'Failed to display question' })
      }
    })

    // EVENT: Participant submits answer
    socket.on('submitAnswer', async (data) => {
      try {
        const { roomCode, questionIndex, selectedAnswer } = data

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) return

        const dbRoom = await Room.findById(quizRoom.roomId).populate('questions')
        const question = dbRoom.questions[questionIndex]
        const correctAnswer = question.correctAnswer

        const timeToAnswer = (Date.now() - quizRoom.questionStartTime) / 1000

        const result = quizRoom.recordAnswer(socket.id, selectedAnswer, correctAnswer, timeToAnswer)

        socket.emit('answerSubmitted', {
          isCorrect: result.isCorrect,
          pointsEarned: result.pointsEarned.toFixed(2),
          newScore: result.newTotalScore.toFixed(2),
          message: result.isCorrect ? '✅ Correct!' : '❌ Incorrect',
        })

        const stats = quizRoom.getResponseStats(correctAnswer)
        quizNamespace.to(roomCode).emit('responseUpdate', {
          answersReceived: stats.total,
          totalParticipants: quizRoom.getParticipantCount(),
          responsePercentage: (stats.total / quizRoom.getParticipantCount() * 100).toFixed(1),
          stats: stats.stats,
        })

        console.log(`📊 Answers: ${stats.total}/${quizRoom.getParticipantCount()}`)
      } catch (error) {
        console.error('Error submitting answer:', error)
        socket.emit('error', { message: 'Failed to submit answer' })
      }
    })

    // EVENT: Host shows results
    socket.on('showResults', async (data) => {
      try {
        const { roomCode, questionIndex } = data

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) return

        const dbRoom = await Room.findById(quizRoom.roomId).populate('questions')
        const question = dbRoom.questions[questionIndex]

        const stats = quizRoom.getResponseStats(question.correctAnswer)

        console.log(`🎯 Showing results for question ${questionIndex + 1}`)

        quizNamespace.to(roomCode).emit('resultsDisplayed', {
          questionIndex,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          stats: stats.stats,
          leaderboard: quizRoom.getLeaderboard(),
        })
      } catch (error) {
        console.error('Error showing results:', error)
        socket.emit('error', { message: 'Failed to show results' })
      }
    })

    // EVENT: Host moves to next question
    socket.on('nextQuestion', async (data) => {
      try {
        const { roomCode } = data

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) return

        const hasNext = quizRoom.nextQuestion()

        if (hasNext) {
          console.log(`➡️ Moving to question ${quizRoom.currentQuestionIndex + 1}`)

          quizNamespace.to(roomCode).emit('nextQuestionReady', {
            questionIndex: quizRoom.currentQuestionIndex,
            questionNumber: quizRoom.currentQuestionIndex + 1,
          })
        } else {
          quizRoom.endQuiz()
          quizNamespace.to(roomCode).emit('quizEnded', {
            finalLeaderboard: quizRoom.getLeaderboard(),
          })

          console.log(`🏁 Quiz ended`)
        }
      } catch (error) {
        console.error('Error moving to next question:', error)
        socket.emit('error', { message: 'Failed to move to next question' })
      }
    })

    // EVENT: Host ends quiz manually
    socket.on('endQuiz', (data) => {
      try {
        const { roomCode } = data

        const quizRoom = getRoom(roomCode)
        if (!quizRoom) return

        quizRoom.endQuiz()

        quizNamespace.to(roomCode).emit('quizEnded', {
          finalLeaderboard: quizRoom.getLeaderboard(),
        })

        deleteRoom(roomCode)
        console.log(`🏁 Quiz ended by host: ${roomCode}`)
      } catch (error) {
        console.error('Error ending quiz:', error)
        socket.emit('error', { message: 'Failed to end quiz' })
      }
    })

    // EVENT: Disconnect
    socket.on('disconnect', () => {
      console.log(`📴 User disconnected: ${socket.id}`)

      const allRooms = getAllRooms()
      for (const [roomCode, quizRoom] of Object.entries(allRooms)) {
        if (quizRoom.participants[socket.id]) {
          const participantName = quizRoom.participants[socket.id].name
          quizRoom.removeParticipant(socket.id)

          quizNamespace.to(roomCode).emit('participantLeft', {
            name: participantName,
            count: quizRoom.getParticipantCount(),
          })

          console.log(`👤 ${participantName} left room ${roomCode}`)

          if (quizRoom.getParticipantCount() === 0) {
            deleteRoom(roomCode)
          }
        }
      }
    })
  })

  console.log('✅ Quiz namespace initialized')
}

module.exports = { setupQuizNamespace }