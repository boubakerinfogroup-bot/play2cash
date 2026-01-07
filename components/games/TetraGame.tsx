'use client'

import { useState, useEffect, useRef } from 'react'

interface TetraGameProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string
}

class SeededRandom {
    private seed: number
    constructor(seed: number) { this.seed = seed }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280
        return this.seed / 233280
    }
}

type PieceType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z'

const PIECES: Record<PieceType, number[][]> = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    L: [[1, 0], [1, 0], [1, 1]],
    J: [[0, 1], [0, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]]
}

export default function TetraGame({ onComplete, isActive, matchId }: TetraGameProps) {
    const COLS = 10
    const ROWS = 20

    const [board, setBoard] = useState<number[][]>(() =>
        Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
    )
    const [currentPiece, setCurrentPiece] = useState<PieceType>('I')
    const [pieceX, setPieceX] = useState(4)
    const [pieceY, setPieceY] = useState(0)
    const [score, setScore] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const [nextPieces, setNextPieces] = useState<PieceType[]>([])

    const randomGen = useRef<SeededRandom | null>(null)
    const gameLoopRef = useRef<number | null>(null)
    const lastDropRef = useRef(0)

    useEffect(() => {
        if (matchId) {
            const seed = parseInt(matchId.replace(/\D/g, '').slice(0, 9)) || 12345
            randomGen.current = new SeededRandom(seed)
            generatePieces()
        }
    }, [matchId])

    useEffect(() => {
        if (isActive && !isGameOver) {
            resetGame()
            gameLoop()
        }

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        }
    }, [isActive])

    const generatePieces = () => {
        const types: PieceType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z']
        const pieces: PieceType[] = []
        const rng = randomGen.current || { next: () => Math.random() }

        for (let i = 0; i < 50; i++) {
            pieces.push(types[Math.floor(rng.next() * types.length)])
        }
        setNextPieces(pieces)
    }

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)))
        setCurrentPiece(nextPieces[0] || 'I')
        setPieceX(4)
        setPieceY(0)
        setScore(0)
        setIsGameOver(false)
        lastDropRef.current = Date.now()
    }

    const gameLoop = () => {
        const now = Date.now()
        if (now - lastDropRef.current > 800) { // Drop every 800ms
            movePieceDown()
            lastDropRef.current = now
        }

        if (!isGameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
    }

    const canMovePiece = (newX: number, newY: number, piece: PieceType) => {
        const shape = PIECES[piece]

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x
                    const boardY = newY + y

                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false
                    if (boardY >= 0 && board[boardY][boardX]) return false
                }
            }
        }
        return true
    }

    const movePieceDown = () => {
        if (canMovePiece(pieceX, pieceY + 1, currentPiece)) {
            setPieceY(prev => prev + 1)
        } else {
            lockPiece()
        }
    }

    const lockPiece = () => {
        const newBoard = board.map(r => [...r])
        const shape = PIECES[currentPiece]

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = pieceY + y
                    const boardX = pieceX + x
                    if (boardY >= 0) {
                        newBoard[boardY][boardX] = 1
                    }
                }
            }
        }

        setBoard(newBoard)

        // Clear lines
        const clearedLines = clearLines(newBoard)
        if (clearedLines > 0) {
            setScore(prev => prev + clearedLines * 100)
        }

        // Spawn new piece
        const nextIndex = Math.min(score / 100 + 1, nextPieces.length - 1)
        const newPiece = nextPieces[nextIndex]
        setCurrentPiece(newPiece)
        setPieceX(4)
        setPieceY(0)

        // Check game over
        if (!canMovePiece(4, 0, newPiece)) {
            handleGameOver()
        }
    }

    const clearLines = (board: number[][]) => {
        const newBoard = board.filter(row => row.some(cell => cell === 0))
        const clearedCount = ROWS - newBoard.length

        while (newBoard.length < ROWS) {
            newBoard.unshift(Array(COLS).fill(0))
        }

        setBoard(newBoard)
        return clearedCount
    }

    const handleGameOver = () => {
        setIsGameOver(true)
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        onComplete(score)
    }

    const moveLeft = () => {
        if (canMovePiece(pieceX - 1, pieceY, currentPiece)) {
            setPieceX(prev => prev - 1)
        }
    }

    const moveRight = () => {
        if (canMovePiece(pieceX + 1, pieceY, currentPiece)) {
            setPieceX(prev => prev + 1)
        }
    }

    const drop = () => {
        while (canMovePiece(pieceX, pieceY + 1, currentPiece)) {
            setPieceY(prev => prev + 1)
        }
        lockPiece()
    }

    if (!isActive) return null

    // Render the board with current piece
    const renderBoard = () => {
        const display = board.map(r => [...r])
        const shape = PIECES[currentPiece]

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = pieceY + y
                    const boardX = pieceX + x
                    if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                        display[boardY][boardX] = 2 // Current piece
                    }
                }
            }
        }

        return display
    }

    const displayBoard = renderBoard()

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score */}
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>النقاط</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{score}</div>
            </div>

            {/* Board */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '10px',
                marginBottom: '20px',
                border: '3px solid #cbd5e1'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    gap: '1px',
                    background: '#0f172a',
                    aspectRatio: `${COLS}/${ROWS}`
                }}>
                    {displayBoard.map((row, y) => (
                        <div key={y} style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '1px' }}>
                            {row.map((cell, x) => (
                                <div
                                    key={x}
                                    style={{
                                        aspectRatio: '1',
                                        background: cell === 2 ? '#3b82f6' : cell === 1 ? '#6366f1' : '#334155',
                                        borderRadius: '2px'
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Game Over Overlay */}
                {isGameOver && (
                    <div style={{
                        marginTop: '16px',
                        padding: '20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid #ef4444',
                        borderRadius: '16px',
                        textAlign: 'center',
                        direction: 'rtl'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎮</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
                            انتهت اللعبة!
                        </div>
                        <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '8px' }}>
                            النقاط: {score}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
            }}>
                <button
                    onClick={moveLeft}
                    disabled={isGameOver}
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    ←
                </button>
                <button
                    onClick={drop}
                    disabled={isGameOver}
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                >
                    ↓
                </button>
                <button
                    onClick={moveRight}
                    disabled={isGameOver}
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    →
                </button>
            </div>

            {/* Instructions */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl',
                marginTop: '16px'
            }}>
                💡 املأ الصفوف الكاملة لتحصل على نقاط!
            </div>
        </div>
    )
}
