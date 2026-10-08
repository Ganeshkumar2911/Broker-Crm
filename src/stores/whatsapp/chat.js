import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

export const cleanPhoneNumber = (phone) => {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}

export const formatMessageTime = (time) => {
  if (!time) return ''
  try {
    const d = new Date(Number(time))
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch (_) {
    return ''
  }
}

export const formatMessageDate = (time) => {
  if (!time) return 'Today'
  try {
    const d = new Date(Number(time))
    if (isNaN(d.getTime())) return 'Today'

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'

    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (_) {
    return 'Today'
  }
}

export const isMessageIncoming = (m, raw = {}) => {
  if (!m && !raw) return false

  // 1. Explicit boolean flag if present
  if (typeof m.isIncoming === 'boolean') return m.isIncoming
  if (typeof raw.isIncoming === 'boolean') return raw.isIncoming
  if (typeof m.from_customer === 'boolean') return m.from_customer
  if (typeof raw.from_customer === 'boolean') return raw.from_customer

  const originType = String(
    m.messageOriginType ||
    m.originType ||
    m.message_origin_type ||
    raw.messageOriginType ||
    raw.originType ||
    ''
  ).trim().toUpperCase()

  const direction = String(
    m.direction ||
    m.messageDirection ||
    raw.direction ||
    ''
  ).trim().toLowerCase()

  const senderType = String(
    m.senderType ||
    m.sender_type ||
    raw.senderType ||
    ''
  ).trim().toLowerCase()

  const senderId = String(
    m.senderId ||
    m.sender_id ||
    raw.senderId ||
    ''
  ).trim()

  const hasSenderUser = Boolean(
    (m.senderUser && typeof m.senderUser === 'object' && m.senderUser.id) ||
    (raw.senderUser && typeof raw.senderUser === 'object' && raw.senderUser.id)
  )

  // 2. Customer / Inbound checks:
  if (
    originType === 'CUSTOMER' ||
    originType === 'CLIENT' ||
    senderType === 'customer' ||
    senderType === 'client' ||
    direction === 'inbound' ||
    direction === 'incoming' ||
    direction === 'in'
  ) {
    return true
  }

  // 3. Business / Outbound checks:
  if (
    originType === 'USER' ||
    originType === 'BUSINESS' ||
    originType === 'BOT' ||
    originType === 'ADMIN' ||
    originType === 'AGENT' ||
    senderType === 'user' ||
    senderType === 'agent' ||
    senderType === 'bot' ||
    senderType === 'admin' ||
    direction === 'outbound' ||
    direction === 'outgoing' ||
    direction === 'out' ||
    hasSenderUser ||
    senderId.startsWith('user_')
  ) {
    return false
  }

  // 4. Fallbacks
  if (senderId.startsWith('customer_')) {
    return true
  }

  const sentCount = Number(m.sentCount ?? raw.sentCount ?? 0)
  if (sentCount > 0) {
    return false
  }

  if (m.receivedAt || raw.receivedAt) {
    return true
  }

  return false
}

export const normalizeMessage = (raw, dtCustId = null, currentPhone = '') => {
  if (!raw) return null

  // If wrapped in { data: ... } or { payload: ... }
  let m = raw
  if (m.data && typeof m.data === 'object' && !Array.isArray(m.data)) {
    m = m.data
  }
  if (m.payload && typeof m.payload === 'object' && !Array.isArray(m.payload)) {
    m = m.payload
  }
  // Only unwrap m.message if m does NOT have id/messageOriginType/senderId/dtMessageId and m.message DOES
  if (
    !m.id &&
    !m.dtMessageId &&
    !m.messageOriginType &&
    !m.senderId &&
    m.message &&
    typeof m.message === 'object' &&
    (m.message.id || m.message.dtMessageId || m.message.messageOriginType || m.message.senderId)
  ) {
    m = m.message
  }

  const isIncoming = isMessageIncoming(m, raw)

  const originType = isIncoming
    ? 'CUSTOMER'
    : String(
        m.messageOriginType ||
        m.originType ||
        raw.messageOriginType ||
        raw.originType ||
        'USER'
      ).trim().toUpperCase()

  const senderId = String(
    m.senderId ||
    m.sender_id ||
    m.sender ||
    m.from ||
    m.senderUser?.id ||
    raw.senderId ||
    raw.sender_id ||
    ''
  ).trim()

  // Extract text content cleanly across all message types (text, template, interactive, button, system)
  let textContent = ''
  if (typeof m.message === 'string') {
    textContent = m.message
  } else if (m.message?.text && typeof m.message.text === 'string') {
    textContent = m.message.text
  } else if (m.text && typeof m.text === 'string') {
    textContent = m.text
  } else if (m.body && typeof m.body === 'string') {
    textContent = m.body
  } else if (m.message?.templateMessage?.body?.data?.[0]?.text) {
    textContent = m.message.templateMessage.body.data[0].text
  } else if (m.message?.interactiveMessage?.body?.text) {
    textContent = m.message.interactiveMessage.body.text
  } else if (typeof m.message?.body === 'string') {
    textContent = m.message.body
  } else if (m.message?.button?.text) {
    textContent = m.message.button.text
  } else if (m.message?.title) {
    textContent = m.message.title
  }

  // Parse timestamp accurately across numeric and ISO string formats (receivedAt)
  let msgTime = Date.now()
  if (m.receivedAt || raw.receivedAt) {
    const t = new Date(m.receivedAt || raw.receivedAt).getTime()
    if (!isNaN(t)) msgTime = t
  } else if (m.messageTime || raw.messageTime) {
    const t = Number(m.messageTime || raw.messageTime)
    if (!isNaN(t) && t > 0) msgTime = t
  } else if (m.timestamp || raw.timestamp) {
    const rawT = m.timestamp || raw.timestamp
    const t = isNaN(Number(rawT)) ? new Date(rawT).getTime() : Number(rawT)
    if (!isNaN(t) && t > 0) msgTime = t
  } else if (m.createdAt || m.created_at || raw.createdAt || raw.created_at) {
    const t = new Date(m.createdAt || m.created_at || raw.createdAt || raw.created_at).getTime()
    if (!isNaN(t)) msgTime = t
  }

  const messageId =
    m.messageId ||
    m.dtMessageId ||
    raw.messageId ||
    raw.dtMessageId ||
    m.id ||
    raw.id ||
    `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

  return {
    id: messageId,
    isIncoming: isIncoming,
    originType: originType,
    senderId: senderId,
    senderName: isIncoming
      ? (m.customerName || raw.customerName || 'Client')
      : (m.senderUser?.name || raw.senderUser?.name || 'Panther Capitals'),
    text: textContent,
    mediaUrl: m.mediaUrl || raw.mediaUrl || m.media_url || raw.media_url || null,
    messageType: m.type || m.message?.messageType || m.messageType || raw.type || raw.messageType || 'text',
    messageTime: msgTime,
    formattedTime: formatMessageTime(msgTime),
    status:
      m.messageMetadata?.status ||
      (m.readCount > 0
        ? 'READ'
        : m.deliveryCount > 0
          ? 'DELIVERED'
          : m.sentCount > 0
            ? 'SENT'
            : null),
    readCount: m.readCount || 0,
    deliveryCount: m.deliveryCount || 0,
    sentCount: m.sentCount || 0,
    erroredCount: m.erroredCount || 0,
    integrationDisplayName: isIncoming ? '' : (m.integrationDisplayName || raw.integrationDisplayName || 'Panther Capitals'),
    integrationWabaNumber: m.integrationWabaNumber || raw.integrationWabaNumber || '',
    raw: m,
  }
}

export const useWhatsAppChatStore = defineStore('whatsappChat', () => {
  const snackbar = useSnackbarStore()

  // ─── State ───────────────────────────────────────────────────
  const rawData = ref(null)
  const messages = ref([])
  const dtCustomerId = ref(null)
  const isSessionOpen = ref(false)
  const currentPhoneNumber = ref('')
  const loading = ref(false)
  const sending = ref(false)
  const error = ref(null)

  // ─── Computed: Group messages chronologically with date headers
  const chronologicalMessages = computed(() => {
    return [...messages.value].sort((a, b) => (Number(a.messageTime) || 0) - (Number(b.messageTime) || 0))
  })

  const groupedMessages = computed(() => {
    const groups = []
    let currentDateKey = null
    let currentGroup = null

    chronologicalMessages.value.forEach((msg) => {
      const dateKey = formatMessageDate(msg.messageTime)
      if (dateKey !== currentDateKey) {
        currentDateKey = dateKey
        currentGroup = {
          date: dateKey,
          messages: [],
        }
        groups.push(currentGroup)
      }
      currentGroup.messages.push(msg)
    })

    return groups
  })

  // ─── Actions ─────────────────────────────────────────────────
  const fetchChat = (phoneNumber, showSnackbar = false) => {
    const cleanNumber = cleanPhoneNumber(phoneNumber)
    if (!cleanNumber) {
      error.value = 'Invalid or missing phone number.'
      if (showSnackbar) {
        snackbar.show('Phone number not available for WhatsApp chat.', 'error')
      }
      return Promise.reject(new Error('Invalid phone number'))
    }

    currentPhoneNumber.value = cleanNumber
    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.whatsapp.chatOpen, {
        params: { phone_number: cleanNumber },
        isTokenRequired: true,
        onSuccess: (res) => {
          rawData.value = res
          dtCustomerId.value = res?.dtCustomerId || null
          isSessionOpen.value = !!res?.isOpen

          const rawList = Array.isArray(res?.messages) ? res.messages : []
          messages.value = rawList.map((m) => normalizeMessage(m, dtCustomerId.value, currentPhoneNumber.value)).filter(Boolean)

          loading.value = false
          resolve(res)
        },
        onFailure: (err) => {
          console.error('WhatsApp chat/open API error:', err)
          loading.value = false
          error.value = err?.message || 'Failed to fetch WhatsApp conversation'
          if (showSnackbar) {
            snackbar.show(error.value, 'error')
          }
          reject(err)
        },
      })
    })
  }

  const sendMessage = (phoneNumber, messageText) => {
    const rawNumber = phoneNumber || currentPhoneNumber.value
    const digitsOnly = cleanPhoneNumber(rawNumber)
    if (!digitsOnly || !messageText?.trim()) {
      return Promise.reject(new Error('Phone number and message text required'))
    }

    const formattedTo = `+${digitsOnly.replace(/^\+/, '')}`
    const text = messageText.trim()
    const tempMsg = {
      id: `temp_${Date.now()}`,
      isIncoming: false,
      originType: 'BUSINESS',
      text: text,
      messageType: 'text',
      messageTime: Date.now(),
      formattedTime: formatMessageTime(Date.now()),
      status: 'SENT',
      readCount: 0,
      deliveryCount: 0,
      sentCount: 1,
      erroredCount: 0,
      integrationDisplayName: 'Panther Capitals',
      integrationWabaNumber: '',
    }

    // Optimistically add message
    messages.value.push(tempMsg)
    sending.value = true

    const payload = {
      to: formattedTo,
      message: text,
    }

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.whatsapp.sendMessage, {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          sending.value = false
          const realId = res?.messageId || res?.id || res?.data?.messageId || res?.data?.id || res?.dtMessageId
          if (realId) {
            tempMsg.id = realId
          }
          resolve(res)
        },
        onFailure: (err) => {
          console.error('Failed to send WhatsApp message:', err)
          sending.value = false
          tempMsg.erroredCount = 1
          tempMsg.status = 'FAILED'
          snackbar.show(err?.message || 'Failed to send message', 'error')
          reject(err)
        },
      })
    })
  }

  const sendTemplate = (options = {}) => {
    let phoneNumber = ''
    let templateName = ''
    let placeholders = []
    let optimisticText = ''

    if (typeof options === 'string') {
      phoneNumber = options
      templateName = arguments[1] || ''
      placeholders = arguments[2] || []
      optimisticText = arguments[3] || ''
    } else if (typeof options === 'object' && options !== null) {
      phoneNumber =
        options.phoneNumber ||
        options.phone_number ||
        options.to ||
        options.phone ||
        options.cleanPhone ||
        currentPhoneNumber.value
      templateName =
        options.templateName ||
        options.template_name ||
        options.name ||
        options.template ||
        ''
      placeholders = options.placeholders || options.variables || []
      optimisticText = options.optimisticText || options.optimistic_text || options.text || ''
    }

    const rawNumber = phoneNumber || currentPhoneNumber.value
    const digitsOnly = cleanPhoneNumber(rawNumber)
    if (!digitsOnly || !templateName?.trim()) {
      const errMsg = 'Phone number and template name required'
      snackbar.show(errMsg, 'error')
      return Promise.reject(new Error(errMsg))
    }

    const formattedTo = `+${digitsOnly.replace(/^\+/, '')}`
    const tempMsg = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isIncoming: false,
      originType: 'BUSINESS',
      text: optimisticText || `[Template: ${templateName}]`,
      messageType: 'template',
      messageTime: Date.now(),
      formattedTime: formatMessageTime(Date.now()),
      status: 'SENT',
      readCount: 0,
      deliveryCount: 0,
      sentCount: 1,
      erroredCount: 0,
      integrationDisplayName: 'Panther Capitals',
      integrationWabaNumber: '',
    }

    // Optimistically add message
    messages.value.push(tempMsg)
    sending.value = true

    const payload = {
      template_name: templateName.trim(),
      to: formattedTo,
      placeholders: Array.isArray(placeholders) ? placeholders : [],
    }

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.whatsapp.sendTemplate, {
        data: payload,
        isTokenRequired: true,
        onSuccess: (res) => {
          sending.value = false
          if (res?.isOpen !== undefined) {
            isSessionOpen.value = !!res.isOpen
          }
          const realId = res?.messageId || res?.id || res?.data?.messageId || res?.data?.id || res?.dtMessageId
          if (realId) {
            tempMsg.id = realId
          }
          resolve(res)
        },
        onFailure: (err) => {
          console.error('Failed to send WhatsApp template:', err)
          sending.value = false
          tempMsg.erroredCount = 1
          tempMsg.status = 'FAILED'
          snackbar.show(err?.message || 'Failed to send template message', 'error')
          reject(err)
        },
      })
    })
  }

  const sendTemplateMessage = sendTemplate

  const handleIncomingSocketMessage = (payload) => {
    if (!payload) return
    console.log('[WS WhatsApp Chat] Incoming raw payload:', payload)
    const normalized = normalizeMessage(payload, dtCustomerId.value, currentPhoneNumber.value)
    if (!normalized) return

    console.log('[WS WhatsApp Chat] Parsed normalized message:', normalized)

    // If an incoming message from the client is received, the 24-hour chat window opens
    if (normalized.isIncoming) {
      isSessionOpen.value = true
    }

    // Check if message already exists by id OR matches an optimistic temp message with same text
    const existingIndex = messages.value.findIndex((existing) => {
      if (existing.id === normalized.id) return true
      if (
        !normalized.isIncoming &&
        existing.id?.startsWith('temp_') &&
        existing.text?.trim() === normalized.text?.trim()
      ) {
        return true
      }
      return false
    })

    if (existingIndex >= 0) {
      messages.value[existingIndex] = { ...messages.value[existingIndex], ...normalized }
    } else {
      messages.value.push(normalized)
    }
  }

  const resetChat = () => {
    rawData.value = null
    messages.value = []
    dtCustomerId.value = null
    isSessionOpen.value = false
    currentPhoneNumber.value = ''
    loading.value = false
    sending.value = false
    error.value = null
  }

  return {
    rawData,
    messages,
    chronologicalMessages,
    groupedMessages,
    dtCustomerId,
    isSessionOpen,
    isOpen: isSessionOpen,
    currentPhoneNumber,
    loading,
    sending,
    error,
    fetchChat,
    sendMessage,
    sendTemplate,
    sendTemplateMessage,
    handleIncomingSocketMessage,
    resetChat,
  }
})
