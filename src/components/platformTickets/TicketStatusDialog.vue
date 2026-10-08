<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md" @click.stop>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-secondary-text" />
          <h2 class="text-sm font-semibold text-primary-text">Update Status</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-2">Current Status</p>
          <span class="inline-block text-[11px] font-medium px-3 py-1.5 rounded-full border capitalize" :class="statusClass(currentStatus)">
            {{ formatStatus(currentStatus) }}
          </span>
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">New Status</p>
          <BaseSelect
            v-model="selected"
            :options="statusOptions"
            placeholder="Select status"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="store.actionLoading || !selected || selected === currentStatus"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? 'Updating...' : 'Update Status' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { usePlatfromTicketsStore } from '@/stores/platformTickets/platformTickets'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open:      { type: Boolean, default: false },
  ticketId:  { type: [String, Number], required: true },
  status:    { type: String, default: '' },
})
const emit = defineEmits(['close'])

const store = usePlatfromTicketsStore()
const selected = ref(null)
const currentStatus = ref(props.status)

watch(() => props.open, (val) => {
  if (val) {
    currentStatus.value = props.status
    selected.value = null
  }
})

const statusOptions = [
  { label: 'Open',        value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved',    value: 'resolved' },
  { label: 'Closed',      value: 'closed' },
]

const submit = () => {
  if (!selected.value) return
  store.updateTicketStatus(props.ticketId, { status: selected.value }, () => {
    emit('close')
  })
}

const formatStatus = (s) => s?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'

const statusClass = (s) => ({
  open:        'bg-primary-blue/20 text-primary border border-primary-blue/30',
  in_progress: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  resolved:    'bg-primary-green/20 text-primary-green border border-primary-green/30',
  closed:      'bg-primary-border/20 text-secondary-text border border-primary-border',
})[s] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border'
</script>
