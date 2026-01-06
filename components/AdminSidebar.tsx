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
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="admin-mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <button
            className="admin-sidebar-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="admin-sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🏠</span>
            <span>Retour au site</span>
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="admin-sidebar-link admin-sidebar-logout">
              <span className="admin-sidebar-icon">🚪</span>
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

