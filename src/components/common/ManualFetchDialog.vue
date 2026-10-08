<script setup>
import { ref, watch } from 'vue'
import { Play, X, Loader2, Calendar } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  record: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const getTodayDateString = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const activityDate = ref(getTodayDateString())

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      activityDate.value = getTodayDateString()
    }
  }
)

const handleConfirm = () => {
  if (!activityDate.value) return
  emit('confirm', { activity_date: activityDate.value })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm shadow-xl"
      @click.stop
    >
      <!-- Header with Icon -->
      <div class="px-6 py-5 border-b border-primary-border flex items-start gap-3">
        <div class="flex-shrink-0 p-2 rounded-lg bg-green-500/10">
          <Play class="w-5 h-5 text-green-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-primary-text">Manual Fetch Confirmation</h2>
        </div>
        <button
          @click="emit('cancel')"
          class="flex-shrink-0 text-secondary-text hover:text-primary-text transition p-1 cursor-pointer focus:outline-none"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Message & Date Picker -->
      <div class="px-6 py-4 space-y-4">
        <p class="text-xs text-secondary-text leading-relaxed">
          Are you sure you want to run the manual fetch for integration provider 
          <strong class="text-primary-text font-medium">'{{ record?.provider }}'</strong> 
          (URL: {{ record?.base_url }})?
        </p>

        <!-- Date Picker Field -->
        <div class="flex flex-col gap-1.5">
          <label class="text-secondary-text text-[11px] font-semibold flex items-center gap-1">
            <Calendar class="w-3.5 h-3.5" />
            Activity Date <span class="text-red-500">*</span>
          </label>
          <input
            v-model="activityDate"
            type="date"
            class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors cursor-pointer"
            required
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          @click="emit('cancel')"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="loading || !activityDate"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Processing...' : 'Run Fetch' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
