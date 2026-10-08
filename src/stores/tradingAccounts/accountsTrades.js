import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useTickerStore } from '@/stores/ws/ticker'
import { perPageOptions } from '@/constants/pagination'

export const useAccountTradesStore = defineStore('accountTrades', () => {
  const snackbar = useSnackbarStore()
  const tickerStore = useTickerStore()

  // ─── State ─────────────────────────────────────────────
  const data        = ref([])
  const loading     = ref(false)
  const error       = ref(null)
  const side        = ref(null) // null | 'open' | 'close'
  const from_date   = ref('')
  const to_date     = ref('')

  const summary = ref({
    total_lots: 0,
    total_pnl:  0,
  })

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  })

  const accountId = ref(null)

  // ─── Fetch Trades ──────────────────────────────────────
  const fetchTrades = (
    id = accountId.value,
    sideParam = side.value,
    fromDateParam = from_date.value,
    toDateParam = to_date.value
  ) => {
    if (!id) return

    accountId.value = id
    loading.value   = true

    const successHandler = (res) => {
      const items = res?.data || []
      data.value = items

      if (items && items.length > 0) {
        const uniqueSymbols = [
          ...new Set(items.map((trade) => trade.symbol)),
        ].filter(Boolean)
        if (uniqueSymbols.length > 0) {
          tickerStore.updateTickerList(uniqueSymbols)
        }
      }

      if (res?.pagination) {
        Object.assign(pagination, res.pagination)
      }

      if (res?.summary) {
        summary.value = res.summary
      }

      loading.value   = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value   = err
      snackbar.show(err?.message || 'Failed to fetch trades', 'error')
    }

    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
    }

    if (sideParam) {
      params.side = sideParam
    }

    if (fromDateParam) {
      params.from_date = fromDateParam
    }

    if (toDateParam) {
      params.to_date = toDateParam
    }

    apiRequest('get', urls.tradingAccounts.accountTrades, {
      look_up_key: id,
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Pagination ────────────────────────────────────────
  const setPage = (page) => {
    pagination.page = Number(page) || 1
    fetchTrades(accountId.value, side.value, from_date.value, to_date.value)
  }

  const updatePerPage = (newPerPage) => {
    const val = typeof newPerPage === 'object' && newPerPage !== null ? (newPerPage.per_page ?? newPerPage.value) : newPerPage
    pagination.per_page = Number(val) || 10
    pagination.page = 1
    fetchTrades(accountId.value, side.value, from_date.value, to_date.value)
  }

  const setSide = (nextSide) => {
    side.value = nextSide || null
    pagination.page = 1
    fetchTrades(accountId.value, side.value, from_date.value, to_date.value)
  }

  const setDateRange = (from, to) => {
    from_date.value = from || ''
    to_date.value = to || ''
    pagination.page = 1
    fetchTrades(accountId.value, side.value, from_date.value, to_date.value)
  }

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value      = []
    loading.value   = false
    error.value     = null
    side.value      = null
    from_date.value = ''
    to_date.value   = ''

    summary.value = {
      total_lots: 0,
      total_pnl:  0,
    }

    Object.assign(pagination, {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    })

    accountId.value = null
  }

  return {
    data,
    loading,
    error,
    pagination,
    summary,
    side,
    from_date,
    to_date,
    perPageOptions,

    fetchTrades,
    setPage,
    updatePerPage,
    setSide,
    setDateRange,
    reset,
  }
})

