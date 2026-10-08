<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  X,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Loader2,
  Filter,
  CheckCircle2,
  FileUp,
  Calendar,
  Search,
  RotateCcw,
} from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { SOURCES } from '@/pages/lead-management/mockLeadData'
import { countries } from '@/utils/countries'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  filters: { type: Object, default: () => ({}) },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'imported'])

const snackbar = useSnackbarStore()

// State
const exportLoading = ref(false)
const templateLoading = ref(false)
const importLoading = ref(false)
const exportConfirmOpen = ref(false)
const templateConfirmOpen = ref(false)

const selectedFile = ref(null)
const dragOver = ref(false)
const fileInputRef = ref(null)

// Local interactive filters for export
const exportFilters = reactive({
  search: '',
  stage: '',
  staff: '',
  country: '',
  source: '',
  priority: '',
  from_date: '',
  to_date: '',
})

// Sync props filters into local export filters when drawer opens
watch(
  () => [props.open, props.filters],
  () => {
    if (props.open) {
      exportFilters.search = props.filters?.search || ''
      exportFilters.stage = props.filters?.stage_id || props.filters?.stage || ''
      exportFilters.staff = props.filters?.staff_id || props.filters?.staff || ''
      exportFilters.country = props.filters?.country || ''
      exportFilters.source = props.filters?.source || ''
      exportFilters.priority = props.filters?.priority || ''
      exportFilters.from_date = props.filters?.created_at_from || props.filters?.from_date || ''
      exportFilters.to_date = props.filters?.created_at_to || props.filters?.to_date || ''
    }
  },
  { immediate: true, deep: true }
)

const resetExportFilters = () => {
  exportFilters.search = ''
  exportFilters.stage = ''
  exportFilters.staff = ''
  exportFilters.country = ''
  exportFilters.source = ''
  exportFilters.priority = ''
  exportFilters.from_date = ''
  exportFilters.to_date = ''
}

// Compute options for BaseSelect dropdowns
const stageOptions = computed(() => {
  const options = [{ label: 'All Stages', value: '' }]
  if (props.stages?.length) {
    props.stages.forEach((s) => {
      options.push({
        label: s.name || s.label || s.key,
        value: s.code || s.key,
      })
    })
  }
  return options
})

