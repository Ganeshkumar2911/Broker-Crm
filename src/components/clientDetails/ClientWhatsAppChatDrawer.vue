<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import {
  X,
  RotateCw,
  MessageSquare,
  CheckCheck,
  Check,
  AlertCircle,
  ShieldCheck,
  Lock,
  Send,
  FileText,
  Clock,
} from 'lucide-vue-next'
import { useWhatsAppChatStore, cleanPhoneNumber } from '@/stores/whatsapp/chat'
import { useTickerStore } from '@/stores/ws/ticker'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import { getFlagCode } from '@/utils/countries'
import WhatsAppSendTemplateSheet from '@/components/clientDetails/WhatsAppSendTemplateSheet.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  client: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close'])

const { hasPermission } = usePermissionCheck()
const canSend = computed(() => hasPermission('whatsapp.send'))

const chatStore = useWhatsAppChatStore()
const tickerStore = useTickerStore()
const chatContainerRef = ref(null)
const inputMessageRef = ref(null)
const inputMessage = ref('')
const isRefreshing = ref(false)
const isTemplateSheetOpen = ref(false)

// Extract clean phone number
const clientPhone = computed(() => {
  return (
    props.client?.phone_number ||
    props.client?.phoneNumber ||
    props.client?.phone ||
    props.client?.mobile ||
    ''
  )
})

const cleanPhone = computed(() => {
  return cleanPhoneNumber(clientPhone.value)
})

const clientName = computed(() => {
  return (
    props.client?.name ||
    props.client?.username ||
    (props.client?.first_name ? `${props.client?.first_name || ''} ${props.client?.last_name || ''}`.trim() : '') ||
    'Client'
  )
})

const clientInitials = computed(() => {
  const n = clientName.value.trim()
  if (!n) return 'C'
  return n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTo({
        top: chatContainerRef.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

// ─── WebSocket Chat Room Lifecycle ─────────────────────────────
const joinActiveChatRoom = () => {
  if (chatStore.dtCustomerId) {
    tickerStore.joinChat(chatStore.dtCustomerId)
  }
}

const leaveActiveChatRoom = () => {
  if (chatStore.dtCustomerId) {
    tickerStore.leaveChat(chatStore.dtCustomerId)
  }
}

// Fetch chat history ONCE on drawer open, then WebSocket handles all real-time events
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      if (cleanPhone.value) {
        try {
          await chatStore.fetchChat(cleanPhone.value)
          scrollToBottom(false)
        } catch (_) {
          // Handled in store
        }
      }
      nextTick(() => {
        inputMessageRef.value?.focus()
      })
    } else {
      leaveActiveChatRoom()
      inputMessage.value = ''
    }
  },
  { immediate: true }
)

// Automatically join room whenever dtCustomerId is available
watch(
  () => chatStore.dtCustomerId,
  (newId) => {
    if (props.open && newId) {
      joinActiveChatRoom()
    }
  },
  { immediate: true }
)

// Scroll to bottom when messages update in real-time
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom(true)
  }
)

onBeforeUnmount(() => {
  leaveActiveChatRoom()
})

const handleRefresh = async () => {
  if (!cleanPhone.value || isRefreshing.value) return
  isRefreshing.value = true
  try {
    await chatStore.fetchChat(cleanPhone.value, true)
    joinActiveChatRoom()
    scrollToBottom(true)
  } catch (_) {
    // Handled in store
  } finally {
    isRefreshing.value = false
  }
}

const handleSendMessage = async () => {
  if (!canSend.value || !chatStore.isSessionOpen || !inputMessage.value?.trim() || chatStore.sending || !cleanPhone.value) return
  const textToSend = inputMessage.value.trim()
  inputMessage.value = ''
  scrollToBottom(true)

  try {
    await chatStore.sendMessage(cleanPhone.value, textToSend)
    scrollToBottom(true)
  } catch (_) {
    // Handled in store
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (!chatStore.isSessionOpen) return
    handleSendMessage()
  }
}

const handleTemplateSent = () => {
  scrollToBottom(true)
  nextTick(() => {
    if (chatStore.isSessionOpen) {
      inputMessageRef.value?.focus()
    }
  })
}

