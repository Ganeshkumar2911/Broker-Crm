import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useIbReferralLinksStore = defineStore('ibReferralLinks', () => {
  const snackbar = useSnackbarStore()

  // State
  const records = ref([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)

  const categories = ref([])
  const categoriesLoading = ref(false)

  const groups = ref([])
  const groupsLoading = ref(false)

  // Fetch Referral Links for target IB
  const fetchReferralLinks = (ibId) => {
    loading.value = true
    error.value = null

    const successHandler = (res) => {
      records.value = res?.data || []
      loading.value = false
    }

    const failureHandler = (err) => {
      loading.value = false
      error.value = err
      snackbar.show(err?.message || 'Failed to fetch referral links.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.referralLinks.list, {
      isTokenRequired: true,
      look_up_key: ibId,
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Fetch Categories
  const fetchCategories = () => {
    categoriesLoading.value = true

    const successHandler = (res) => {
      categories.value = res?.data || []
      categoriesLoading.value = false
    }

    const failureHandler = (err) => {
      categoriesLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch account categories.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.groupConfig.categories, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Fetch MT5 groups under target category/type
  const fetchGroupsForCategory = (category, type, status = 'all') => {
    groupsLoading.value = true
    groups.value = []

    const successHandler = (res) => {
      groups.value = res?.data || []
      groupsLoading.value = false
    }

    const failureHandler = (err) => {
      groupsLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch MT5 groups for category.', 'error')
    }

    apiRequest(urls.KEYS.GET, urls.groupConfig.groups, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        status: status,
        account_category: category,
        account_type: type,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Create Campaign Referral Link
  const createReferralLink = (ibId, payload, onSuccess) => {
    actionLoading.value = true

    const successHandler = (res) => {
      actionLoading.value = false
      snackbar.show(res?.message || 'Referral campaign created successfully.', 'success')
      fetchReferralLinks(ibId) // refresh list
      if (onSuccess) onSuccess()
    }

    const failureHandler = (err) => {
      actionLoading.value = false
      snackbar.show(err?.message || 'Failed to create referral campaign.', 'error')
    }

    apiRequest(urls.KEYS.POST, urls.referralLinks.create, {
      isTokenRequired: true,
      look_up_key: ibId,
      data: {
        name: payload.name,
        code: payload.code,
        description: payload.description,
        broker_group_config_ids: payload.broker_group_config_ids,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Update Campaign Referral Link
  const updateReferralLink = (ibId, linkId, payload, onSuccess) => {
    actionLoading.value = true

    const successHandler = (res) => {
      actionLoading.value = false
      snackbar.show(res?.message || 'Referral campaign updated successfully.', 'success')
      fetchReferralLinks(ibId) // refresh list
      if (onSuccess) onSuccess()
    }

    const failureHandler = (err) => {
      actionLoading.value = false
      snackbar.show(err?.message || 'Failed to update referral campaign.', 'error')
    }

    apiRequest(urls.KEYS.PUT, urls.referralLinks.update, {
      isTokenRequired: true,
      look_up_key: linkId,
      data: {
        name: payload.name,
        broker_group_config_ids: payload.broker_group_config_ids,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    })
  }

  // Reset
  const reset = () => {
    records.value = []
    loading.value = false
    actionLoading.value = false
    error.value = null
    categories.value = []
    groups.value = []
    categoriesLoading.value = false
    groupsLoading.value = false
  }

  return {
    records,
    loading,
    actionLoading,
    error,
    categories,
    categoriesLoading,
    groups,
    groupsLoading,
    fetchReferralLinks,
    fetchCategories,
    fetchGroupsForCategory,
    createReferralLink,
    updateReferralLink,
    reset,
  }
})
