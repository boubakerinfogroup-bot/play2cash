'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseQuitPreventionOptions {
    enabled: boolean
    onQuit: () => Promise<void> | void
    matchId?: string
}

export function useQuitPrevention({ enabled, onQuit, matchId }: UseQuitPreventionOptions) {
    const router = useRouter()
    const warningStage = useRef(0)
    const isQuitting = useRef(false)

    useEffect(() => {
        if (!enabled) return

        // Prevent browser back button
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault()

            if (isQuitting.current) return

            warningStage.current++

            if (warningStage.current === 1) {
                const confirm1 = window.confirm(
                    "Match in progress! Are you sure you want to leave?\n\nYou will lose this match."
                )
                if (!confirm1) {
                    warningStage.current = 0
                    history.pushState(null, '', window.location.pathname)
                    return
                }
            }

            if (warningStage.current === 2) {
                const confirm2 = window.confirm(
                    "⚠️ STRONG WARNING!\n\nLeaving will count as a LOSS!\n\nYou will lose your stake. Continue anyway?"
                )
                if (!confirm2) {
                    warningStage.current = 0
                    history.pushState(null, '', window.location.pathname)
                    return
                }
            }

            if (warningStage.current === 3) {
                const confirm3 = window.confirm(
                    "🚨 FINAL WARNING!\n\nYou will LOSE this match and your stake!\n\nThis cannot be undone. Are you absolutely sure?"
                )
                if (confirm3) {
                    isQuitting.current = true
                    onQuit()
                } else {
                    warningStage.current = 0
                    history.pushState(null, '', window.location.pathname)
                }
            }
        }

        // Prevent tab close / page reload
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isQuitting.current) return

            e.preventDefault()
            e.returnValue = 'Match in progress! Leaving will count as a loss.'
            return 'Match in progress! Leaving will count as a loss.'
        }

        // Add state to prevent back button
        history.pushState(null, '', window.location.pathname)

        window.addEventListener('popstate', handlePopState)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('popstate', handlePopState)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [enabled, onQuit])

    return { isQuitting: isQuitting.current }
}
