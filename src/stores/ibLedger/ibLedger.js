import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

const defaultPagination = () => ({
  page: 1,
  per_page: 10,
  total_items: 0,
  total_pages: 0,
})

const defaultSummary = () => ({
  total_deposit: 0,
  total_fee_paid: 0,
  total_ib_fee: 0,
  total_records: 0,
  total_trade_pnl: 0,
  total_withdrawal: 0,
})

const defaultFilters = () => ({
  type: null,
  user_id: null,
  from_date: null,
  to_date: null,
})

export const useIbWalletStore = defineStore('ibWallet', () => {
  // ─── State ───────────────────────────────────────────
  const data = ref([])
  const summary = ref(defaultSummary())

  const loading = ref(false)
  const searchLoading = ref(false)

  const isFetched = ref(false)
  const error = ref(null)

  const pagination = ref(defaultPagination())

  // ✅ Persist filter state
  const filters = reactive(defaultFilters())

  // Dynamic filters from API
  const filterOptions = reactive({
    types: [],
  })

  // Search dropdown options
  const ibOptions = ref([])

  const snackbar = useSnackbarStore()

  // ─── Helpers ─────────────────────────────────────────
  const cleanFilters = (payload = {}) =>
    Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) =>
          value !== '' &&
          value !== null &&
          value !== undefined
      )
    )

  // ─── Fetch IB Wallet ────────────────────────────────
  const fetchIbWallet = (force = false) => {
    if (isFetched.value && !force) return

    loading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      summary.value = {
        ...defaultSummary(),
        ...(res?.summary || {}),
      }

      pagination.value = res?.pagination || defaultPagination()

      filterOptions.types = res?.filters?.types || []

      loading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err

      snackbar.show(
        err?.message || 'Failed to fetch IB wallet.',
        'error'
      )
    }

    apiRequest(urls.KEYS.GET, urls.ibLedger.list, {
      params: cleanFilters({
        page: pagination.value.page,
        per_page: pagination.value.per_page,

        type: filters.type,
        user_id: filters.user_id,
        from_date: filters.from_date,
        to_date: filters.to_date,
      }),

      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Search IBs ─────────────────────────────────────
  const searchIbs = (query = '') => {
    const searchQuery = query.trim()

    if (!searchQuery) {
      ibOptions.value = []
      searchLoading.value = false
      return Promise.resolve([])
    }

    searchLoading.value = true

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const options = (res?.data || []).map((ib) => ({
          label: ib.label_name ?? ib.name ?? ib.ib_name ?? ib.email ?? `IB ${ib.user_id ?? ib.id}`,
          value: ib.user_id ?? ib.id ?? ib.user_id,
          email: ib.email,
          available_balance: ib.available_balance ?? 0.0,
          ib_id: ib.ib_id,
          referral_code: ib.referral_code,
        }))

        ibOptions.value = options
        searchLoading.value = false
        resolve(options)
      }

      const failureHandler = (err) => {
        ibOptions.value = []
        searchLoading.value = false
        snackbar.show(err?.message || 'Failed to fetch IBs.', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
        params: { search: searchQuery },

        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // ─── Filters ────────────────────────────────────────
  const setFilters = (payload = {}) => {
    Object.assign(filters, payload)

    pagination.value.page = 1
    isFetched.value = false

    fetchIbWallet(true)
  }

  const updatePerPage = (newPerPage) => {
    pagination.value.per_page = Number(newPerPage)
    pagination.value.page = 1
    isFetched.value = false

    fetchIbWallet(true)
  }

  const resetFilters = () => {
    Object.assign(filters, defaultFilters())

    pagination.value.page = 1
    isFetched.value = false

    fetchIbWallet(true)
  }

  // ─── Pagination ─────────────────────────────────────
  const setPage = (page = 1) => {
    pagination.value.page = page

    isFetched.value = false

    fetchIbWallet(true)
  }

  // ─── Reset ──────────────────────────────────────────
  const reset = () => {
    data.value = []

    summary.value = defaultSummary()

    loading.value = false
    searchLoading.value = false

    isFetched.value = false
    error.value = null

    pagination.value = defaultPagination()

    Object.assign(filters, defaultFilters())

    filterOptions.types = []

    ibOptions.value = []
  }

  // ─── Expose ─────────────────────────────────────────
  return {
    data,
    summary,

    loading,
    searchLoading,

    isFetched,
    error,

    pagination,
    perPageOptions,

    filters,
    filterOptions,

    ibOptions,

    fetchIbWallet,
    searchIbs,

    setFilters,
    updatePerPage,
    resetFilters,

    setPage,
    reset,
  }
})
