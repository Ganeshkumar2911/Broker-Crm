import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'


export const useAccountsStore = defineStore('accounts', () => {
  const snackbar = useSnackbarStore()

  const data = ref([])
  const loading = ref(false)
  const error = ref(null)

  const summary = ref({
    total_accounts: 0,
    total_balance: 0,
    total_pnl: 0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  const filters = reactive({
    account_type: 'all',
    trading_type: 'all',
    account_subtype: 'all',
    is_active: 'all',
    search_query: '',
  })

  const activeType = computed(() => filters.account_type)

  const fetchAccounts = () => {
    loading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []

      if (res?.pagination) {
        const currentPerPage = pagination.per_page
        Object.assign(pagination, res.pagination)
        if (!pagination.per_page) {
          pagination.per_page = Number(currentPerPage) || 10
        } else {
          pagination.per_page = Number(pagination.per_page)
        }
      }

      if (res?.summary) {
        summary.value = res.summary
      }

      loading.value = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err
      snackbar.show(err?.message || 'Failed to fetch accounts', 'error')
    }

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      ...(filters.account_type !== 'all' ? { account_type: filters.account_type } : {}),
      ...(filters.trading_type !== 'all' ? { trading_type: filters.trading_type } : {}),
      ...(filters.account_subtype !== 'all' ? { account_subtype: filters.account_subtype } : {}),
      ...(filters.is_active !== 'all' && filters.is_active !== null && filters.is_active !== undefined
        ? { is_active: filters.is_active === 'true' || filters.is_active === true }
        : {}),
      ...(filters.search_query?.trim() ? { search_query: filters.search_query.trim() } : {}),
    }

    apiRequest('get', urls.tradingAccounts.list, {
      params,
      isTokenRequired: true,
      cancelPrevious: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  const setType = (type) => {
    filters.account_type = type
    pagination.page = 1
    fetchAccounts()
  }

  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters)
    pagination.page = 1
    fetchAccounts()
  }

  const setPage = (page) => {
    pagination.page = page
    fetchAccounts()
  }

  const reset = () => {
    data.value = []
    loading.value = false
    error.value = null

    summary.value = {
      total_accounts: 0,
      total_balance: 0,
      total_pnl: 0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    filters.account_type = 'all'
    filters.trading_type = 'all'
    filters.account_subtype = 'all'
    filters.is_active = 'all'
    filters.search_query = ''
  }

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage)
    pagination.page = 1
    fetchAccounts()
  }

  return {
    data,
    loading,
    error,
    pagination,
    summary,
    filters,
    activeType,
    perPageOptions,

    fetchAccounts,
    setType,
    setFilters,
    setPage,
    updatePerPage,
    reset,
  }
})