// Simple Markdown Parser for WhatsApp *bold*, _italic_, ~strike~, `code`
const renderMarkdown = (text, isIncoming = false) => {
  if (!text) return ''
  let escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const codeBgClass = isIncoming
    ? 'bg-background border border-primary-border text-primary'
    : 'bg-black/20 text-btn-text-primary'

  const linkClass = isIncoming
    ? 'text-primary underline hover:opacity-80 font-semibold'
    : 'text-btn-text-primary underline hover:opacity-90 font-semibold'

  escaped = escaped.replace(/```([\s\S]*?)```/g, `<code class="font-mono ${codeBgClass} px-1.5 py-0.5 rounded text-[11px] font-semibold">$1</code>`)
  escaped = escaped.replace(/`([^`]+)`/g, `<code class="font-mono ${codeBgClass} px-1 py-0.5 rounded text-[11px] font-semibold">$1</code>`)
  escaped = escaped.replace(/\*(.*?)\*/g, '<strong class="font-bold">$1</strong>')
  escaped = escaped.replace(/_(.*?)_/g, '<em class="italic">$1</em>')
  escaped = escaped.replace(/~(.*?)~/g, '<del class="line-through opacity-75">$1</del>')

  // Convert URLs to clickable links
  escaped = escaped.replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`)

  return escaped
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer transition-opacity"
          @click="emit('close')"
        />

        <!-- Chat Slide-over Drawer Panel -->
        <div
          class="relative z-10 w-full max-w-xl md:max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300 select-none"
        >
          <!-- WhatsApp Top App Bar / Header -->
          <div
            class="px-4 sm:px-6 py-3 bg-card-background border-b border-primary-border flex items-center justify-between shrink-0 shadow-xs z-20"
          >
            <!-- Left: Client Info & Avatar -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shadow-2xs"
                >
                  {{ clientInitials }}
                </div>
                <!-- Live Presence Indicator -->
                <div
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary-green border-2 border-card-background flex items-center justify-center"
                >
                  <ShieldCheck class="w-2 h-2 text-white" />
                </div>
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-bold text-primary-text truncate">
                    {{ clientName }}
                  </h2>
                  <span
                    v-if="client?.id"
                    class="text-[10px] font-mono text-secondary-text bg-background px-1.5 py-0.5 rounded border border-primary-border shrink-0"
                  >
                    #{{ client.id }}
                  </span>
                  <span
                    v-if="client?.country && getFlagCode(client.country)"
                    :class="[
                      'fi',
                      `fi-${getFlagCode(client.country)}`,
                      'fis',
                      'w-3.5 h-2.5 flex-shrink-0 rounded-xs',
                    ]"
                  />
                </div>
                <div class="flex items-center gap-2 text-xs text-secondary-text mt-0.5">
                  <span class="font-mono text-[11px] text-primary font-medium">
                    {{ clientPhone || 'No Phone' }}
                  </span>
                  <span>•</span>
                  <span class="text-[10.5px] text-primary-green flex items-center gap-1 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
                    Live WhatsApp
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Controls -->
            <div class="flex items-center gap-1 shrink-0 text-secondary-text">
              <!-- Refresh Button -->
              <button
                type="button"
                @click="handleRefresh"
                :disabled="chatStore.loading || isRefreshing"
                title="Refresh Chat"
                class="p-2 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin text-primary': chatStore.loading || isRefreshing }"
                />
              </button>

              <!-- Close Button -->
              <button
                type="button"
                @click="emit('close')"
                title="Close"
                class="p-2 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Chat Stream Area with Theme-Aware Wallpaper -->
          <div
            ref="chatContainerRef"
            class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 relative bg-background no-scrollbar"
          >
            <!-- Encryption Security Banner -->
            <div class="flex justify-center mb-2 shrink-0">
              <div
                class="max-w-md bg-card-background border border-primary-border rounded-xl px-3.5 py-2 text-center shadow-2xs flex items-center gap-2 justify-center"
              >
                <Lock class="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span class="text-[10.5px] text-secondary-text leading-tight font-medium">
                  Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
                </span>
              </div>
            </div>

            <!-- Loading State Skeleton -->
            <div v-if="chatStore.loading && chatStore.messages.length === 0" class="space-y-4 py-8">
              <div class="flex items-start gap-2.5 max-w-[70%] animate-pulse">
                <div class="w-full bg-card-background border border-primary-border rounded-2xl rounded-tl-xs p-3.5 space-y-2">
                  <div class="h-3 bg-secondary-text/15 rounded w-3/4" />
                  <div class="h-3 bg-secondary-text/15 rounded w-1/2" />
                </div>
              </div>
              <div class="flex items-end justify-end max-w-[70%] ml-auto animate-pulse">
                <div class="w-full bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-xs p-3.5 space-y-2">
                  <div class="h-3 bg-primary/20 rounded w-4/5 ml-auto" />
                  <div class="h-3 bg-primary/20 rounded w-2/5 ml-auto" />
                </div>
              </div>
              <div class="flex items-start gap-2.5 max-w-[65%] animate-pulse">
                <div class="w-full bg-card-background border border-primary-border rounded-2xl rounded-tl-xs p-3.5 space-y-2">
                  <div class="h-3 bg-secondary-text/15 rounded w-5/6" />
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div
              v-else-if="chatStore.error"
              class="my-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3"
            >
              <AlertCircle class="w-8 h-8 text-rose-500 mx-auto" />
              <p class="text-xs text-rose-500 font-medium">{{ chatStore.error }}</p>
              <button
                type="button"
                @click="handleRefresh"
                class="px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>

            <!-- Empty Messages State -->
            <div
              v-else-if="chatStore.groupedMessages.length === 0"
              class="my-16 text-center flex flex-col items-center justify-center gap-3"
            >
              <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-primary shadow-2xs">
                <MessageSquare class="w-7 h-7" />
              </div>
              <div class="max-w-xs">
                <h3 class="text-sm font-bold text-primary-text">No messages yet</h3>
                <p class="text-xs text-secondary-text mt-1">
                  Send a message below to start a live conversation with {{ clientName }}.
                </p>
              </div>
            </div>

            <!-- Grouped Message Stream -->
            <div v-else class="space-y-6">
              <div
                v-for="group in chatStore.groupedMessages"
                :key="group.date"
                class="space-y-3"
              >
                <!-- Date Pill Header -->
                <div class="flex justify-center my-3 sticky top-1 z-10">
                  <span
                    class="bg-card-background/90 backdrop-blur-xs border border-primary-border text-secondary-text text-[10px] font-semibold px-3 py-1 rounded-lg tracking-wider uppercase shadow-2xs"
                  >
                    {{ group.date }}
                  </span>
                </div>

                <!-- Message Items in Group -->
                <div
                  v-for="msg in group.messages"
                  :key="msg.id"
                  class="flex flex-col select-text"
                  :class="msg.isIncoming ? 'items-start' : 'items-end'"
                >
                  <!-- Bubble Container -->
                  <div
                    class="max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 shadow-2xs relative group transition-all duration-150"
                    :class="[
                      msg.isIncoming
                        ? 'bg-card-background text-primary-text rounded-2xl rounded-tl-xs border border-primary-border'
                        : 'bg-primary text-btn-text-primary rounded-2xl rounded-tr-xs border border-primary/20',
                    ]"
                  >
                    <!-- Sender Name / Integration Label if Outgoing -->
                    <div
                      v-if="!msg.isIncoming && msg.integrationDisplayName"
                      class="text-[10px] font-semibold opacity-85 mb-1 flex items-center gap-1"
                    >
                      <span>{{ msg.integrationDisplayName }}</span>
                    </div>

                    <!-- Message Body Content -->
                    <div
                      class="text-[12.5px] leading-relaxed whitespace-pre-wrap break-words select-text font-sans"
                      v-html="renderMarkdown(msg.text, msg.isIncoming)"
                    />

                    <!-- Message Bottom Row: Timestamp + Delivery/Read Status -->
                    <div
                      class="flex items-center justify-end gap-1 mt-1 text-[10px] select-none"
                      :class="msg.isIncoming ? 'text-secondary-text' : 'opacity-80'"
                    >
                      <span>{{ msg.formattedTime }}</span>

                      <!-- Outgoing Status Checks -->
                      <template v-if="!msg.isIncoming">
                        <!-- Read: Blue Double Checks -->
                        <CheckCheck
                          v-if="msg.status === 'READ' || msg.readCount > 0"
                          class="w-3.5 h-3.5 text-sky-300"
                          title="Read"
                        />
                        <!-- Delivered: White Double Checks -->
                        <CheckCheck
                          v-else-if="msg.status === 'DELIVERED' || msg.deliveryCount > 0"
                          class="w-3.5 h-3.5 opacity-90"
                          title="Delivered"
                        />
                        <!-- Sent: Single Check -->
                        <Check
                          v-else-if="msg.status === 'SENT' || msg.sentCount > 0"
                          class="w-3.5 h-3.5 opacity-80"
                          title="Sent"
                        />
                        <!-- Errored -->
                        <AlertCircle
                          v-else-if="msg.erroredCount > 0"
                          class="w-3.5 h-3.5 text-rose-300"
                          title="Failed to deliver"
                        />
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- WhatsApp Session Status & Send Template Action Bar -->
          <div
            v-if="!chatStore.loading"
            class="px-4 py-2.5 bg-card-background border-t border-primary-border flex items-center justify-between gap-3 text-xs shrink-0 z-20"
          >
            <!-- Left status info -->
            <div v-if="!canSend" class="flex items-center gap-2 text-secondary-text min-w-0">
              <Lock class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate text-[11px] font-medium">Read-only mode (Send permission required)</span>
            </div>
            <div v-else-if="!chatStore.isSessionOpen" class="flex items-center gap-2 text-primary-yellow min-w-0">
              <Clock class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate text-[11px] font-medium">24h window closed. Send a template to chat.</span>
            </div>
            <div v-else class="flex items-center gap-2 text-primary-green min-w-0">
              <span class="w-2 h-2 rounded-full bg-primary-green animate-pulse shrink-0" />
              <span class="truncate text-[11px] font-medium">24-hour conversation window active</span>
            </div>

            <!-- Send Template Button -->
            <button
              v-if="canSend"
              type="button"
              @click="isTemplateSheetOpen = true"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
              :class="[
                !chatStore.isSessionOpen
                  ? 'bg-primary hover:bg-primary-hover text-btn-text-primary'
                  : 'bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary',
              ]"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>Send Template</span>
            </button>
          </div>

          <!-- Bottom Real-Time WhatsApp Message Input Bar -->
          <div
            class="p-3 bg-card-background border-t border-primary-border flex items-center gap-2 shrink-0 z-20"
          >
            <!-- Input Bar -->
            <div
              class="flex-1 bg-background rounded-2xl px-3.5 py-2 flex items-center gap-2 border border-primary-border focus-within:border-primary transition-colors shadow-2xs"
              :class="{ 'opacity-60 cursor-not-allowed': !canSend || !chatStore.isSessionOpen }"
            >
              <textarea
                ref="inputMessageRef"
                v-model="inputMessage"
                :disabled="!canSend || !chatStore.isSessionOpen || chatStore.loading"
                rows="1"
                :placeholder="!canSend ? 'You do not have permission to send WhatsApp messages' : (chatStore.isSessionOpen ? 'Type a message (Press Enter to send)...' : 'Chat disabled — Send template above to start conversation')"
                @keydown="handleKeydown"
                class="flex-1 bg-transparent text-xs text-primary-text placeholder:text-secondary-text outline-none resize-none max-h-24 leading-relaxed font-sans disabled:cursor-not-allowed"
              />
            </div>

            <!-- Send Button -->
            <button
              type="button"
              @click="handleSendMessage"
              :disabled="!canSend || !chatStore.isSessionOpen || !inputMessage.trim() || chatStore.sending"
              class="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:hover:bg-primary disabled:cursor-not-allowed text-btn-text-primary flex items-center justify-center shadow-xs transition-all duration-150 cursor-pointer active:scale-95 shrink-0"
            >
              <span
                v-if="chatStore.sending"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
              <Send v-else class="w-4 h-4 stroke-[2.2] translate-x-px" />
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Slide-over Template Selection & Sending Sheet -->
    <WhatsAppSendTemplateSheet
      :open="isTemplateSheetOpen"
      :client="client"
      @close="isTemplateSheetOpen = false"
      @template-sent="handleTemplateSent"
    />
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
