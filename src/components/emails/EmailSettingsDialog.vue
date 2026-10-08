<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-card-background border border-primary-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <!-- Header -->
        <div class="sticky top-0 bg-card-background border-b border-primary-border px-6 py-5 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-primary-text">
              {{ isEdit ? 'Edit Email Settings' : 'Configure Email Settings' }}
            </h2>
            <p class="sub-text text-secondary-text mt-0.5">Update your email provider and sender configuration</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-6">

          <!-- Provider Section -->
          <div class="space-y-2">
            <label class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">Provider</label>
            <BaseSelect
              v-model="form.provider"
              :options="providerOptions"
              placeholder="Select Provider"
            />
            <p class="text-[11px] text-secondary-text mt-1">Choose your email delivery service</p>
          </div>

          <!-- API Key Section -->
          <div class="space-y-2">
            <label class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">API Key</label>
            <div class="relative">
              <input
                v-model="form.api_key"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="xkeysib-xxxxxxxxxxxxxxxx"
                class="input-field px-4 py-2.5"
              />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-secondary-text hover:text-primary-text transition-colors"
              >
                <Eye v-if="!showApiKey" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-[11px] text-secondary-text">Your API credentials are securely stored</p>
          </div>

          <!-- Divider -->
          <div class="border-t border-primary-border my-2" />

          <!-- Sender Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-primary-text">Sender Information</h3>

            <!-- From Name -->
            <div class="space-y-2">
              <label class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">From Name</label>
              <input
                v-model="form.from_name"
                type="text"
                placeholder="e.g., Support Team"
                class="input-field px-4 py-2.5"
              />
            </div>

            <!-- From Email + Reply To Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">From Email</label>
                <input
                  v-model="form.from_email"
                  type="email"
                  placeholder="support@example.com"
                  class="input-field px-4 py-2.5"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-semibold uppercase tracking-widest text-secondary-text">Reply To Email</label>
                <input
                  v-model="form.reply_to_email"
                  type="email"
                  placeholder="reply@example.com"
                  class="input-field px-4 py-2.5"
                />
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-primary-border my-2" />

          <!-- Status Toggle -->
          <div class="flex items-center justify-between p-4 bg-background border border-primary-border rounded-xl">
            <div>
              <p class="text-sm font-medium text-primary-text">Status</p>
              <p class="text-[11px] text-secondary-text mt-0.5">Enable email settings</p>
            </div>
            <button
              type="button"
              @click="form.is_active = !form.is_active"
              class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              :class="form.is_active ? 'bg-primary-green' : 'bg-primary-border'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-card-background border-t border-primary-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            @click="$emit('close')"
            class="border border-primary-border bg-card-background text-primary-text hover:bg-background transition-colors rounded-lg px-5 py-2.5 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="loading"
            class="bg-primary text-white hover:bg-primary-hover transition-colors rounded-lg px-5 py-2.5 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Eye, EyeOff, Save, Loader2 } from 'lucide-vue-next'
import BaseSelect from '../common/BaseSelect.vue'

const props = defineProps({
  settings: { type: Object, default: null },
  loading:  { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const isEdit = ref(!!props.settings)
const showApiKey = ref(false)

const providerOptions = [
  { label: 'Brevo', value: 'brevo' },
]

const defaultForm = () => ({
  provider:       'brevo',
  api_key:        '',
  from_name:      '',
  from_email:     '',
  reply_to_email: '',
  is_active:      true,
})

const form = ref(
  props.settings
    ? { ...defaultForm(), ...props.settings, smtp_password: '' }
    : defaultForm()
)

watch(() => props.settings, (val) => {
  isEdit.value = !!val
  form.value = val
    ? { ...defaultForm(), ...val, smtp_password: '' }
    : defaultForm()
})

function submit() {
  emit('submit', { ...form.value })
}
</script>
