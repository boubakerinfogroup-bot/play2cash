'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [deposits, setDeposits] = useState<any[]>([])
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'stats' | 'deposits' | 'withdrawals'>('stats')

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            router.push('/admin/login')
            return
        }

        loadData()
    }, [])

    const loadData = async () => {
        const token = localStorage.getItem('adminToken')
        const headers = { 'Authorization': `Bearer ${token}` }

        try {
            // Load stats
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers })
            const statsData = await statsRes.json()
            if (statsData.success) setStats(statsData.stats)

            // Load deposits
            const depositsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deposits`, { headers })
            const depositsData = await depositsRes.json()
            if (depositsData.success) setDeposits(depositsData.deposits)

            // Load withdrawals
            const withdrawalsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals`, { headers })
            const withdrawalsData = await withdrawalsRes.json()
            if (withdrawalsData.success) setWithdrawals(withdrawalsData.withdrawals)
        } catch (error) {
            console.error('Load data error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproveDeposit = async (id: string) => {
        if (!confirm('Approve this deposit?')) return

        const token = localStorage.getItem('adminToken')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/deposits/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                alert('Deposit approved!')
                loadData()
            }
        } catch (error) {
            console.error('Approve error:', error)
        }
    }

    const handleApproveWithdrawal = async (id: string) => {
        if (!confirm('Approve this withdrawal?')) return

        const token = localStorage.getItem('adminToken')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                alert('Withdrawal approved!')
                loadData()
            }
        } catch (error) {
            console.error('Approve error:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white' }}>
            {/* Header */}
            <div style={{ background: '#1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🎮 Play2Cash Admin</h1>
                <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div style={{ background: '#1e293b', padding: '0 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #334155' }}>
                {['stats', 'deposits', 'withdrawals'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === tab ? '#3b82f6' : 'transparent',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
                {activeTab === 'stats' && stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        <StatCard title="Total Users" value={stats.total_users || 0} />
                        <StatCard title="Active Matches" value={stats.active_matches || 0} />
                        <StatCard title="Total Matches" value={stats.total_matches || 0} />
                        <StatCard title="Platform Balance" value={formatCurrency(stats.platform_balance || 0)} />
                    </div>
                )}

                {activeTab === 'deposits' && (
                    <div>
                        <h2 style={{ marginBottom: '16px' }}>Pending Deposits ({deposits.length})</h2>
                        {deposits.map(deposit => (
                            <div key={deposit.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatCurrency(deposit.amount)}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                        User: {deposit.user.name} | WhatsApp: {deposit.whatsapp}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {new Date(deposit.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApproveDeposit(deposit.id)}
                                    style={{ background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Approve
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div>
                        <h2 style={{ marginBottom: '16px' }}>Pending Withdrawals ({withdrawals.length})</h2>
                        {withdrawals.map(withdrawal => (
                            <div key={withdrawal.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatCurrency(withdrawal.amount)}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                        User: {withdrawal.user.name} | Balance: {formatCurrency(withdrawal.user.balance)}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        WhatsApp: {withdrawal.whatsapp} | {new Date(withdrawal.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                    style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Approve
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value }: { title: string, value: any }) {
    return (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
        </div>
    )
}
