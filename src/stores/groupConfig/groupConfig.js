// stores/groupConfig/groupConfig.js

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useGroupConfigStore = defineStore(
  'groupConfig',
  () => {
    // ─────────────────────────────────────
    // Route
    // ─────────────────────────────────────

    const route = useRoute()

    // ─────────────────────────────────────
    // Snackbar
    // ─────────────────────────────────────

    const snackbar = useSnackbarStore()

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────

    const records = ref([])

    const mt5Groups = ref([])

    const loading = ref(false)

    const createLoading = ref(false)

    const mt5GroupsLoading = ref(false)

    const actionLoading = reactive({
      type: null,
      id: null,
    })

    const error = ref(null)

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const filters = reactive({
      status: 'all',
    })

    // ─────────────────────────────────────
    // Summary
    // ─────────────────────────────────────

    const summary = reactive({
      added: 0,
      not_added: 0,
      total_groups: 0,
    })

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const pagination = reactive({
      page: 1,
      per_page: 100,
      total_items: 0,
      total_pages: 1,
    })

    // ─────────────────────────────────────
    // Fetch Groups
    // ─────────────────────────────────────

    const fetchGroups = () => {
      loading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.GET,
        urls.groupConfig.list,
        {
          isTokenRequired: true,

          params: {
            page: pagination.page,
            per_page: pagination.per_page,

            status: filters.status,

            account_category:
              route.params.account_category,

            account_type:
              route.params.account_type,
          },

          onSuccess: (res) => {
            records.value = res?.data || []

            Object.assign(summary, {
              added: res?.summary?.added || 0,

              not_added:
                res?.summary?.not_added || 0,

              total_groups:
                res?.summary?.total_groups || 0,
            })

            Object.assign(pagination, {
              page: res?.pagination?.page || 1,

              per_page:
                res?.pagination?.per_page || 10,

              total_items:
                res?.pagination?.total_items || 0,

              total_pages:
                res?.pagination?.total_pages || 1,
            })

            loading.value = false
          },

          onFailure: (err) => {
            loading.value = false

            error.value = err

            snackbar.show(
              err?.message ||
                'Failed to fetch group configurations.',
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
      mt5GroupsLoading.value = true

      apiRequest(
        urls.KEYS.GET,
        urls.groupConfig.list,
        {
          isTokenRequired: true,

          params: {
            page: 1,
            per_page: 10,
            q: query,
          },

          onSuccess: (res) => {
            mt5Groups.value = res?.data || []

            mt5GroupsLoading.value = false
          },

          onFailure: (err) => {
            mt5GroupsLoading.value = false

            snackbar.show(
              err?.message ||
                'Failed to fetch MT5 groups.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Add Group Config
    // ─────────────────────────────────────

    const addGroupConfig = (payload, onSuccess) => {
      createLoading.value = true

      error.value = null

      apiRequest(
        urls.KEYS.POST,
        urls.groupConfig.add,
        {
          isTokenRequired: true,

          data: {
            mt5_group: payload.mt5_group,

            label: payload.label,

            account_type:
              route.params.account_type,

            account_category:
              route.params.account_category,

            currency: payload.currency,

            leverage: Number(payload.leverage),

            badge: payload.badge,

            description: payload.description,
          },

          onSuccess: (res) => {
            snackbar.show(
              res?.message ||
                'Group configuration added successfully.',
              'success'
            )

            createLoading.value = false

            fetchGroups()

            if (onSuccess) onSuccess()
          },

          onFailure: (err) => {
            createLoading.value = false

            error.value = err

            snackbar.show(
              err?.message ||
                'Failed to add group configuration.',
              'error'
            )
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Group Actions
    // ─────────────────────────────────────

    const setDefaultGroup = (configId, onSuccess) => {
      if (!configId) return

      actionLoading.type = 'set_default'
      actionLoading.id = configId

      apiRequest(
        urls.KEYS.PATCH,
        urls.groupConfig.setDefault,
        {
          isTokenRequired: true,
          look_up_key: configId,

          onSuccess: (res) => {
            snackbar.show(
              res?.message || 'Group set as default successfully.',
              'success'
            )

            fetchGroups()

            if (onSuccess) onSuccess(res)
          },

          onFailure: (err) => {
            snackbar.show(
              err?.message || 'Failed to set group as default.',
              'error'
            )
          },

          onFinally: () => {
            actionLoading.type = null
            actionLoading.id = null
          },
        }
      )
    }

    const deconfigGroup = (configId, onSuccess) => {
      if (!configId) return

      actionLoading.type = 'deconfig'
      actionLoading.id = configId

      apiRequest(
        urls.KEYS.DELETE,
        urls.groupConfig.deconfig,
        {
          isTokenRequired: true,
          look_up_key: configId,

          onSuccess: (res) => {
            snackbar.show(
              res?.message || 'Group de-configured successfully.',
              'success'
            )

            fetchGroups()

            if (onSuccess) onSuccess(res)
          },

          onFailure: (err) => {
            snackbar.show(
              err?.message || 'Failed to de-config group.',
              'error'
            )
          },

          onFinally: () => {
            actionLoading.type = null
            actionLoading.id = null
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Filters
    // ─────────────────────────────────────

    const applyFilters = () => {
      pagination.page = 1

      fetchGroups()
    }

    const setPage = (page) => {
      pagination.page = page

      fetchGroups()
    }

    const setStatus = (status) => {
      filters.status = status

      pagination.page = 1

      fetchGroups()
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      records.value = []

      mt5Groups.value = []

      loading.value = false

      createLoading.value = false

      mt5GroupsLoading.value = false

      error.value = null

      filters.status = 'all'

      Object.assign(summary, {
        added: 0,
        not_added: 0,
        total_groups: 0,
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

    const updatePerPage = (newPerPage) => {
      pagination.per_page = Number(newPerPage)
      pagination.page = 1
      fetchGroups()
    }

    return {
      // state
      records,
      mt5Groups,

      loading,
      createLoading,
      mt5GroupsLoading,

      error,

      filters,
      summary,
      pagination,
      perPageOptions,

      // methods
      fetchGroups,

      searchMt5Groups,

      addGroupConfig,
      setDefaultGroup,
      deconfigGroup,

      applyFilters,
      setPage,
      updatePerPage,
      setStatus,

      actionLoading,

      reset,
    }
  }
)
