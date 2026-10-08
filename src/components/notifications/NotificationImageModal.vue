<script setup>
import { X, ExternalLink, Image as ImageIcon } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  title: { type: String, default: 'Notification Image Attachment' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        @click.self="emit('close')"
      >
        <div class="relative w-full max-w-xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-background/50">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ImageIcon class="w-4 h-4" />
              </div>
              <h3 class="text-xs font-bold text-primary-text truncate max-w-xs sm:max-w-sm">
                {{ title || 'Notification Image Attachment' }}
              </h3>
            </div>

            <div class="flex items-center gap-2">
              <a
                v-if="imageUrl"
                :href="imageUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Open full size image"
              >
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                @click="emit('close')"
                class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Image Container -->
          <div class="p-4 overflow-y-auto flex items-center justify-center bg-black/40 min-h-[250px]">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              :alt="title"
              class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
            />
            <div v-else class="text-center text-secondary-text py-12 text-xs">
              No image content available.
            </div>
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
