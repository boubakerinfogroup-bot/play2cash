'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import MemoryGame from '@/components/games/MemoryGame'
import RocketGame from '@/components/games/RocketGame'
import SequencePad from '@/components/games/SequencePad'
import RockPaperScissors from '@/components/games/RockPaperScissors'
import TicTacToePlus from '@/components/games/TicTacToePlus'
import PatternLock from '@/components/games/PatternLock'
import BankerGame from '@/components/games/BankerGame'

interface MatchData {
    id: string
    gameId: string
    gameName: string
    gameSlug: string
    stake: number
    platformFee: number
    status: string
    startedAt: string | null
    creator: {
        id: string
        name: string
    }
    players: Array<{
        userId: string
        user: {
            id: string
            name: string
        }
        score: number
    }>
    isCreator: boolean
    isPlayer: boolean
}

export default function MatchPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [match, setMatch] = useState<MatchData | null>(null)
    const [loading, setLoading] = useState(true)
    const [countdown, setCountdown] = useState(10)
    const [phase, setPhase] = useState<'countdown' | 'playing' | 'results'>('countdown')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        loadMatch()
        const pollInterval = setInterval(loadMatch, 2000)
        return () => clearInterval(pollInterval)
    }, [params.id])

    // Countdown timer
    useEffect(() => {
        if (!match || match.status !== 'COUNTDOWN' || !match.startedAt) return

        const startTime = new Date(match.startedAt)
        const updateCountdown = () => {
            const now = new Date()
            const elapsed = (now.getTime() - startTime.getTime()) / 1000
            const remaining = Math.max(0, 10 - elapsed)
            setCountdown(Math.ceil(remaining))

            if (remaining <= 0) {
                startMatch()
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 100)
        return () => clearInterval(interval)
    }, [match])

    const loadMatch = async () => {
        try {
            const response = await fetch(`/api/matches/${params.id}/poll`)
            const data = await response.json()

            if (data.success) {
                setMatch(data.match)

                // Determine current phase
                if (data.match.status === 'COUNTDOWN') {
                    setPhase('countdown')
                } else if (data.match.status === 'ACTIVE') {
                    setPhase('playing')
                } else if (data.match.status === 'COMPLETED') {
                    setPhase('results')
                }

                // Get current user ID from players
                if (!currentUserId && data.match.isPlayer) {
                    // This is a simplification - in real app, get from session
                    setCurrentUserId(data.match.players[0].userId)
                }
            }
        } catch (err: any) {
            console.error('Load match error:', err)
        } finally {
            setLoading(false)
        }
    }

    const startMatch = async () => {
        try {
            await fetch(`/api/matches/${params.id}/start`, {
                method: 'POST'
            })
            setPhase('playing')
        } catch (err: any) {
            console.error('Start match error:', err)
        }
    }

    const handleFinishGame = async (score: number = 100) => {
        // Save game result with actual score from the game
        try {
            const response = await fetch(`/api/matches/${params.id}/save-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score,
                    gameData: { status: 'completed', time: Date.now(), finalScore: score }
                })
            })

            const data = await response.json()
            if (data.success) {
                // Match will update to COMPLETED via polling
            }
        } catch (err: any) {
            console.error('Save result error:', err)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <div style={{ fontSize: '2rem', color: 'white' }}>⏳</div>
            </div>
        )
    }

    if (!match || (!match.isCreator && !match.isPlayer)) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
                <h1 style={{ fontSize: '1.5rem', color: '#ef4444' }}>Accès refusé</h1>
            </div>
        )
    }

    const opponent = match.players.find(p => p.userId !== currentUserId)
    const totalPot = match.stake * 2
    const platformFee = totalPot * 0.05
    const winnerGets = totalPot - platformFee

    // COUNTDOWN PHASE
    if (phase === 'countdown') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    fontSize: '8rem',
                    fontWeight: 900,
                    color: 'white',
                    textShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    animation: 'pulse 1s ease-in-out infinite',
                    marginBottom: '40px'
                }}>
                    {countdown}
                </div>

                <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    Préparez-vous !
                </h1>

                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginTop: '20px'
                }}>
                    <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '8px', textAlign: 'center' }}>
                        🎮 {match.gameName}
                    </p>
                    <p style={{ color: 'white', fontSize: '0.95rem', opacity: 0.9, textAlign: 'center' }}>
                        Vs {opponent?.user.name}
                    </p>
                </div>
            </div>
        )
    }

    // PLAYING PHASE
    if (phase === 'playing') {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                padding: '20px'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Game Header */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>Vous</div>
                            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                                {match.players.find(p => p.userId === currentUserId)?.user.name}
                            </div>
                        </div>
                        <div style={{ color: '#667eea', fontSize: '1.5rem', fontWeight: 800 }}>VS</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>Adversaire</div>
                            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                                {opponent?.user.name}
                            </div>
                        </div>
                    </div>

                    {/* Game Interface - Memory Game */}
                    {(() => {
                        const slug = match.gameSlug?.toLowerCase()

                        // Memory Game
                        if (slug === 'memory') {
                            return (
                                <MemoryGame
                                    isActive={true}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Rocket Game
                        if (slug === 'rocket') {
                            return (
                                <RocketGame
                                    isActive={true}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Sequence Pad
                        if (slug === 'sequence') {
                            return (
                                <SequencePad
                                    isActive={true}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Rock Paper Scissors
                        if (slug === 'rps') {
                            return (
                                <RockPaperScissors
                                    isActive={true}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Tic-Tac-Toe Plus
                        if (slug === 'tictactoe') {
                            return (
                                <TicTacToePlus
                                    isActive={true}
                                    matchId={params.id}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Pattern Lock
                        if (slug === 'pattern') {
                            return (
                                <PatternLock
                                    isActive={true}
                                    matchId={params.id}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Banker Game
                        if (slug === 'banker') {
                            return (
                                <BankerGame
                                    isActive={true}
                                    matchId={params.id}
                                    onComplete={(score) => handleFinishGame(score)}
                                />
                            )
                        }

                        // Fallback for unknown games
                        return (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '24px',
                                padding: '60px 40px',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                                <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>
                                    Game Not Found
                                </h2>
                                <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                                    Game: {match.gameName} (slug: {match.gameSlug})
                                </p>
                            </div>
                        )
                    })()}

                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        💡 Le premier à terminer gagne tout !
                    </div>
                </div>
            </div>
        )
    }

    // RESULTS PHASE
    const winner = match.players.find(p => p.score > 0)
    const isWinner = winner?.userId === currentUserId

    return (
        <div style={{
            minHeight: '100vh',
            background: isWinner
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
                        {isWinner ? '🏆' : '😢'}
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: isWinner ? '#10b981' : '#ef4444',
                        marginBottom: '8px'
                    }}>
                        {isWinner ? 'Victoire !' : 'Défaite'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                        {isWinner
                            ? `Vous avez battu ${opponent?.user.name} !`
                            : `${winner?.user.name} a gagné`
                        }
                    </p>
                </div>

                {/* Earnings Breakdown */}
                <div style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                        Résumé financier
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#64748b' }}>Pot total (2 × mise)</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(totalPot)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#64748b' }}>Commission plateforme (5%)</span>
                        <span style={{ fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(platformFee)}</span>
                    </div>

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {isWinner ? 'Vous recevez' : 'Vous perdez'}
                        </span>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 900,
                            color: isWinner ? '#10b981' : '#ef4444'
                        }}>
                            {isWinner ? '+' : '-'}{formatCurrency(isWinner ? winnerGets : match.stake)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    🎮 Jouer encore
                </button>
            </div>
        </div>
    )
}
