<script setup>
import { ref } from 'vue'
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileText,
  Trash2,
  Info,
  Table as TableIcon,
} from 'lucide-vue-next'
import { useWatchlistStore } from '@/stores/watchlist/watchlist'

const store = useWatchlistStore()

const importMode = ref('upsert')
const selectedFile = ref(null)
const isDragging = ref(false)
const fileInputRef = ref(null)

// Sample dummy rows for user visualization
const sampleTemplateRows = [
  {
    symbol: 'XAUUSD',
    name: 'Gold vs US Dollar',
    category: 'Forex/Commodities',
    sort_order: 1,
    is_active: 'true',
  },
  {
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    category: 'Forex',
    sort_order: 2,
    is_active: 'true',
  },
]

function onFileSelect(e) {
  const files = e.target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    const file = files[0]
    const ext = file.name.split('.').pop().toLowerCase()
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      selectedFile.value = file
    } else {
      store.snackbar?.show?.(
        'Invalid file type. Please upload .xlsx, .xls, or .csv',
        'error',
      )
    }
  }
}

function clearSelectedFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  store.importResult = null
}

async function handleStartImport() {
  if (!selectedFile.value) return
  await store.importFile(selectedFile.value, importMode.value)
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Download Template -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-text">Import Symbols</h2>
        <p class="text-xs text-secondary-text mt-1">
          Bulk import symbols from an Excel (<code class="font-mono text-primary">.xlsx</code>, <code class="font-mono text-primary">.xls</code>) or <code class="font-mono text-primary">.csv</code> file.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border bg-card-background hover:text-primary-text hover:bg-background transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          :disabled="store.templateDownloading"
          @click="store.downloadTemplate('csv')"
        >
          <Loader2
            v-if="store.templateDownloading && store.templateDownloadFormat === 'csv'"
            class="w-3.5 h-3.5 animate-spin text-primary"
          />
          <Download v-else class="w-3.5 h-3.5 text-primary" />
          <span>Download Template (.csv)</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border bg-card-background hover:text-primary-text hover:bg-background transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          :disabled="store.templateDownloading"
          @click="store.downloadTemplate('xlsx')"
        >
          <Loader2
            v-if="store.templateDownloading && store.templateDownloadFormat === 'xlsx'"
            class="w-3.5 h-3.5 animate-spin text-primary"
          />
          <FileSpreadsheet v-else class="w-3.5 h-3.5 text-primary" />
          <span>Download Template (.xlsx)</span>
        </button>
      </div>
    </div>

    <!-- Main Import Card -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-6 shadow-sm space-y-6">
      <!-- 1. Select Mode -->
      <div>
        <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2.5">
          1. Choose Import Strategy
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Upsert Option -->
          <div
            class="p-4 rounded-xl border transition-all cursor-pointer select-none"
            :class="
              importMode === 'upsert'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-primary-border bg-background hover:border-primary/50'
            "
            @click="importMode = 'upsert'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="w-3.5 h-3.5 rounded-full border flex items-center justify-center"
                  :class="
                    importMode === 'upsert'
                      ? 'border-primary'
                      : 'border-secondary-text'
                  "
                >
                  <span
                    v-if="importMode === 'upsert'"
                    class="w-2 h-2 rounded-full bg-primary"
                  />
                </span>
                <span class="text-sm font-semibold text-primary-text">Upsert (Recommended)</span>
              </div>
              <span class="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                Safe
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-2 ml-5.5 leading-relaxed">
              Create new symbol catalog entries and update existing symbols with matched tickers.
            </p>
          </div>

          <!-- Replace All Option -->
          <div
            class="p-4 rounded-xl border transition-all cursor-pointer select-none"
            :class="
              importMode === 'replace_all'
                ? 'border-primary-red bg-primary-red/5 ring-1 ring-primary-red'
                : 'border-primary-border bg-background hover:border-primary-red/50'
            "
            @click="importMode = 'replace_all'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="w-3.5 h-3.5 rounded-full border flex items-center justify-center"
                  :class="
                    importMode === 'replace_all'
                      ? 'border-primary-red'
                      : 'border-secondary-text'
                  "
                >
                  <span
                    v-if="importMode === 'replace_all'"
                    class="w-2 h-2 rounded-full bg-primary-red"
                  />
                </span>
                <span class="text-sm font-semibold text-primary-text">Replace All</span>
              </div>
              <span class="text-[10px] uppercase font-bold text-primary-red px-2 py-0.5 rounded-full bg-primary-red/10">
                Destructive
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-2 ml-5.5 leading-relaxed">
              Purges all existing symbols in the catalog first, then imports records from the new file.
            </p>
          </div>
        </div>
      </div>

      <!-- Format Specifications & Dummy Visual Table (Positioned above Step 2) -->
      <div class="rounded-xl bg-background border border-primary-border p-4 sm:p-5 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <TableIcon class="w-4 h-4 text-primary shrink-0" />
            <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
              Expected Spreadsheet Format & Example Structure
            </h4>
          </div>
          <span class="text-[11px] text-secondary-text">
            Headers must match the columns below
          </span>
        </div>

        <p class="text-xs text-secondary-text leading-relaxed">
          Prepare your Excel sheet (<code class="font-mono text-primary">.xlsx</code> / <code class="font-mono text-primary">.xls</code>) or CSV file with the following column headers. Only <code class="font-mono font-semibold text-primary">symbol</code> is strictly required.
        </p>

        <!-- Dummy Preview Table for Visualization -->
        <div class="border border-primary-border rounded-lg overflow-x-auto bg-card-background shadow-xs">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/80">
                <th class="px-3.5 py-2.5 font-mono font-semibold text-primary-text whitespace-nowrap">
                  symbol <span class="text-primary-red text-[10px] uppercase font-bold ml-1">Required</span>
                </th>
                <th class="px-3.5 py-2.5 font-mono font-semibold text-primary-text whitespace-nowrap">
                  name <span class="text-secondary-text text-[10px] uppercase font-normal ml-1">Optional</span>
                </th>
                <th class="px-3.5 py-2.5 font-mono font-semibold text-primary-text whitespace-nowrap">
                  category <span class="text-secondary-text text-[10px] uppercase font-normal ml-1">Optional</span>
                </th>
                <!-- <th class="px-3.5 py-2.5 font-mono font-semibold text-primary-text whitespace-nowrap">
                  sort_order <span class="text-secondary-text text-[10px] uppercase font-normal ml-1">Number</span>
                </th> -->
                <th class="px-3.5 py-2.5 font-mono font-semibold text-primary-text whitespace-nowrap">
                  is_active <span class="text-secondary-text text-[10px] uppercase font-normal ml-1">Boolean</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border">
              <tr
                v-for="(row, idx) in sampleTemplateRows"
                :key="idx"
                class="hover:bg-background/40 transition-colors"
              >
                <td class="px-3.5 py-2 font-mono font-bold text-primary">
                  {{ row.symbol }}
                </td>
                <td class="px-3.5 py-2 text-primary-text">
                  {{ row.name }}
                </td>
                <td class="px-3.5 py-2 text-secondary-text">
                  <span class="px-2 py-0.5 rounded bg-background border border-primary-border text-[11px]">
                    {{ row.category }}
                  </span>
                </td>
                <!-- <td class="px-3.5 py-2 font-mono text-secondary-text">
                  {{ row.sort_order }}
                </td> -->
                <td class="px-3.5 py-2">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-green bg-primary-green/10 px-2 py-0.5 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                    {{ row.is_active }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. File Dropzone -->
      <div>
        <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2.5">
          2. Upload Spreadsheet
        </label>

        <!-- Hidden input -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="onFileSelect"
        />

        <!-- Active Dropzone / Selected State -->
        <div
          v-if="!selectedFile"
          class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
          :class="
            isDragging
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-primary-border bg-background hover:border-primary/60 hover:bg-background/80'
          "
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop="onDrop"
          @click="fileInputRef?.click()"
        >
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
            <UploadCloud class="w-6 h-6" />
          </div>
          <p class="text-sm font-semibold text-primary-text mb-1">
            Drop your spreadsheet here, or <span class="text-primary underline">browse</span>
          </p>
          <p class="text-xs text-secondary-text">
            Supports Microsoft Excel (<code class="font-mono">.xlsx</code>, <code class="font-mono">.xls</code>) and CSV (<code class="font-mono">.csv</code>)
          </p>
        </div>

        <!-- File Chosen Preview Card -->
        <div
          v-else
          class="p-4 rounded-xl bg-background border border-primary-border flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-semibold text-primary-text font-mono truncate max-w-xs sm:max-w-md">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-secondary-text">
                Size: {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="p-2 text-secondary-text hover:text-primary-red hover:bg-card-background rounded-lg transition-colors cursor-pointer"
            title="Remove file"
            @click="clearSelectedFile"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex items-center gap-3">
        <button
          type="button"
          :disabled="!selectedFile || store.importLoading"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          @click="handleStartImport"
        >
          <Loader2 v-if="store.importLoading" class="w-4 h-4 animate-spin" />
          <UploadCloud v-else class="w-4 h-4" />
          <span>{{ store.importLoading ? 'Processing Import...' : 'Start Import' }}</span>
        </button>

        <button
          v-if="selectedFile"
          type="button"
          :disabled="store.importLoading"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          @click="clearSelectedFile"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Clear File</span>
        </button>
      </div>

      <!-- 3. Import Results Banner -->
      <div
        v-if="store.importResult"
        class="mt-6 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 animate-in fade-in duration-200"
      >
        <div class="flex items-center gap-2 text-primary font-semibold text-sm">
          <CheckCircle2 class="w-4 h-4" />
          <span>Import Process Completed</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div class="bg-card-background border border-primary-border p-2.5 rounded-lg">
            <span class="text-secondary-text block text-[10px] uppercase">Strategy Mode</span>
            <span class="font-semibold text-primary-text capitalize font-mono">{{ store.importResult.mode }}</span>
          </div>

          <div class="bg-card-background border border-primary-border p-2.5 rounded-lg">
            <span class="text-secondary-text block text-[10px] uppercase">New Added</span>
            <span class="font-semibold text-primary-green">{{ store.importResult.added }} symbols</span>
          </div>

          <div class="bg-card-background border border-primary-border p-2.5 rounded-lg">
            <span class="text-secondary-text block text-[10px] uppercase">Updated</span>
            <span class="font-semibold text-primary-blue">{{ store.importResult.updated }} symbols</span>
          </div>

          <div class="bg-card-background border border-primary-border p-2.5 rounded-lg">
            <span class="text-secondary-text block text-[10px] uppercase">Skipped</span>
            <span class="font-semibold text-secondary-text">{{ store.importResult.skipped }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
