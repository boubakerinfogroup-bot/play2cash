'use client'

import { useEffect, useState } from 'react'

export default function Confetti() {
    const [particles, setParticles] = useState<Array<{
        id: number
        left: number
        delay: number
        duration: number
        color: string
    }>>([])

    useEffect(() => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8']
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)]
        }))
        setParticles(newParticles)
    }, [])

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            {particles.map(particle => (
                <div
                    key={particle.id}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        backgroundColor: particle.color,
                        left: `${particle.left}%`,
                        top: '-10px',
                        animation: `confetti-fall ${particle.duration}s linear ${particle.delay}s forwards`,
                        borderRadius: '50%'
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
        </div>
    )
}
