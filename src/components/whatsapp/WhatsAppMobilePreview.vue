<script setup>
import { computed } from 'vue'
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Film,
  ShieldCheck,
  Lock,
  Wifi,
  Signal,
  ExternalLink,
} from 'lucide-vue-next'

const props = defineProps({
  businessName: {
    type: String,
    default: 'Panther Capital',
  },
  name: {
    type: String,
    default: '',
  },
  headerType: {
    type: String,
    default: 'none', // 'none' | 'text' | 'image' | 'video' | 'document'
  },
  header: {
    type: String,
    default: '',
  },
  body: {
    type: String,
    default: '',
  },
  footer: {
    type: String,
    default: '',
  },
  buttons: {
    type: Array,
    default: () => [],
  },
  variableValues: {
    type: Object,
    default: () => ({}),
  },
  category: {
    type: String,
    default: 'MARKETING',
  },
})

// Current formatted time (e.g. 12:30 PM)
const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
})

// Replace {{1}}, {{v1}}, {{variable}} with sample values
const formattedBody = computed(() => {
  if (!props.body) {
    return 'Your message body will appear here. Add text and variables to preview.'
  }

  let text = props.body

  // Replace variables with sample values if provided, or preserve the placeholder
  text = text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, p1) => {
    if (props.variableValues && props.variableValues[p1] !== undefined && props.variableValues[p1] !== '') {
      return props.variableValues[p1]
    }
    // Also check for 1-based index or normalized key
    const cleanKey = p1.replace(/^v/, '')
    if (props.variableValues && props.variableValues[cleanKey] !== undefined && props.variableValues[cleanKey] !== '') {
      return props.variableValues[cleanKey]
    }
    return `{{${p1}}}`
  })

  return text
})

// Replace variables in header text if present
const formattedHeader = computed(() => {
  if (!props.header) return ''
  let text = props.header
  text = text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, p1) => {
    if (props.variableValues && props.variableValues[p1] !== undefined && props.variableValues[p1] !== '') {
      return props.variableValues[p1]
    }
    return `{{${p1}}}`
  })
  return text
})

