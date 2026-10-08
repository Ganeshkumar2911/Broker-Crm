import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useInternalTransfersStore = defineStore('internalTransfers', () => {
  const snackbar = useSnackbarStore()

  // ─── State ─────────────────────────────────────────────
  const data        = ref([])
  const loading     = ref(false)
  const isFetched   = ref(false)
  const error       = ref(null)

  const summary = ref({
    total_deposit:    0,
    total_withdrawal: 0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  // ✅ Filters (selected values)
  const filters = reactive({
    client_id:  null,
    account_id: null,
    type:       null,
    from_date:  '',
    to_date:    '',
  })

  // ✅ Filter options (from API)
  const filterOptions = ref({
    clients:  [],
    accounts: [],
    types:    [],
  })

  // ─── Helpers ───────────────────────────────────────────
  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== null && v !== '' && v !== undefined
      )
    )

  // ─── Fetch Internal Transfers ──────────────────────────
  const fetchTransfers = (force = false) => {
    if (isFetched.value && !force) return
    if (loading.value) return

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
      snackbar.show(err?.message || 'Failed to fetch internal transfers', 'error')
    }

    apiRequest('get', urls.clientLedger.internalTransfers, {
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

  // ─── Apply Filters ─────────────────────────────────────
  const applyFilters = (newFilters) => {
    if (newFilters) {
      Object.assign(filters, newFilters)
    }
    pagination.page = 1
    isFetched.value = false
    fetchTransfers(true)
  }

  // ─── Update Per Page ──────────────────────────────────
  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    isFetched.value = false
    fetchTransfers(true)
  }

  // ─── Reset Filters ─────────────────────────────────────
  const resetFilters = () => {
    Object.assign(filters, {
      client_id:  null,
      account_id: null,
      type:       null,
      from_date:  '',
      to_date:    '',
    })

    applyFilters()
  }

  // ─── Pagination ────────────────────────────────────────
  const setPage = (page) => {
    pagination.page = page
    isFetched.value = false
    fetchTransfers(true)
  }

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value      = []
    loading.value   = false
    isFetched.value = false
    error.value     = null

    summary.value = {
      total_deposit:    0,
      total_withdrawal: 0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    resetFilters()
  }

  // ─── Fetch All Clients (for Searchable BaseSelect) ──────
  const fetchAllClients = (searchQuery = '') => {
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const clientList = (res?.data || []).map(c => ({
          label: c.name,
          value: c.id,
          email: c.email,
        }))
        resolve(clientList)
      }

      const failureHandler = (err) => {
        snackbar.show(err?.message || 'Failed to fetch clients', 'error')
        reject(err)
      }

      apiRequest('get', urls.clientLedger.allClients, {
        params: searchQuery ? { search: searchQuery } : {},
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // ─── Fetch All Accounts (for Searchable BaseSelect) ─────
  const fetchAllAccounts = (searchQuery = '', clientId = null) => {
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const accountList = (res?.data || []).map(a => ({
          label: `#${a.account_number} · ${a.broker_label || ''}`.trim(),
          value: a.account_id,
          accountNumber: a.account_number,
          brokerLabel: a.broker_label,
          clientName: a.client_name,
        }))
        resolve(accountList)
      }

      const failureHandler = (err) => {
        snackbar.show(err?.message || 'Failed to fetch accounts', 'error')
        reject(err)
      }

      const params = {}
      if (searchQuery) params.search = searchQuery
      if (clientId) params.client_id = clientId

      apiRequest('get', urls.clientLedger.allAccounts, {
        params,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
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

    fetchTransfers,
    applyFilters,
    updatePerPage,
    resetFilters,
    setPage,
    reset,
    fetchAllClients,
    fetchAllAccounts,
  }
})
