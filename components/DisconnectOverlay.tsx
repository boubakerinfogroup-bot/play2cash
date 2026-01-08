'use client'

import { useEffect } from 'react'

interface DisconnectOverlayProps {
    opponentName: string
    secondsRemaining: number
    lang: 'fr' | 'ar'
    onTimeout?: () => void
}

export default function DisconnectOverlay({
    opponentName,
    secondsRemaining,
    lang,
    onTimeout
}: DisconnectOverlayProps) {
    useEffect(() => {
        if (secondsRemaining === 0 && onTimeout) {
            onTimeout()
        }
    }, [secondsRemaining, onTimeout])

    const getColor = () => {
        if (secondsRemaining > 20) return '#10b981'
        if (secondsRemaining > 10) return '#f59e0b'
        return '#ef4444'
    }

    return (
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
            zIndex: 10000,
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: '24px',
                padding: '48px 40px',
                maxWidth: '400px',
                textAlign: 'center',
                border: `3px solid ${getColor()}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                {/* Icon */}
                <div style={{
                    fontSize: '64px',
                    marginBottom: '24px',
                    animation: 'pulse 2s infinite'
                }}>
                    🔌
                </div>

                {/* Title */}
                <h2 style={{
                    color: 'white',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    marginBottom: '12px'
                }}>
                    {lang === 'ar' ? 'انقطاع الاتصال' : 'Déconnexion'}
                </h2>

                {/* Opponent info */}
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1.1rem',
                    marginBottom: '24px'
                }}>
                    {lang === 'ar'
                        ? `${opponentName} غير متصل`
                        : `${opponentName} est déconnecté`}
                </p>

                {/* Countdown */}
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Circle background */}
                    <svg style={{
                        position: 'absolute',
                        transform: 'rotate(-90deg)',
                        width: '100%',
                        height: '100%'
                    }}>
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="#334155"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke={getColor()}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(secondsRemaining / 30) * 339} 339`}
                            style={{
                                transition: 'stroke-dasharray 1s linear, stroke 0.3s ease'
                            }}
                        />
                    </svg>

                    {/* Timer number */}
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: getColor(),
                        transition: 'color 0.3s ease'
                    }}>
                        {secondsRemaining}
                    </div>
                </div>

                {/* Status message */}
                <p style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: 1.5
                }}>
                    {lang === 'ar'
                        ? 'في انتظار إعادة الاتصال...\nإذا لم يعد الاتصال، ستفوز تلقائياً'
                        : 'En attente de reconnexion...\nSi aucune reconnexion, vous gagnez'}
                </p>

                <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
            </div>
        </div>
    )
}
