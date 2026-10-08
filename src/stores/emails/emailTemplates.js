import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { perPageOptions } from '@/constants/pagination'

export const useEmailTemplatesStore = defineStore(
  'emailTemplates',
  () => {
    // ─────────────────────────────────────
    // Snackbar
    // ─────────────────────────────────────

    const snackbar = useSnackbarStore()

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────

    const templates = ref([])

    const templateDetails = ref(null)

    const loading = ref(false)

    const detailsLoading = ref(false)

    const createLoading = ref(false)

    const updateLoading = ref(false)

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
    // Filters
    // ─────────────────────────────────────

    const filters = reactive({
      search: '',
      category: null,
    })

    // ─────────────────────────────────────
    // Static Options
    // ─────────────────────────────────────

    const categoryOptions = [
      'AUTH',
      'KYC',
      'PAYMENT',
      'FM',
      'IB',
      'MARKETING',
      'SYSTEM',
      'TRADING_ACCOUNT',
    ]

    const codeOptions = {
      AUTH: [
        'OTP_EMAIL',
        'PASSWORD_RESET',
        'WELCOME_EMAIL',
        'EMAIL_VERIFICATION',
        'PASSWORD_RESET_EMAIL',
        'RESET_PASSWORD_SUCCESSFUL',
      ],

      KYC: [
        'KYC_SUBMITTED',
        'KYC_APPROVED',
        'KYC_REJECTED',
      ],

      PAYMENT: [
        'DEPOSIT_SUCCESS',
        'DEPOSIT_FAILED',
        'WITHDRAWAL_REQUESTED',
        'WITHDRAWAL_APPROVED',
        'WITHDRAWAL_REJECTED',
        'NEW_WITHDRAWAL_REQUEST',
      ],

      FM: [
        'FOLLOWER_JOINED',
        'FOLLOWER_LEFT',
        'FM_SETTLEMENT',
        'FM_PAYOUT',
      ],

      SYSTEM: [
        'ACCOUNT_CREATED',
        'ACCOUNT_DISABLED',
        'LOGIN_ALERT',
        'SECURITY_ALERT',
      ],
      TRADING_ACCOUNT: [
        'TRADING_ACCOUNT_CREATED',
      ]
    }

    // ─────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────

    const cleanFilters = () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) =>
            value !== null &&
            value !== '' &&
            value !== undefined
        )
      )

    const extractVariables = (html = '') => {
      const matches = html.match(/{{(.*?)}}/g) || []

      return [
        ...new Set(
          matches.map(variable =>
            variable
              .replace('{{', '')
              .replace('}}', '')
              .trim()
          )
        ),
      ]
    }

    // ─────────────────────────────────────
    // Fetch Templates
    // ─────────────────────────────────────

    const fetchTemplates = (force = false) => {
      if (isFetched.value && !force) return

      loading.value = true

      error.value = null

      const successHandler = (res) => {
        templates.value = res?.data || []

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
          err?.message || 'Failed to fetch email templates.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.emailTemplates.list,
        {
          params: {
            page: pagination.page,
            per_page: pagination.per_page,
            ...cleanFilters(),
          },

          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Fetch Template Details
    // ─────────────────────────────────────

    const fetchTemplateDetails = (id) => {
      detailsLoading.value = true

      error.value = null

      const successHandler = (res) => {
        templateDetails.value = res?.data || null

        detailsLoading.value = false
      }

      const failureHandler = (err) => {
        detailsLoading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to fetch template details.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.emailTemplates.details,
        {
          look_up_key: id,

          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Create Template
    // ─────────────────────────────────────

    const createTemplate = (payload, onSuccess, onFailure) => {
      createLoading.value = true

      error.value = null

      const finalPayload = {
        ...payload,

        available_variables: extractVariables(
          payload?.body_html
        ),
      }

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Template created successfully.',
          'success'
        )

        createLoading.value = false

        fetchTemplates(true)

        if (onSuccess) onSuccess(res)
      }

      const failureHandler = (err) => {
        createLoading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to create template.',
          'error'
        )

        if (onFailure) onFailure(err)
      }

      apiRequest(
        urls.KEYS.POST,
        urls.emailTemplates.create,
        {
          data: finalPayload,

          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Update Template
    // ─────────────────────────────────────

    const updateTemplate = (id, payload, onSuccess, onFailure) => {
      updateLoading.value = true

      error.value = null

      const finalPayload = {
        ...payload,

        available_variables: extractVariables(
          payload?.body_html
        ),
      }

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Template updated successfully.',
          'success'
        )

        updateLoading.value = false

        fetchTemplates(true)

        fetchTemplateDetails(id)

        if (onSuccess) onSuccess(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to update template.',
          'error'
        )

        if (onFailure) onFailure(err)
      }

      apiRequest(
        urls.KEYS.PUT,
        urls.emailTemplates.update,
        {
          look_up_key: id,

          data: finalPayload,

          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Apply Filters
    // ─────────────────────────────────────

    const applyFilters = (newFilters = null) => {
      if (newFilters) {
        Object.assign(filters, newFilters)
      }

      pagination.page = 1

      isFetched.value = false

      fetchTemplates(true)
    }

    // ─────────────────────────────────────
    // Reset Filters
    // ─────────────────────────────────────

    const resetFilters = () => {
      Object.assign(filters, {
        search: '',
        category: null,
      })

      applyFilters()
    }

    // ─────────────────────────────────────
    // Pagination
    // ─────────────────────────────────────

    const setPage = (page) => {
      pagination.page = page

      isFetched.value = false

      fetchTemplates(true)
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      templates.value = []

      templateDetails.value = null

      loading.value = false

      detailsLoading.value = false

      createLoading.value = false

      updateLoading.value = false

      error.value = null

      isFetched.value = false

      Object.assign(pagination, {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 1,
      })

      Object.assign(filters, {
        search: '',
        category: null,
      })
    }

    // ─────────────────────────────────────
    // Return
    // ─────────────────────────────────────

    const updatePerPage = (newPerPage) => {
      pagination.per_page = Number(newPerPage)
      pagination.page = 1
      isFetched.value = false
      fetchTemplates(true)
    }

    return {
      // state
      templates,
      templateDetails,

      loading,
      detailsLoading,
      createLoading,
      updateLoading,

      error,
      isFetched,

      pagination,
      perPageOptions,
      filters,

      categoryOptions,
      codeOptions,

      // methods
      fetchTemplates,
      fetchTemplateDetails,

      createTemplate,
      updateTemplate,

      applyFilters,
      resetFilters,

      setPage,
      updatePerPage,

      extractVariables,

      reset,
    }
  }
)