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
  total_broker_fee: 0,
  total_earnings: 0,
  total_platform_earning: 0,
  total_records: 0,
})

const defaultFilters = () => ({
  type: null,
})

export const useAdminLedgerStore = defineStore('adminLedger', () => {
  // ─── State ───────────────────────────────────────────
  const data = ref([])

  const summary = ref(defaultSummary())

  const loading = ref(false)

  const isFetched = ref(false)
  const error = ref(null)

  const pagination = ref(defaultPagination())

  // ✅ Persist filter state
  const filters = reactive(defaultFilters())

  // Dynamic filter options
  const filterOptions = reactive({
    types: [],
  })

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

  // ─── Fetch Admin Ledger ─────────────────────────────
  const fetchAdminLedger = (force = false) => {
    if (isFetched.value && !force) return

    loading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      if (res?.summary) {
        summary.value = res.summary
      }

      if (res?.pagination) {
        pagination.value = res.pagination
      }

      if (res?.filters?.types) {
        filterOptions.types = res.filters.types
      }

      loading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err

      snackbar.show(
        err?.message || 'Failed to fetch my wallet ledger data',
        'error'
      )
    }

    const params = cleanFilters({
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      ...filters,
    })

    apiRequest('get', urls.adminLedger.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Filters & Pagination Actions ───────────────────
  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters)

    pagination.value.page = 1

    fetchAdminLedger(true)
  }

  const updatePerPage = (newPerPage) => {
    pagination.value.per_page = Number(newPerPage)
    pagination.value.page = 1
    fetchAdminLedger(true)
  }

  const resetFilters = () => {
    Object.assign(filters, defaultFilters())

    pagination.value.page = 1

    fetchAdminLedger(true)
  }

  const setPage = (page) => {
    pagination.value.page = page

    fetchAdminLedger(true)
  }

  // ─── Reset ──────────────────────────────────────────
  const reset = () => {
    data.value = []

    summary.value = defaultSummary()

    loading.value = false

    isFetched.value = false
    error.value = null

    pagination.value = defaultPagination()

    Object.assign(filters, defaultFilters())

    filterOptions.types = []
  }

  // ─── Expose ─────────────────────────────────────────
  return {
    data,
    summary,

    loading,

    isFetched,
    error,

    pagination,
    perPageOptions,

    filters,
    filterOptions,

    fetchAdminLedger,

    setFilters,
    updatePerPage,
    resetFilters,

    setPage,
    reset,
  }
})