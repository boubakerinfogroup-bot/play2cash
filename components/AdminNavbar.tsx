'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function AdminNavbar() {
    const [revenue, setRevenue] = useState(0)

    useEffect(() => {
        loadRevenue()
        // Refresh every 30 seconds
        const interval = setInterval(loadRevenue, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadRevenue = async () => {
        try {
            const response = await fetch('/api/admin/revenue/total')
            const data = await response.json()
            if (data.total !== undefined) {
                setRevenue(data.total)
            }
        } catch (error) {
            console.error('Error loading revenue:', error)
        }
    }

    return (
        <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ADMIN
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {/* Revenue Display */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>💰</span>
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 500 }}>Revenus (5%)</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{formatCurrency(revenue)}</div>
                    </div>
                </div>

                <a href="/admin" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 600 }}>Dashboard</a>
            </div>
        </nav>
    )
}
