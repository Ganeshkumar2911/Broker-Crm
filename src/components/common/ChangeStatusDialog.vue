<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
    @click="closeDialog"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background">
        <div class="flex items-center gap-2">
          <UserX v-if="client.is_active" class="w-4 h-4 text-red-500" />
          <UserCheck v-else class="w-4 h-4 text-green-500" />
          <h2 class="text-sm font-semibold text-primary-text">Change Client Status</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4 bg-card-background">
        <!-- Client Info -->
        <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1.5 font-medium">Client Info</p>
          <p class="text-sm font-semibold text-primary-text">{{ client.name || '—' }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ client.email || '—' }}</p>
        </div>

        <!-- Warning / Notice Message -->
        <div
          class="flex gap-3 p-4 rounded-xl border transition-all duration-200"
          :class="client.is_active
            ? 'bg-red-500/10 border-red-500/20 text-red-600'
            : 'bg-green-500/10 border-green-500/20 text-green-600'"
        >
          <div class="shrink-0 mt-0.5">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div class="text-xs leading-relaxed">
            <p class="font-semibold mb-1">
              {{ client.is_active ? 'Warning: Deactivating Client' : 'Notice: Activating Client' }}
            </p>
            <p class="text-secondary-text">
              {{ client.is_active
                ? 'Are you sure you want to change the status to inactive? Changing the status to inactive will make it so the user will not be able to login.'
                : 'Are you sure you want to change the status to active? Changing the status to active will allow the user to login.'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background">
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          :class="client.is_active
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700'"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Processing...' : (client.is_active ? 'Deactivate' : 'Activate') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Loader2, UserX, UserCheck, AlertTriangle } from 'lucide-vue-next'
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

const handleSubmit = () => {
  if (!props.client?.id) return
  isSubmitting.value = true

  const targetStatus = !props.client.is_active

  apiRequest(urls.KEYS.PUT, urls.clientList.changeStatus, {
    look_up_key: props.client.id,
    data: { is_active: targetStatus },
    isTokenRequired: true,
    onSuccess: () => {
      snackbar.show(
        `Client status changed to ${targetStatus ? 'active' : 'inactive'} successfully.`,
        'success'
      )
      isSubmitting.value = false
      emit('success')
      closeDialog()
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to change client status.', 'error')
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  emit('close')
}
</script>
