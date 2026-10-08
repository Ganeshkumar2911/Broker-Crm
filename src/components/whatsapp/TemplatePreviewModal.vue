<script setup>
import { computed, ref } from 'vue'
import { X, MessageSquare, CheckCheck, Copy, Check } from 'lucide-vue-next'
import WhatsAppMobilePreview from './WhatsAppMobilePreview.vue'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  template: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])
const snackbar = useSnackbarStore()
const copied = ref(false)

const copyText = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  copied.value = true
  snackbar.show('Template body copied to clipboard!', 'success')
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen && template"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="emit('close')"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-primary-text font-mono">{{ template.name }}</h2>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {{ template.category }}
                </span>
                <span
                  v-if="template.status === 'APPROVED'"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-green/10 text-primary-green border border-primary-green/20"
                >
                  {{ template.status }}
                </span>
                <span
                  v-else-if="template.status === 'PENDING'"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                >
                  {{ template.status }}
                </span>
                <span
                  v-else
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-red/10 text-primary-red border border-primary-red/20"
                >
                  {{ template.status }}
                </span>
              </div>
              <p class="text-xs text-secondary-text">Template Details & WhatsApp Live Rendering</p>
            </div>
          </div>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body: Split Info (Scrollable) & Mobile Mockup (Fixed) -->
        <div class="flex-1 min-h-0 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Details & Metadata (Independently Scrollable) -->
          <div class="lg:col-span-6 h-full overflow-y-auto space-y-4 pr-1 no-scrollbar">
            <div class="p-4 rounded-xl bg-background border border-primary-border space-y-3">
              <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">Template Configuration</h3>
              
              <div class="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text block text-[11px]">Language</span>
                  <span class="font-medium text-primary-text">{{ template.language || 'English' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text block text-[11px]">Created By</span>
                  <span class="font-medium text-primary-text">{{ template.created_by || '-' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text block text-[11px]">Header Type</span>
                  <span class="font-medium capitalize text-primary-text">{{ template.header_type || 'None' }}</span>
                </div>
              </div>
            </div>

            <!-- Header Content if any -->
            <div v-if="template.header" class="p-4 rounded-xl bg-background border border-primary-border space-y-1.5">
              <span class="text-xs font-semibold text-secondary-text">Header Text</span>
              <p class="text-xs font-bold text-primary-text">{{ template.header }}</p>
            </div>

            <!-- Body Content -->
            <div class="p-4 rounded-xl bg-background border border-primary-border space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-secondary-text">Message Body Content</span>
                <button
                  class="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(template.body_text)"
                >
                  <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" />
                  <span>{{ copied ? 'Copied' : 'Copy Text' }}</span>
                </button>
              </div>
              <p class="text-xs text-primary-text leading-relaxed whitespace-pre-wrap font-sans bg-card-background p-3 rounded-lg border border-primary-border">
                {{ template.body_text }}
              </p>
            </div>

            <!-- Footer Content if any -->
            <div v-if="template.footer_text" class="p-4 rounded-xl bg-background border border-primary-border space-y-1.5">
              <span class="text-xs font-semibold text-secondary-text">Footer Text</span>
              <p class="text-xs italic text-secondary-text">{{ template.footer_text }}</p>
            </div>
          </div>

          <!-- Right: Interactive Mobile Mockup (Fixed / Stationary) -->
          <div class="lg:col-span-6 h-full flex items-center justify-center p-1 overflow-hidden min-h-0">
            <WhatsAppMobilePreview
              :business-name="Array.isArray(template.channels) && template.channels.length ? template.channels[0] : (template.waba_phone_number ? `+${template.waba_phone_number}` : 'Panther Capital')"
              :name="template.name"
              :header-type="template.header_type || (template.header ? 'text' : 'none')"
              :header="template.header"
              :body="template.body_text"
              :footer="template.footer_text"
              :buttons="template.buttons || []"
              :category="template.category"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3.5 border-t border-primary-border bg-background/50 flex justify-end shrink-0">
          <button
            class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
