'use client'

import { useState } from 'react'
import Link from 'next/link'
import MemoryGame from '@/components/games/MemoryGame'
import RocketGame from '@/components/games/RocketGame'
import SequencePad from '@/components/games/SequencePad'
import RockPaperScissors from '@/components/games/RockPaperScissors'
import TicTacToePlus from '@/components/games/TicTacToePlus'
import PatternLock from '@/components/games/PatternLock'
import BankerGame from '@/components/games/BankerGame'

type GameType = 'memory' | 'rocket' | 'sequence' | 'rps' | 'tictactoe' | 'pattern' | 'banker' | null

export default function TrainingPage() {
    const [selectedGame, setSelectedGame] = useState<GameType>(null)
    const [score, setScore] = useState<number | null>(null)

    const handleComplete = (finalScore: number) => {
        setScore(finalScore)
        console.log('Training completed with score:', finalScore)
    }

    const handleBackToSelection = () => {
        setSelectedGame(null)
        setScore(null)
    }

    const games = [
        { id: 'memory' as GameType, nameEn: 'Memory', nameAr: 'الذاكرة', icon: '🧠', descEn: 'Match pairs of cards', descAr: 'طابق أزواج البطاقات' },
        { id: 'rocket' as GameType, nameEn: 'Rocket', nameAr: 'الصاروخ', icon: '🚀', descEn: 'Dodge falling obstacles', descAr: 'تفادى العقبات الساقطة' },
        { id: 'sequence' as GameType, nameEn: 'Sequence Pad', nameAr: 'لوحة التسلسل', icon: '🎯', descEn: 'Remember patterns', descAr: 'تذكر الأنماط' },
        { id: 'rps' as GameType, nameEn: 'Rock Paper Scissors', nameAr: 'حجر ورقة مقص', icon: '✊', descEn: 'Best of 15', descAr: 'أفضل من 15' },
        { id: 'tictactoe' as GameType, nameEn: 'Tic-Tac-Toe Plus', nameAr: 'إكس أو بلس', icon: '⭕', descEn: '4x6 grid', descAr: 'شبكة 4×6' },
        { id: 'pattern' as GameType, nameEn: 'Pattern Lock', nameAr: 'قفل النمط', icon: '🔒', descEn: 'Memorize pattern', descAr: 'احفظ النمط' },
        { id: 'banker' as GameType, nameEn: 'Banker', nameAr: 'المصرفي', icon: '💰', descEn: 'Race to 200', descAr: 'سباق إلى 200' }
    ]

    // If game is selected, show the game
    if (selectedGame) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }}>
                {/* Back Button */}
                <button
                    onClick={handleBackToSelection}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1rem',
                        zIndex: 1000
                    }}
                >
                    ← العودة | Retour
                </button>

                {/* Game Container */}
                <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '60px' }}>
                    {selectedGame === 'memory' && <MemoryGame matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'rocket' && <RocketGame matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'sequence' && <SequencePad matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'rps' && <RockPaperScissors matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'tictactoe' && <TicTacToePlus matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'pattern' && <PatternLock matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                    {selectedGame === 'banker' && <BankerGame matchId="training" seed="training-seed" userId="training-user" lang="ar" onResultSubmitted={() => handleComplete(100)} />}
                </div>
            </div>
        )
    }

    // Game selection screen (looks like main page)
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                padding: '20px'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '2.5rem',
                    marginBottom: '10px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                    🎯 وضع التدريب
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.2rem',
                    marginBottom: '5px'
                }}>
                    Mode Entraînement
                </p>
                <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1rem'
                }}>
                    تدرّب على جميع الألعاب بدون مخاطر
                </p>
            </div>

            {/* Back to Home */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Link href="/" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700
                }}>
                    ← العودة للرئيسية | Retour à l'accueil
                </Link>
            </div>

            {/* Game Cards Grid */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                padding: '0 20px'
            }}>
                {games.map((game, index) => (
                    <div
                        key={game.id}
                        onClick={() => setSelectedGame(game.id)}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '32px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '2px solid rgba(255,255,255,0.2)',
                            textAlign: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            animation: `slideUp 0.5s ease ${index * 100}ms both`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)'
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Icon */}
                        <div style={{ fontSize: '80px', marginBottom: '16px' }}>
                            {game.icon}
                        </div>

                        {/* Name */}
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: '8px'
                        }}>
                            {game.nameAr}
                        </h3>
                        <h4 style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1.1rem',
                            marginBottom: '12px'
                        }}>
                            {game.nameEn}
                        </h4>

                        {/* Description */}
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.95rem',
                            lineHeight: '1.4'
                        }}>
                            {game.descAr}
                        </p>

                        {/* Play Button */}
                        <div style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            تدرّب الآن | S'entraîner
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}
