<script setup>
import { ref, onUnmounted } from 'vue'
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: 'Access Restricted',
  },
  description: {
    type: String,
    default: 'You do not have any assigned permissions. Please contact your system administrator to assign roles or permissions to your account.',
  },
})

const emit = defineEmits(['retry'])

const isLoading = ref(false)
const countdown = ref(0)
let timer = null

const handleRetry = () => {
  if (isLoading.value || countdown.value > 0) return

  isLoading.value = true
  emit('retry')

  // Keep loader spinning for a brief moment then start 10s retry countdown
  setTimeout(() => {
    isLoading.value = false
    countdown.value = 10

    clearInterval(timer)
    timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
    <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-sm">
      <ShieldAlert class="w-8 h-8 text-amber-500" />
    </div>

    <h2 class="text-xl font-bold text-primary-text mb-2">
      {{ title }}
    </h2>

    <p class="text-sm text-secondary-text max-w-md mb-6 leading-relaxed">
      {{ description }}
    </p>

    <button
      :disabled="isLoading || countdown > 0"
      @click="handleRetry"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
      <RefreshCw v-else class="w-4 h-4" />
      <span>
        <template v-if="isLoading">Refreshing...</template>
        <template v-else-if="countdown > 0">Retry in {{ countdown }}s</template>
        <template v-else>Refresh Permissions</template>
      </span>
    </button>
  </div>
</template>

