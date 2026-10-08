import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useWatchlistStore = defineStore('watchlist', () => {
  const snackbar = useSnackbarStore()

  // ─────────────────────────────────────
  // Settings State
  // ─────────────────────────────────────
  const settings = ref({
    max_watchlists_per_user: 5,
    max_symbols_per_watchlist: 50,
  })
  const settingsLoading = ref(false)
  const settingsSaving = ref(false)
  const settingsFetched = ref(false)

  // ─────────────────────────────────────
  // Symbols State (Real API data)
  // ─────────────────────────────────────
  const symbols = ref([])
  const symbolsLoading = ref(false)
  const symbolSaving = ref(false)
  const symbolDeleting = ref(false)
  const symbolsFetched = ref(false)

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  })

  const filters = reactive({
    search: '',
    category: '',
    status: '', // '' (all), 'active', 'inactive'
  })

  // ─────────────────────────────────────
  // Categories State
  // ─────────────────────────────────────
  const backendCategories = ref([])

  // ─────────────────────────────────────
  // Computed
  // ─────────────────────────────────────
  const availableCategories = computed(() => {
    const dynamicCats = new Set(backendCategories.value)
    symbols.value.forEach((s) => {
      if (s.category) dynamicCats.add(s.category)
    })
    return Array.from(dynamicCats)
  })

  const summary = computed(() => {
    const total = pagination.total || symbols.value.length
    const active = symbols.value.filter((s) => s.is_active).length
    const inactive = symbols.value.filter((s) => !s.is_active).length
    return { total, active, inactive }
  })

  // ─────────────────────────────────────
  // Settings Actions
  // ─────────────────────────────────────
  const fetchSettings = (force = false) => {
    if (settingsFetched.value && !force) return

    settingsLoading.value = true
    apiRequest(urls.KEYS.GET, urls.watchlist.settings, {
      isTokenRequired: true,
      onSuccess: (res) => {
        if (res?.data) {
          settings.value = {
            max_watchlists_per_user:
              res.data.max_watchlists_per_user ?? res.data.maxLists ?? 5,
            max_symbols_per_watchlist:
              res.data.max_symbols_per_watchlist ?? res.data.maxSymbols ?? 50,
          }
        }
        settingsFetched.value = true
        settingsLoading.value = false
      },
      onFailure: (err) => {
        settingsLoading.value = false
        console.warn('Watchlist settings fetch notice:', err?.message)
      },
    })
  }

  const saveSettings = (payload) => {
    settingsSaving.value = true
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PATCH, urls.watchlist.settings, {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          settings.value = { ...settings.value, ...payload }
          settingsSaving.value = false
          snackbar.show(
            res?.message || 'Watchlist settings saved successfully.',
            'success',
          )
          resolve(res)
        },
        onFailure: (err) => {
          settingsSaving.value = false
          snackbar.show(err?.message || 'Failed to save settings.', 'error')
          reject(err)
        },
      })
    })
  }

  // ─────────────────────────────────────
  // Symbols Actions (Real API)
  // ─────────────────────────────────────
  let searchDebounceTimer = null

  const fetchSymbols = (force = false) => {
    if (symbolsFetched.value && !force && symbols.value.length > 0) return

    symbolsLoading.value = true

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
    }

    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim()
    }

    if (filters.category && filters.category.trim()) {
      params.category = filters.category.trim()
    }

    if (filters.status === 'active') {
      params.active_only = true
    } else if (filters.status === 'inactive') {
      params.active_only = false
    }

    apiRequest(urls.KEYS.GET, urls.watchlist.symbols, {
      isTokenRequired: true,
      params,
      onSuccess: (res) => {
        const data = res?.data
        if (Array.isArray(data?.categories)) {
          backendCategories.value = data.categories
        }
        if (data && Array.isArray(data.items)) {
          symbols.value = data.items
          pagination.page = data.page || 1
          pagination.pages = data.pages || 1
          pagination.per_page = data.per_page || 10
          pagination.total = data.total ?? data.items.length
        } else if (Array.isArray(data)) {
          symbols.value = data
          pagination.page = 1
          pagination.pages = 1
          pagination.total = data.length
        } else if (Array.isArray(data?.symbols)) {
          symbols.value = data.symbols
          pagination.total = data.total ?? data.symbols.length
        } else {
          symbols.value = []
          pagination.total = 0
          pagination.pages = 1
        }

        symbolsFetched.value = true
        symbolsLoading.value = false
      },
      onFailure: (err) => {
        symbolsLoading.value = false
        console.error('Watchlist symbols fetch error:', err)
        snackbar.show(err?.message || 'Failed to fetch symbol catalog.', 'error')
      },
    })
  }

  const setPage = (page) => {
    pagination.page = page
    fetchSymbols(true)
  }

  const setPerPage = (perPage) => {
    pagination.per_page = perPage
    pagination.page = 1
    fetchSymbols(true)
  }

  const handleFilterChange = (debounce = false) => {
    pagination.page = 1
    if (debounce) {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => {
        fetchSymbols(true)
      }, 350)
    } else {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
      fetchSymbols(true)
    }
  }

  const createSymbol = (payload) => {
    symbolSaving.value = true
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.watchlist.symbols, {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          symbolSaving.value = false
          snackbar.show(res?.message || 'Symbol added to catalog successfully.', 'success')
          fetchSymbols(true)
          resolve(res)
        },
        onFailure: (err) => {
          symbolSaving.value = false
          snackbar.show(err?.message || 'Failed to create symbol.', 'error')
          reject(err)
        },
      })
    })
  }

  const updateSymbol = (id, payload) => {
    symbolSaving.value = true
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PUT, urls.watchlist.symbolDetail(id), {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          symbolSaving.value = false
          snackbar.show(res?.message || 'Symbol updated successfully.', 'success')
          fetchSymbols(true)
          resolve(res)
        },
        onFailure: (err) => {
          symbolSaving.value = false
          snackbar.show(err?.message || 'Failed to update symbol.', 'error')
          reject(err)
        },
      })
    })
  }

  const deleteSymbol = (id) => {
    symbolDeleting.value = true
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.DELETE, urls.watchlist.symbolDetail(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          symbolDeleting.value = false
          snackbar.show(res?.message || 'Symbol deleted from catalog.', 'success')
          fetchSymbols(true)
          resolve(res)
        },
        onFailure: (err) => {
          symbolDeleting.value = false
          snackbar.show(err?.message || 'Failed to delete symbol.', 'error')
          reject(err)
        },
      })
    })
  }

  // ─────────────────────────────────────
  // ─────────────────────────────────────
  // Import & Template State & Actions
  // ─────────────────────────────────────
  const importLoading = ref(false)
  const importResult = ref(null)
  const templateDownloading = ref(false)
  const templateDownloadFormat = ref(null)

  const importFile = (file, mode = 'upsert') => {
    if (!file) {
      snackbar.show('Please select a file to import.', 'error')
      return Promise.reject(new Error('No file selected'))
    }

    importLoading.value = true
    importResult.value = null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.watchlist.import, {
        params: { mode },
        data: formData,
        isTokenRequired: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onSuccess: (res) => {
          importLoading.value = false
          importResult.value = res?.data || {
            mode,
            filename: file.name,
            added: res?.data?.added ?? 0,
            updated: res?.data?.updated ?? 0,
            skipped: res?.data?.skipped ?? 0,
          }
          fetchSymbols(true)
          snackbar.show(
            res?.message || `Catalog imported successfully in ${mode} mode.`,
            'success',
          )
          resolve(importResult.value)
        },
        onFailure: (err) => {
          importLoading.value = false
          snackbar.show(err?.message || 'Failed to import file.', 'error')
          reject(err)
        },
      })
    })
  }

  const downloadTemplate = (format = 'csv') => {
    const ext = format.toLowerCase() === 'xlsx' ? 'xlsx' : 'csv'
    const mimeType =
      ext === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv'
    const fileName = `watchlist_symbols_template.${ext}`

    templateDownloading.value = true
    templateDownloadFormat.value = ext

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.watchlist.template, {
        params: { format: ext },
        responseType: 'blob',
        isTokenRequired: true,
        onSuccess: (res) => {
          templateDownloading.value = false
          templateDownloadFormat.value = null

          const blob =
            res instanceof Blob ? res : new Blob([res], { type: mimeType })
          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(downloadUrl)

          snackbar.show(
            `Template (${ext.toUpperCase()}) downloaded successfully.`,
            'success',
          )
          resolve(res)
        },
        onFailure: (err) => {
          templateDownloading.value = false
          templateDownloadFormat.value = null
          snackbar.show(
            err?.message || `Failed to download ${ext.toUpperCase()} template.`,
            'error',
          )
          reject(err)
        },
      })
    })
  }

  return {
    // Settings
    settings,
    settingsLoading,
    settingsSaving,
    fetchSettings,
    saveSettings,

    // Symbols
    symbols,
    pagination,
    perPageOptions,
    availableCategories,
    summary,
    filters,
    symbolsLoading,
    symbolSaving,
    symbolDeleting,
    fetchSymbols,
    setPage,
    setPerPage,
    handleFilterChange,
    createSymbol,
    updateSymbol,
    deleteSymbol,

    // Import & Template
    importLoading,
    importResult,
    templateDownloading,
    templateDownloadFormat,
    importFile,
    downloadTemplate,
  }
})
