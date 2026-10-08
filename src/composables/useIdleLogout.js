import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import authToken from '@/common/authToken'

export function useIdleLogout() {
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
  const CHECK_INTERVAL = 1000 // 1 second
  const THROTTLE_DELAY = 1000 // 1 second throttle for localStorage updates

  let checkIntervalId = null
  let lastWriteTime = 0

  const updateActivity = () => {
    const now = Date.now()
    // Throttle writing to localStorage and checking to prevent performance lag (especially on mousemove/scroll)
    if (now - lastWriteTime < THROTTLE_DELAY) return
    
    lastWriteTime = now

    // Only track activity if the user has an active session
    if (!authToken.getToken().accessToken) return

    localStorage.setItem('lastActivityTimestamp', now.toString())
  }

  const checkInactivity = () => {
    // Only check if the user is authenticated
    if (!authToken.getToken().accessToken) return

    const lastActivityStr = localStorage.getItem('lastActivityTimestamp')
    const now = Date.now()

    if (!lastActivityStr) {
      // If the key is not set, initialize it with the current timestamp
      localStorage.setItem('lastActivityTimestamp', now.toString())
      return
    }

    const lastActivity = parseInt(lastActivityStr, 10)
    const elapsed = now - lastActivity

    if (elapsed >= INACTIVITY_TIMEOUT) {
      const authStore = useAuthStore()
      authStore.logout()
    }
  }

  onMounted(() => {
    // Initialize timestamp if logged in and not already set
    if (authToken.getToken().accessToken && !localStorage.getItem('lastActivityTimestamp')) {
      localStorage.setItem('lastActivityTimestamp', Date.now().toString())
    }

    // Register event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Start checking inactivity periodically
    checkIntervalId = setInterval(checkInactivity, CHECK_INTERVAL)
  })

  onUnmounted(() => {
    // Clean up event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.removeEventListener(event, updateActivity)
    })

    // Clean up interval check
    if (checkIntervalId) {
      clearInterval(checkIntervalId)
    }
  })
}
