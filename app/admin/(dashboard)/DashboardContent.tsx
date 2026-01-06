'use client'

import Link from 'next/link'

export default function DashboardContent() {
    return (
        <>
            <style jsx>{`
        .desktop-only {
          display: flex;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                    Tableau de bord <span style={{ fontSize: '1rem', opacity: 0.5, color: '#64748b' }}>v5.0</span>
                </h1>
                <p style={{ color: '#64748b' }}>Bienvenue, Admin. Que voulez-vous gérer ?</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
                <div className="desktop-only">
                    <Link href="/admin/deposits" style={{ textDecoration: 'none', width: '100%' }}>
                        <div className="glass-card" style={{
                            padding: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ fontSize: '2rem', width: '60px', height: '60px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💰</div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>Dépôts</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Gérer et valider les demandes</span>
                                </div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>›</div>
                        </div>
                    </Link>
                </div>

                <div className="desktop-only">
                    <Link href="/admin/withdrawals" style={{ textDecoration: 'none', width: '100%' }}>
                        <div className="glass-card" style={{
                            padding: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ fontSize: '2rem', width: '60px', height: '60px', borderRadius: '16px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💸</div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>Retraits</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Valider les paiements sortants</span>
                                </div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>›</div>
                        </div>
                    </Link>
                </div>

                <Link href="/admin/users" style={{ textDecoration: 'none', width: '100%' }}>
                    <div className="glass-card" style={{
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.8)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ fontSize: '2rem', width: '60px', height: '60px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>Utilisateurs</h3>
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Liste des joueurs et soldes</span>
                            </div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>›</div>
                    </div>
                </Link>

                <div className="desktop-only">
                    <Link href="/admin/revenue" style={{ textDecoration: 'none', width: '100%' }}>
                        <div className="glass-card" style={{
                            padding: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.8)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ fontSize: '2rem', width: '60px', height: '60px', borderRadius: '16px', background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0, fontWeight: 700 }}>Revenus</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Statistiques et gains</span>
                                </div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>›</div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    )
}
