// Auto-logout after 30 minutes of inactivity
export function setupInactivityLogout() {
    if (typeof window === 'undefined') return

    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
        localStorage.setItem('lastActivity', Date.now().toString())
        clearTimeout(inactivityTimer)

        // Set 30 minute timer
        inactivityTimer = setTimeout(() => {
            // Clear user data
            localStorage.removeItem('user')
            localStorage.removeItem('language')
            localStorage.removeItem('lastActivity')

            // Reload to login page
            window.location.href = '/login'
        }, 30 * 60 * 1000) // 30 minutes
    }

    // Check on page load
    const lastActivity = localStorage.getItem('lastActivity')
    if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceActivity > 30 * 60 * 1000) {
            // Auto-logout if more than 30 min
            localStorage.removeItem('user')
            localStorage.removeItem('language')
            localStorage.removeItem('lastActivity')
            window.location.href = '/login'
            return
        }
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
        document.addEventListener(event, resetTimer, true)
    })

    // Initial timer
    resetTimer()

    // Cleanup function
    return () => {
        clearTimeout(inactivityTimer)
        events.forEach(event => {
            document.removeEventListener(event, resetTimer, true)
        })
    }
}
