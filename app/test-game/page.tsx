'use client'

import { useState } from 'react'
import MemoryGame from '@/components/games/MemoryGame'
import RocketGame from '@/components/games/RocketGame'
import SequencePad from '@/components/games/SequencePad'
import CoinsDrop from '@/components/games/CoinsDrop'
import MazeMystery from '@/components/games/MazeMystery'
import BalanceGame from '@/components/games/BalanceGame'

type GameType = 'memory' | 'rocket' | 'sequence' | 'coins' | 'maze' | 'balance'

export default function TestGamePage() {
    const [score, setScore] = useState<number | null>(null)
    const [selectedGame, setSelectedGame] = useState<GameType>('memory')

    const handleComplete = (finalScore: number) => {
        setScore(finalScore)
        console.log('Game completed with score:', finalScore)
        alert(`Game Finished! Score: ${Math.round(finalScore)}`)
    }

    const handleReset = () => {
        setScore(null)
        window.location.reload()
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '400px',
                margin: '0 auto 20px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '10px'
                }}>
                    🎮 Game Testing Mode
                </h1>

                {/* Game Selector - 5 Games in 3x2 Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <button onClick={() => { setSelectedGame('memory'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'memory' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        🧠<br />Memory
                    </button>
                    <button onClick={() => { setSelectedGame('rocket'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'rocket' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        🚀<br />Rocket
                    </button>
                    <button onClick={() => { setSelectedGame('sequence'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'sequence' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        🎯<br />Sequence
                    </button>
                    <button onClick={() => { setSelectedGame('coins'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'coins' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        💵<br />Dollars
                    </button>
                    <button onClick={() => { setSelectedGame('maze'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'maze' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        🧩<br />Maze
                    </button>
                    <button onClick={() => { setSelectedGame('balance'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'balance' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        ⚖️<br />Balance
                    </button>
                </div>

                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    marginBottom: '10px'
                }}>
                    Development Only - Test games here
                </p>
                {score !== null && (
                    <div style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '10px',
                        fontWeight: 700
                    }}>
                        ✓ Completed! Score: {Math.round(score)}
                    </div>
                )}
                <button
                    onClick={handleReset}
                    style={{
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    🔄 Reset Game
                </button>
            </div>

            {/* Game Rendering - 4 Games */}
            {selectedGame === 'memory' && <MemoryGame isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'rocket' && <RocketGame isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'sequence' && <SequencePad isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'coins' && <CoinsDrop isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'maze' && <MazeMystery isActive={score === null} onComplete={handleComplete} matchId="test-maze-123" />}
            {selectedGame === 'balance' && <BalanceGame isActive={score === null} onComplete={handleComplete} matchId="test-balance-123" />}
        </div>
    )
}
