'use client'

import { useState, useEffect, useRef } from 'react'

interface RPSProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string
    seed?: string | null
}

type Choice = 'rock' | 'paper' | 'scissors' | null

interface GameState {
    currentRound: number
    rounds: Array<{
        roundNumber: number
        player1Choice: string | null
        player2Choice: string | null
        winner: 1 | 2 | 'tie' | null
        player1Submitted: boolean
        player2Submitted: boolean
    }>
    player1Wins: number
    player2Wins: number
    gameComplete: boolean
    finalWinner: 1 | 2 | 'tie' | null
}

export default function RockPaperScissors({ onComplete, isActive, matchId, seed }: RPSProps) {
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [myChoice, setMyChoice] = useState<Choice>(null)
    const [waitingForOpponent, setWaitingForOpponent] = useState(false)
    const [isRevealed, setIsRevealed] = useState(false)
    const [myPlayerNumber, setMyPlayerNumber] = useState<1 | 2 | null>(null)
    const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'tie' | null>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize game
    useEffect(() => {
        if (isActive && matchId) {
            initializeGame()
            // Get my player number
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const user = JSON.parse(userStr)
                determinePlayerNumber(user.id)
            }
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [isActive, matchId])

    const initializeGame = async () => {
        try {
            const response = await fetch(`/api/matches/${matchId}/rps/init`, {
                method: 'POST'
            })
            const data = await response.json()
            if (data.success) {
                setGameState(data.gameState)
                startPolling()
            }
        } catch (error) {
            console.error('Init error:', error)
        }
    }

    const determinePlayerNumber = async (userId: string) => {
        try {
            const response = await fetch(`/api/matches/${matchId}/poll`)
            const data = await response.json()
            if (data.success && data.match.players) {
                const playerIndex = data.match.players.findIndex((p: any) => p.userId === userId)
                setMyPlayerNumber(playerIndex === 0 ? 1 : 2)
            }
        } catch (error) {
            console.error('Player number error:', error)
        }
    }

    const startPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
        }
        pollingRef.current = setInterval(pollGameState, 500)
    }

    const pollGameState = async () => {
        try {
            const response = await fetch(`/api/matches/${matchId}/rps/state`)
            const data = await response.json()
            if (data.success && data.gameState) {
                setGameState(data.gameState)

                // Check if game is complete
                if (data.gameState.gameComplete) {
                    handleGameComplete(data.gameState)
                }
            }
        } catch (error) {
            console.error('Poll error:', error)
        }
    }

    const makeChoice = async (choice: Choice) => {
        if (!gameState || myChoice || !myPlayerNumber) return

        setMyChoice(choice)
        setWaitingForOpponent(true)

        try {
            const userStr = localStorage.getItem('user')
            if (!userStr) return

            const user = JSON.parse(userStr)

            const response = await fetch(`/api/matches/${matchId}/rps/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    roundNumber: gameState.currentRound,
                    choice
                })
            })

            const data = await response.json()
            if (data.success && data.bothSubmitted) {
                // Both players submitted, show result
                showRoundResult(data.gameState)
            }
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const showRoundResult = (state: GameState) => {
        const currentRoundData = state.rounds.find(r => r.roundNumber === state.currentRound - 1)
        if (!currentRoundData) return

        setIsRevealed(true)

        // Determine if I won
        if (currentRoundData.winner === myPlayerNumber) {
            setRoundResult('win')
        } else if (currentRoundData.winner === 'tie') {
            setRoundResult('tie')
        } else {
            setRoundResult('lose')
        }

        // Reset for next round after 2.5 seconds
        setTimeout(() => {
            setMyChoice(null)
            setWaitingForOpponent(false)
            setIsRevealed(false)
            setRoundResult(null)
        }, 2500)
    }

    // Watch for both players submitting
    useEffect(() => {
        if (!gameState || !myPlayerNumber) return

        const currentRoundData = gameState.rounds.find(r => r.roundNumber === gameState.currentRound)
        if (currentRoundData && currentRoundData.player1Submitted && currentRoundData.player2Submitted && waitingForOpponent) {
            showRoundResult(gameState)
        }
    }, [gameState, myPlayerNumber, waitingForOpponent])

    const handleGameComplete = (state: GameState) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
        }

        // Calculate score: wins * 10
        const myWins = myPlayerNumber === 1 ? state.player1Wins : state.player2Wins
        const score = myWins * 10

        setTimeout(() => {
            onComplete(score)
        }, 3000)
    }

    if (!gameState || !myPlayerNumber) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
                <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
                <div>Initialisation du jeu...</div>
            </div>
        )
    }

    const myWins = myPlayerNumber === 1 ? gameState.player1Wins : gameState.player2Wins
    const opponentWins = myPlayerNumber === 1 ? gameState.player2Wins : gameState.player1Wins
    const currentRoundData = gameState.rounds.find(r => r.roundNumber === gameState.currentRound)
    const opponentChoice = myPlayerNumber === 1 ? currentRoundData?.player2Choice : currentRoundData?.player1Choice

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Score Display */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: 'white'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)'
                }}>
                    Vous: {myWins}
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '10px 20px',
                    borderRadius: '10px'
                }}>
                    Manche {gameState.currentRound}/15
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)'
                }}>
                    Adversaire: {opponentWins}
                </div>
            </div>

            {/* Opponent Choice (Revealed) */}
            {isRevealed && (
                <div style={{
                    fontSize: '6rem',
                    marginBottom: '20px',
                    animation: 'bounce 0.5s ease'
                }}>
                    {opponentChoice === 'rock' && '✊'}
                    {opponentChoice === 'paper' && '✋'}
                    {opponentChoice === 'scissors' && '✌️'}
                </div>
            )}

            {/* Result Display */}
            {isRevealed && roundResult && (
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '20px',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                    {roundResult === 'win' && '🏆 Vous gagnez!'}
                    {roundResult === 'lose' && '😔 Vous perdez'}
                    {roundResult === 'tie' && '🤝 Égalité!'}
                </div>
            )}

            {/* Waiting Message */}
            {waitingForOpponent && !isRevealed && (
                <div style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    marginBottom: '30px',
                    animation: 'pulse 1.5s infinite'
                }}>
                    ⏳ En attente de l'adversaire...
                </div>
            )}

            {/* Player Choice Buttons */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                    <button
                        key={choice}
                        onClick={() => makeChoice(choice)}
                        disabled={!!myChoice || isRevealed}
                        style={{
                            fontSize: '5rem',
                            background: myChoice === choice ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                            border: myChoice === choice ? '4px solid white' : '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '20px',
                            padding: '20px',
                            cursor: myChoice || isRevealed ? 'not-allowed' : 'pointer',
                            transform: myChoice === choice ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s ease',
                            opacity: myChoice && myChoice !== choice ? 0.5 : 1
                        }}
                    >
                        {choice === 'rock' && '✊'}
                        {choice === 'paper' && '✋'}
                        {choice === 'scissors' && '✌️'}
                    </button>
                ))}
            </div>

            {/* Game Complete */}
            {gameState.gameComplete && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                        {gameState.finalWinner === myPlayerNumber ? '🏆' : '😔'}
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
                        {gameState.finalWinner === myPlayerNumber ? 'VICTOIRE!' : 'DÉFAITE'}
                    </div>
                    <div style={{ fontSize: '1.5rem', color: '#ccc' }}>
                        Score final: {myWins} - {opponentWins}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
