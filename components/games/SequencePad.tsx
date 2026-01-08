'use client'

import { useState, useEffect, useRef } from 'react'
import seedrandom from 'seedrandom'

interface SequencePadProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}



const COLORS = ['#3b82f6', '#10b981', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1']

export default function SequencePad({ matchId, seed, userId, lang, onResultSubmitted }: SequencePadProps) {
    const [sequence, setSequence] = useState<number[]>([])
    const [playerInput, setPlayerInput] = useState<number[]>([])
    const [currentLevel, setCurrentLevel] = useState(1)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPlayerTurn, setIsPlayerTurn] = useState(false)
    const [lightedTile, setLightedTile] = useState<number | null>(null)
    const [isGameOver, setIsGameOver] = useState(false)
    const randomGen = useRef<(() => number) | null>(null)

    // Initialize seeded random
    useEffect(() => {
        randomGen.current = seedrandom(seed)
    }, [seed])

    // Start game
    useEffect(() => {
        if (!isGameOver) {
            startNewRound()
        }
    }, [])

    const startNewRound = () => {
        const rng = randomGen.current || (() => Math.random())
        const newSequence: number[] = []
        // Increase difficulty: 3, 5, 7, 9, 11... (+2 each level)
        const sequenceLength = 3 + ((currentLevel - 1) * 2)
        for (let i = 0; i < sequenceLength; i++) {
            newSequence.push(Math.floor(rng() * 9))
        }

        setSequence(newSequence)
        setPlayerInput([])
        setIsPlayerTurn(false)
        playSequence(newSequence)
    }

    const playSequence = async (seq: number[]) => {
        setIsPlaying(true)

        // Faster playback at higher levels
        const baseDelay = Math.max(200, 400 - (currentLevel * 15))
        const showDuration = Math.max(300, 600 - (currentLevel * 20))

        for (let i = 0; i < seq.length; i++) {
            await new Promise(resolve => setTimeout(resolve, baseDelay))
            setLightedTile(seq[i])
            await new Promise(resolve => setTimeout(resolve, showDuration))
            setLightedTile(null)
        }

        setIsPlaying(false)
        setIsPlayerTurn(true)
    }

    const handleTileClick = (index: number) => {
        if (!isPlayerTurn || isPlaying || isGameOver) return

        const newInput = [...playerInput, index]
        setPlayerInput(newInput)

        // Check if correct
        if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
            // Wrong! Game over
            handleGameOver()
            return
        }

        // Check if sequence completed
        if (newInput.length === sequence.length) {
            // Level complete!
            setCurrentLevel(prev => prev + 1)
            setTimeout(() => startNewRound(), 1000)
        }
    }

    const handleGameOver = () => {
        setIsGameOver(true)
        onResultSubmitted()
    }



    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Stats - Arabic */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>المستوى</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{currentLevel}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                    {isPlaying ? 'راقب التسلسل...' : isPlayerTurn ? 'دورك!' : 'استعد...'}
                </div>
            </div>

            {/* Game Grid - 3x3 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px'
            }}>
                {[...Array(9)].map((_, index) => {
                    const isLit = lightedTile === index
                    const isClicked = playerInput.includes(index)

                    return (
                        <button
                            key={index}
                            onClick={() => handleTileClick(index)}
                            disabled={!isPlayerTurn || isPlaying || isGameOver}
                            style={{
                                aspectRatio: '1',
                                border: 'none',
                                borderRadius: '0',
                                background: isLit ? COLORS[index] : isClicked ? `${COLORS[index]}80` : '#e2e8f0',
                                cursor: isPlayerTurn && !isPlaying ? 'pointer' : 'default',
                                transform: isLit ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s',
                                boxShadow: isLit ? `0 8px 20px ${COLORS[index]}80` : '0 2px 8px rgba(0,0,0,0.1)',
                                minHeight: '100px',
                                overflow: 'hidden'
                            }}
                        />
                    )
                })}
            </div>

            {/* Game Over */}
            {isGameOver && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #ef4444',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                    direction: 'rtl'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                        خطأ!
                    </div>
                    <div style={{ fontSize: '1rem', color: '#64748b' }}>
                        النقاط: {(currentLevel - 1) * 100}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl',
                marginTop: '16px'
            }}>
                💡 راقب التسلسل ثم كرره بنفس الترتيب!
            </div>
        </div>
    )
}
