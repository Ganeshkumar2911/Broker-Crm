<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md" @click.stop>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <MessageSquare v-if="mode === 'comment'" class="w-4 h-4 text-secondary-text" />
          <Paperclip v-else class="w-4 h-4 text-secondary-text" />
          <h2 class="text-sm font-semibold text-primary-text">{{ mode === 'comment' ? 'Add Comment' : 'Add Attachment' }}</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Comment Mode -->
      <div v-if="mode === 'comment'" class="px-6 py-5">
        <p class="text-xs text-secondary-text mb-1.5">Comment</p>
        <textarea
          ref="focusEl"
          v-model="comment"
          rows="4"
          placeholder="Write your comment..."
          :disabled="store.actionLoading"
          class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
        />
      </div>

      <!-- Attachment Mode -->
      <div v-else class="px-6 py-5 space-y-3">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">File</p>
          <label class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-background border border-primary-border border-dashed cursor-pointer hover:bg-card-background transition-colors">
            <Paperclip class="w-3.5 h-3.5 text-secondary-text shrink-0" />
            <span class="text-xs text-secondary-text">{{ file ? file.name : 'Click to select file' }}</span>
            <input ref="focusEl" type="file" class="hidden" @change="onFileChange" />
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="store.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? 'Submitting...' : 'Submit' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { X, Loader2, MessageSquare, Paperclip } from 'lucide-vue-next'
import { useTicketsStore } from '@/stores/tickets/tickets'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'comment' },
  ticketId: { type: [String, Number], required: true },
})
const emit = defineEmits(['close'])

const store = useTicketsStore()
const comment = ref('')
const file = ref(null)
const focusEl = ref(null)

const isValid = computed(() => props.mode === 'comment' ? !!comment.value.trim() : !!file.value)

watch(() => props.open, (val) => {
  if (val) {
    comment.value = ''
    file.value = null
    nextTick(() => focusEl.value?.focus())
  }
})

const onFileChange = (e) => { file.value = e.target.files[0] || null }

const submit = () => {
  if (props.mode === 'comment') {
    store.addComment(props.ticketId, { comment: comment.value }, () => emit('close'))
  } else {
    const fd = new FormData()
    fd.append('file', file.value)
    fd.append('attachments', file.value)
    fd.append('files', file.value)
    store.addAttachment(props.ticketId, fd, () => emit('close'))
  }
}
</script>