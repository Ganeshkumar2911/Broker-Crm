<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Send,
  MessageSquare,
  Megaphone,
  BellRing,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Hash,
  Sparkles,
  Smartphone,
  Edit3,
} from 'lucide-vue-next'
import { useWhatsAppTemplatesStore } from '@/stores/whatsapp/templates'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import WhatsAppMobilePreview from '@/components/whatsapp/WhatsAppMobilePreview.vue'

const router = useRouter()
const store = useWhatsAppTemplatesStore()
const snackbar = useSnackbarStore()
const { hasPermission } = usePermissionCheck()

// Permissions
const canCreateTemplate = computed(() => hasPermission('whatsapp.create'))

onMounted(() => {
  if (!canCreateTemplate.value) {
    snackbar.show('You do not have permission to create WhatsApp templates', 'error')
    router.push('/whatsapp/templates')
  }
})

// Responsive Tab Mode for Tablets & Mobile (under 1280px)
const activeTab = ref('form') // 'form' | 'preview'

// Form Model
const form = reactive({
  name: '',
  category: 'MARKETING',
  headerType: 'none', // 'none' | 'text'
  header: '',
  body: '',
  footer: '',
})

// Variable sample test values (for live preview & meta submission)
const variableSamples = reactive({})

// Header format types
const headerTypes = [
  { label: 'None', value: 'none' },
  { label: 'Text', value: 'text' },
]

// Categories with metadata
const categories = [
  {
    value: 'MARKETING',
    title: 'Marketing',
    rate: 'High Engagement',
    badgeClass: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    desc: 'Send promotional offers, seasonal announcements, newsletters, and marketing updates to build brand loyalty.',
    icon: Megaphone,
  },
  {
    value: 'UTILITY',
    title: 'Utility',
    rate: '99% Delivery Rate',
    badgeClass: 'bg-primary-green/10 text-primary-green border border-primary-green/20',
    desc: 'Send transactional messages about account changes, order updates, deposit/withdrawal alerts, and invoices.',
    icon: BellRing,
  },
  {
    value: 'AUTHENTICATION',
    title: 'Authentication',
    rate: 'Instant Delivery',
    badgeClass: 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20',
    desc: 'Send one-time password (OTP) verification codes and security alerts to verify user logins and actions.',
    icon: ShieldCheck,
  },
]

// Automatically extract variables from body for body_example
const bodyVariables = computed(() => {
  const matches = form.body.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g)
  if (!matches) return []
  return Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ''))))
})

// Automatically extract all variables like {{1}}, {{2}}, {{v1}}, {{username}} from header and body
const detectedVariables = computed(() => {
  const combinedText = `${form.header} ${form.body}`
  const matches = combinedText.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g)
  if (!matches) return []

  const unique = Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ''))))
  return unique
})

// Ensure sample values exist for all detected variables
watch(
  detectedVariables,
  (newVars) => {
    newVars.forEach((v) => {
      if (variableSamples[v] === undefined) {
        variableSamples[v] = ''
      }
    })
  },
  { immediate: true },
)

// Name sanitization helper (lowercase letters, numbers, underscore)
const onNameInput = (e) => {
  const clean = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
  form.name = clean
}

// Add variable to body
const addVariableToBody = () => {
  const nextNumber = detectedVariables.value.length + 1
  const varTag = `{{v${nextNumber}}}`
  form.body += (form.body.endsWith(' ') || form.body === '' ? '' : ' ') + varTag + ' '
}

// Insert {{username}}
const insertUsernameTag = () => {
  const tag = '{{username}}'
  form.body += (form.body.endsWith(' ') || form.body === '' ? '' : ' ') + tag + ' '
}

// Add variable to header
const addVariableToHeader = () => {
  if (form.header.includes('{{')) {
    snackbar.show('Header text can only include at most one variable.', 'warning')
    return
  }
  form.header += (form.header.endsWith(' ') || form.header === '' ? '' : ' ') + '{{v1}}'
}

// Form Validation
const errors = reactive({
  name: '',
  body: '',
})

const validate = () => {
  let isValid = true
  errors.name = ''
  errors.body = ''

  if (!form.name.trim()) {
    errors.name = 'Template name is required'
    isValid = false
  } else if (!/^[a-z0-9_]+$/.test(form.name)) {
    errors.name = 'Only lowercase letters, numbers, and underscore are allowed'
    isValid = false
  }

  if (!form.body.trim()) {
    errors.body = 'Message body text is required'
    isValid = false
  }

  return isValid
}

