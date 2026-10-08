// stores/groupConfig/categories.js

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useGroupCategoriesStore = defineStore(
  'groupCategories',
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

    const createLoading = ref(false)

    const groupSearchLoading = ref(false)

    const error = ref(null)

    const isFetched = ref(false)

    // ─────────────────────────────────────
    // MT5 Group Search
    // ─────────────────────────────────────

    const groupOptions = ref([])

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
    // Fetch Categories
    // ─────────────────────────────────────

    const fetchCategories = (force = false) => {
      if (isFetched.value && !force) return

      loading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.GET,
        urls.groupConfig.categories,
        {
          isTokenRequired: true,

          params: {
            page: pagination.page,
            per_page: pagination.per_page,
            search: filters.search,
          },

          onSuccess: (res) => {
            records.value = res?.data || []

            Object.assign(pagination, {
              page: res?.pagination?.page || 1,
              per_page: res?.pagination?.per_page || 10,
              total_items: res?.pagination?.total_items || 0,
              total_pages: res?.pagination?.total_pages || 1,
            })

            isFetched.value = true

            loading.value = false
          },

          onFailure: (err) => {
            loading.value = false

            error.value = err

            snackbar.show(
              err?.message || 'Failed to fetch categories.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Search MT5 Groups
    // ─────────────────────────────────────

    const searchMt5Groups = (query = '') => {
      groupSearchLoading.value = true

      const params = {
        page: 1,
        per_page: 10,
        status: 'all',
      }

      if (query.trim()) {
        params.q = query
      }

      apiRequest(
        urls.KEYS.GET,
        urls.groupConfig.groups,
        {
          isTokenRequired: true,

          params,

          onSuccess: (res) => {
            groupOptions.value = res?.data || []

            groupSearchLoading.value = false
          },

          onFailure: (err) => {
            groupSearchLoading.value = false

            snackbar.show(
              err?.message || 'Failed to search MT5 groups.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Create Category
    // ─────────────────────────────────────

    const createCategory = (payload, onSuccess) => {
      createLoading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.POST,
        urls.groupConfig.create,
        {
          isTokenRequired: true,

          data: {
            mt5_group: payload.mt5_group,
            label: payload.label,

            account_type: payload.account_type,

            account_category: payload.account_category,

            currency: payload.currency,

            leverage: Number(payload.leverage),

            badge: payload.badge,

            description: payload.description,
          },

          onSuccess: (res) => {
            snackbar.show(
              res?.message || 'Category created successfully.',
              'success'
            )

            createLoading.value = false

            fetchCategories(true)

            if (onSuccess) onSuccess()
          },

          onFailure: (err) => {
            createLoading.value = false

            error.value = err

            snackbar.show(
              err?.message || 'Failed to create category.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const applyFilters = () => {
      pagination.page = 1

      fetchCategories(true)
    }

    const setPage = (page) => {
      pagination.page = page

      fetchCategories(true)
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      records.value = []

      groupOptions.value = []

      loading.value = false

      createLoading.value = false

      groupSearchLoading.value = false

      error.value = null

      isFetched.value = false

      filters.search = ''

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

    const updatePerPage = (newPerPage) => {
      pagination.per_page = Number(newPerPage)
      pagination.page = 1
      isFetched.value = false
      fetchCategories(true)
    }

    return {
      // state
      records,
      loading,
      createLoading,
      groupSearchLoading,
      error,
      isFetched,

      groupOptions,

      filters,
      pagination,
      perPageOptions,

      // methods
      fetchCategories,
      searchMt5Groups,
      createCategory,

      applyFilters,
      setPage,
      updatePerPage,

      reset,
    }
  }
)
