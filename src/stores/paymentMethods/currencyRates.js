// stores/paymentMethods/currencyRates.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useCurrencyRatesStore = defineStore('currencyRates', () => {
  const snackbar = useSnackbarStore()

  // State
  const records = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const togglingId = ref(null)
  const deletingId = ref(null)
  const error = ref(null)
  const isFetched = ref(false)

  // Getters / Computed
  const activeRecords = computed(() => records.value.filter((r) => r.is_active))
  const inactiveRecords = computed(() => records.value.filter((r) => !r.is_active))
  const totalCount = computed(() => records.value.length)
  const activeCount = computed(() => activeRecords.value.length)

  // Fetch Currency Rates
  const fetchCurrencyRates = (filterActive = null, force = false) => {
    if (isFetched.value && !force && filterActive === null) {
      return Promise.resolve(records.value)
    }

    loading.value = true
    error.value = null

    const params = {}
    if (filterActive !== null && filterActive !== undefined && filterActive !== '') {
      params.is_active = filterActive
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        records.value = Array.isArray(res?.data) ? res.data : []
        isFetched.value = true
        loading.value = false
        resolve(records.value)
      }

      const failureHandler = (err) => {
        loading.value = false
        error.value = err
        const msg = err?.message || 'Failed to fetch currency rates.'
        snackbar.show(msg, 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.GET, urls.currencyRates.list, {
        params,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Create Currency Rate
  const createCurrencyRate = (payload) => {
    submitting.value = true
    error.value = null

    // Format payload cleanly for the API
    const formattedPayload = {
      currency: (payload.currency || '').trim().toUpperCase(),
      deposit_units_per_usd: Number(payload.deposit_units_per_usd),
      withdrawal_units_per_usd: payload.withdrawal_units_per_usd ? Number(payload.withdrawal_units_per_usd) : Number(payload.deposit_units_per_usd),
      label: (payload.label || '').trim(),
      description: (payload.description || '').trim(),
      is_active: Boolean(payload.is_active ?? true),
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate created successfully.', 'success')
        submitting.value = false
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        submitting.value = false
        error.value = err
        const msg = err?.message || 'Failed to create currency rate.'
        snackbar.show(msg, 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, urls.currencyRates.create, {
        data: formattedPayload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Update Currency Rate
  const updateCurrencyRate = (id, payload) => {
    submitting.value = true
    error.value = null

    const formattedPayload = {}
    if (payload.currency !== undefined) formattedPayload.currency = (payload.currency || '').trim().toUpperCase()
    if (payload.deposit_units_per_usd !== undefined) formattedPayload.deposit_units_per_usd = Number(payload.deposit_units_per_usd)
    if (payload.withdrawal_units_per_usd !== undefined) formattedPayload.withdrawal_units_per_usd = Number(payload.withdrawal_units_per_usd)
    if (payload.label !== undefined) formattedPayload.label = (payload.label || '').trim()
    if (payload.description !== undefined) formattedPayload.description = (payload.description || '').trim()
    if (payload.is_active !== undefined) formattedPayload.is_active = Boolean(payload.is_active)

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate updated successfully.', 'success')
        submitting.value = false
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        submitting.value = false
        error.value = err
        const msg = err?.message || 'Failed to update currency rate.'
        snackbar.show(msg, 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.PUT, urls.currencyRates.update, {
        look_up_key: id,
        data: formattedPayload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Toggle Currency Rate Active / Inactive
  const toggleCurrencyRate = (rate) => {
    if (!rate || !rate.id) return Promise.reject(new Error('Invalid rate object'))
    togglingId.value = rate.id

    const nextActive = !rate.is_active
    const payload = {
      is_active: nextActive,
    }

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(
          res?.message || `Currency rate ${nextActive ? 'activated' : 'deactivated'} successfully.`,
          'success'
        )
        togglingId.value = null
        // Optimistic local update
        const index = records.value.findIndex((r) => r.id === rate.id)
        if (index !== -1) {
          records.value[index] = { ...records.value[index], is_active: nextActive }
        }
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        togglingId.value = null
        error.value = err
        const msg = err?.message || `Failed to ${nextActive ? 'activate' : 'deactivate'} currency rate.`
        snackbar.show(msg, 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.PUT, urls.currencyRates.update, {
        look_up_key: rate.id,
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  // Delete Currency Rate
  const deleteCurrencyRate = (id) => {
    deletingId.value = id
    error.value = null

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(res?.message || 'Currency rate deleted successfully.', 'success')
        deletingId.value = null
        // Remove locally
        records.value = records.value.filter((r) => r.id !== id)
        fetchCurrencyRates(null, true)
        resolve(res)
      }

      const failureHandler = (err) => {
        deletingId.value = null
        error.value = err
        const msg = err?.message || 'Failed to delete currency rate.'
        snackbar.show(msg, 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.DELETE, urls.currencyRates.delete, {
        look_up_key: id,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const reset = () => {
    records.value = []
    loading.value = false
    submitting.value = false
    togglingId.value = null
    deletingId.value = null
    error.value = null
    isFetched.value = false
  }

  return {
    records,
    loading,
    submitting,
    togglingId,
    deletingId,
    error,
    isFetched,
    activeRecords,
    inactiveRecords,
    totalCount,
    activeCount,
    fetchCurrencyRates,
    createCurrencyRate,
    updateCurrencyRate,
    toggleCurrencyRate,
    deleteCurrencyRate,
    reset,
  }
})
