// Socket.io Server Setup
// For real-time game sync, countdown, disconnect detection

import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { prisma } from './db'

let io: SocketIOServer | null = null

export function initSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
      methods: ["GET", "POST"]
    },
    path: '/api/socket'
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join match room
    socket.on('join-match', async ({ matchId, userId }) => {
      socket.join(`match:${matchId}`)
      socket.data.matchId = matchId
      socket.data.userId = userId

      // Update heartbeat
      await updateHeartbeat(matchId, userId)

      // Notify other players
      socket.to(`match:${matchId}`).emit('opponent-joined', { userId })
    })

    // Heartbeat (every 3 seconds from client)
    socket.on('heartbeat', async ({ matchId, userId }) => {
      await updateHeartbeat(matchId, userId)
    })

    // Check opponent status (every 2 seconds from client)
    socket.on('check-opponent', async ({ matchId, userId }) => {
      const status = await checkOpponentStatus(matchId, userId)
      socket.emit('opponent-status', status)
    })

    // Submit game result
    socket.on('submit-result', async ({ matchId, userId, score, gameData }) => {
      // This will be handled by the API route
      // Socket just notifies other players
      socket.to(`match:${matchId}`).emit('opponent-finished', { userId, score })
    })

    // Leave match
    socket.on('leave-match', async ({ matchId, userId }) => {
      await markPlayerLeft(matchId, userId)
      socket.to(`match:${matchId}`).emit('opponent-left', { userId })
      socket.leave(`match:${matchId}`)
    })

    // Disconnect
    socket.on('disconnect', async () => {
      if (socket.data.matchId && socket.data.userId) {
        await markPlayerLeft(socket.data.matchId, socket.data.userId)
        io?.to(`match:${socket.data.matchId}`).emit('opponent-left', {
          userId: socket.data.userId
        })
      }
      console.log('Client disconnected:', socket.id)
    })
  })

  // Start countdown for active matches
  startCountdownTimer()

  return io
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

async function updateHeartbeat(matchId: string, userId: string) {
  await prisma.matchPlayer.updateMany({
    where: {
      matchId,
      userId
    },
    data: {
      lastHeartbeat: new Date()
    }
  })
}

async function checkOpponentStatus(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: true
    }
  })

  if (!match) {
    return { error: 'Match not found' }
  }

  const opponent = match.players.find(p => p.userId !== userId)

  if (!opponent) {
    return { error: 'Opponent not found' }
  }

  // Check if match is completed
  if (match.status === 'COMPLETED') {
    return {
      matchCompleted: true,
      winnerId: match.winnerId
    }
  }

  // Check if opponent finished
  if (opponent.gameResult) {
    return {
      opponentFinished: true
    }
  }

  // Check if opponent left
  if (opponent.leftGame) {
    return {
      opponentLeft: true
    }
  }

  // Check if opponent disconnected (no heartbeat for > 10 seconds)
  const now = new Date()
  const lastHeartbeat = opponent.lastHeartbeat
  const secondsSinceHeartbeat = lastHeartbeat
    ? (now.getTime() - lastHeartbeat.getTime()) / 1000
    : Infinity

  if (lastHeartbeat && secondsSinceHeartbeat > 10 && secondsSinceHeartbeat < 30) {
    return {
      opponentDisconnected: true,
      secondsSinceHeartbeat
    }
  }

  return {
    opponentConnected: true
  }
}

async function markPlayerLeft(matchId: string, userId: string) {
  await prisma.matchPlayer.updateMany({
    where: {
      matchId,
      userId
    },
    data: {
      leftGame: true,
      leftAt: new Date()
    }
  })

  // If match is active, auto-win for opponent
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: true
    }
  })

  if (match && match.status === 'ACTIVE') {
    const opponent = match.players.find(p => p.userId !== userId)
    if (opponent) {
      // Award win to opponent
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          winnerId: opponent.userId,
          completedAt: new Date()
        }
      })

      // Notify via socket
      io?.to(`match:${matchId}`).emit('match-complete', {
        winnerId: opponent.userId
      })
    }
  }
}

// Countdown timer for active matches
function startCountdownTimer() {
  setInterval(async () => {
    // Find matches that just became active (within last 2 seconds)
    const twoSecondsAgo = new Date(Date.now() - 2000)
    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'ACTIVE',
        startedAt: {
          gte: twoSecondsAgo
        }
      }
    })

    for (const match of recentMatches) {
      // Start countdown (3, 2, 1)
      const io = getIO()
      io.to(`match:${match.id}`).emit('countdown', { number: 3 })
      
      setTimeout(() => {
        io.to(`match:${match.id}`).emit('countdown', { number: 2 })
      }, 1000)

      setTimeout(() => {
        io.to(`match:${match.id}`).emit('countdown', { number: 1 })
      }, 2000)

      setTimeout(() => {
        io.to(`match:${match.id}`).emit('game-start', {
          timestamp: Date.now()
        })
      }, 3000)
    }
  }, 1000) // Check every second
}

