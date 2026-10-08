<template>
  <div>
    <router-view />
    <Snackbar />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Snackbar from '@/components/common/snackbar.vue'
import { useIdleLogout } from './composables/useIdleLogout'
import { useAuthStore } from '@/stores/auth'
import authToken from '@/common/authToken'
import router from '@/router'

useIdleLogout()

const handleKeydown = (e) => {
  if (e.metaKey || e.ctrlKey) {
    const key = e.key.toLowerCase()
    if (key === 'l' || key === 'd') {
      e.preventDefault()
      const isLoggedIn = !!authToken.getToken().accessToken
      const targetRoute = key === 'l' ? 'login' : 'dev-login'
      
      if (isLoggedIn) {
        const authStore = useAuthStore()
        authStore.logout(targetRoute)
      } else {
        router.push({ name: targetRoute })
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>