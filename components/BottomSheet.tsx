'use client'

import { useEffect, useState } from 'react'

interface Option {
    label: string
    value: string | number
    disabled?: boolean
    description?: string
}

interface BottomSheetProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (value: any) => void
    title: string
    options: Option[]
    selectedValue?: any
}

export default function BottomSheet({ isOpen, onClose, onSelect, title, options, selectedValue }: BottomSheetProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            setTimeout(() => setVisible(false), 300) // Wait for animation
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen && !visible) return null

    return (
        <div
            className="bottom-sheet-overlay"
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999, /* High z-index */
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <div
                className="bottom-sheet-content"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    padding: '24px',
                    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 24px' }} />

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center', color: '#1e293b' }}>
                    {title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {options.map((option) => {
                        const isSelected = option.value === selectedValue
                        return (
                            <button
                                key={String(option.value)}
                                onClick={() => {
                                    if (!option.disabled) {
                                        onSelect(option.value)
                                        onClose()
                                    }
                                }}
                                disabled={option.disabled}
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'white',
                                    color: option.disabled ? '#94a3b8' : '#334155',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div>
                                    <div>{option.label}</div>
                                    {option.description && (
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                                {isSelected && <span style={{ color: '#6366f1' }}>✓</span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
