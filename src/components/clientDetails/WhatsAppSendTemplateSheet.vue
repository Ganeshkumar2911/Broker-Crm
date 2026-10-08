<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  X,
  Search,
  Plus,
  FileText,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCw,
  ExternalLink,
  Layers,
  MessageSquare,
} from 'lucide-vue-next'
import { useWhatsAppTemplatesStore } from '@/stores/whatsapp/templates'
import { useWhatsAppChatStore, cleanPhoneNumber } from '@/stores/whatsapp/chat'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import WhatsAppMobilePreview from '@/components/whatsapp/WhatsAppMobilePreview.vue'

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

const emit = defineEmits(['close', 'template-sent'])

const router = useRouter()
const templateStore = useWhatsAppTemplatesStore()
const chatStore = useWhatsAppChatStore()
const snackbar = useSnackbarStore()
const { hasPermission } = usePermissionCheck()

// Permissions
const canSend = computed(() => hasPermission('whatsapp.send'))
const canCreate = computed(() => hasPermission('whatsapp.create'))

// State
const searchQuery = ref('')
const selectedCategory = ref('ALL')
const selectedTemplate = ref(null)
const variableValues = reactive({})
const isSending = ref(false)

// Extract clean phone & client info
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

// Highlight variable chips in body text (e.g. {{1}}, {{username}})
const renderBodyWithHighlight = (text) => {
  if (!text) return ''
  let escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /(\{\{[a-zA-Z0-9_-]+\}\})/g,
    '<span class="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded bg-primary/10 text-primary font-mono text-[10.5px] font-semibold border border-primary/20">$1</span>'
  )
}

// Fetch templates when opened
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      templateStore.fetchTemplates()
      resetSelection()
    }
  },
  { immediate: true },
)

// Extract variables from template body and header (e.g. {{1}}, {{username}}, {{v1}})
const templateVariables = computed(() => {
  if (!selectedTemplate.value) return []
  const text = `${selectedTemplate.value.header || ''} ${selectedTemplate.value.body_text || selectedTemplate.value.body || ''}`
  const matches = [...text.matchAll(/\{\{([a-zA-Z0-9_-]+)\}\}/g)]
  const uniqueVars = [...new Set(matches.map((m) => m[1]))]
  return uniqueVars
})

// Watch selected template to auto-populate default variable values
watch(
  () => selectedTemplate.value,
  (tpl) => {
    // Clear old values
    Object.keys(variableValues).forEach((key) => {
      delete variableValues[key]
    })

    if (!tpl) return

    const vars = templateVariables.value
    vars.forEach((v) => {
      const lower = v.toLowerCase()
      // Smart pre-fill for common variable names
      if (
        lower.includes('name') ||
        lower.includes('user') ||
        lower.includes('client') ||
        lower.includes('customer') ||
        lower === '1' ||
        lower === 'v1'
      ) {
        variableValues[v] = clientName.value
      } else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')) {
        variableValues[v] = clientPhone.value
      } else if (tpl.body_example && tpl.body_example[v]) {
        variableValues[v] = tpl.body_example[v]
      } else {
        variableValues[v] = ''
      }
    })
  },
)

// Filter templates (search & category)
const filteredTemplates = computed(() => {
  const list = templateStore.templates || []
  return list.filter((tpl) => {
    // Filter by category
    if (selectedCategory.value !== 'ALL' && tpl.category !== selectedCategory.value) {
      return false
    }
    // Filter by search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = tpl.name?.toLowerCase().includes(q)
      const matchBody = (tpl.body_text || tpl.body || '').toLowerCase().includes(q)
      const matchHeader = (tpl.header || '').toLowerCase().includes(q)
      if (!matchName && !matchBody && !matchHeader) return false
    }
    return true
  })
})

const selectTemplate = (tpl) => {
  selectedTemplate.value = tpl
}

const resetSelection = () => {
  selectedTemplate.value = null
  Object.keys(variableValues).forEach((key) => {
    delete variableValues[key]
  })
}

