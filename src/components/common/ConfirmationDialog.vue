<script setup>
import { AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'danger', 'success'],
    default: 'info',
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const iconClass = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
  success: 'text-green-600',
}

const buttonClass = {
  info: 'bg-blue-600 hover:bg-blue-700',
  warning: 'bg-yellow-600 hover:bg-yellow-700',
  danger: 'bg-primary-red hover:bg-primary-red/90',
  success: 'bg-primary-green hover:bg-primary-green/90',
}

const bgClass = {
  info: 'bg-blue-50',
  warning: 'bg-yellow-50',
  danger: 'bg-primary-red/10',
  success: 'bg-primary-green/10',
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="emit('cancel')"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm shadow-xl"
      @click.stop
    >
      <!-- Header with Icon -->
      <div class="px-6 py-5 border-b border-primary-border flex items-start gap-3">
        <div :class="`shrink-0 p-2 rounded-lg ${bgClass[type]}`">
          <AlertCircle v-if="type === 'warning'" :class="`w-5 h-5 ${iconClass[type]}`" />
          <AlertCircle v-else-if="type === 'danger'" :class="`w-5 h-5 ${iconClass[type]}`" />
          <CheckCircle2 v-else-if="type === 'success'" :class="`w-5 h-5 ${iconClass[type]}`" />
          <AlertCircle v-else :class="`w-5 h-5 ${iconClass[type]}`" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-primary-text">{{ title }}</h2>
        </div>
        <button
          @click="emit('cancel')"
          class="shrink-0 text-secondary-text hover:text-primary-text transition p-1"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Message -->
      <div class="px-6 py-4 space-y-4">
        <p v-if="message" class="text-sm text-secondary-text leading-relaxed">{{ message }}</p>
        <slot />
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          @click="emit('cancel')"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ cancelText }}
        </button>
        <button
          @click="emit('confirm')"
          :disabled="loading"
          :class="`flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white ${buttonClass[type]} transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Processing...' : confirmText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
