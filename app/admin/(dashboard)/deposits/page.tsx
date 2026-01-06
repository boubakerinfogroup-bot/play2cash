'use client'

import { useEffect, useState } from 'react'

export default function AdminDepositsPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>💻</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
          Desktop Uniquement
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '400px' }}>
          La gestion des dépôts nécessite un écran plus large pour afficher toutes les informations de sécurité.
        </p>
        <a
          href="/admin"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Retour au tableau de bord
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>
        Demandes de dépôt
      </h1>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
        <p>Utilisez votre ordinateur pour gérer les dépôts.</p>
        <p style={{ marginTop: '16px', fontSize: '0.9rem' }}>
          Cette fonctionnalité nécessite plus d'espace d'écran.
        </p>
      </div>
    </div>
  )
}
