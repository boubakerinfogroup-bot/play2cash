'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MatchResult {
    id: string
    gameName: string
    stake: number
    platformFee: number
    winnerId: string
    player1: {
        id: string
        name: string
        score: number
    }
    player2: {
        id: string
        name: string
        score: number
    }
}

export default function ResultPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [result, setResult] = useState<MatchResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [lang, setLang] = useState<'fr' | 'ar'>('fr')

    useEffect(() => {
        // Get user and language
        const userStr = localStorage.getItem('user')
        const langStr = localStorage.getItem('language')
        if (userStr) {
            const user = JSON.parse(userStr)
            setCurrentUserId(user.id)
        }
        if (langStr) {
            setLang(langStr as 'fr' | 'ar')
        }

        loadResult()
    }, [params.id])

    const loadResult = async () => {
        try {
            const response = await fetch(`/api/matches/${params.id}/result`)
            const data = await response.json()

            if (data.success) {
                setResult(data.result)
            }
        } catch (err: any) {
            console.error('Load result error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ fontSize: '2rem', color: 'white' }}>⏳</div>
            </div>
        )
    }

    if (!result) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
                <h1 style={{ fontSize: '1.5rem', color: '#ef4444' }}>{lang === 'ar' ? 'النتيجة غير متوفرة' : 'Résultat non disponible'}</h1>
            </div>
        )
    }

    const isWinner = currentUserId === result.winnerId
    const winnerAmount = (result.stake * 2) - result.platformFee
    const myScore = currentUserId === result.player1.id ? result.player1.score : result.player2.score
    const opponentScore = currentUserId === result.player1.id ? result.player2.score : result.player1.score
    const opponentName = currentUserId === result.player1.id ? result.player2.name : result.player1.name

    return (
        <div style={{
            minHeight: '100vh',
            background: isWinner
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background */}
            {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: `${300 + i * 100}px`,
                    height: `${300 + i * 100}px`,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    animation: `pulse ${3 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    zIndex: 0
                }} />
            ))}

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', width: '100%' }}>
                {/* Result Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                        {isWinner ? '🏆' : '😔'}
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: '12px',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {isWinner
                            ? (lang === 'ar' ? 'فزت!' : 'Vous avez gagné!')
                            : (lang === 'ar' ? 'خسرت' : 'Vous avez perdu')
                        }
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                        {result.gameName}
                    </p>
                </div>

                {/* Scores */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.2rem', fontWeight: 700 }}>
                        {lang === 'ar' ? 'النتائج' : 'Scores'}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                                {lang === 'ar' ? 'أنت' : 'Vous'}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: isWinner ? '#10b981' : '#ef4444' }}>
                                {myScore}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 700 }}>VS</div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                                {opponentName}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: !isWinner ? '#10b981' : '#ef4444' }}>
                                {opponentScore}
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>
                                {lang === 'ar' ? 'المبلغ المراهن' : 'Mise'}
                            </span>
                            <span style={{ fontWeight: 600 }}>{result.stake} TND</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>
                                {lang === 'ar' ? 'رسوم المنصة (5%)' : 'Frais plateforme (5%)'}
                            </span>
                            <span style={{ fontWeight: 600, color: '#f59e0b' }}>-{result.platformFee.toFixed(2)} TND</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '12px',
                            borderTop: '2px solid #e2e8f0',
                            marginTop: '12px'
                        }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                {isWinner
                                    ? (lang === 'ar' ? 'أرباحك' : 'Vos gains')
                                    : (lang === 'ar' ? 'خسارتك' : 'Votre perte')
                                }
                            </span>
                            <span style={{
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                color: isWinner ? '#10b981' : '#ef4444'
                            }}>
                                {isWinner ? '+' : '-'}{isWinner ? winnerAmount.toFixed(2) : result.stake} TND
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <Link
                    href="/"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.95)',
                        color: isWinner ? '#10b981' : '#ef4444',
                        padding: '18px',
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🏠 {lang === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
                </Link>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
