import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useAccountTransactionsStore = defineStore('accountTransactions', () => {
  const data = ref([])

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  })

  const summary = ref({
    net_flow: 0,
    total_credits: 0,
    total_debits: 0,
    total_deposit: 0,
    total_withdrawal: 0,
    total_transactions: 0,
  })

  const filters = ref({
    search: '',
    page: 1,
    per_page: 10,
    from_date: '',
    to_date: '',
  })

  const from_date = ref('')
  const to_date = ref('')

  const isLoading = ref(false)

  const snackbar = useSnackbarStore()

  // ─── Fetch Transactions ─────────────────────────────────────
  const fetchTransactions = (accountId, page = filters.value.page) => {
    filters.value.page = page

    isLoading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      pagination.value = res?.pagination || {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      }

      summary.value = res?.summary || {
        net_flow: 0,
        total_credits: 0,
        total_debits: 0,
        total_deposit: 0,
        total_withdrawal: 0,
        total_transactions: 0,
      }

      isLoading.value = false
    }

    const failureHandler = (err) => {
      data.value = []

      pagination.value = {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      }

      summary.value = {
        net_flow: 0,
        total_credits: 0,
        total_debits: 0,
        total_deposit: 0,
        total_withdrawal: 0,
        total_transactions: 0,
      }

      isLoading.value = false

      snackbar.show(
        err?.message || 'Failed to fetch transactions.',
        'error'
      )
    }

    apiRequest(
      urls.KEYS.GET,
      urls.tradingAccounts.transactions,
      {
        look_up_key: accountId,

        params: {
          page: filters.value.page,
          per_page: filters.value.per_page,
          // search: filters.value.search || undefined,
          ...(filters.value.from_date ? { from_date: filters.value.from_date } : {}),
          ...(filters.value.to_date ? { to_date: filters.value.to_date } : {}),
        },

        isTokenRequired: true,

        onSuccess: successHandler,
        onFailure: failureHandler,
      }
    )
  }

  // ─── Apply Filters ─────────────────────────────────────
  const applyFilters = (accountId) => {
    filters.value.page = 1
    fetchTransactions(accountId, 1)
  }

  const updatePerPage = (accountId, newPerPage) => {
    filters.value.per_page = Number(newPerPage)
    pagination.value.per_page = Number(newPerPage)
    filters.value.page = 1
    fetchTransactions(accountId, 1)
  }

  // ─── Reset Store ─────────────────────────────────────
  const reset = () => {
    data.value = []

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    }

    summary.value = {
      net_flow: 0,
      total_credits: 0,
      total_debits: 0,
      total_deposit: 0,
      total_withdrawal: 0,
      total_transactions: 0,
    }

    filters.value = {
      search: '',
      page: 1,
      per_page: 10,
      from_date: '',
      to_date: '',
    }

    from_date.value = ''
    to_date.value = ''
    isLoading.value = false
  }

  // Store the current accountId so watchers can re-fetch
  const _accountId = ref(null)

  const setDateRange = (from, to, accountId) => {
    filters.value.from_date = from
    filters.value.to_date = to
    from_date.value = from
    to_date.value = to
    if (accountId) _accountId.value = accountId
    if (_accountId.value) {
      filters.value.page = 1
      fetchTransactions(_accountId.value, 1)
    }
  }

  const initAccountId = (id) => {
    _accountId.value = id
  }

  return {
    data,
    pagination,
    summary,
    perPageOptions,

    filters,
    from_date,
    to_date,

    isLoading,

    fetchTransactions,
    applyFilters,
    updatePerPage,
    setDateRange,
    initAccountId,
    reset,
  }
})