<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  RotateCw,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  Eye,
  LayoutGrid,
  List,
  Smartphone,
  ExternalLink,
  CheckCheck,
  FileText,
  CornerDownRight,
} from 'lucide-vue-next'
import { useWhatsAppTemplatesStore } from '@/stores/whatsapp/templates'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import TemplatePreviewModal from '@/components/whatsapp/TemplatePreviewModal.vue'
import { formatDate } from '@/utils/timeFormatter'

const router = useRouter()
const store = useWhatsAppTemplatesStore()
const { hasPermission } = usePermissionCheck()

// Permissions
const canCreateTemplate = computed(() => hasPermission('whatsapp.create'))
const canViewTemplates = computed(() => hasPermission(['whatsapp.view', 'whatsapp.create']))

// State
const layoutMode = ref('grid') // 'grid' | 'list'
const selectedTemplateForModal = ref(null)
const isPreviewModalOpen = ref(false)

// Category options
const categoryOptions = [
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Utility', value: 'UTILITY' },
  { label: 'Authentication', value: 'AUTHENTICATION' },
]

// Status options
const statusOptions = [
  { label: 'All status', value: 'ALL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Paused', value: 'PAUSED' },
]

onMounted(() => {
  if (canViewTemplates.value) {
    store.fetchTemplates()
  }
})

// Refetch templates when status/category filter changes
watch(
  [() => store.filters.status, () => store.filters.category],
  () => {
    if (canViewTemplates.value) {
      store.fetchTemplates(true)
    }
  }
)

const navigateToCreate = () => {
  if (!canCreateTemplate.value) return
  router.push('/whatsapp/templates/create')
}

const openPreviewModal = (template) => {
  selectedTemplateForModal.value = template
  isPreviewModalOpen.value = true
}

const handleResetAll = () => {
  store.resetFilters()
}

const formatTime = (dateStr) => {
  if (!dateStr || dateStr === '-') {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      const now = new Date()
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch (_) {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }
}

// Helper to escape and highlight {{variable}} tags in WhatsApp message body
const formatBodyWithVariables = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  return escaped.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, v) => {
    return `<span class="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold border border-primary/20 shadow-2xs">\{\{${v}\}\}</span>`
  })
}

// Category styling badge classes
const getCategoryBadgeClass = (category) => {
  const cat = (category || '').toUpperCase()
  if (cat === 'MARKETING') {
    return 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
  }
  if (cat === 'UTILITY') {
    return 'bg-primary-green/10 text-primary-green border border-primary-green/20'
  }
  if (cat === 'AUTHENTICATION') {
    return 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
  }
  return 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20'
}
</script>

