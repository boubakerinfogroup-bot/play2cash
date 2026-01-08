'use client'

import { useState, useEffect } from 'react'
import seedrandom from 'seedrandom'

interface Card {
    id: number
    emoji: string
    isFlipped: boolean
    isMatched: boolean
}

interface MemoryGameProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}

// MASSIVE EMOJI POOL - 100+ unique emojis for infinite variations!
const EMOJI_POOL = [
    // Games & Entertainment
    '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎼',
    '🎹', '🎺', '🎸', '🎻', '🪕', '🥁', '🎳', '🎾', '⚽', '🏀',
    '🏈', '⚾', '🥎', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑',

    // Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
    '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',

    // Food & Drinks
    '🍕', '🍔', '🍟', '🌭', '🍿', '🥨', '🧀', '🍖', '🍗', '🥓',
    '🥩', '🍞', '🥐', '🥖', '🥯', '🧇', '🥞', '🍰', '🎂', '🧁',
    '🍪', '🍩', '🍨', '🍧', '🍦', '🥧', '🍫', '🍬', '🍭', '🍮',

    // Fruits & Vegetables
    '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥕', '🌽', '🌶️',

    // Objects & Symbols
    '⭐', '⚡', '🔥', '💧', '🌈', '☀️', '🌙', '⛅', '❄️', '💎',
    '🎁', '🎈', '🎊', '🎉', '🏆', '🥇', '🥈', '🥉', '🏅',
    '👑', '💰', '💵', '💴', '💶', '💷', '🔔', '🔑', '🗝️', '🔒'
]

// Function to get random unique emojis for each game
function getRandomEmojis(count: number, seed?: string | null): string[] {
    const rng = seed ? seedrandom(seed) : Math.random
    const shuffled = [...EMOJI_POOL].sort(() => rng() - 0.5)
    return shuffled.slice(0, count)
}

export default function MemoryGame({ matchId, seed, userId, lang, onResultSubmitted }: MemoryGameProps) {
    const [cards, setCards] = useState<Card[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [isChecking, setIsChecking] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])

    // Initialize game with random emojis
    useEffect(() => {
        if (!isCompleted) {
            // Get 14 random emojis from the pool (28 cards total - easier!)
            const randomEmojis = getRandomEmojis(14, seed)
            setSelectedEmojis(randomEmojis)
            initializeGame(randomEmojis)
            setStartTime(Date.now())
        }
    }, [])

    const initializeGame = (emojis: string[]) => {
        // Create pairs of cards with the selected emojis
        const cardPairs = emojis.flatMap((emoji, index) => [
            { id: index * 2, emoji, isFlipped: false, isMatched: false },
            { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
        ])

        // Shuffle cards for random positions every time
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
                    if (newPairs === selectedEmojis.length && !isCompleted) {
                        // Game complete!
                        setIsCompleted(true)
                        onResultSubmitted()
                    }
                    return newPairs
                })
                setFlippedCards([])
                setIsChecking(false)
            } else {
                // No match - flip cards back after brief delay
                setTimeout(() => {
                    // Flip back the unmatched cards
                    setCards(cards.map(card =>
                        newFlippedCards.includes(card.id)
                            ? { ...card, isFlipped: false }
                            : card
                    ))
                    setFlippedCards([])
                    setIsChecking(false)
                }, 800) // 800ms delay so user can see both cards
            }
        }
    }

    return (
        <div style={{
            padding: '10px',
            width: '100%',
            maxWidth: '100vw'
        }}>
            {/* Game Stats - Arabic */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: '15px',
                background: '#1e293b',
                borderRadius: '10px',
                padding: '10px',
                gap: '10px',
                direction: 'rtl'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>المحاولات</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{moves}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>الأزواج</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{matchedPairs}/{selectedEmojis.length}</div>
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
                            borderRadius: '16px',
                            transition: 'transform 0.3s',
                            transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            background: '#1e293b',
                            border: '3px solid #334155',
                            fontSize: '1.8rem',
                            opacity: 1,
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
                fontSize: '0.8rem',
                direction: 'rtl'
            }}>
                💡 اعثر على الأزواج المتطابقة!
            </div>
        </div>
    )
}
