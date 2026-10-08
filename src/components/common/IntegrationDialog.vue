<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/50"
      />
    </Transition>

    <Transition name="panel">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
          <div class="flex items-center gap-2">
            <Cpu class="w-4 h-4 text-primary" />
            <h2 class="text-sm font-semibold text-primary-text">
              {{ isEditMode ? 'Edit Integration' : 'Add Integration' }}
            </h2>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer focus:outline-none"
            @click="closeDialog"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-4 bg-card-background">
          <!-- Base URL -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-semibold">Base URL <span class="text-red-500">*</span></label>
            <input
              v-model="form.base_url"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="e.g., https://tenant.domain/webapi/api"
            />
          </div>

          <!-- API Key -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-semibold">
              API Key <span v-if="!isEditMode" class="text-red-500">*</span>
            </label>
            <div class="relative flex items-center">
              <input
                v-model="form.api_key"
                :type="showApiKey ? 'text' : 'password'"
                class="w-full bg-background border border-primary-border rounded-lg pl-3 pr-10 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                :placeholder="isEditMode ? '•••••••••••• (Leave blank to keep current)' : 'Enter API key'"
              />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute right-3 text-secondary-text hover:text-primary-text transition-colors focus:outline-none cursor-pointer"
              >
                <Eye v-if="!showApiKey" class="w-3.5 h-3.5" />
                <EyeOff v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Report User ID -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-semibold">Report User ID</label>
            <input
              v-model="form.report_user_id"
              type="number"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="e.g., 100006"
            />
          </div>

          <!-- Scheduler Enabled (Toggle Switch) -->
          <div class="flex items-center justify-between pt-2 border-t border-primary-border bg-card-background">
            <div>
              <span class="text-xs font-semibold text-primary-text">Scheduler Enabled</span>
              <p class="text-[10px] text-secondary-text">Enable scheduled report fetching</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input
                v-model="form.scheduler_enabled"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondary-text after:border-primary-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
            </label>
          </div>

          <!-- Scheduler Settings (Time, Token, Endpoint) -->
          <div v-if="form.scheduler_enabled" class="space-y-4 transition-all duration-300">
            <!-- Scheduler Time -->
            <div class="flex flex-col gap-1">
              <label class="text-secondary-text text-[11px] font-semibold">Scheduler Time <span class="text-red-500">*</span></label>
              <input
                v-model="form.scheduler_time"
                type="time"
                step="1"
                class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Scheduler Token -->
            <div class="flex flex-col gap-1">
              <label class="text-secondary-text text-[11px] font-semibold">Token <span class="text-red-500">*</span></label>
              <input
                v-model="form.token"
                type="text"
                class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                placeholder="Enter scheduler token"
              />
            </div>

          </div>

          <!-- Active Status (Toggle Switch) -->
          <div v-if="isEditMode" class="flex items-center justify-between pt-2 border-t border-primary-border bg-card-background">
            <div>
              <span class="text-xs font-semibold text-primary-text">Status</span>
              <p class="text-[10px] text-secondary-text">Enable or disable this integration provider</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondary-text after:border-primary-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background shrink-0">
          <button
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            :disabled="!isValid || store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="handleSubmit"
          >
            <Loader2 v-if="store.isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create') }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Cpu, X, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useCompanyIntegrationsStore } from '@/stores/companyIntegrations/companyIntegrations'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const store = useCompanyIntegrationsStore()

const isEditMode = computed(() => !!props.record)
const showApiKey = ref(false)

const form = reactive({
  company_id: 1,
  provider: 'affiliate',
  base_url: '',
  api_key: '',
  report_user_id: '',
  scheduler_enabled: false,
  scheduler_time: '00:30:00',
  token: '',
  is_active: true,
})

const isValid = computed(() => {
  const baseValid = isEditMode.value
    ? (form.base_url && form.base_url.trim().length > 0)
    : (form.base_url && form.base_url.trim().length > 0 && form.api_key && form.api_key.trim().length > 0)

  if (!baseValid) return false

  if (form.scheduler_enabled) {
    if (!form.scheduler_time || form.scheduler_time.trim().length === 0) return false
    if (!form.token || form.token.trim().length === 0) return false
  }

  return true
})

const formatTimeForInput = (timeStr) => {
  if (!timeStr) return '00:30:00'
  const match = timeStr.match(/^(\d{2}:\d{2}:\d{2})/)
  if (match) return match[1]
  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`
  return '00:30:00'
}

watch(
  () => [props.open, props.record],
  ([isOpen, currentRecord]) => {
    if (isOpen) {
      showApiKey.value = false
      if (currentRecord) {
        // Edit mode
        form.company_id = currentRecord.company_id
        form.provider = currentRecord.provider
        form.base_url = currentRecord.base_url
        form.api_key = currentRecord.api_key || ''
        form.report_user_id = currentRecord.report_user_id || ''
        form.scheduler_enabled = currentRecord.scheduler_enabled ?? false
        form.scheduler_time = formatTimeForInput(currentRecord.scheduler_time)
        form.token = currentRecord.token || ''
        form.is_active = currentRecord.is_active
      } else {
        // Create mode
        form.company_id = 1
        form.provider = 'affiliate'
        form.base_url = ''
        form.api_key = ''
        form.report_user_id = ''
        form.scheduler_enabled = false
        form.scheduler_time = '00:30:00'
        form.token = ''
        form.is_active = true
      }
    }
  },
  { immediate: true }
)

const closeDialog = () => {
  if (store.isSubmitting) return
  emit('close')
}

const handleSubmit = async () => {
  if (!isValid.value) return

  if (isEditMode.value) {
    const payload = {
      base_url: form.base_url.trim(),
      report_user_id: form.report_user_id ? Number(form.report_user_id) : null,
      scheduler_enabled: form.scheduler_enabled,
      scheduler_time: form.scheduler_enabled ? form.scheduler_time : null,
      token: form.scheduler_enabled ? form.token.trim() : null,
      is_active: form.is_active,
    }
    if (form.api_key && form.api_key.trim().length > 0) {
      payload.api_key = form.api_key.trim()
    }
    
    await store.updateIntegration(props.record.id, payload)
  } else {
    const payload = {
      company_id: Number(form.company_id),
      provider: form.provider.trim(),
      base_url: form.base_url.trim(),
      api_key: form.api_key.trim(),
      report_user_id: form.report_user_id ? Number(form.report_user_id) : null,
      scheduler_enabled: form.scheduler_enabled,
      scheduler_time: form.scheduler_enabled ? form.scheduler_time : null,
      token: form.scheduler_enabled ? form.token.trim() : null,
      is_active: form.is_active,
    }
    
    await store.createIntegration(payload)
  }

  emit('success')
  emit('close')
}
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
}
</style>