// Simple Markdown Parser for WhatsApp bold (*text*), italic (_text_), strike (~text~), monospace (`code`)
const renderWhatsAppMarkdown = (text) => {
  if (!text) return ''
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Monospace ```code```
  escaped = escaped.replace(/```([\s\S]*?)```/g, '<code class="font-mono bg-black/30 text-emerald-300 px-1 py-0.5 rounded text-[11px]">$1</code>')
  // Monospace `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="font-mono bg-black/30 text-emerald-300 px-1 py-0.5 rounded text-[11px]">$1</code>')
  // Bold *text*
  escaped = escaped.replace(/\*(.*?)\*/g, '<strong class="font-bold text-white">$1</strong>')
  // Italic _text_
  escaped = escaped.replace(/_(.*?)_/g, '<em class="italic">$1</em>')
  // Strike ~text~
  escaped = escaped.replace(/~(.*?)~/g, '<del class="line-through opacity-75">$1</del>')

  // Highlight unreplaced variables {{var}} with an emerald pill badge
  escaped = escaped.replace(/(\{\{[a-zA-Z0-9_-]+\}\})/g, '<span class="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30">$1</span>')

  return escaped
}
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Ultra-Sleek Smartphone Frame -->
    <div
      class="relative w-full max-w-[340px] xl:max-w-[365px] h-full max-h-[560px] min-h-[440px] bg-[#11181c] rounded-[44px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border-[4px] border-[#222c32] ring-1 ring-white/10 select-none flex flex-col justify-between overflow-hidden transition-all duration-300"
    >
      <!-- Hardware: Volume Rockers (Left) -->
      <div class="absolute -left-[5px] top-24 w-[3px] h-7 bg-[#2e3940] rounded-l-md" />
      <div class="absolute -left-[5px] top-36 w-[3px] h-11 bg-[#2e3940] rounded-l-md" />
      <div class="absolute -left-[5px] top-50 w-[3px] h-11 bg-[#2e3940] rounded-l-md" />

      <!-- Hardware: Power Button (Right) -->
      <div class="absolute -right-[5px] top-32 w-[3px] h-14 bg-[#2e3940] rounded-r-md" />

      <!-- Top Dynamic Island Pill -->
      <div class="absolute top-2.5 left-1/2 -translate-x-1/2 w-26 h-4 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-inner border border-white/5">
        <div class="w-2 h-2 rounded-full bg-[#111] border border-[#252525] relative flex items-center justify-center">
          <div class="w-1 h-1 rounded-full bg-[#0d233a]" />
        </div>
        <div class="w-1.5 h-1.5 rounded-full bg-[#0b1b0b]" />
      </div>

      <!-- Phone Screen Container -->
      <div class="w-full h-full bg-[#0b141a] rounded-[36px] overflow-hidden flex flex-col relative z-10 border border-white/5 shadow-inner min-h-0">
        
        <!-- Status Bar -->
        <div class="h-9 bg-[#1f2c34] text-white px-5 pt-2 flex items-center justify-between text-[11px] font-semibold tracking-tight z-20 shrink-0 select-none">
          <span class="pl-1">{{ currentTime }}</span>
          <div class="flex items-center gap-2">
            <Signal class="w-3 h-3 text-white/90" />
            <Wifi class="w-3 h-3 text-white/90" />
            <!-- Battery Pill -->
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-white/90 font-medium">99%</span>
              <div class="w-4.5 h-2.5 border border-white/80 rounded-[3px] p-[1px] flex items-center">
                <div class="w-full h-full bg-emerald-400 rounded-[1px]" />
              </div>
            </div>
          </div>
        </div>

        <!-- WhatsApp Chat Top App Bar -->
        <div class="h-14 bg-[#1f2c34] text-white px-3 flex items-center justify-between shadow-md z-20 shrink-0 border-b border-white/5">
          <div class="flex items-center gap-2 min-w-0">
            <button type="button" class="text-white/90 hover:text-white transition-colors cursor-pointer p-0.5">
              <ArrowLeft class="w-4 h-4" />
            </button>
            <div class="relative">
              <div class="w-9 h-9 rounded-full bg-[#111b21] flex items-center justify-center overflow-hidden border border-white/15 p-1">
                <img src="../../assets/logo_full.svg" alt="Panther" class="w-full h-full object-contain" />
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 bg-[#00a884] text-white rounded-full p-[1px] shadow-xs">
                <ShieldCheck class="w-2.5 h-2.5 fill-white text-[#00a884]" />
              </div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1">
                <span class="text-xs font-semibold truncate text-[#e9edef]">{{ businessName || 'Panther Capital' }}</span>
              </div>
              <p class="text-[10px] text-[#8696a0] leading-none flex items-center gap-1 font-medium">
                Official Business Account
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3.5 text-[#aebac1]">
            <Video class="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Phone class="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" />
            <MoreVertical class="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>

        <!-- Chat Area with WhatsApp Wallpaper Pattern -->
        <div
          class="flex-1 p-3.5 overflow-y-auto relative flex flex-col justify-start bg-[#0b141a] no-scrollbar"
          style="background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.04) 1px, #0b141a 1px); background-size: 24px 24px; background-position: 0 0, 12px 12px;"
        >
          <!-- Date Pill -->
          <div class="flex justify-center mb-2.5 shrink-0">
            <span class="bg-[#182229]/95 border border-white/5 shadow-xs text-[#8696a0] text-[10px] font-semibold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              Today
            </span>
          </div>

          <!-- Encryption Notice -->
          <div class="flex justify-center mb-3 shrink-0">
            <div class="max-w-[90%] bg-[#182229]/90 border border-[#ffd279]/15 rounded-lg px-2.5 py-1.5 text-center shadow-xs flex items-center gap-1.5 justify-center">
              <Lock class="w-3 h-3 text-[#ffd279] shrink-0" />
              <span class="text-[9.5px] text-[#ffd279]/90 leading-tight">
                Messages and calls are end-to-end encrypted.
              </span>
            </div>
          </div>

          <!-- Message Bubble Container -->
          <div class="w-full flex justify-start my-1 animate-in fade-in zoom-in-95 duration-200">
            <div
              class="w-full max-w-[94%] bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-xs p-3.5 shadow-md border border-white/5 relative group"
            >
              <!-- Media Header (Image / Video / Document) -->
              <div v-if="headerType === 'image'" class="mb-2.5 rounded-xl bg-[#111b21] h-32 flex flex-col items-center justify-center text-[#8696a0] border border-white/5 relative overflow-hidden">
                <ImageIcon class="w-8 h-8 opacity-70 mb-1 text-emerald-400" />
                <span class="text-[11px] font-medium text-[#e9edef]">Image Attachment</span>
              </div>

              <div v-else-if="headerType === 'video'" class="mb-2.5 rounded-xl bg-[#111b21] h-32 flex flex-col items-center justify-center text-[#8696a0] border border-white/5 relative overflow-hidden">
                <Film class="w-8 h-8 opacity-70 mb-1 text-emerald-400" />
                <span class="text-[11px] font-medium text-[#e9edef]">Video Attachment</span>
              </div>

              <div v-else-if="headerType === 'document'" class="mb-2.5 rounded-xl bg-[#111b21] p-2.5 flex items-center gap-2.5 border border-white/5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold truncate text-[#e9edef]">document_attachment.pdf</p>
                  <p class="text-[10px] text-[#8696a0]">PDF Document • 1.2 MB</p>
                </div>
              </div>

              <!-- Text Header -->
              <div v-else-if="headerType === 'text' && formattedHeader" class="font-bold text-xs text-white mb-1.5 leading-snug break-words">
                {{ formattedHeader }}
              </div>

              <!-- Message Body (Preserves newlines, formats markdown, highlights variables) -->
              <div
                class="text-[12.5px] leading-relaxed whitespace-pre-wrap break-words text-[#e9edef]"
                v-html="renderWhatsAppMarkdown(formattedBody)"
              />

              <!-- Footer Text -->
              <div
                v-if="footer"
                class="text-[10.5px] text-[#8696a0] mt-2 pt-1.5 border-t border-white/5 italic break-words"
              >
                {{ footer }}
              </div>

              <!-- Action Buttons / Quick Replies if present -->
              <div v-if="buttons && buttons.length > 0" class="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                <div
                  v-for="(btn, idx) in buttons"
                  :key="idx"
                  class="w-full py-1.5 px-3 text-center text-xs font-semibold text-[#00a884] bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{{ btn.text }}</span>
                  <ExternalLink v-if="btn.type === 'URL'" class="w-3 h-3 opacity-70" />
                </div>
              </div>

              <!-- Timestamp & Read Receipt Status -->
              <div class="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-[#8696a0] shrink-0">
                <span>{{ currentTime }}</span>
                <CheckCheck class="w-3.5 h-3.5 text-[#53bdeb]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Input Bar Mockup -->
        <div class="h-14 bg-[#202c33] px-2.5 flex items-center gap-2 border-t border-white/5 z-20 shrink-0">
          <div class="flex-1 bg-[#2a3942] rounded-full h-9.5 px-3.5 flex items-center justify-between text-[#8696a0] shadow-inner">
            <div class="flex items-center gap-2.5">
              <Smile class="w-4.5 h-4.5 cursor-pointer hover:text-[#00a884] transition-colors" />
              <span class="text-xs text-[#8696a0] select-none">Message</span>
            </div>
            <div class="flex items-center gap-2.5">
              <Paperclip class="w-4 h-4 cursor-pointer hover:text-[#00a884] transition-colors" />
              <Camera class="w-4 h-4 cursor-pointer hover:text-[#00a884] transition-colors" />
            </div>
          </div>
          <div class="w-9.5 h-9.5 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#008f6f] active:scale-95 transition-all flex-shrink-0">
            <Mic class="w-4.5 h-4.5" />
          </div>
        </div>

        <!-- Home Swipe Bar Indicator -->
        <div class="w-full bg-[#202c33] pb-1.5 pt-0.5 flex justify-center shrink-0">
          <div class="w-28 h-1 bg-white/25 rounded-full" />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar hiding for crisp mobile app feel */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
