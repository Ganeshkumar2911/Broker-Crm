<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-2xl max-h-[90vh] flex flex-col" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-sm font-semibold text-primary-text">{{ template?.subject ?? 'Email Preview' }}</h2>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ template?.name }} · {{ template?.code }}</p>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-xl border border-primary-border p-6 min-h-48">
          <div v-if="template?.body_html" v-html="template.body_html" class="prose max-w-none text-sm" />
          <p v-else class="text-secondary-text text-sm text-center py-8">No HTML content available</p>
        </div>

        <div v-if="template?.available_variables?.length" class="mt-4">
          <p class="text-[11px] text-secondary-text uppercase tracking-wide mb-2">Variables</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="v in template.available_variables"
              :key="v"
              class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
            >{{ '\u007B\u007B' + v + '\u007D\u007D' }}</span>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border shrink-0">
        <button
          class="w-full px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
defineProps({ open: { type: Boolean, default: false }, template: { type: Object, default: null } })
const emit = defineEmits(['close'])
</script>