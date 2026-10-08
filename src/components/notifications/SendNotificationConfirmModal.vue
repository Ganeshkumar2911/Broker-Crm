<script setup>
import { AlertCircle, Send, X, CheckCircle2 } from 'lucide-vue-next'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import MetadataBadges from '@/components/notifications/MetadataBadges.vue'
import { getMetadataEntries } from '@/utils/notificationHelpers'

const props = defineProps({
  open: { type: Boolean, default: false },
  notification: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const store = useNotificationsStore()

function handleConfirmSend() {
  if (!props.notification?.id) return

  store.sendNotification(props.notification.id, () => {
    emit('close')
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open && notification"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        @click="emit('close')"
      >
        <div
          class="bg-card-background border border-primary-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Send class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-primary-text">Send & Activate Notification</h3>
                <p class="text-[11px] text-secondary-text">Trigger dispatch for Notification #{{ notification.id }}</p>
              </div>
            </div>

            <button
              type="button"
              @click="emit('close')"
              class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 text-xs">
            <div class="bg-background border border-primary-border rounded-lg p-3.5 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wider">
                  {{ notification.type }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded border uppercase',
                    notification.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  ]"
                >
                  {{ notification.is_active ? 'Currently Active' : 'Inactive' }}
                </span>
              </div>

              <h4 class="text-sm font-bold text-primary-text">
                {{ notification.title }}
              </h4>

              <div class="flex items-start justify-between gap-2">
                <p class="text-xs text-secondary-text leading-relaxed min-w-0 flex-1">
                  {{ notification.message }}
                </p>

                <!-- Metadata Badges inline with message at the right end -->
                <MetadataBadges :metadata="notification.metadata_json" :limit="2" align="right" class="shrink-0 ml-auto mt-0.5" />
              </div>
            </div>

            <div class="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary-text flex items-start gap-2.5">
              <AlertCircle class="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p class="font-semibold text-primary">Confirmation Prompt</p>
                <p class="text-[11px] text-secondary-text mt-0.5">
                  Are you sure you want to activate and send this notification? Its status will be updated to <span class="font-semibold text-primary-text">Active (`is_active: true`)</span> and delivered to target recipients.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-5 py-3.5 border-t border-primary-border bg-background/50 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              @click="handleConfirmSend"
              :disabled="store.sendLoadingId === notification.id"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send class="w-3.5 h-3.5" />
              <span>{{ store.sendLoadingId === notification.id ? 'Sending...' : 'Confirm & Send' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