// Submit Form
const isSubmitting = ref(false)
const handleSubmit = async () => {
  if (!canCreateTemplate.value) {
    snackbar.show('You do not have permission to create WhatsApp templates', 'error')
    return
  }

  if (!validate()) {
    snackbar.show('Please fix the errors before submitting', 'error')
    activeTab.value = 'form'
    return
  }

  isSubmitting.value = true

  try {
    // Build body_example object mapping each variable in body to its sample value
    const bodyExample = {}
    bodyVariables.value.forEach((v) => {
      bodyExample[v] = variableSamples[v]?.trim() || v
    })

    // Construct exact expected backend payload
    const payload = {
      name: form.name.trim(),
      category: form.category.toUpperCase(),
      body_text: form.body,
      body_example: bodyExample,
      header_text: form.headerType === 'text' && form.header.trim() ? form.header.trim() : '',
      header_format: form.headerType === 'text' && form.header.trim() ? 'TEXT' : 'NONE',
      footer_text: form.footer?.trim() || '',
    }

    await store.createTemplate(payload)
    router.push('/whatsapp/templates')
  } catch (err) {
    console.error('Template submission error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-3 py-1 h-[calc(100vh-90px)] flex flex-col overflow-hidden relative">
    <!-- Tablet / Mobile Tab Switcher (Visible only on < 1280px screen) -->
    <div class="xl:hidden flex items-center justify-between pb-1 shrink-0">
      <div class="flex items-center gap-1 p-1 bg-background rounded-xl border border-primary-border shadow-2xs">
        <button
          type="button"
          @click="activeTab = 'form'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none"
          :class="
            activeTab === 'form'
              ? 'bg-primary text-btn-text-primary shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          "
        >
          <Edit3 class="w-3.5 h-3.5" />
          <span>Form</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'preview'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none"
          :class="
            activeTab === 'preview'
              ? 'bg-primary text-btn-text-primary shadow-xs'
              : 'text-secondary-text hover:text-primary-text'
          "
        >
          <Smartphone class="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      <button
        type="button"
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-btn-text-primary text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
      >
        <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <Send v-else class="w-3.5 h-3.5" />
        <span>{{ isSubmitting ? 'Submitting...' : 'Submit' }}</span>
      </button>
    </div>

    <!-- Main Content Area: Responsive Grid / Tab View -->
    <div class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden">
      
      <!-- Left Column: Configuration Form -->
      <div
        class="h-full overflow-y-auto pr-1 pb-16 space-y-5 no-scrollbar transition-all"
        :class="[
          'xl:col-span-7 xl:block',
          activeTab === 'form' ? 'block' : 'hidden xl:block'
        ]"
      >
        <!-- 1. Basic Information Card -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div class="flex items-center justify-between border-b border-primary-border pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">Basic Information</h2>
                <p class="text-[11px] text-secondary-text">Name and category classification</p>
              </div>
            </div>
            <span class="text-[10px] font-semibold text-secondary-text uppercase tracking-wider bg-background px-2 py-0.5 rounded border border-primary-border">
              Required
            </span>
          </div>

          <!-- Template Name Input -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-primary-text flex items-center gap-1">
                <span>Template Name</span>
                <span class="text-rose-500">*</span>
              </label>
              <span class="text-[11px] text-secondary-text font-mono">{{ form.name.length }}/512</span>
            </div>
            <div class="relative">
              <Hash class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none" />
              <input
                :value="form.name"
                @input="onNameInput"
                maxlength="512"
                type="text"
                placeholder="e.g. deposit_success, welcome_user, order_update"
                class="w-full pl-9 pr-3 py-2.5 text-xs font-mono rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                :class="{ 'border-rose-500 focus:border-rose-500': errors.name }"
              />
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <p class="text-secondary-text">
                Use lowercase letters (a-z), numbers (0-9), and underscores (_) only.
              </p>
              <p v-if="errors.name" class="text-rose-500 font-semibold">{{ errors.name }}</p>
            </div>
          </div>

          <!-- Category Selection Cards -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-primary-text flex items-center gap-1">
                <span>Category</span>
                <span class="text-rose-500">*</span>
              </label>
              <span class="text-[11px] text-secondary-text">Select one category</span>
            </div>

            <div class="grid grid-cols-1 gap-2.5">
              <div
                v-for="cat in categories"
                :key="cat.value"
                @click="form.category = cat.value"
                class="p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 select-none relative overflow-hidden"
                :class="
                  form.category === cat.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/25 shadow-2xs'
                    : 'border-primary-border bg-background/50 hover:bg-background hover:border-primary/40'
                "
              >
                <!-- Radio indicator & icon -->
                <div class="flex items-center gap-2.5 mt-0.5">
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors"
                    :class="
                      form.category === cat.value
                        ? 'border-primary bg-primary'
                        : 'border-primary-border bg-card-background'
                    "
                  >
                    <div v-if="form.category === cat.value" class="w-1.5 h-1.5 rounded-full bg-btn-text-primary" />
                  </div>
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    :class="
                      form.category === cat.value
                        ? 'bg-primary/10 text-primary'
                        : 'bg-background text-secondary-text'
                    "
                  >
                    <component :is="cat.icon" class="w-3.5 h-3.5" />
                  </div>
                </div>

                <!-- Info Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-bold text-primary-text">{{ cat.title }}</span>
                    <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-md border tracking-wide"
                      :class="cat.badgeClass"
                    >
                      {{ cat.rate }}
                    </span>
                  </div>
                  <p class="text-[11px] text-secondary-text mt-1 leading-relaxed">{{ cat.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Message Content Card -->
        <div class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div class="flex items-center justify-between border-b border-primary-border pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">Message Content</h2>
                <p class="text-[11px] text-secondary-text">Header, body text with variables, and footer</p>
              </div>
            </div>
          </div>

          <!-- Header Section (Optional) -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-xs font-semibold text-primary-text">Header (Optional)</label>
                <p class="text-[11px] text-secondary-text">Add a title or subject line to highlight your message.</p>
              </div>
            </div>

            <!-- Header Type Segmented Control -->
            <div class="flex items-center gap-1 p-1 bg-background rounded-xl border border-primary-border w-fit">
              <button
                v-for="ht in headerTypes"
                :key="ht.value"
                type="button"
                @click="form.headerType = ht.value"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                :class="
                  form.headerType === ht.value
                    ? 'bg-primary text-btn-text-primary shadow-xs'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background'
                "
              >
                {{ ht.label }}
              </button>
            </div>

            <!-- Text Header Input (If Text is selected) -->
            <div v-if="form.headerType === 'text'" class="space-y-1.5 animate-in fade-in duration-150 pt-1">
              <div class="relative">
                <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none" />
                <input
                  v-model="form.header"
                  maxlength="60"
                  type="text"
                  placeholder="e.g. Withdrawal Notification, Welcome to Panther Capital"
                  class="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-medium"
                />
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  @click="addVariableToHeader"
                  class="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" /> <span>Add Variable in Header</span>
                </button>
                <span class="text-secondary-text font-mono">({{ form.header.length }}/60)</span>
              </div>
            </div>
          </div>

          <!-- Body Section (Required) -->
          <div class="space-y-2 pt-3 border-t border-primary-border">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-xs font-semibold text-primary-text flex items-center gap-1">
                  <span>Body Text</span>
                  <span class="text-rose-500">*</span>
                </label>
              </div>
              <span class="text-[11px] text-secondary-text font-mono">{{ form.body.length }}/1024</span>
            </div>

            <!-- Quick Variable Chips Toolbar -->
            <div class="flex items-center justify-between py-1 bg-background/60 p-2 rounded-xl border border-primary-border/60">
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-secondary-text font-medium">Quick Tags:</span>
                <button
                  type="button"
                  @click="insertUsernameTag"
                  class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/25 text-[11px] font-mono text-primary font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus class="w-3 h-3" />
                  <span>username</span>
                </button>
              </div>

              <button
                type="button"
                @click="addVariableToBody"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer bg-card-background border border-primary-border px-2.5 py-1 rounded-lg hover:bg-background transition-colors"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Variable</span>
              </button>
            </div>

            <!-- Body Textarea -->
            <textarea
              v-model="form.body"
              maxlength="1024"
              rows="5"
              placeholder="Hello {{username}}, this is an update regarding your transaction {{v1}}..."
              class="w-full px-3.5 py-3 text-xs leading-relaxed rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-y font-sans"
              :class="{ 'border-rose-500 focus:border-rose-500': errors.body }"
            />

            <div class="flex items-center justify-between text-[11px]">
              <p class="text-secondary-text">
                Insert variables using double curly braces, e.g. <code class="font-mono font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">{{ '{' }}{{ '{' }}1{{ '}' }}{{ '}' }}</code> or <code class="font-mono font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">{{ '{' }}{{ '{' }}username{{ '}' }}{{ '}' }}</code>.
              </p>
              <p v-if="errors.body" class="text-rose-500 font-semibold">{{ errors.body }}</p>
            </div>
          </div>

          <!-- Footer Section (Optional) -->
          <div class="space-y-1.5 pt-3 border-t border-primary-border">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-xs font-semibold text-primary-text">Footer (Optional)</label>
                <p class="text-[11px] text-secondary-text">Short disclaimer, company name, or expiry notice.</p>
              </div>
              <span class="text-[11px] text-secondary-text font-mono">{{ form.footer.length }}/60)</span>
            </div>
            <input
              v-model="form.footer"
              maxlength="60"
              type="text"
              placeholder="e.g. Panther Capital Ltd • Reply STOP to unsubscribe"
              class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-medium"
            />
          </div>
        </div>

        <!-- 3. Dynamic Variables Test Examples Card -->
        <div
          v-if="detectedVariables.length > 0"
          class="bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200"
        >
          <div class="flex items-center justify-between border-b border-primary-border pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-primary-green/10 text-primary-green border border-primary-green/20 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">Variable Test Samples</h2>
                <p class="text-[11px] text-secondary-text">Provide sample values to preview live on the phone screen</p>
              </div>
            </div>
            <span class="text-[11px] font-mono text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-md">
              {{ detectedVariables.length }} {{ detectedVariables.length === 1 ? 'variable' : 'variables' }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div
              v-for="v in detectedVariables"
              :key="v"
              class="space-y-1.5 p-3 rounded-xl bg-background border border-primary-border"
            >
              <div class="flex items-center justify-between">
                <label class="text-xs font-mono font-bold text-primary">
                  {{ '{' }}{{ '{' }}{{ v }}{{ '}' }}{{ '}' }}
                </label>
                <span class="text-[10px] text-secondary-text">Sample value</span>
              </div>
              <input
                v-model="variableSamples[v]"
                type="text"
                :placeholder="`e.g. John Doe, $500`"
                class="w-full px-3 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-medium"
              />
            </div>
          </div>
        </div>

        <!-- Bottom Action Buttons (Right where they were originally) -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="router.push('/whatsapp/templates')"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-card-background border border-primary-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || !canCreateTemplate"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-btn-text-primary text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <Send v-else class="w-3.5 h-3.5" />
            <span>{{ isSubmitting ? 'Submitting...' : 'Submit Template' }}</span>
          </button>
        </div>

      </div>

      <!-- Right Column: Live WhatsApp Mobile Preview (Full width on 'preview' tab, 5 cols on >= 1280px desktop) -->
      <div
        class="h-full flex flex-col justify-between overflow-hidden bg-card-background border border-primary-border rounded-2xl p-4 shadow-2xs transition-all"
        :class="[
          'xl:col-span-5 xl:flex',
          activeTab === 'preview' ? 'flex' : 'hidden xl:flex'
        ]"
      >
        <!-- Preview Panel Header -->
        <div class="flex items-center justify-between pb-3 border-b border-primary-border shrink-0">
          <div class="flex items-center gap-2">
            <Smartphone class="w-4 h-4 text-primary" />
            <h2 class="text-xs font-bold text-primary-text uppercase tracking-wider">Live WhatsApp Preview</h2>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="activeTab = 'form'"
              class="xl:hidden text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 class="w-3 h-3" />
              <span>Back to Form</span>
            </button>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-green/10 text-primary-green border border-primary-green/20">
              Real-Time Sync
            </span>
          </div>
        </div>

        <!-- Phone Mockup Container -->
        <div class="flex-1 min-h-0 flex items-center justify-center p-1 overflow-hidden">
          <WhatsAppMobilePreview
            :name="form.name"
            :header-type="form.headerType"
            :header="form.header"
            :body="form.body"
            :footer="form.footer"
            :variable-values="variableSamples"
            :category="form.category"
          />
        </div>
      </div>

    </div>

    <!-- Floating Live Preview Button on Tablet & Mobile (When editing form) -->
    <div
      v-if="activeTab === 'form'"
      class="xl:hidden fixed bottom-6 right-6 z-30"
    >
      <button
        @click="activeTab = 'preview'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-btn-text-primary text-xs font-bold shadow-lg hover:bg-primary-hover active:scale-95 transition-all cursor-pointer border border-white/10"
      >
        <Smartphone class="w-4 h-4" />
        <span>View Live Preview</span>
      </button>
    </div>
  </div>
</template>
