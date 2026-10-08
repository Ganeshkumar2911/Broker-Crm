import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useLeadStageStore = defineStore('leadStage', () => {
  const snackbar = useSnackbarStore()

  // State
  const stages = ref([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)
  const isFetched = ref(false)
  let inFlightPromise = null

  // Actions
  const fetchStages = (force = false) => {
    if (isFetched.value && !force) {
      return Promise.resolve(stages.value)
    }
    if (inFlightPromise) {
      return inFlightPromise
    }

    loading.value = true
    error.value = null

    inFlightPromise = new Promise((resolve, reject) => {
      const successHandler = (res) => {
        inFlightPromise = null
        loading.value = false
        isFetched.value = true
        // Handle response data - array of stages
        let dataList = []
        if (Array.isArray(res?.data)) {
          dataList = res.data
        } else if (Array.isArray(res)) {
          dataList = res
        } else if (res?.data?.stages && Array.isArray(res.data.stages)) {
          dataList = res.data.stages
        }

        // Sort stages by display_order ascending
        stages.value = dataList.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        resolve(stages.value)
      }

      const failureHandler = (err) => {
        inFlightPromise = null
        loading.value = false
        error.value = err
        snackbar.show(err?.message || err?.response?.data?.message || 'Failed to fetch lead stages', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.GET, urls.lead.stages, {
        isTokenRequired: true,
        params: { show_count: true },
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })

    return inFlightPromise
  }

  const createStage = (payload) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false
        snackbar.show(res?.message || res?.data?.message || 'Stage created successfully', 'success')
        fetchStages(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        actionLoading.value = false
        snackbar.show(err?.response?.data?.message || err?.message || 'Failed to create stage', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.POST, urls.lead.stages, {
        isTokenRequired: true,
        data: {
          code: payload.code,
          name: payload.name,
          description: payload.description ?? '',
          display_order: Number(payload.display_order) || 1,
          color: payload.color || '#3B82F6',
          is_active: Boolean(payload.is_active),
          is_system: Boolean(payload.is_system),
        },
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const updateStage = (stageId, payload) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false
        snackbar.show(res?.message || res?.data?.message || 'Stage updated successfully', 'success')
        fetchStages(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        actionLoading.value = false
        snackbar.show(err?.response?.data?.message || err?.message || 'Failed to update stage', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.PATCH, urls.lead.stages, {
        look_up_key: stageId,
        isTokenRequired: true,
        data: payload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  const deleteStage = (stageId) => {
    actionLoading.value = true

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false
        snackbar.show(res?.message || res?.data?.message || 'Stage deleted successfully', 'success')
        fetchStages(true)
        resolve(res)
      }

      const failureHandler = (err) => {
        actionLoading.value = false
        snackbar.show(err?.response?.data?.message || err?.message || 'Failed to delete stage', 'error')
        reject(err)
      }

      apiRequest(urls.KEYS.DELETE, urls.lead.stages, {
        look_up_key: stageId,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    })
  }

  return {
    stages,
    loading,
    actionLoading,
    error,
    isFetched,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
  }
})
