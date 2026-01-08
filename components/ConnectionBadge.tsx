'use client'

import { useConnectionStatus } from '@/hooks/useConnectionStatus'

export default function ConnectionBadge() {
    const { status, isOnline } = useConnectionStatus()

    if (status === 'online') return null

    const getStatusInfo = () => {
        switch (status) {
            case 'offline':
                return { icon: '⚠️', text: 'Hors ligne', color: '#ef4444' }
            case 'unstable':
                return { icon: '📶', text: 'Connexion instable', color: '#f59e0b' }
            case 'reconnecting':
                return { icon: '🔄', text: 'Reconnexion...', color: '#3b82f6' }
            default:
                return null
        }
    }

    const info = getStatusInfo()
    if (!info) return null

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: info.color,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideDown 0.3s ease'
        }}>
            <span>{info.icon}</span>
            <span>{info.text}</span>
            <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}
