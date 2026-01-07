'use client'

import { useState } from 'react'
import MemoryGame from '@/components/games/MemoryGame'
import RocketGame from '@/components/games/RocketGame'
import SequencePad from '@/components/games/SequencePad'
import RockPaperScissors from '@/components/games/RockPaperScissors'
import TicTacToePlus from '@/components/games/TicTacToePlus'
import PatternLock from '@/components/games/PatternLock'
import BankerGame from '@/components/games/BankerGame'

type GameType = 'memory' | 'rocket' | 'sequence' | 'rps' | 'tictactoe' | 'pattern' | 'banker'

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

                {/* Game Selector - 7 Games */}
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
                    <button onClick={() => { setSelectedGame('rps'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'rps' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        ✊<br />RPS
                    </button>
                    <button onClick={() => { setSelectedGame('tictactoe'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'tictactoe' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        ⭕<br />TicTac
                    </button>
                    <button onClick={() => { setSelectedGame('pattern'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'pattern' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        🔒<br />Pattern
                    </button>
                    <button onClick={() => { setSelectedGame('banker'); setScore(null); }}
                        style={{
                            padding: '16px',
                            background: selectedGame === 'banker' ? '#10b981' : '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}>
                        💰<br />Banker
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

            {/* Game Rendering - 8 Games */}
            {selectedGame === 'memory' && <MemoryGame isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'rocket' && <RocketGame isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'sequence' && <SequencePad isActive={score === null} onComplete={handleComplete} />}
            {selectedGame === 'rps' && <RockPaperScissors isActive={score === null} onComplete={handleComplete} matchId="test-rps-123" />}
            {selectedGame === 'tictactoe' && <TicTacToePlus isActive={score === null} onComplete={handleComplete} matchId="test-ttt-123" />}
            {selectedGame === 'pattern' && <PatternLock isActive={score === null} onComplete={handleComplete} matchId="test-pattern-123" />}
            {selectedGame === 'banker' && <BankerGame isActive={score === null} onComplete={handleComplete} matchId="test-banker-123" />}
        </div>
    )
}
