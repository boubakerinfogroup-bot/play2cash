'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { href: '/admin/deposits', label: 'Dépôts', icon: '💰' },
    { href: '/admin/withdrawals', label: 'Retraits', icon: '💸' },
    { href: '/admin/revenue', label: 'Revenus', icon: '📈' },
  ]

  return (
  return (
    <>
      <div style={{
        width: '280px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', paddingLeft: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--gradient-main)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold'
          }}>
            A
          </div>
          <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Admin Panel</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#4f46e5' : '#64748b',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid transparent'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
            <span>🏠</span>
            <span>Retour au site</span>
          </Link>

          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            style={{
              background: 'none', border: 'none',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex', gap: '12px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              alignItems: 'center'
            }}
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )
  )
}

