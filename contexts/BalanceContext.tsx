'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase-client'
import { authAPI } from '@/lib/api-client'

interface BalanceContextType {
    balance: number | null
    loading: boolean
    error: string | null
    refreshBalance: () => Promise<void>
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    // Fetch balance from API
    const fetchBalance = async () => {
        try {
            setLoading(true)
            setError(null)

            const user = await authAPI.me()
            if (user.success && user.user) {
                setBalance(user.user.balance)
                setUserId(user.user.id)
            } else {
                setBalance(null)
                setUserId(null)
            }
        } catch (err: any) {
            console.error('Balance fetch error:', err)
            setError(err.message || 'Failed to load balance')
            setBalance(null)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch on mount
    useEffect(() => {
        fetchBalance()
    }, [])

    // Subscribe to Supabase Realtime updates for user balance
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`user-balance:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('Balance updated via Realtime:', payload.new.balance)
                    setBalance(payload.new.balance)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const refreshBalance = async () => {
        await fetchBalance()
    }

    return (
        <BalanceContext.Provider value={{ balance, loading, error, refreshBalance }}>
            {children}
        </BalanceContext.Provider>
    )
}

export function useBalance() {
    const context = useContext(BalanceContext)
    if (context === undefined) {
        throw new Error('useBalance must be used within a BalanceProvider')
    }
    return context
}
