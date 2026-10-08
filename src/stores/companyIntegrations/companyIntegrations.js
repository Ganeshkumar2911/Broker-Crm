import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useCompanyIntegrationsStore = defineStore(
  'companyIntegrations',
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

    const isSubmitting = ref(false)

    const error = ref(null)

    const isFetched = ref(false)

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
    // Fetch Integrations
    // ─────────────────────────────────────

    const fetchIntegrations = (force = false) => {
      if (isFetched.value && !force) return Promise.resolve()

      loading.value = true

      error.value = null

      const successHandler = (res) => {
        records.value = res?.data || []

        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 10,
          total_items: res?.pagination?.total_items || 0,
          total_pages: res?.pagination?.total_pages || 1,
        })

        isFetched.value = true

        loading.value = false
      }

      const failureHandler = (err) => {
        loading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to fetch integrations.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.GET,
        urls.integrations.list,
        {
          params: {
            page: pagination.page,
            per_page: pagination.per_page,
          },

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Create Integration
    // ─────────────────────────────────────

    const createIntegration = (payload) => {
      isSubmitting.value = true

      error.value = null

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Integration created successfully.',
          'success'
        )

        fetchIntegrations(true)
      }

      const failureHandler = (err) => {
        error.value = err

        snackbar.show(
          err?.message || 'Failed to create integration.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.POST,
        urls.integrations.create,
        {
          data: payload,

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: () => {
            isSubmitting.value = false
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Update Integration
    // ─────────────────────────────────────

    const updateIntegration = (id, payload) => {
      isSubmitting.value = true

      error.value = null

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Integration updated successfully.',
          'success'
        )

        fetchIntegrations(true)
      }

      const failureHandler = (err) => {
        error.value = err

        snackbar.show(
          err?.message || 'Failed to update integration.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.PUT,
        urls.integrations.update,
        {
          look_up_key: id,

          data: payload,

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: () => {
            isSubmitting.value = false
          },
        }
      )
    }

    // ─────────────────────────────────────
    // Run Integration Manually
    // ─────────────────────────────────────

    const isRunning = ref(false)

    const runIntegration = (id, payload = {}) => {
      isRunning.value = true

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Manual fetch completed/initiated successfully.',
          'success'
        )
      }

      const failureHandler = (err) => {
        snackbar.show(
          err?.message || 'Failed to trigger manual fetch.',
          'error'
        )
      }

      return apiRequest(
        urls.KEYS.POST,
        urls.integrations.run,
        {
          look_up_key: id,
          data: payload,

          isTokenRequired: true,

          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: () => {
            isRunning.value = false
          },
        }
      )
    }

    const updatePerPage = (newPerPage) => {
      pagination.per_page = Number(newPerPage)
      pagination.page = 1
      fetchIntegrations(true)
    }

    return {
      records,
      loading,
      isSubmitting,
      isRunning,
      error,
      isFetched,
      pagination,
      perPageOptions,
      fetchIntegrations,
      updatePerPage,
      createIntegration,
      updateIntegration,
      runIntegration,
    }
  }
)
