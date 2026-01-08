'use client'

import { useState, useEffect } from 'react'

export type ConnectionStatus = 'online' | 'offline' | 'unstable' | 'reconnecting'

export function useConnectionStatus() {
    const [status, setStatus] = useState<ConnectionStatus>('online')
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Initial state
        setIsOnline(navigator.onLine)
        setStatus(navigator.onLine ? 'online' : 'offline')

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true)
            setStatus('online')
            console.log('Connection restored')
        }

        const handleOffline = () => {
            setIsOnline(false)
            setStatus('offline')
            console.log('Connection lost')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Periodic server ping to detect connection quality
        const pingInterval = setInterval(async () => {
            if (!navigator.onLine) {
                setStatus('offline')
                return
            }

            try {
                const start = Date.now()
                const response = await fetch('/api/health', {
                    method: 'HEAD',
                    cache: 'no-cache'
                })
                const latency = Date.now() - start

                if (!response.ok) {
                    setStatus('unstable')
                } else if (latency > 2000) {
                    setStatus('unstable')
                } else {
                    setStatus('online')
                }
            } catch (error) {
                setStatus('offline')
            }
        }, 5000) // Ping every 5 seconds

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(pingInterval)
        }
    }, [])

    return { status, isOnline }
}
