import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useIbClientsStore = defineStore(
  'ibClients',
  () => {
    // ─────────────────────────────────────
    // Snackbar
    // ─────────────────────────────────────

    const snackbar = useSnackbarStore()

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────

    const records = ref([])

    const loading = ref(false)

    const error = ref(null)

    // ─────────────────────────────────────
    // IB Details
    // ─────────────────────────────────────

    const ib = reactive({
      id: null,
      name: '',
      email: '',
      referral_code: '',
      level: 0,
      total_clients: 0,
      downline_ibs: 0,
    })

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const filters = reactive({
      search: '',
    })

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const pagination = reactive({
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    })

    // ─────────────────────────────────────
    // Fetch Clients
    // ─────────────────────────────────────

    const fetchClients = (ibId = ib.id) => {
      if (!ibId) return

      ib.id = ibId

      loading.value = true

      error.value = null

      const successHandler = (res) => {
        records.value = res?.data || []

        Object.assign(ib, {
          id: res?.ib?.id || null,
          name: res?.ib?.name || '',
          email: res?.ib?.email || '',
          referral_code: res?.ib?.referral_code || '',
          level: res?.ib?.level || 0,
          total_clients: res?.ib?.total_clients || 0,
          downline_ibs: res?.ib?.downline_ibs || 0,
        })

        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 10,
          total_items: res?.pagination?.total_items || 0,
          total_pages: res?.pagination?.total_pages || 1,
        })

        loading.value = false
      }

      const failureHandler = (err) => {
        loading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to fetch IB clients.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.ibTree.clients,
        {
          isTokenRequired: true,

          look_up_key: ibId,

          params: {
            page: pagination.page,
            per_page: pagination.per_page,
            search: filters.search,
          },

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const applyFilters = (ibId = ib.id) => {
      pagination.page = 1

      fetchClients(ibId)
    }

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const setPage = (page) => {
      pagination.page = page

      fetchClients(ib.id)
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      records.value = []

      loading.value = false

      error.value = null

      filters.search = ''

      Object.assign(ib, {
        id: null,
        name: '',
        email: '',
        referral_code: '',
        level: 0,
        total_clients: 0,
        downline_ibs: 0,
      })

      Object.assign(pagination, {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      })
    }

    // ─────────────────────────────────────
    // Return
    // ─────────────────────────────────────

    const updatePerPage = (ibId, newPerPage) => {
      pagination.per_page = Number(newPerPage)
      pagination.page = 1
      fetchClients(ibId || ib.id, 1)
    }

    return {
      // state
      records,

      loading,

      error,

      ib,

      filters,

      pagination,
      perPageOptions,

      // methods
      fetchClients,

      applyFilters,

      setPage,
      updatePerPage,

      reset,
    }
  }
)