const staffOptions = computed(() => {
  const options = [{ label: 'All Staff', value: '' }]
  if (props.staffList?.length) {
    props.staffList.forEach((st) => {
      options.push({
        label: st.name || `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.email,
        value: st.id,
      })
    })
  }
  return options
})

const countryOptions = computed(() => {
  return [{ label: 'All Countries', value: '' }, ...countries]
})

const sourceOptions = computed(() => {
  const options = [{ label: 'All Sources', value: '' }]
  SOURCES.forEach((s) => {
    options.push({ label: s.label, value: s.key })
  })
  return options
})

const priorityOptions = [
  { label: 'All Priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

// ─── Export Leads Handler ───────────────────────────────────────────────────
const handleExport = () => {
  exportLoading.value = true

  const params = {}
  
  if (exportFilters.stage) {
    params.stage_id = exportFilters.stage
  }

  if (exportFilters.staff) {
    params.staff_id = exportFilters.staff
  }

  if (exportFilters.source) {
    params.source = exportFilters.source
  }

  if (exportFilters.priority) {
    params.priority = exportFilters.priority
  }

  if (exportFilters.country) {
    params.country = exportFilters.country
  }

  if (exportFilters.search) {
    params.search = exportFilters.search
  }

  if (exportFilters.from_date) {
    params.from_date = exportFilters.from_date
  }

  if (exportFilters.to_date) {
    params.to_date = exportFilters.to_date
  }

  const successHandler = (res) => {
    exportLoading.value = false
    exportConfirmOpen.value = false
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
    snackbar.show('Leads exported successfully.', 'success')
  }

  const failureHandler = (err) => {
    exportLoading.value = false
    exportConfirmOpen.value = false
    snackbar.show(err?.message || err?.error || 'Failed to export leads.', 'error')
  }

  apiRequest(urls.KEYS.GET, urls.lead.export, {
    params,
    responseType: 'blob',
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}

// ─── Download Import Template Handler ───────────────────────────────────────
const handleDownloadTemplate = () => {
  templateLoading.value = true

  const successHandler = (res) => {
    templateLoading.value = false
    templateConfirmOpen.value = false
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', 'lead_import_template.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
    snackbar.show('Import template downloaded.', 'success')
  }

  const failureHandler = (err) => {
    templateLoading.value = false
    templateConfirmOpen.value = false
    snackbar.show(err?.message || err?.error || 'Failed to download import template.', 'error')
  }

  apiRequest(urls.KEYS.GET, urls.lead.importTemplate, {
    responseType: 'blob',
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}

// ─── Import Leads Handler ───────────────────────────────────────────────────
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleDrop = (event) => {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleImport = () => {
  if (!selectedFile.value) {
    snackbar.show('Please select a file to import.', 'error')
    return
  }

  importLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  const successHandler = (res) => {
    importLoading.value = false
    snackbar.show(res?.message || 'Leads imported successfully.', 'success')
    selectedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
    emit('imported')
    emit('close')
  }

  const failureHandler = (err) => {
    importLoading.value = false
    snackbar.show(err?.message || err?.error || 'Failed to import leads.', 'error')
  }

  apiRequest(urls.KEYS.POST, urls.lead.import, {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[460px] bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div>
            <h2 class="text-base font-bold text-primary-text">Import / Export Leads</h2>
            <p class="text-xs text-secondary-text mt-0.5">Manage batch operations for lead records</p>
          </div>
          <button
            @click="emit('close')"
            class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

          <!-- Option 1: Export Leads with Full Filter Controls -->
          <div class="rounded-xl border border-primary-border bg-background/40 p-4 space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Download class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-primary-text">1. Export Leads</h3>
                  <p class="text-[11px] text-secondary-text">Filter data to export specific lead records</p>
                </div>
              </div>

              <button
                @click="resetExportFilters"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:bg-card-background transition-colors cursor-pointer whitespace-nowrap"
                title="Reset Export Filters"
              >
                <RotateCcw class="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <!-- Export Filter Grid -->
            <div class="space-y-2.5 pt-1 border-t border-primary-border/50">

              <!-- Search Filter -->
              <div>
                <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Search class="w-3 h-3 text-primary" />
                  <span>Search</span>
                </label>
                <input
                  v-model="exportFilters.search"
                  type="text"
                  placeholder="Search name, email, phone, code..."
                  class="w-full px-3 py-2.5 text-xs rounded-lg border border-primary-border bg-background text-primary-text placeholder:text-secondary-text focus:outline-none"
                />
              </div>

              <!-- Stage & Staff Dropdowns -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">Stage</label>
                  <BaseSelect
                    v-model="exportFilters.stage"
                    :options="stageOptions"
                    placeholder="Stages"
                    variant="surface"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">Staff</label>
                  <BaseSelect
                    v-model="exportFilters.staff"
                    :options="staffOptions"
                    placeholder="Staff"
                    searchable
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Country & Source Dropdowns -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">Country</label>
                  <BaseSelect
                    v-model="exportFilters.country"
                    :options="countryOptions"
                    placeholder="Countries"
                    searchable
                    show-flags
                    variant="surface"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">Source</label>
                  <BaseSelect
                    v-model="exportFilters.source"
                    :options="sourceOptions"
                    placeholder="Sources"
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Priority & Date Range Grid -->
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">Priority</label>
                  <BaseSelect
                    v-model="exportFilters.priority"
                    :options="priorityOptions"
                    placeholder="Priorities"
                    variant="surface"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1 truncate">From Date</label>
                  <input
                    v-model="exportFilters.from_date"
                    type="date"
                    class="w-full px-2 py-2.5 text-xs rounded-lg border border-primary-border bg-background text-primary-text focus:outline-none hover:cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1 truncate">To Date</label>
                  <input
                    v-model="exportFilters.to_date"
                    type="date"
                    class="w-full px-2 py-2.5 text-xs rounded-lg border border-primary-border bg-background text-primary-text focus:outline-none hover:cursor-pointer"
                  />
                </div>
              </div>

            </div>

            <button
              :disabled="exportLoading"
              @click="exportConfirmOpen = true"
              class="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
            >
              <Loader2 v-if="exportLoading" class="w-3.5 h-3.5 animate-spin" />
              <Download v-else class="w-3.5 h-3.5" />
              <span>{{ exportLoading ? 'Exporting Leads...' : 'Export Leads CSV' }}</span>
            </button>
          </div>

          <!-- Option 2: Download Import Template -->
          <div class="rounded-xl border border-primary-border bg-background/40 p-4 space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <FileSpreadsheet class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-primary-text">2. Import Template</h3>
                <p class="text-[11px] text-secondary-text">Download sample CSV format required for importing leads</p>
              </div>
            </div>

            <button
              :disabled="templateLoading"
              @click="templateConfirmOpen = true"
              class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Loader2 v-if="templateLoading" class="w-3.5 h-3.5 animate-spin text-primary" />
              <FileText v-else class="w-3.5 h-3.5 text-primary" />
              <span>{{ templateLoading ? 'Downloading Template...' : 'Download Sample CSV Template' }}</span>
            </button>
          </div>

          <!-- Option 3: Import Leads -->
          <div class="rounded-xl border border-primary-border bg-background/40 p-4 space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <UploadCloud class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-primary-text">3. Import Leads</h3>
                <p class="text-[11px] text-secondary-text">Upload a completed CSV file to import new lead records</p>
              </div>
            </div>

            <!-- Drop Zone / File Picker -->
            <div
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleDrop"
              @click="fileInputRef?.click()"
              :class="[
                'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
                dragOver ? 'border-primary bg-primary/5' : 'border-primary-border bg-background/60 hover:border-primary/50',
                selectedFile ? 'border-green-500/50 bg-green-500/5' : ''
              ]"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".csv,.xlsx,.xls"
                class="hidden"
                @change="handleFileSelect"
              />

              <template v-if="selectedFile">
                <div class="flex items-center justify-center gap-2 text-green-500 font-semibold text-xs">
                  <CheckCircle2 class="w-4 h-4" />
                  <span class="truncate max-w-[200px]">{{ selectedFile.name }}</span>
                  <span class="text-[10px] text-secondary-text">({{ formatFileSize(selectedFile.size) }})</span>
                  <button
                    @click.stop="removeFile"
                    class="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition ml-1"
                    title="Remove file"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </template>

              <template v-else>
                <FileUp class="w-7 h-7 text-secondary-text mx-auto mb-1.5" />
                <p class="text-xs font-medium text-primary-text">Click or drag & drop CSV file here</p>
                <p class="text-[10px] text-secondary-text mt-0.5">Supports .csv, .xlsx up to 10MB</p>
              </template>
            </div>

            <button
              :disabled="!selectedFile || importLoading"
              @click="handleImport"
              class="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="importLoading" class="w-3.5 h-3.5 animate-spin" />
              <UploadCloud v-else class="w-3.5 h-3.5" />
              <span>{{ importLoading ? 'Uploading & Importing...' : 'Upload & Import Leads' }}</span>
            </button>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-primary-border bg-background/60 flex items-center justify-end shrink-0">
          <button
            @click="emit('close')"
            class="px-4 py-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>

    <!-- Export Confirmation Dialog -->
    <ConfirmationDialog
      :open="exportConfirmOpen"
      title="Confirm Lead Export"
      message="Are you sure you want to export the lead records CSV with the applied filters?"
      confirm-text="Export CSV"
      cancel-text="Cancel"
      type="info"
      :loading="exportLoading"
      @confirm="handleExport"
      @cancel="exportConfirmOpen = false"
    />

    <!-- Template Download Confirmation Dialog -->
    <ConfirmationDialog
      :open="templateConfirmOpen"
      title="Confirm Template Download"
      message="Are you sure you want to download the sample CSV lead import template?"
      confirm-text="Download Template"
      cancel-text="Cancel"
      type="info"
      :loading="templateLoading"
      @confirm="handleDownloadTemplate"
      @cancel="templateConfirmOpen = false"
    />
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
