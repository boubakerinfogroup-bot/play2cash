'use client'

import { useState } from 'react'
import TurnBasedWrapper from './TurnBasedWrapper'

interface TicTacToeTurnBasedProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}

type CellValue = 'X' | 'O' | null

export default function TicTacToeTurnBased({ matchId, seed, userId, lang, onResultSubmitted }: TicTacToeTurnBasedProps) {
    const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null))
    const [mySymbol, setMySymbol] = useState<'X' | 'O'>('X') // X goes first

    const handleMove = async (moveData: any) => {
        // This is handled by TurnBasedWrapper
    }

    const handleCellClick = (index: number, onSubmitMove: (data: any) => void) => {
        if (board[index]) return // Cell already filled

        const newBoard = [...board]
        newBoard[index] = mySymbol
        setBoard(newBoard)

        onSubmitMove({
            position: index,
            symbol: mySymbol
        })
    }

    return (
        <TurnBasedWrapper
            matchId={matchId}
            userId={userId}
            lang={lang}
            onMove={handleMove}
        >
            {({ isMyTurn, timeRemaining, onSubmitMove }) => (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    padding: '40px'
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: '40px',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {lang === 'ar' ? 'إكس أو' : 'Tic Tac Toe'}
                    </h1>

                    {/* Board */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px',
                        marginBottom: '30px',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {board.map((cell, index) => (
                            <button
                                key={index}
                                onClick={() => isMyTurn && !cell && handleCellClick(index, onSubmitMove)}
                                disabled={!isMyTurn || !!cell}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    background: cell
                                        ? 'rgba(255,255,255,0.3)'
                                        : 'rgba(255,255,255,0.1)',
                                    border: '3px solid rgba(255,255,255,0.4)',
                                    borderRadius: '15px',
                                    cursor: isMyTurn && !cell ? 'pointer' : 'not-allowed',
                                    color: cell === 'X' ? '#4CAF50' : '#2196F3',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    if (isMyTurn && !cell) {
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    if (!cell) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                }}
                            >
                                {cell}
                            </button>
                        ))}
                    </div>

                    {/* Instructions */}
                    <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.25rem',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        {isMyTurn
                            ? (lang === 'ar' ? `دورك! أنت ${mySymbol}` : `Votre tour! Vous êtes ${mySymbol}`)
                            : (lang === 'ar' ? 'دور الخصم...' : "Tour de l'adversaire...")}
                    </p>
                </div>
            )}
        </TurnBasedWrapper>
    )
}
