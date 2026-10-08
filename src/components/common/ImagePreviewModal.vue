<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" @click="handleClose" />
      <div class="relative bg-card-background border border-primary-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-4xl max-h-[90vh] w-full">
        <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between shrink-0">
          <h3 class="text-sm font-bold text-primary-text">{{ title || 'Image Preview' }}</h3>
          <button @click="handleClose" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 flex items-center justify-center bg-background/50">
          <img v-if="imageUrl" :src="imageUrl" :alt="title || 'Preview'" class="max-w-full max-h-full object-contain rounded-lg" />
          <div v-else class="text-sm text-secondary-text">No image available</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  title: { type: String, default: 'Image Preview' }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

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
