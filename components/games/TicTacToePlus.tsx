'use client'

import { useState, useEffect } from 'react'

interface TicTacToePlusProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string
}

export default function TicTacToePlus({ onComplete, isActive, matchId }: TicTacToePlusProps) {
    const ROWS = 6
    const COLS = 4

    const [board, setBoard] = useState<(null | 1 | 2)[][]>(() =>
        Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    )
    const [currentTurn, setCurrentTurn] = useState<1 | 2>(1)
    const [playerWins, setPlayerWins] = useState(0)
    const [opponentWins, setOpponentWins] = useState(0)
    const [currentRound, setCurrentRound] = useState(1)
    const [winner, setWinner] = useState<null | 1 | 2 | 'tie'>(null)
    const [winningLine, setWinningLine] = useState<number[][] | null>(null)
    const [isGameOver, setIsGameOver] = useState(false)

    useEffect(() => {
        if (isActive && !isGameOver) {
            resetGame()
        }
    }, [isActive])

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
        setCurrentTurn(1)
        setPlayerWins(0)
        setOpponentWins(0)
        setCurrentRound(1)
        setWinner(null)
        setWinningLine(null)
        setIsGameOver(false)
    }

    const resetBoard = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
        setCurrentTurn(currentRound % 2 === 0 ? 2 : 1) // Alternate starting player
        setWinner(null)
        setWinningLine(null)
    }

    const makeMove = (row: number, col: number) => {
        if (board[row][col] !== null || winner !== null || currentTurn !== 1) return

        const newBoard = board.map(r => [...r])
        newBoard[row][col] = 1
        setBoard(newBoard)

        const result = checkWinner(newBoard, row, col, 1)
        if (result) {
            handleRoundEnd(result)
        } else {
            setCurrentTurn(2)
            // Simulate opponent move
            setTimeout(() => makeOpponentMove(newBoard), 800)
        }
    }

    const makeOpponentMove = (currentBoard: (null | 1 | 2)[][]) => {
        const emptyCells: [number, number][] = []
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (currentBoard[r][c] === null) {
                    emptyCells.push([r, c])
                }
            }
        }

        if (emptyCells.length === 0) {
            handleRoundEnd({ winner: 'tie', line: null })
            return
        }

        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        const newBoard = currentBoard.map(r => [...r])
        newBoard[row][col] = 2
        setBoard(newBoard)

        const result = checkWinner(newBoard, row, col, 2)
        if (result) {
            handleRoundEnd(result)
        } else {
            setCurrentTurn(1)
        }
    }

    const checkWinner = (board: (null | 1 | 2)[][], row: number, col: number, player: 1 | 2) => {
        const directions = [
            [[0, 1], [0, -1]], // Horizontal
            [[1, 0], [-1, 0]], // Vertical
            [[1, 1], [-1, -1]], // Diagonal \
            [[1, -1], [-1, 1]]  // Diagonal /
        ]

        for (const [dir1, dir2] of directions) {
            const line: number[][] = [[row, col]]

            // Check in first direction
            let r = row + dir1[0], c = col + dir1[1]
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                line.push([r, c])
                r += dir1[0]
                c += dir1[1]
            }

            // Check in opposite direction
            r = row + dir2[0]
            c = col + dir2[1]
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                line.push([r, c])
                r += dir2[0]
                c += dir2[1]
            }

            if (line.length >= 4) {
                return { winner: player, line }
            }
        }

        // Check for tie
        if (board.every(row => row.every(cell => cell !== null))) {
            return { winner: 'tie' as const, line: null }
        }

        return null
    }

    const handleRoundEnd = (result: any) => {
        setWinner(result.winner)
        setWinningLine(result.line)

        setTimeout(() => {
            if (result.winner === 1) {
                const newWins = playerWins + 1
                setPlayerWins(newWins)
                if (newWins === 3) {
                    endGame(true)
                    return
                }
            } else if (result.winner === 2) {
                const newWins = opponentWins + 1
                setOpponentWins(newWins)
                if (newWins === 3) {
                    endGame(false)
                    return
                }
            }

            setCurrentRound(prev => prev + 1)
            setTimeout(resetBoard, 500)
        }, 2000)
    }

    const endGame = (playerWon: boolean) => {
        setIsGameOver(true)
        onComplete(playerWon ? 1000 : 100)
    }

    if (!isActive) return null

    const isWinningCell = (row: number, col: number) => {
        return winningLine?.some(([r, c]) => r === row && c === col) || false
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score */}
            <div style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-around',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>أنت</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{playerWins}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>الجولة {currentRound}/5</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الخصم</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{opponentWins}</div>
                </div>
            </div>

            {/* Board */}
            <div style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '20px',
                padding: '20px',
                border: '3px solid #cbd5e1',
                marginBottom: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    gap: '8px',
                    aspectRatio: `${COLS}/${ROWS}`,
                    position: 'relative',
                    zIndex: 1
                }}>
                    {board.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '8px' }}>
                            {row.map((cell, colIndex) => (
                                <button
                                    key={colIndex}
                                    onClick={() => makeMove(rowIndex, colIndex)}
                                    disabled={cell !== null || winner !== null || currentTurn !== 1 || isGameOver}
                                    style={{
                                        aspectRatio: '1',
                                        background: isWinningCell(rowIndex, colIndex)
                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                            : cell === null
                                                ? 'rgba(255, 255, 255, 0.9)'
                                                : cell === 1
                                                    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' // Yellow for player
                                                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '2rem',
                                        fontWeight: 800,
                                        cursor: cell === null && currentTurn === 1 && !winner ? 'pointer' : 'default',
                                        color: cell === 1 ? '#000000' : 'white', // Black text for yellow cells
                                        boxShadow: cell !== null ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                        transition: 'all 200ms'
                                    }}
                                >
                                    {cell === 1 ? '⭕' : cell === 2 ? '❌' : ''}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                {/* Round Result */}
                {winner && !isGameOver && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: winner === 1 ? 'rgba(16, 185, 129, 0.1)' : winner === 2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        border: `2px solid ${winner === 1 ? '#10b981' : winner === 2 ? '#ef4444' : '#f59e0b'}`,
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: winner === 1 ? '#10b981' : winner === 2 ? '#ef4444' : '#f59e0b',
                        direction: 'rtl'
                    }}>
                        {winner === 1 && '🎉 فزت بالجولة!'}
                        {winner === 2 && '😔 خسرت الجولة'}
                        {winner === 'tie' && '🤝 تعادل'}
                    </div>
                )}
            </div>

            {/* Game Over */}
            {isGameOver && (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    borderRadius: '20px',
                    padding: '30px',
                    textAlign: 'center',
                    direction: 'rtl'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
                        {playerWins > opponentWins ? '🏆' : '💔'}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                        {playerWins > opponentWins ? 'فزت بالمباراة!' : 'خسرت المباراة'}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#14b8a6' }}>
                        {playerWins} - {opponentWins}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl'
            }}>
                💡 صل 4 في صف أو عمود أو قطر - أول من يفوز بـ 3 جولات يربح!
            </div>
        </div>
    )
}
