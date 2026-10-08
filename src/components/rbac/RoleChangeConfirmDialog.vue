<script setup>
import { Loader2, ShieldAlert } from 'lucide-vue-next'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  staffName: {
    type: String,
    default: '',
  },
  currentRoleName: {
    type: String,
    default: '',
  },
  newRoleName: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="emit('close')"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6"
      @click.stop
    >
      <div class="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <ShieldAlert class="w-5 h-5 text-amber-500" />
      </div>

      <h3 class="text-sm font-semibold text-primary-text mb-1">
        Change Staff Role
      </h3>

      <p class="text-xs text-secondary-text mb-5 leading-relaxed">
        Are you sure you want to change role for <strong>{{ staffName }}</strong> from
        <span class="font-medium text-primary-text">{{ currentRoleName || 'Unassigned' }}</span> to
        <span class="font-semibold text-primary">{{ newRoleName }}</span>?
      </p>

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
          :disabled="loading"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
          @click="emit('confirm')"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Updating...' : 'Confirm' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
