'use client'

interface ConfirmModalProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    title: string
    message: string
    confirmText: string
    cancelText: string
    stake: number
    currency?: string
}

export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText,
    cancelText,
    stake,
    currency = 'TND'
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <>
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10000,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10001,
                    animation: 'popIn 0.3s ease-out'
                }}
            >
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    maxWidth: '400px',
                    width: '90vw',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '2.5rem'
                        }}>
                            🎮
                        </div>

                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: '8px'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            color: '#64748b',
                            fontSize: '1rem',
                            marginBottom: '20px'
                        }}>
                            {message}
                        </p>

                        {/* Stake Display */}
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.85rem',
                                marginBottom: '4px'
                            }}>
                                Mise
                            </div>
                            <div style={{
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 900
                            }}>
                                {stake.toFixed(3)} {currency}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                background: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onCancel()
                            }}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
      `}</style>
        </>
    )
}
