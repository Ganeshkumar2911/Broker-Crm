import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useFmLedgerStore = defineStore('fmLedger', () => {
  const snackbar = useSnackbarStore()

  // ─── State ─────────────────────────────────────────────
  const data        = ref([])
  const loading     = ref(false)
  const isFetched   = ref(false)
  const error       = ref(null)

  const summary = ref({
    total_records:     0,
    total_deposit:     0,
    total_withdrawal:  0,
    total_pnl:         0,
    total_fee_paid:    0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  // ✅ Filters (selected values)
  const filters = reactive({
    account_id: null,
    type:       null,
    fm_id:      null, // from search dropdown
    from_date:  null,
    to_date:    null,
  })

  // ✅ Dynamic filter options (from API)
  const filterOptions = ref({
    types: [],
  })

  // ✅ Search dropdown (FM search)
  const fmOptions      = ref([])
  const fmSearchLoading = ref(false)

  // ─── Helpers ───────────────────────────────────────────
  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== null && v !== '' && v !== undefined
      )
    )

  // ─── Fetch Ledger ──────────────────────────────────────
  const fetchLedger = (force = false) => {
    if (isFetched.value && !force) return

    loading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      if (res?.pagination) {
        Object.assign(pagination, res.pagination)
      }

      if (res?.summary) {
        summary.value = res.summary
      }

      if (res?.filters) {
        filterOptions.value = res.filters
      }

      isFetched.value = true
      loading.value   = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value   = err
      snackbar.show(err?.message || 'Failed to fetch FM ledger', 'error')
    }

    apiRequest('get', urls.fmLedger.list, {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        ...cleanFilters(),
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Search FM (async dropdown) ────────────────────────
  const searchFm = (query = '') => {
    const searchQuery = query.trim()

    if (!searchQuery) {
      fmOptions.value = []
      fmSearchLoading.value = false
      return Promise.resolve([])
    }

    fmSearchLoading.value = true

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const options = (res?.data || []).map((fm) => ({
          label: fm.label_name,
          value: fm.fm_id,
          email: fm.email,
        }))

        fmOptions.value = options
        fmSearchLoading.value = false
        resolve(options)
      }

      const failureHandler = (err) => {
        fmOptions.value = []
        fmSearchLoading.value = false
        snackbar.show(err?.message || 'Failed to fetch fund managers', 'error')
        reject(err)
      }

      apiRequest('get', urls.fmLedger.allFundManagers, {
        params: { search: searchQuery },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // ─── Apply Filters ─────────────────────────────────────
  const applyFilters = () => {
    pagination.page = 1
    isFetched.value = false
    fetchLedger(true)
  }

  // ─── Pagination ────────────────────────────────────────
  const setPage = (page) => {
    pagination.page = page
    isFetched.value = false
    fetchLedger(true)
  }

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    isFetched.value = false
    fetchLedger(true)
  }

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value      = []
    loading.value   = false
    isFetched.value = false
    error.value     = null

    summary.value = {
      total_records:     0,
      total_deposit:     0,
      total_withdrawal:  0,
      total_pnl:         0,
      total_fee_paid:    0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    Object.assign(filters, {
      account_id: null,
      type:       null,
      fm_id:      null,
      from_date:  null,
      to_date:    null,
    })

    fmOptions.value = []
  }

  return {
    data,
    loading,
    isFetched,
    error,
    pagination,
    summary,
    perPageOptions,

    filters,
    filterOptions,

    fmOptions,
    fmSearchLoading,

    fetchLedger,
    applyFilters,
    updatePerPage,
    setPage,
    reset,

    searchFm,
  }
})
