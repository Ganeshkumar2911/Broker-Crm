import { defineStore } from 'pinia'
import { ref } from 'vue'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useEmailSettingsStore = defineStore(
  'emailSettings',
  () => {
    const snackbar = useSnackbarStore()

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────

    const settings = ref(null)

    const loading = ref(false)

    const updateLoading = ref(false)

    const error = ref(null)

    const isFetched = ref(false)

    // ─────────────────────────────────────
    // Fetch Settings
    // ─────────────────────────────────────

    const fetchSettings = (force = false) => {
      if (isFetched.value && !force) return

      loading.value = true

      error.value = null

      const successHandler = (res) => {
        settings.value = res?.data || null

        isFetched.value = true

        loading.value = false
      }

      const failureHandler = (err) => {
        loading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to fetch email settings.',
          'error'
        )
      }

      apiRequest(
        urls.KEYS.GET,
        urls.emailSettings.details,
        {
          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Save / Update Settings
    // ─────────────────────────────────────

    const saveSettings = (payload, onSuccess, onFailure) => {
      updateLoading.value = true

      error.value = null

      const successHandler = (res) => {
        snackbar.show(
          res?.message || 'Email settings saved successfully.',
          'success'
        )

        updateLoading.value = false

        fetchSettings(true)

        if (onSuccess) onSuccess(res)
      }

      const failureHandler = (err) => {
        updateLoading.value = false

        error.value = err

        snackbar.show(
          err?.message || 'Failed to save email settings.',
          'error'
        )

        if (onFailure) onFailure(err)
      }

      apiRequest(
        urls.KEYS.PUT,
        urls.emailSettings.update,
        {
          data: payload,

          isTokenRequired: true,

          onSuccess: successHandler,

          onFailure: failureHandler,
        }
      )
    }

    // ─────────────────────────────────────
    // Reset
    // ─────────────────────────────────────

    const reset = () => {
      settings.value = null

      loading.value = false

      updateLoading.value = false

      error.value = null

      isFetched.value = false
    }

    // ─────────────────────────────────────
    // Return
    // ─────────────────────────────────────

    return {
      settings,

      loading,
      updateLoading,

      error,
      isFetched,

      fetchSettings,
      saveSettings,

      reset,
    }
  }
)