'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/lib/utils'
import { Share2, X, Check, Timer, Copy } from 'lucide-react'
import { matchesAPI } from '@/lib/api-client'

interface JoinRequest {
    id: string
    userId: string
    user: {
        id: string
        name: string
        accountId: string
        whatsapp: string
    }
    createdAt: string
}

interface MatchData {
    id: string
    gameId: string
    gameName: string
    stake: number
    status: string
    shareLink: string | null
    createdAt: string
    isCreator: boolean
    joinRequests: JoinRequest[]
}

export default function WaitingRoomPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [match, setMatch] = useState<MatchData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [secondsUntilCanCancel, setSecondsUntilCanCancel] = useState(60)
    const [copied, setCopied] = useState(false)
    const [pendingRequest, setPendingRequest] = useState<JoinRequest | null>(null)
    const [opponentJoined, setOpponentJoined] = useState(false)


    useEffect(() => {
        pollMatch()
        const pollInterval = setInterval(pollMatch, 2000) // Poll every 2 seconds
        return () => clearInterval(pollInterval)
    }, [params.id])

    // Countdown timer
    useEffect(() => {
        if (!match) return

        const createdAt = new Date(match.createdAt)
        const updateTimer = () => {
            const now = new Date()
            const elapsed = (now.getTime() - createdAt.getTime()) / 1000
            const remaining = Math.max(0, 60 - elapsed)
            setSecondsUntilCanCancel(Math.ceil(remaining))
        }

        updateTimer()
        const timerInterval = setInterval(updateTimer, 1000)
        return () => clearInterval(timerInterval)
    }, [match])

    // Check for join requests
    useEffect(() => {
        if (match && match.joinRequests.length > 0 && !pendingRequest) {
            setPendingRequest(match.joinRequests[0])
        }
    }, [match?.joinRequests])

    const pollMatch = async () => {
        try {
            const response = await matchesAPI.get(params.id)

            if (!response.success || !response.match) {
                throw new Error('Failed to get match')
            }

            setMatch(response.match)

            // If status changed to COUNTDOWN, redirect to match page
            if (response.match.status === 'COUNTDOWN' || response.match.status === 'ACTIVE') {
                setOpponentJoined(true)
                confetti()
                setTimeout(() => router.push(`/ play ? match = ${params.id} `), 2000)
            } else if (response.match.status === 'CANCELLED') {
                router.push('/lobby')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = () => {
        if (match?.shareLink) {
            navigator.clipboard.writeText(match.shareLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const cancelMatch = async () => {
        if (secondsUntilCanCancel > 0) return

        try {
            const response = await matchesAPI.cancel(params.id)

            if (response.success) {
                router.push('/')
            } else {
                setError(response.error || 'Failed to cancel')
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleAcceptRequest = async () => {
        if (!pendingRequest) return

        try {
            const response = await matchesAPI.acceptJoinRequest(params.id, pendingRequest.id)

            if (response.success) {
                setPendingRequest(null)
                // Will redirect automatically when poll detects COUNTDOWN status
            } else {
                setError(response.error || 'Failed to accept')
                setPendingRequest(null)
            }
        } catch (err: any) {
            setError(err.message)
            setPendingRequest(null)
        }
    }

    const handleRejectRequest = async () => {
        if (!pendingRequest) return

        try {
            const response = await matchesAPI.rejectJoinRequest(params.id, pendingRequest.id)

            if (response.success) {
                setPendingRequest(null)
            } else {
                setError(response.error || 'Failed to reject')
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ fontSize: '2rem' }}>⏳</div>
            </div>
        )
    }

    if (error || !match) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
                <h1 style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '10px' }}>Erreur</h1>
                <p style={{ color: '#64748b' }}>{error || 'Match introuvable'}</p>
            </div>
        )
    }

    if (!match.isCreator) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⛔</div>
                <h1 style={{ fontSize: '1.5rem', color: '#dc2626' }}>Accès refusé</h1>
            </div>
        )
    }

    return (
        <>
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ maxWidth: '500px', width: '100%' }}>
                    {/* Main Card */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏰</div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                                Salle d'attente
                            </h1>
                            <p style={{ color: '#64748b' }}>En attente d'un adversaire...</p>
                        </div>

                        {/* Match Details */}
                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Jeu</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{match.gameName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Mise</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{formatCurrency(match.stake)}</div>
                            </div>
                        </div>

                        {/* Share Link */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                                Partagez ce lien
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={match.shareLink || ''}
                                    readOnly
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'monospace' }}
                                />
                                <button
                                    onClick={handleCopyLink}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        background: copied ? '#10b981' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {copied ? '✓ Copié' : '📋 Copier'}
                                </button>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={handleCancel}
                            disabled={secondsUntilCanCancel > 0}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                background: secondsUntilCanCancel > 0 ? '#e2e8f0' : '#ef4444',
                                color: secondsUntilCanCancel > 0 ? '#94a3b8' : 'white',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: secondsUntilCanCancel > 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {secondsUntilCanCancel > 0
                                ? `Annuler dans ${secondsUntilCanCancel} s`
                                : '❌ Annuler la salle'}
                        </button>
                    </div>

                    {/* Waiting Animation */}
                    <div style={{ textAlign: 'center', color: 'white', opacity: 0.8 }}>
                        <p style={{ fontSize: '0.9rem' }}>🔄 Recherche d'un adversaire...</p>
                    </div>
                </div>
            </div>

            {/* Join Request Popup */}
            {pendingRequest && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 10000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                        animation: 'popIn 0.3s ease-out'
                    }}>
                        <style jsx>{`
@keyframes popIn {
                from {
        opacity: 0;
        transform: scale(0.8);
    }
                to {
        opacity: 1;
        transform: scale(1);
    }
}
`}</style>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎮</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                                Nouveau challenger !
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                <strong>{pendingRequest.user.name}</strong> veut jouer avec vous
                            </p>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>ID Compte</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'monospace', color: '#475569' }}>
                                {pendingRequest.user.accountId}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleAcceptRequest}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✓ Accepter
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕ Refuser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
