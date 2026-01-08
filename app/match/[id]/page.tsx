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

    // Disconnect detection
    const [pollFailures, setPollFailures] = useState(0)
    const [confirmationCount, setConfirmationCount] = useState(0)
    const [opponentDisconnected, setOpponentDisconnected] = useState(false)
    const [disconnectCountdown, setDisconnectCountdown] = useState(20)
    const [allowLeave, setAllowLeave] = useState(false)

    useEffect(() => {
        loadMatch()
        const pollInterval = setInterval(loadMatch, 500) // Poll every 500ms for real-time sync
        return () => clearInterval(pollInterval)
    }, [params.id])

    // Disconnect detection: beforeunload handler with triple confirmation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allowLeave || phase !== 'playing') return

            // First confirmation
            const firstConfirm = window.confirm('⚠️ Are you sure you want to leave? You\'ll lose this match!')
            if (!firstConfirm) {
                e.preventDefault()
                return
            }

            // Second confirmation
            const secondConfirm = window.confirm('⚠️ Leaving will result in a LOSS and forfeit your stake. Continue?')
            if (!secondConfirm) {
                e.preventDefault()
                return
            }

            // Third and final confirmation
            const thirdConfirm = window.confirm('⚠️ FINAL WARNING: This action is irreversible. Leave and lose?')
            if (thirdConfirm) {
                // All 3 confirmations accepted - forfeit the match
                handleForfeit()
                setAllowLeave(true)
            } else {
                e.preventDefault()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [phase, currentUserId, allowLeave])

    // Opponent disconnect timeout (20 seconds)
    useEffect(() => {
        if (!opponentDisconnected) return

        if (disconnectCountdown <= 0) {
            // Timeout - opponent forfeits
            handleOpponentForfeit()
            return
        }

        const timer = setTimeout(() => {
            setDisconnectCountdown(d => d - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [opponentDisconnected, disconnectCountdown])

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
                setPollFailures(0) // Reset failures on successful poll

                // If opponent reconnected, clear disconnect state
                if (opponentDisconnected) {
                    setOpponentDisconnected(false)
                    setDisconnectCountdown(20)
                }

                // Determine current phase
                if (data.match.status === 'COUNTDOWN') {
                    setPhase('countdown')
                } else if (data.match.status === 'ACTIVE') {
                    setPhase('playing')
                } else if (data.match.status === 'COMPLETED') {
                    // Match completed - redirect to results
                    window.location.href = `/match/${params.id}/result`
                    return
                }

                // Get current user ID from localStorage
                if (!currentUserId) {
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                        const user = JSON.parse(userStr)
                        setCurrentUserId(user.id)
                    }
                }
            }
        } catch (err: any) {
            console.error('Load match error:', err)

            // Track consecutive poll failures - possible opponent disconnect
            setPollFailures(prev => {
                const newCount = prev + 1
                if (newCount >= 3 && phase === 'playing' && !opponentDisconnected) {
                    // 3+ failures - opponent likely disconnected
                    setOpponentDisconnected(true)
                    setDisconnectCountdown(20)
                }
                return newCount
            })
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
        if (!currentUserId) return

        try {
            const response = await fetch(`/api/matches/${params.id}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    score
                })
            })

            const data = await response.json()
            if (data.success) {
                // If match completed, redirect will happen via polling
                // Otherwise wait for opponent to finish
            }
        } catch (err: any) {
            console.error('Finish game error:', err)
        }
    }

    const handleForfeit = async () => {
        if (!currentUserId) return

        try {
            await fetch(`/api/matches/${params.id}/forfeit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            })
        } catch (err: any) {
            console.error('Forfeit error:', err)
        }
    }

    const handleOpponentForfeit = async () => {
        if (!match) return

        const opponentId = match.players.find(p => p.userId !== currentUserId)?.userId
        if (!opponentId) return

        try {
            await fetch(`/api/matches/${params.id}/forfeit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: opponentId })
            })
            // Poll will redirect to results
        } catch (err: any) {
            console.error('Opponent forfeit error:', err)
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

                    {/* Opponent Disconnect Overlay */}
                    {opponentDisconnected && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                background: '#1e293b',
                                borderRadius: '20px',
                                padding: '40px',
                                maxWidth: '400px',
                                textAlign: 'center',
                                border: '3px solid #ef4444'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔌</div>
                                <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>
                                    Network Issues
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '20px' }}>
                                    {opponent?.user.name} is having connection problems...
                                </p>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 900,
                                    color: '#ef4444',
                                    marginBottom: '10px'
                                }}>
                                    {disconnectCountdown}s
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Waiting for reconnection...
                                </p>
                            </div>
                        </div>
                    )}
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
