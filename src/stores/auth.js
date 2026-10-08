import { defineStore } from 'pinia'
import router from '@/router'
import authToken from '@/common/authToken'

export const useAuthStore = defineStore('auth', () => {
  const logout = (redirectName = 'login') => {
    // Clear auth credentials
    authToken.removeToken()
    
    // Clear stored session-specific values
    localStorage.removeItem('lastActivityTimestamp')
    localStorage.removeItem('custom_base_url')
    
    // Redirect to login page and reload to reset all Pinia states
    router.push({ name: redirectName }).then(() => {
      window.location.reload()
    })
  }

  return {
    logout
  }
})
