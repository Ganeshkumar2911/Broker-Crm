<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
  >
    <div
      class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-100 transition-all duration-300 relative"
      @click.stop
    >
      <!-- Close button -->
      <button
        class="absolute right-4 top-4 w-8 h-8 flex items-center justify-center hover:bg-background hover:text-primary-text transition-all duration-200 text-secondary-text"
        @click="closeDialog"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- Body Content -->
      <div class="px-6 pt-8 pb-6 text-center">
        <!-- Danger Icon Container -->
        <div class="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 class="w-7 h-7 text-red-500" />
        </div>

        <h2 class="text-base font-semibold text-primary-text tracking-wide">Delete Client Account</h2>
        <p class="text-xs text-secondary-text px-4 mt-1">
          This client will be permanently removed from the workspace database.
        </p>

        <!-- Client Info Panel -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-2 mt-6 text-left relative overflow-hidden">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[9px] font-bold text-red-500 uppercase tracking-widest">Target Client</span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-wider">
              KYC Pending
            </span>
          </div>

          <p class="text-sm font-semibold text-primary-text truncate">{{ client.name || '—' }}</p>
          <p class="text-xs text-secondary-text truncate">{{ client.email || '—' }}</p>
        </div>

        <!-- Security Confirmation Checkbox -->
        <label class="flex items-start gap-3 mt-6 text-left cursor-pointer group p-1 select-none">
          <input
            type="checkbox"
            v-model="confirmChecked"
            class="mt-0.5 accent-red-600 rounded bg-background border-primary-border text-red-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
          />
          <span class="text-xs text-secondary-text group-hover:text-primary-text transition-colors leading-relaxed">
            I confirm that I want to permanently delete this client and all associated configurations.
          </span>
        </label>
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 pb-6 pt-2 flex gap-3">
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 border border-primary-border text-secondary-text hover:text-primary-text bg-background hover:bg-background rounded-lg text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="!confirmChecked || isSubmitting"
          class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Deleting...' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Loader2, Trash2 } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()
const isSubmitting = ref(false)
const confirmChecked = ref(false)

// Reset checkbox when dialog status changes
watch(() => props.open, (newVal) => {
  if (!newVal) {
    confirmChecked.value = false
  }
})

const handleSubmit = () => {
  if (!props.client?.id || !confirmChecked.value) return
  isSubmitting.value = true

  apiRequest(urls.KEYS.DELETE, urls.clientList.delete, {
    look_up_key: props.client.id,
    isTokenRequired: true,
    onSuccess: () => {
      snackbar.show('Client deleted successfully.', 'success')
      isSubmitting.value = false
      emit('success')
      closeDialog()
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to delete client.', 'error')
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  emit('close')
}
</script>