// Redirect to Create Template page in WhatsApp module
const handleCreateTemplateRedirect = () => {
  emit('close')
  router.push('/whatsapp/templates/create')
}

// Replace placeholders {{var}} with actual filled values
const resolveText = (text, values) => {
  if (!text) return ''
  return text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, p1) => {
    if (values && values[p1] !== undefined && values[p1] !== '') {
      return values[p1]
    }
    // Fallback for number or normalized key
    const clean = p1.replace(/^v/, '')
    if (values && values[clean] !== undefined && values[clean] !== '') {
      return values[clean]
    }
    return `{{${p1}}}`
  })
}

// Send Template Handler
const handleSendTemplate = async () => {
  if (!canSend.value) {
    snackbar.show('You do not have permission to send WhatsApp templates', 'error')
    return
  }

  if (!selectedTemplate.value || !cleanPhone.value || isSending.value) return

  isSending.value = true

  try {
    // Construct placeholders array: Extract variable values in order of appearance
    const vars = templateVariables.value
    const placeholders = vars.map((v) => {
      return variableValues[v]?.trim() || `{{${v}}}`
    })

    // Construct preview optimistic message text
    const fullMessage = `${selectedTemplate.value.header ? `${resolveText(selectedTemplate.value.header, variableValues)}\n\n` : ''}${resolveText(selectedTemplate.value.body_text || selectedTemplate.value.body, variableValues)}${selectedTemplate.value.footer_text ? `\n\n_${resolveText(selectedTemplate.value.footer_text, variableValues)}_` : ''}`

    await chatStore.sendTemplateMessage({
      template_name: selectedTemplate.value.name,
      templateName: selectedTemplate.value.name,
      phoneNumber: cleanPhone.value,
      to: cleanPhone.value,
      placeholders: placeholders,
      optimisticText: fullMessage.trim(),
    })

    snackbar.show('Template message sent successfully!', 'success')
    emit('template-sent')
    emit('close')
  } catch (err) {
    console.error('Failed to send template message:', err)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-slide">
      <div v-if="open" class="fixed inset-0 z-[60] flex justify-end">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer transition-opacity"
          @click="emit('close')"
        />

        <!-- Slide-over Drawer -->
        <div
          class="relative z-10 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300 select-none"
        >
          <!-- Top Header -->
          <div
            class="px-5 py-4 bg-card-background border-b border-primary-border flex items-center justify-between shrink-0 shadow-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <button
                v-if="selectedTemplate"
                type="button"
                @click="resetSelection"
                title="Back to templates list"
                class="p-2 rounded-xl bg-background hover:bg-card-background border border-primary-border text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              >
                <ArrowLeft class="w-4 h-4" />
              </button>

              <div
                v-else
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0"
              >
                <FileText class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <h2 class="text-sm md:text-base font-bold text-primary-text flex items-center gap-2 truncate">
                  <span class="truncate">{{ selectedTemplate ? selectedTemplate.name : 'Select WhatsApp Template' }}</span>
                  <span
                    v-if="selectedTemplate"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono shrink-0 uppercase"
                  >
                    {{ selectedTemplate.category }}
                  </span>
                </h2>
                <p class="text-xs text-secondary-text truncate">
                  {{
                    selectedTemplate
                      ? 'Fill in template parameters and preview before sending'
                      : `Send an approved template to ${clientName} to initiate 24h conversation window`
                  }}
                </p>
              </div>
            </div>

            <!-- Right Header Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Create Template Button -->
              <button
                type="button"
                @click="handleCreateTemplateRedirect"
                class="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">New Template</span>
              </button>

              <!-- Close Button -->
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-xl hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Drawer Body Content -->
          <div class="flex-1 overflow-y-auto no-scrollbar bg-background">
            <!-- ════════════════════ VIEW 1: TEMPLATE LISTING ════════════════════ -->
            <div v-if="!selectedTemplate" class="p-5 space-y-4">
              <!-- Search & Filter Bar -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <!-- Search Input -->
                <div class="relative flex-1">
                  <Search class="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search templates by name or content..."
                    class="w-full bg-card-background border border-primary-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary transition-colors shadow-2xs"
                  />
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Category Pills -->
                <div class="flex items-center gap-1.5 bg-card-background p-1 rounded-xl border border-primary-border shrink-0 shadow-2xs">
                  <button
                    v-for="cat in ['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION']"
                    :key="cat"
                    type="button"
                    @click="selectedCategory = cat"
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    :class="[
                      selectedCategory === cat
                        ? 'bg-primary text-btn-text-primary shadow-xs'
                        : 'text-secondary-text hover:text-primary-text hover:bg-background',
                    ]"
                  >
                    {{ cat }}
                  </button>
                </div>

                <!-- Refresh Button -->
                <button
                  type="button"
                  @click="templateStore.fetchTemplates(true)"
                  :disabled="templateStore.loading"
                  class="p-2 rounded-xl bg-card-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
                  title="Refresh templates"
                >
                  <RotateCw
                    class="w-4 h-4"
                    :class="{ 'animate-spin text-primary': templateStore.loading }"
                  />
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="templateStore.loading" class="py-16 text-center space-y-3">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p class="text-xs text-secondary-text">Loading approved WhatsApp templates...</p>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="filteredTemplates.length === 0"
                class="py-14 px-4 text-center rounded-2xl bg-card-background border border-primary-border space-y-3 shadow-2xs"
              >
                <div class="w-12 h-12 rounded-2xl bg-background text-secondary-text flex items-center justify-center mx-auto border border-primary-border">
                  <FileText class="w-6 h-6" />
                </div>
                <h3 class="text-sm font-semibold text-primary-text">No Templates Found</h3>
                <p class="text-xs text-secondary-text max-w-sm mx-auto">
                  {{
                    searchQuery
                      ? 'No templates match your search query.'
                      : 'You do not have any approved templates in the WhatsApp module yet.'
                  }}
                </p>
                <button
                  v-if="canCreate"
                  type="button"
                  @click="handleCreateTemplateRedirect"
                  class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus class="w-4 h-4" />
                  <span>Create Template in WhatsApp Module</span>
                </button>
              </div>

              <!-- Template Grid -->
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  v-for="tpl in filteredTemplates"
                  :key="tpl.id || tpl.name"
                  @click="selectTemplate(tpl)"
                  class="group p-4 rounded-2xl bg-card-background border border-primary-border hover:border-primary/50 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs relative overflow-hidden"
                >
                  <div class="space-y-2">
                    <!-- Name & Category -->
                    <div class="flex items-center justify-between gap-2">
                      <h4 class="text-xs md:text-sm font-bold text-primary-text group-hover:text-primary transition-colors font-mono truncate">
                        {{ tpl.name }}
                      </h4>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 uppercase border"
                        :class="[
                          tpl.category === 'MARKETING'
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            : tpl.category === 'AUTHENTICATION'
                            ? 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
                            : 'bg-primary-green/10 text-primary-green border-primary-green/20',
                        ]"
                      >
                        {{ tpl.category }}
                      </span>
                    </div>

                    <!-- Header preview if present -->
                    <div v-if="tpl.header" class="text-[11px] font-semibold text-primary truncate">
                      📌 {{ tpl.header }}
                    </div>

                    <!-- Body snippet with variable highlights -->
                    <div
                      class="text-xs text-secondary-text line-clamp-3 leading-relaxed font-sans"
                      v-html="renderBodyWithHighlight(tpl.body_text || tpl.body)"
                    />
                  </div>

                  <!-- Card Footer -->
                  <div class="pt-2 border-t border-primary-border flex items-center justify-between text-[11px] text-secondary-text">
                    <span class="flex items-center gap-1 font-mono uppercase">
                      {{ tpl.language || 'en' }}
                    </span>
                    <span class="text-primary font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                      Select Template
                      <ArrowRight class="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ════════════════════ VIEW 2: CONFIGURE & PREVIEW & SEND ════════════════════ -->
            <div v-else class="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- Left Column: Variables Configuration Form -->
              <div class="lg:col-span-6 space-y-4">
                <!-- Back Action -->
                <button
                  type="button"
                  @click="resetSelection"
                  class="inline-flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary transition-colors cursor-pointer font-semibold"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                  <span>Choose a different template</span>
                </button>

                <!-- Template Details Summary Card -->
                <div class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-2 shadow-2xs">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm font-bold text-primary-text font-mono truncate">
                      {{ selectedTemplate.name }}
                    </h3>
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0 uppercase"
                    >
                      {{ selectedTemplate.category }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 text-xs text-secondary-text">
                    <span>Language: <strong class="text-primary-text">{{ selectedTemplate.language || 'en' }}</strong></span>
                    <span>•</span>
                    <span>Recipient: <strong class="text-primary font-mono">{{ cleanPhone || 'No Phone' }}</strong></span>
                  </div>
                </div>

                <!-- Variables Inputs -->
                <div class="p-4 rounded-2xl bg-card-background border border-primary-border space-y-3.5 shadow-2xs">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-2">
                      <Sparkles class="w-3.5 h-3.5 text-primary" />
                      Dynamic Parameters
                    </h4>
                    <span class="text-[11px] text-secondary-text font-mono font-semibold">
                      {{ templateVariables.length }} variable(s)
                    </span>
                  </div>

                  <!-- If no variables in template -->
                  <div
                    v-if="templateVariables.length === 0"
                    class="p-3.5 rounded-xl bg-background border border-primary-border text-xs text-secondary-text"
                  >
                    ✨ This template has no dynamic variables. It is ready to send as-is!
                  </div>

                  <!-- Variable inputs list -->
                  <div v-else class="space-y-3">
                    <div
                      v-for="varName in templateVariables"
                      :key="varName"
                      class="space-y-1.5"
                    >
                      <label class="block text-xs font-medium text-secondary-text">
                        Parameter <code class="text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{&#123;{{ varName }}&#125;}</code>
                      </label>
                      <input
                        v-model="variableValues[varName]"
                        type="text"
                        :placeholder="`Enter value for {{${varName}}}...`"
                        class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary transition-colors shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <!-- Send Button -->
                <div class="pt-2">
                  <button
                    type="button"
                    @click="handleSendTemplate"
                    :disabled="isSending || !cleanPhone || !canSend"
                    class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-btn-text-primary font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99]"
                  >
                    <span
                      v-if="isSending"
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    <Send v-else class="w-4 h-4 stroke-[2.2]" />
                    <span>{{ isSending ? 'Sending Template...' : 'Send Template & Start Chat' }}</span>
                  </button>
                  <p class="text-[11px] text-center text-secondary-text mt-2">
                    Sending this template initiates a 24-hour active WhatsApp conversation window.
                  </p>
                </div>
              </div>

              <!-- Right Column: Interactive WhatsApp Mobile Preview -->
              <div class="lg:col-span-6 flex flex-col items-center justify-start p-2">
                <div class="text-xs font-semibold text-secondary-text mb-2.5 self-start flex items-center gap-1.5">
                  <MessageSquare class="w-3.5 h-3.5 text-primary" />
                  Live WhatsApp Message Preview
                </div>
                <div class="w-full max-w-[340px]">
                  <WhatsAppMobilePreview
                    :business-name="Array.isArray(selectedTemplate.channels) && selectedTemplate.channels.length ? selectedTemplate.channels[0] : 'Panther Capital'"
                    :name="selectedTemplate.name"
                    :header-type="selectedTemplate.header_type || (selectedTemplate.header ? 'text' : 'none')"
                    :header="selectedTemplate.header"
                    :body="selectedTemplate.body_text || selectedTemplate.body"
                    :footer="selectedTemplate.footer_text || selectedTemplate.footer"
                    :buttons="selectedTemplate.buttons || []"
                    :variable-values="variableValues"
                    :category="selectedTemplate.category"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: all 0.25s ease-out;
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