<template>
  <div class="space-y-4 py-1 min-h-[calc(100vh-100px)] flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-primary-text tracking-tight">WhatsApp Templates</h1>
          <span
            v-if="store.templates.length > 0"
            class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {{ store.templates.length }}
          </span>
        </div>
        <p class="text-xs text-secondary-text mt-0.5">
          Manage, monitor, and preview your approved WhatsApp message templates
        </p>
      </div>

      <button
        v-if="canCreateTemplate"
        @click="navigateToCreate"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>New Template</span>
      </button>
    </div>

    <!-- Filter & Layout Toolbar Section (Only Category, Status, Refresh, Reset, Layout) -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between overflow-visible"
      >
        <!-- Left: Category & Status Filter controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Category Filter -->
          <BaseSelect
            v-model="store.filters.category"
            :options="categoryOptions"
            placeholder="Categories"
            class="w-full sm:w-44"
          />

          <!-- Status Filter -->
          <BaseSelect
            v-model="store.filters.status"
            :options="statusOptions"
            placeholder="All status"
            class="w-full sm:w-40"
          />

          <!-- Refresh & Clear Filters -->
          <div class="flex items-center gap-1.5 h-9">
            <Tooltip text="Refresh Templates" placement="top">
              <button
                :disabled="store.loading"
                @click="store.fetchTemplates(true)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
              >
                <RotateCw
                  class="w-4 h-4"
                  :class="{ 'animate-spin': store.loading }"
                />
              </button>
            </Tooltip>

            <button
              v-if="store.filters.category || store.filters.status !== 'ALL'"
              @click="handleResetAll"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Right: Layout Switcher (Grid & List View) -->
        <div
          class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 h-9 shrink-0 self-end sm:self-auto"
        >
          <Tooltip text="Grid Card View" placement="top">
            <button
              @click="layoutMode = 'grid'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'grid'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip text="Table List View" placement="top">
            <button
              @click="layoutMode = 'list'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'list'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <List class="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Loading Skeleton State -->
      <div
        v-if="store.loading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-36 bg-background rounded-md" />
            <div class="h-5 w-16 bg-background rounded-full" />
          </div>
          <div class="h-48 w-full bg-background rounded-xl" />
          <div class="flex justify-between items-center pt-2">
            <div class="h-4 w-24 bg-background rounded-md" />
            <div class="h-8 w-20 bg-background rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="store.filteredTemplates.length === 0"
        class="flex-1 flex flex-col items-center justify-center gap-4 py-20 bg-card-background/30 border border-primary-border rounded-2xl text-center px-4"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
        >
          <MessageSquare class="w-8 h-8 stroke-[1.5]" />
        </div>
        <div class="max-w-sm">
          <h3 class="text-base font-bold text-primary-text">No templates found</h3>
          <p class="text-xs text-secondary-text mt-1">
            {{
              store.filters.category || store.filters.status !== 'ALL'
                ? "No WhatsApp templates match your active filters."
                : "Create your first WhatsApp message template to start engaging customers."
            }}
          </p>
        </div>
        <button
          v-if="store.filters.category || store.filters.status !== 'ALL'"
          @click="handleResetAll"
          class="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
        <button
          v-else-if="canCreateTemplate"
          @click="navigateToCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <!-- 1. GRID CARDS VIEW MODE (Theme Aware: Light in Light mode, Dark in Dark mode) -->
      <div
        v-else-if="layoutMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <div
          v-for="tpl in store.filteredTemplates"
          :key="tpl.id"
          class="group bg-card-background border border-primary-border hover:border-primary/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative overflow-hidden"
        >
          <!-- Card Header Section -->
          <div class="space-y-2 mb-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                <!-- Category Badge -->
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase"
                  :class="getCategoryBadgeClass(tpl.category)"
                >
                  {{ tpl.category }}
                </span>

                <!-- ID Badge -->
                <span
                  class="text-[11px] text-secondary-text font-semibold px-1.5 py-0.5 bg-background rounded-md border border-primary-border shrink-0"
                >
                  #{{ tpl.id }}
                </span>

                <!-- Status Badge -->
                <span
                  v-if="tpl.status === 'APPROVED'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>Approved</span>
                </span>
                <span
                  v-else-if="tpl.status === 'PENDING'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                >
                  <Clock class="w-3 h-3" />
                  <span>Pending</span>
                </span>
                <span
                  v-else-if="tpl.status === 'PAUSED'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                >
                  <PauseCircle class="w-3 h-3" />
                  <span>Paused</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20"
                >
                  <XCircle class="w-3 h-3" />
                  <span>{{ tpl.status || 'Rejected' }}</span>
                </span>
              </div>

              <!-- Top Quick Preview Eye Icon -->
              <Tooltip text="View Full WhatsApp Preview" placement="top">
                <button
                  @click="openPreviewModal(tpl)"
                  class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer shrink-0"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

            <!-- Template Name & Author/Date -->
            <div class="min-w-0">
              <h2
                class="font-mono text-sm font-bold text-primary-text truncate"
                :title="tpl.name"
              >
                {{ tpl.name }}
              </h2>
              <div class="flex items-center gap-2 text-[11px] text-secondary-text mt-0.5 flex-wrap">
                <span v-if="tpl.created_by">By {{ tpl.created_by }}</span>
                <span v-if="tpl.created_by && (tpl.created_at || tpl.updated_at)">•</span>
                <span v-if="tpl.created_at || tpl.updated_at">{{ formatDate(tpl.created_at || tpl.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- WhatsApp Message Preview Container (Properly themed with bg-background and bg-card-background) -->
          <div
            class="relative w-full min-h-[175px] max-h-[210px] rounded-xl border border-primary-border bg-background p-2.5 flex flex-col justify-between overflow-hidden group/preview cursor-pointer transition-all duration-200 hover:border-primary/50"
            @click="openPreviewModal(tpl)"
          >
            <!-- WhatsApp Chat Bubble (White in Light mode, Dark Slate in Dark mode) -->
            <div
              class="w-full bg-card-background border border-primary-border/70 rounded-xl p-3 shadow-2xs space-y-2 relative overflow-hidden max-h-full flex flex-col"
            >
              <!-- Optional Header Text -->
              <div
                v-if="tpl.header"
                class="text-xs font-bold text-primary-text pb-1.5 border-b border-primary-border/60 flex items-center gap-1.5 shrink-0"
              >
                <FileText class="w-3.5 h-3.5 text-primary shrink-0" />
                <span class="truncate">{{ tpl.header }}</span>
              </div>

              <!-- Body Text with Theme-Aware Variable Badges -->
              <div class="flex-1 overflow-y-auto scrollbar-none text-xs text-primary-text leading-relaxed whitespace-pre-line font-sans break-words pr-1">
                <span v-html="formatBodyWithVariables(tpl.body_text)" />
              </div>

              <!-- Optional Footer Text -->
              <div
                v-if="tpl.footer_text"
                class="text-[10px] text-secondary-text italic pt-1 border-t border-primary-border/60 shrink-0 truncate"
              >
                {{ tpl.footer_text }}
              </div>

              <!-- Optional Action Buttons -->
              <div
                v-if="tpl.buttons && tpl.buttons.length > 0"
                class="pt-1.5 border-t border-primary-border/60 space-y-1 shrink-0"
              >
                <div
                  v-for="(btn, bIdx) in tpl.buttons"
                  :key="bIdx"
                  class="w-full py-1 px-2.5 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 flex items-center justify-center gap-1.5 text-center truncate"
                >
                  <ExternalLink v-if="btn.type === 'URL'" class="w-3 h-3 shrink-0" />
                  <CornerDownRight v-else class="w-3 h-3 shrink-0" />
                  <span class="truncate">{{ btn.text }}</span>
                </div>
              </div>

              <!-- Message Timestamp & Double Check ticks -->
              <div class="flex items-center justify-end gap-1 text-[10px] text-secondary-text pt-0.5 shrink-0">
                <span>{{ formatTime(tpl.updated_at || tpl.created_at) }}</span>
                <CheckCheck class="w-3.5 h-3.5 text-sky-500" />
              </div>
            </div>

            <!-- Hover Preview Overlay -->
            <div
              class="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 text-white p-4"
            >
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Eye class="w-4 h-4" />
              </div>
              <span class="text-xs font-semibold">Click for Full Preview</span>
              <span class="text-[10px] text-slate-300">View real-time mobile WhatsApp chat</span>
            </div>
          </div>

          <!-- Card Bottom Bar (Channel & Preview Action) -->
          <div
            class="mt-3 pt-3 border-t border-primary-border flex items-center justify-between text-xs"
          >
            <!-- Left Info: WABA Channel + Language -->
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="flex items-center gap-1 font-mono text-[11px] text-secondary-text truncate"
                :title="tpl.waba_phone_number ? `+${tpl.waba_phone_number}` : 'Panther Capital'"
              >
                <Smartphone class="w-3.5 h-3.5 text-primary-green shrink-0" />
                <span class="text-primary-text font-semibold">
                  {{ tpl.waba_phone_number ? `+${tpl.waba_phone_number}` : 'Panther Capital' }}
                </span>
              </span>
              <span class="text-[10px] text-secondary-text bg-background border border-primary-border px-1.5 py-0.5 rounded font-medium uppercase shrink-0">
                {{ tpl.language || 'en' }}
              </span>
            </div>

            <!-- Right Action: Preview Only (NO Delete, NO Copy) -->
            <button
              @click="openPreviewModal(tpl)"
              class="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Preview</span>
              <Eye class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 2. TABLE LIST VIEW MODE (Alternative Toggle) -->
      <div
        v-else-if="layoutMode === 'list'"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-xs"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/50 text-secondary-text font-semibold uppercase text-[11px]">
                <th class="p-3.5 pl-5">Template Name & Category</th>
                <th class="p-3.5 min-w-[300px]">Message Preview</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5">WABA Channel</th>
                <th class="p-3.5">Created By</th>
                <th class="p-3.5">Created Date</th>
                <th class="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border text-primary-text">
              <tr
                v-for="tpl in store.filteredTemplates"
                :key="tpl.id"
                class="hover:bg-background/40 transition-colors group"
              >
                <!-- Name & Category -->
                <td class="p-3.5 pl-5 align-top">
                  <div class="space-y-1">
                    <span class="font-mono text-xs font-bold text-primary-text block truncate max-w-[180px]">
                      {{ tpl.name }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <span
                        class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                        :class="getCategoryBadgeClass(tpl.category)"
                      >
                        {{ tpl.category }}
                      </span>
                      <span class="text-[10px] text-secondary-text bg-background border border-primary-border px-1.5 py-0.5 rounded">
                        #{{ tpl.id }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Message Preview -->
                <td class="p-3.5 align-top">
                  <div
                    class="max-w-md cursor-pointer hover:text-primary transition-colors space-y-1"
                    @click="openPreviewModal(tpl)"
                  >
                    <div v-if="tpl.header" class="font-bold text-xs text-primary-text">
                      {{ tpl.header }}
                    </div>
                    <p class="text-secondary-text text-xs line-clamp-2 leading-relaxed">
                      {{ tpl.body_text }}
                    </p>
                    <div v-if="tpl.buttons && tpl.buttons.length > 0" class="flex items-center gap-1.5 pt-1">
                      <span
                        v-for="(b, idx) in tpl.buttons"
                        :key="idx"
                        class="text-[10px] text-primary font-semibold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded"
                      >
                        {{ b.text }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="p-3.5 align-top">
                  <span
                    v-if="tpl.status === 'APPROVED'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20"
                  >
                    <CheckCircle2 class="w-3 h-3" />
                    <span>Approved</span>
                  </span>
                  <span
                    v-else-if="tpl.status === 'PENDING'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                  >
                    <Clock class="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                  <span
                    v-else-if="tpl.status === 'PAUSED'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                  >
                    <PauseCircle class="w-3 h-3" />
                    <span>Paused</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20"
                  >
                    <XCircle class="w-3 h-3" />
                    <span>{{ tpl.status || 'Rejected' }}</span>
                  </span>
                </td>

                <!-- WABA Channel -->
                <td class="p-3.5 align-top font-mono text-xs text-secondary-text">
                  {{ tpl.waba_phone_number ? `+${tpl.waba_phone_number}` : '-' }}
                </td>

                <!-- Created By -->
                <td class="p-3.5 align-top text-secondary-text text-xs">
                  {{ tpl.created_by || '-' }}
                </td>

                <!-- Created Date -->
                <td class="p-3.5 align-top text-secondary-text text-xs">
                  {{ formatDate(tpl.created_at || tpl.updated_at) }}
                </td>

                <!-- Actions: ONLY Preview -->
                <td class="p-3.5 align-top text-right pr-5">
                  <button
                    @click="openPreviewModal(tpl)"
                    title="View Full WhatsApp Preview"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer text-xs font-medium"
                  >
                    <Eye class="w-3.5 h-3.5 text-primary" />
                    <span>Preview</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Template Full Interactive WhatsApp Preview Modal -->
    <TemplatePreviewModal
      :is-open="isPreviewModalOpen"
      :template="selectedTemplateForModal"
      @close="isPreviewModalOpen = false"
    />
  </div>
</template>
