'use client'

import { useState, useEffect } from 'react'

interface Card {
    id: number
    emoji: string
    isFlipped: boolean
    isMatched: boolean
}

interface MemoryGameProps {
    onComplete: (score: number) => void
    isActive: boolean
}

// 20 unique emojis for maximum difficulty (40 cards total)
const EMOJIS = [
    '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤',
    '🎧', '🎼', '🎹', '🎺', '🎸', '🎻', '🪕', '🥁',
    '🎳', '🎾', '⚽', '🏀'
]

export default function MemoryGame({ onComplete, isActive }: MemoryGameProps) {
    const [cards, setCards] = useState<Card[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    // Initialize game
    useEffect(() => {
        if (isActive) {
            initializeGame()
            setStartTime(Date.now())
        }
    }, [isActive])

    const initializeGame = () => {
        // Create pairs of cards
        const cardPairs = EMOJIS.flatMap((emoji, index) => [
            { id: index * 2, emoji, isFlipped: false, isMatched: false },
            { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
        ])

        // Shuffle cards
        const shuffled = cardPairs.sort(() => Math.random() - 0.5)
        setCards(shuffled)
        setFlippedCards([])
        setMoves(0)
        setMatchedPairs(0)
    }

    const handleCardClick = (id: number) => {
        if (isChecking) return
        if (flippedCards.length >= 2) return
        if (flippedCards.includes(id)) return
        if (cards.find(c => c.id === id)?.isMatched) return

        const newFlippedCards = [...flippedCards, id]
        setFlippedCards(newFlippedCards)

        // Update card to be flipped
        setCards(cards.map(card =>
            card.id === id ? { ...card, isFlipped: true } : card
        ))

        // Check for match when 2 cards are flipped
        if (newFlippedCards.length === 2) {
            setMoves(m => m + 1)
            setIsChecking(true)

            const [first, second] = newFlippedCards
            const firstCard = cards.find(c => c.id === first)
            const secondCard = cards.find(c => c.id === second)

            if (firstCard?.emoji === secondCard?.emoji) {
                // Match found!
                setTimeout(() => {
                    setCards(cards.map(card =>
                        newFlippedCards.includes(card.id)
                            ? { ...card, isMatched: true }
                            : card
                    ))
                    setMatchedPairs(p => {
                        const newPairs = p + 1
                        if (newPairs === EMOJIS.length) {
                            // Game complete!
                            const timeTaken = Date.now() - (startTime || Date.now())
                            const score = Math.max(1000 - moves * 10 - timeTaken / 100, 100)
                            setTimeout(() => onComplete(score), 500)
                        }
                        return newPairs
                    })
                    setFlippedCards([])
                    setIsChecking(false)
                }, 600)
            } else {
                // No match
                setTimeout(() => {
                    setCards(cards.map(card =>
                        newFlippedCards.includes(card.id)
                            ? { ...card, isFlipped: false }
                            : card
                    ))
                    setFlippedCards([])
                    setIsChecking(false)
                }, 1000)
            }
        }
    }

    if (!isActive) return null

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            {/* Game Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white'
            }}>
                <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Coups</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{moves}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Paires</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{matchedPairs}/{EMOJIS.length}</div>
                </div>
            </div>

            {/* Game Grid - 8x5 grid for 40 cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        disabled={card.isMatched || isChecking}
                        style={{
                            aspectRatio: '1',
                            borderRadius: '12px',
                            border: 'none',
                            background: card.isFlipped || card.isMatched
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '2rem',
                            cursor: card.isMatched ? 'default' : 'pointer',
                            transition: 'all 0.3s',
                            transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            opacity: card.isMatched ? 0.5 : 1,
                            boxShadow: card.isFlipped || card.isMatched
                                ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                                : 'none'
                        }}
                    >
                        {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '20px',
                textAlign: 'center',
                color: 'white',
                fontSize: '0.9rem',
                opacity: 0.8
            }}>
                💡 Trouvez toutes les paires pour gagner !
            </div>
        </div>
    )
}
