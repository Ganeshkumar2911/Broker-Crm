import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

// Normalizer for template response data from live backend API
export const normalizeTemplate = (raw) => {
  if (!raw) return null

  let header = raw.header_text || raw.header || ''
  let headerType = raw.header_format ? raw.header_format.toLowerCase() : (raw.header_type || (raw.header_text || raw.header ? 'text' : 'none'))
  let bodyText = raw.body_text || raw.body || ''
  let footerText = raw.footer_text || raw.footer || ''
  let buttons = raw.buttons || []
  let bodyExample = raw.body_example || {}

  // Extract from components array if present (Meta / DoubleTick API structure)
  if (Array.isArray(raw.components)) {
    const headerComp = raw.components.find((c) => c.type === 'HEADER')
    if (headerComp) {
      header = headerComp.text || ''
      headerType = headerComp.format ? headerComp.format.toLowerCase() : 'text'
    }

    const bodyComp = raw.components.find((c) => c.type === 'BODY')
    if (bodyComp) {
      bodyText = bodyComp.text || ''
    }

    const footerComp = raw.components.find((c) => c.type === 'FOOTER')
    if (footerComp) {
      footerText = footerComp.text || ''
    }

    const buttonComp = raw.components.find((c) => c.type === 'BUTTON')
    if (buttonComp) {
      buttons = buttonComp.buttons || []
    }
  }

  // Derive channels/waba display dynamically
  let channels = []
  if (Array.isArray(raw.channels) && raw.channels.length > 0) {
    channels = raw.channels
  } else if (typeof raw.channels === 'string' && raw.channels) {
    channels = [raw.channels]
  } else if (raw.wabaPhoneNumber) {
    channels = [`+${raw.wabaPhoneNumber}`]
  } else if (raw.waba_phone_number) {
    channels = [`+${raw.waba_phone_number}`]
  }

  return {
    id: raw.id ?? `tpl_${Date.now()}`,
    name: raw.name || '',
    category: (raw.category || 'MARKETING').toUpperCase(),
    language: raw.language || 'en',
    status: (raw.status || 'PENDING').toUpperCase(),
    created_by: raw.createdBy || raw.created_by || '',
    rejected_reason: raw.rejectedReason || raw.rejected_reason || null,
    waba_phone_number: raw.wabaPhoneNumber || raw.waba_phone_number || '',
    channels,
    created_at: raw.createdAt || raw.created_at || raw.date_created || '',
    updated_at: raw.updatedAt || raw.updated_at || raw.date_updated || '',
    last_used_at: raw.lastUsedAt || raw.last_used_at || '',
    header,
    header_text: header,
    header_format: headerType === 'text' ? 'TEXT' : 'NONE',
    header_type: headerType,
    body_text: bodyText,
    body_example: bodyExample,
    footer_text: footerText,
    buttons,
    components: raw.components || [],
  }
}

