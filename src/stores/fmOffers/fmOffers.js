import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const useFmOffersStore = defineStore('fmOffers', () => {
  const offers        = ref([])
  const joinLinks     = ref([])
  const agents        = ref([])
  const agentsSummary = ref({ remaining_share: 0, total_share: 0 })

  const loading            = ref(false)
  const linksLoading       = ref(false)
  const agentsLoading      = ref(false)
  const createLoading      = ref(false)
  const updateLoading      = ref(false)
  const createLinkLoading  = ref(false)
  const updateLinkLoading  = ref(false)
  const deleteLinkLoading  = ref(false)
  const createAgentLoading = ref(false)
  const updateAgentLoading = ref(false)
  const deleteAgentLoading = ref(false)

  const error     = ref(null)
  const isFetched = ref(false)

  const snackbar = useSnackbarStore()

  const fetchOffers = (fmId, force = false) => {
    if (!fmId) return
    if (isFetched.value && !force) return
    loading.value = true

    apiRequest(urls.KEYS.GET, `${urls.fm.offers}/${fmId}`, {
      isTokenRequired: true,
      onSuccess: (res) => {
        offers.value   = res?.data || []
        loading.value  = false
        isFetched.value = true
      },
      onFailure: (err) => {
        loading.value = false
        error.value   = err
        snackbar.show(err?.message || 'Failed to load offers.', 'error')
      },
    })
  }

  const createOffer = (payload, fmId, onDone) => {
    let callback = onDone
    let targetFmId = fmId
    if (typeof fmId === 'function') {
      callback = fmId
      targetFmId = payload?.fm_id || null
    }

    createLoading.value = true
    const endpoint = targetFmId ? `${urls.fm.offers}/${targetFmId}` : urls.fm.offers

    apiRequest(urls.KEYS.POST, endpoint, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        createLoading.value = false
        snackbar.show('Offer created successfully.', 'success')
        if (targetFmId) {
          fetchOffers(targetFmId, true)
        }
        callback?.()
      },
      onFailure: (err) => {
        createLoading.value = false
        snackbar.show(err?.message || 'Failed to create offer.', 'error')
      },
    })
  }

  const updateOffer = (offerId, payload, onDone, onFinally) => {
    updateLoading.value = true
    apiRequest(urls.KEYS.PUT, urls.fm.offers, {
      look_up_key: offerId,
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        updateLoading.value = false
        snackbar.show('Offer updated successfully.', 'success')
        fetchOffers(null, true)
        onDone?.()
      },
      onFailure: (err) => {
        updateLoading.value = false
        snackbar.show(err?.message || 'Failed to update offer.', 'error')
      },
      onFinally,
    })
  }

  const fetchJoinLinks = (offerId) => {
    linksLoading.value = true
    const url = urls.fm.offerJoinLinks ? `${urls.fm.offerJoinLinks}/${offerId}` : `/offers/join-links/${offerId}`
    apiRequest(urls.KEYS.GET, url, {
      isTokenRequired: true,
      onSuccess: (res) => {
        joinLinks.value    = res?.data || []
        linksLoading.value = false
      },
      onFailure: (err) => {
        linksLoading.value = false
        snackbar.show(err?.message || 'Failed to fetch join links.', 'error')
      },
    })
  }

  const createJoinLink = (offerId, payload, onDone) => {
    createLinkLoading.value = true
    const url = urls.fm.offerJoinLinks ? `${urls.fm.offerJoinLinks}/${offerId}` : `/offers/join-links/${offerId}`
    apiRequest(urls.KEYS.POST, url, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        createLinkLoading.value = false
        snackbar.show('Link created successfully.', 'success')
        fetchJoinLinks(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        createLinkLoading.value = false
        snackbar.show(err?.message || 'Failed to create link.', 'error')
      },
    })
  }

  const updateJoinLink = (offerId, linkId, payload, onDone) => {
    updateLinkLoading.value = true
    const url = urls.fm.offerJoinLinks ? `${urls.fm.offerJoinLinks}/${linkId}` : `/offers/join-links/${linkId}`
    apiRequest(urls.KEYS.PUT, url, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        updateLinkLoading.value = false
        snackbar.show('Link updated successfully.', 'success')
        fetchJoinLinks(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        updateLinkLoading.value = false
        snackbar.show(err?.message || 'Failed to update link.', 'error')
      },
    })
  }

  const deleteJoinLink = (offerId, linkId, onDone) => {
    deleteLinkLoading.value = true
    const url = urls.fm.offerJoinLinks ? `${urls.fm.offerJoinLinks}/${linkId}` : `/offers/join-links/${linkId}`
    apiRequest(urls.KEYS.DELETE, url, {
      isTokenRequired: true,
      onSuccess: () => {
        deleteLinkLoading.value = false
        snackbar.show('Link deleted successfully.', 'success')
        fetchJoinLinks(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        deleteLinkLoading.value = false
        snackbar.show(err?.message || 'Failed to delete link.', 'error')
        onDone?.()
      },
    })
  }

  const fetchAgents = (offerId) => {
    agentsLoading.value = true
    const url = urls.fm.offerAgents ? `${urls.fm.offerAgents}/${offerId}` : `/offers/agents/${offerId}`
    apiRequest(urls.KEYS.GET, url, {
      isTokenRequired: true,
      onSuccess: (res) => {
        agents.value        = res?.data || []
        agentsSummary.value = res?.summary || { remaining_share: 0, total_share: 0 }
        agentsLoading.value = false
      },
      onFailure: (err) => {
        agentsLoading.value = false
        snackbar.show(err?.message || 'Failed to fetch agents.', 'error')
      },
    })
  }

  const createAgent = (offerId, payload, onDone) => {
    createAgentLoading.value = true
    const url = urls.fm.offerAgents ? `${urls.fm.offerAgents}/${offerId}` : `/offers/agents/${offerId}`
    apiRequest(urls.KEYS.POST, url, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        createAgentLoading.value = false
        snackbar.show('Agent added successfully.', 'success')
        fetchAgents(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        createAgentLoading.value = false
        snackbar.show(err?.message || 'Failed to add agent.', 'error')
      },
    })
  }

  const updateAgent = (offerId, agentId, payload, onDone) => {
    updateAgentLoading.value = true
    const url = urls.fm.offerAgents ? `${urls.fm.offerAgents}/${agentId}` : `/offers/agents/${agentId}`
    apiRequest(urls.KEYS.PUT, url, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        updateAgentLoading.value = false
        snackbar.show('Agent updated successfully.', 'success')
        fetchAgents(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        updateAgentLoading.value = false
        snackbar.show(err?.message || 'Failed to update agent.', 'error')
        onDone?.()
      },
    })
  }

  const deleteAgent = (offerId, agentId, onDone) => {
    deleteAgentLoading.value = true
    const url = urls.fm.offerAgents ? `${urls.fm.offerAgents}/${agentId}` : `/offers/agents/${agentId}`
    apiRequest(urls.KEYS.DELETE, url, {
      isTokenRequired: true,
      onSuccess: () => {
        deleteAgentLoading.value = false
        snackbar.show('Agent deleted successfully.', 'success')
        fetchAgents(offerId)
        onDone?.()
      },
      onFailure: (err) => {
        deleteAgentLoading.value = false
        snackbar.show(err?.message || 'Failed to delete agent.', 'error')
        onDone?.()
      },
    })
  }

  const reset = () => {
    offers.value        = []
    joinLinks.value     = []
    agents.value        = []
    agentsSummary.value = { remaining_share: 0, total_share: 0 }
    loading.value       = false
    linksLoading.value  = false
    agentsLoading.value = false
    createLoading.value = false
    updateLoading.value = false
    createLinkLoading.value = false
    updateLinkLoading.value = false
    deleteLinkLoading.value = false
    createAgentLoading.value = false
    updateAgentLoading.value = false
    deleteAgentLoading.value = false
    error.value         = null
    isFetched.value     = false
  }

  return {
    offers, joinLinks, agents, agentsSummary,
    loading, linksLoading, agentsLoading,
    createLoading, updateLoading, createLinkLoading, updateLinkLoading, deleteLinkLoading,
    createAgentLoading, updateAgentLoading, deleteAgentLoading,
    error, isFetched,
    fetchOffers, createOffer, updateOffer,
    fetchJoinLinks, createJoinLink, updateJoinLink, deleteJoinLink,
    fetchAgents, createAgent, updateAgent, deleteAgent,
    reset,
  }
})
