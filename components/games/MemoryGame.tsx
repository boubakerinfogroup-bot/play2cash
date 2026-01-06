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
    const [isCompleted, setIsCompleted] = useState(false)

    // Initialize game
    useEffect(() => {
        if (isActive && !isCompleted) {
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
        setIsCompleted(false)
    }

    const handleCardClick = (id: number) => {
        if (isChecking || isCompleted) return
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
                // Match found! - No delay for mobile speed
                setCards(cards.map(card =>
                    newFlippedCards.includes(card.id)
                        ? { ...card, isMatched: true }
                        : card
                ))
                setMatchedPairs(p => {
                    const newPairs = p + 1
                    if (newPairs === EMOJIS.length && !isCompleted) {
                        // Game complete!
                        setIsCompleted(true)
                        const timeTaken = Date.now() - (startTime || Date.now())
                        const score = Math.max(1000 - moves * 10 - timeTaken / 100, 100)
                        onComplete(score)
                    }
                    return newPairs
                })
                setFlippedCards([])
                setIsChecking(false)
            } else {
                // No match - quick flip back for mobile
                setTimeout(() => {
                    setCards(cards.map(card =>
                        newFlippedCards.includes(card.id)
                            ? { ...card, isFlipped: false }
                            : card
                    ))
                    setFlippedCards([])
                    setIsChecking(false)
                }, 600)
            }
        }
    }

    if (!isActive) return null

    return (
        <div style={{
            padding: '10px',
            width: '100%',
            maxWidth: '100vw'
        }}>
            {/* Game Stats - Mobile Only */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: '15px',
                background: '#1e293b',
                borderRadius: '10px',
                padding: '10px',
                gap: '10px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>COUPS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{moves}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>PAIRES</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{matchedPairs}/{EMOJIS.length}</div>
                </div>
            </div>

            {/* Game Grid - Mobile First: 4 columns for phone screens */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        disabled={card.isMatched || isChecking || isCompleted}
                        style={{
                            aspectRatio: '1',
                            borderRadius: '8px',
                            border: card.isFlipped || card.isMatched ? '3px solid #10b981' : '2px solid #475569',
                            background: card.isFlipped || card.isMatched ? '#10b981' : '#1e293b',
                            fontSize: '1.8rem',
                            cursor: (card.isMatched || isCompleted) ? 'default' : 'pointer',
                            opacity: card.isMatched ? 0.3 : 1,
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '75px',
                            userSelect: 'none'
                        }}
                    >
                        {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '12px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.8rem'
            }}>
                💡 Trouvez les paires !
            </div>
        </div>
    )
}