export const useWhatsAppTemplatesStore = defineStore('whatsappTemplates', () => {
  const snackbar = useSnackbarStore()

  // ─────────────────────────────────────
  // State (Initialized empty, 100% dynamic from API)
  // ─────────────────────────────────────
  const templates = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  })

  const filters = reactive({
    category: '', // 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
    status: 'ALL', // 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED'
  })

  // ─────────────────────────────────────
  // Computed
  // ─────────────────────────────────────
  const filteredTemplates = computed(() => {
    let list = templates.value.filter((item) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase().trim()
        const nameMatch = item.name?.toLowerCase().includes(query)
        const idMatch = String(item.id)?.toLowerCase().includes(query)
        const bodyMatch = item.body_text?.toLowerCase().includes(query)
        const headerMatch = item.header?.toLowerCase().includes(query)
        const createdByMatch = item.created_by?.toLowerCase().includes(query)
        const categoryMatch = item.category?.toLowerCase().includes(query)
        const wabaMatch = item.waba_phone_number?.toLowerCase().includes(query)
        if (!nameMatch && !idMatch && !bodyMatch && !headerMatch && !createdByMatch && !categoryMatch && !wabaMatch) {
          return false
        }
      }

      // Category
      if (
        filters.category &&
        filters.category !== 'All categories' &&
        filters.category !== 'All' &&
        filters.category !== 'ALL'
      ) {
        if (item.category?.toUpperCase() !== filters.category.toUpperCase()) return false
      }

      // Status
      if (
        filters.status &&
        filters.status !== 'All status' &&
        filters.status !== 'All' &&
        filters.status !== 'ALL'
      ) {
        if (item.status?.toUpperCase() !== filters.status.toUpperCase()) return false
      }

      return true
    })

    // Sorting
    if (filters.sort === 'NEWEST') {
      list = [...list].sort((a, b) => {
        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        if (idA && idB) return idB - idA
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
    } else if (filters.sort === 'OLDEST') {
      list = [...list].sort((a, b) => {
        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        if (idA && idB) return idA - idB
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      })
    } else if (filters.sort === 'NAME_ASC') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (filters.sort === 'NAME_DESC') {
      list = [...list].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    }

    return list
  })

  const paginatedTemplates = computed(() => {
    const list = filteredTemplates.value
    pagination.total = list.length
    pagination.pages = Math.max(1, Math.ceil(list.length / pagination.per_page))

    const start = (pagination.page - 1) * pagination.per_page
    return list.slice(start, start + pagination.per_page)
  })

  const paginationObj = computed(() => ({
    page: pagination.page,
    per_page: pagination.per_page,
    total_items: pagination.total,
    total_pages: pagination.pages,
  }))

  const updatePerPage = (val) => {
    pagination.per_page = Number(val) || 10
    pagination.page = 1
  }

  // ─────────────────────────────────────
  // Actions
  // ─────────────────────────────────────
  const fetchTemplates = (force = false, customParams = null) => {
    loading.value = true

    // 1. Resolve status (by default 'ALL', supports 'APPROVED', 'REJECTED', 'PENDING', 'PAUSED', 'ALL')
    let statusParam = 'ALL'
    if (
      filters.status &&
      filters.status !== 'All status' &&
      filters.status !== 'All' &&
      filters.status !== 'null' &&
      filters.status !== ''
    ) {
      statusParam = filters.status.toUpperCase()
    }

    // 2. Resolve category ('MARKETING', 'UTILITY' or omitted if all)
    let categoryParam = null
    if (
      filters.category &&
      filters.category !== 'All categories' &&
      filters.category !== 'All' &&
      filters.category !== 'null' &&
      filters.category !== ''
    ) {
      categoryParam = filters.category.toUpperCase()
    }

    const queryParams = {
      status: statusParam,
      ...(categoryParam ? { category: categoryParam } : {}),
      ...(customParams || {}),
    }

    return new Promise((resolve) => {
      apiRequest(urls.KEYS.GET, urls.whatsapp.templates, {
        params: queryParams,
        isTokenRequired: true,
        onSuccess: (res) => {
          let rawList = []
          if (Array.isArray(res)) {
            rawList = res
          } else if (res?.data && Array.isArray(res.data)) {
            rawList = res.data
          } else if (res?.templates && Array.isArray(res.templates)) {
            rawList = res.templates
          } else if (res?.items && Array.isArray(res.items)) {
            rawList = res.items
          }

          templates.value = rawList.map(normalizeTemplate).filter(Boolean)
          loading.value = false
          resolve(templates.value)
        },
        onFailure: (err) => {
          console.error('WhatsApp templates API error:', err)
          templates.value = []
          loading.value = false
          snackbar.show(err?.message || 'Failed to fetch templates from WhatsApp API', 'error')
          resolve([])
        },
      })
    })
  }

  const createTemplate = (payload) => {
    saving.value = true

    // Format strictly expected backend payload:
    // {
    //   "name": "vivek_test",
    //   "category": "UTILITY",
    //   "body_text": "Hello {{username}} welcome to {{or_name}} we are here to help you.",
    //   "body_example": {
    //     "username": "Rahul",
    //     "or_name": "Panther Capital"
    //   },
    //   "header_text": "Vivek Header",
    //   "header_format": "TEXT",
    //   "footer_text": "panther capital"
    // }
    const templatePayload = {
      name: payload.name?.trim().toLowerCase().replace(/\s+/g, '_'),
      category: payload.category?.toUpperCase() || 'MARKETING',
      body_text: payload.body_text || payload.body || '',
      body_example: payload.body_example && typeof payload.body_example === 'object' ? payload.body_example : {},
      header_text: payload.header_text ?? payload.header ?? '',
      header_format: payload.header_format || (payload.header_text || payload.header ? 'TEXT' : 'NONE'),
      footer_text: payload.footer_text ?? payload.footer ?? '',
    }

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.whatsapp.createTemplate, {
        data: templatePayload,
        isTokenRequired: true,
        onSuccess: async (res) => {
          saving.value = false
          snackbar.show(res?.message || 'Template created successfully!', 'success')
          await fetchTemplates(true)
          resolve(res)
        },
        onFailure: (err) => {
          saving.value = false
          snackbar.show(err?.message || 'Failed to create template', 'error')
          reject(err)
        },
      })
    })
  }

  const deleteTemplate = (id) => {
    deleting.value = true
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.DELETE, urls.whatsapp.deleteTemplate, {
        look_up_key: id,
        isTokenRequired: true,
        onSuccess: (res) => {
          templates.value = templates.value.filter((t) => t.id !== id)
          deleting.value = false
          snackbar.show(res?.message || 'Template deleted successfully', 'success')
          resolve(true)
        },
        onFailure: (err) => {
          deleting.value = false
          snackbar.show(err?.message || 'Failed to delete template', 'error')
          reject(err)
        },
      })
    })
  }

  const resetFilters = () => {
    filters.category = ''
    filters.status = 'ALL'
    fetchTemplates(true)
  }

  return {
    templates,
    filteredTemplates,
    paginatedTemplates,
    loading,
    saving,
    deleting,
    pagination,
    paginationObj,
    updatePerPage,
    filters,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    resetFilters,
  }
})
