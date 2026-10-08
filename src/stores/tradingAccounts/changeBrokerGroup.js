import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useChangeBrokerGroupStore = defineStore('changeBrokerGroup', () => {
  const snackbar = useSnackbarStore()

  const categories = ref([])
  const categoriesLoading = ref(false)

  const mt5Groups = ref([])
  const mt5GroupsLoading = ref(false)

  const submitting = ref(false)
  const error = ref(null)

  const fetchCategories = (search = '') => {
    categoriesLoading.value = true
    error.value = null

    apiRequest(urls.KEYS.GET, urls.groupConfig.categories, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        search,
      },
      onSuccess: (res) => {
        categories.value = res?.data || []
        categoriesLoading.value = false
      },
      onFailure: (err) => {
        categoriesLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to fetch account categories.', 'error')
      },
    })
  }

  const fetchMt5Groups = (accountCategory, accountType = 'live') => {
    if (!accountCategory) {
      mt5Groups.value = []
      return
    }

    mt5GroupsLoading.value = true
    error.value = null

    apiRequest(urls.KEYS.GET, urls.groupConfig.groups, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        status: 'all',
        account_category: accountCategory,
        account_type: accountType,
      },
      onSuccess: (res) => {
        mt5Groups.value = res?.data || []
        mt5GroupsLoading.value = false
      },
      onFailure: (err) => {
        mt5GroupsLoading.value = false
        error.value = err
        snackbar.show(err?.message || 'Failed to fetch group configurations.', 'error')
      },
    })
  }

  const changeBrokerGroup = (payload, onSuccess, onFailure) => {
    if (!payload?.user_id || !payload?.trading_account_id || !payload?.broker_group) {
      snackbar.show('Missing required fields for changing broker group.', 'error')
      return
    }

    submitting.value = true
    error.value = null

    apiRequest(urls.KEYS.POST, urls.tradingAccounts.changeBrokerGroup, {
      isTokenRequired: true,
      data: {
        user_id: Number(payload.user_id),
        trading_account_id: Number(payload.trading_account_id),
        broker_group: payload.broker_group,
      },
      onSuccess: (res) => {
        submitting.value = false
        snackbar.show(res?.message || 'Broker group changed successfully.', 'success')
        if (onSuccess) onSuccess(res)
      },
      onFailure: (err) => {
        submitting.value = false
        error.value = err
        snackbar.show(err?.message || err?.error || 'Failed to change broker group.', 'error')
        if (onFailure) onFailure(err)
      },
    })
  }

  const reset = () => {
    categories.value = []
    categoriesLoading.value = false
    mt5Groups.value = []
    mt5GroupsLoading.value = false
    submitting.value = false
    error.value = null
  }

  return {
    categories,
    categoriesLoading,
    mt5Groups,
    mt5GroupsLoading,
    submitting,
    error,

    fetchCategories,
    fetchMt5Groups,
    changeBrokerGroup,
    reset,
  }
})
