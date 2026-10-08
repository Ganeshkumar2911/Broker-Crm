// /stores/ibTree/ibTree.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useIbTreeStore = defineStore('ibTree', () => {
  const data = ref([])
  const isLoading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)
  const isFetched = ref(false)
  const searchQuery = ref('')

  const snackbar = useSnackbarStore()

  // ─── Fetch Tree
  const fetchIbTree = (force = false) => {
    if (isFetched.value && !force) return

    isLoading.value = true

    const successHandler = (res) => {
      data.value = res?.data || []
      isLoading.value = false
      isFetched.value = true
    }

    const failureHandler = (err) => {
      isLoading.value = false
      error.value = err
      snackbar.show(err?.error || 'Something went wrong.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.ibTree.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // ─── Create / Edit IB or SubIB
  const saveIb = ({ email, password, split_percentage, parent_ib_id = null, ib_id = null }) => {
    actionLoading.value = true

    const payload = {
      email,
      split_percentage,
    }

    if (password) payload.password = password
    if (parent_ib_id) payload.parent_ib_id = parent_ib_id

    const successHandler = () => {
      actionLoading.value = false
      fetchIbTree(true) // force refresh
    }

    const failureHandler = (err) => {
      actionLoading.value = false
      snackbar.show(err?.error || 'Something went wrong.', 'error')
    }

    if (ib_id) {
      apiRequest(urls.KEYS.PUT, urls.ibTree.update, {
        look_up_key: ib_id,
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    } else {
      apiRequest(urls.KEYS.POST, urls.ibTree.create, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      })
    }
  }

  // ─── Convert Client to IB
  const createIbFromClient = ({ clientId, parentIbId, splitPercentage, affiliatePassword }) => {
    actionLoading.value = true

    const payload = {
      parent_ib_id: parentIbId,
      split_percentage: Number(splitPercentage),
      affiliate_password: affiliatePassword.trim(),
    }

    const successHandler = () => {
      actionLoading.value = false
      snackbar.show('Client successfully converted to IB.', 'success')
      fetchIbTree(true) // force refresh
    }

    const failureHandler = (err) => {
      actionLoading.value = false
      snackbar.show(err?.message || err?.error || 'Failed to convert client to IB.', 'error')
    }

    return new Promise((resolve, reject) => {
      apiRequest(
        urls.KEYS.POST,
        `${urls.clientList.createIB}/${clientId}`,
        {
          data: payload,
          isTokenRequired: true,
          onSuccess: (res) => {
            successHandler()
            resolve(res)
          },
          onFailure: (err) => {
            failureHandler(err)
            reject(err)
          },
        }
      )
    })
  }

  const reset = () => {
    data.value = []
    isLoading.value = false
    actionLoading.value = false
    error.value = null
    isFetched.value = false
    searchQuery.value = ''
  }

  return {
    data,
    isLoading,
    actionLoading,
    error,
    isFetched,
    searchQuery,
    fetchIbTree,
    saveIb,
    createIbFromClient,
    reset,
  }
})
