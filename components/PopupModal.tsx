'use client'

import { useEffect, useState } from 'react'

interface PopupModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type?: 'success' | 'error' | 'info' | 'warning'
    icon?: string
}

export default function PopupModal({ isOpen, onClose, title, message, type = 'info', icon }: PopupModalProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShow(true)
            // Auto-close after 3 seconds for success/info
            if (type === 'success' || type === 'info') {
                const timer = setTimeout(() => {
                    handleClose()
                }, 3000)
                return () => clearTimeout(timer)
            }
        }
    }, [isOpen, type])

    const handleClose = () => {
        setShow(false)
        setTimeout(() => onClose(), 300) // Wait for animation
    }

    if (!isOpen) return null

    const colors = {
        success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '✓' },
        error: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '✕' },
        info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: 'ℹ' },
        warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '⚠' }
    }

    const color = colors[type]

    return (
        <>
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    animation: show ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out',
                    opacity: show ? 1 : 0
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: show ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
                    zIndex: 10001,
                    animation: show ? 'popIn 0.3s ease-out' : 'popOut 0.3s ease-out',
                    opacity: show ? 1 : 0
                }}
            >
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    maxWidth: '400px',
                    width: '90vw',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                background: color.bg,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                fontSize: '2.5rem',
                                color: 'white'
                            }}
                        >
                            {icon || color.icon}
                        </div>

                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: '12px'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            color: '#64748b',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            marginBottom: '24px'
                        }}>
                            {message}
                        </p>

                        <button
                            onClick={handleClose}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: color.bg,
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes popOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `}</style>
        </>
    )
}
