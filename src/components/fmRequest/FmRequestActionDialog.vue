<script setup>
import { ref, watch, computed } from 'vue'
import { Loader2, X, Pencil, Check } from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'

const props = defineProps({
  open:         { type: Boolean,  default: false },
  item:         { type: Object,   default: null  },
  action:       { type: String,   default: 'accept' },
  isSubmitting: { type: Boolean,  default: false },
})

const emit = defineEmits(['close', 'confirm'])

// ─── State
const reason   = ref('')
const isEditing = ref(false)
const message  = ref('')

const rawGroups = ref([])
const groupsLoading = ref(false)
const selectedGroupValue = ref('')

const form = ref({
  broker_group:       '',
  broker_currency:    'USD',
  broker_leverage:    100,
  group_config_id:    null,
  broker_share:       '',
  fm_share:           '',
  ib_pool_percentage: '',
  performance_fee:    '',
  settlement_type:    '',
  settlement_time:    '',
})

const fetchAvailableGroups = async () => {
  groupsLoading.value = true
  try {
    const endpoint =
      urls.groupConfig?.groups || urls.groupConfig?.list || '/mt5/groups'
    apiRequest(urls.KEYS.GET, endpoint, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        status: 'all',
        account_type: 'live',
      },
      onSuccess: (res) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : []
        rawGroups.value = items
        groupsLoading.value = false
        syncSelectedGroup()
      },
      onFailure: () => {
        groupsLoading.value = false
      },
    })
  } catch {
    groupsLoading.value = false
  }
}

const groupOptions = computed(() => {
  const filtered = rawGroups.value.filter((g) => g.is_added === true)
  const list = filtered.length > 0 ? filtered : rawGroups.value
  return list.map((g) => ({
    label: `${g.label || g.badge || g.group} (${g.currency || 'USD'} · 1:${g.leverage || 100})`,
    value: g.group || g.config_id || g.label,
    data: g,
  }))
})

const onGroupPresetSelect = (groupValue) => {
  selectedGroupValue.value = groupValue
  const match = rawGroups.value.find(
    (g) =>
      g.group === groupValue ||
      String(g.config_id) === String(groupValue) ||
      g.label === groupValue,
  )
  if (match) {
    form.value.broker_group = match.group || groupValue
    if (match.currency) form.value.broker_currency = match.currency
    if (match.leverage) form.value.broker_leverage = Number(match.leverage)
    form.value.group_config_id =
      match.config_id || match.group_config_id || match.id || null
  } else {
    form.value.broker_group = groupValue
  }
}

const syncSelectedGroup = () => {
  const currentGroup = form.value.broker_group || props.item?.broker_group
  const currentConfigId = form.value.group_config_id || props.item?.group_config_id
  if (!currentGroup && !currentConfigId) {
    selectedGroupValue.value = ''
    return
  }
  const match = rawGroups.value.find(
    (g) =>
      (currentConfigId && String(g.config_id) === String(currentConfigId)) ||
      g.group === currentGroup ||
      g.label === currentGroup ||
      g.badge === currentGroup,
  )
  if (match) {
    selectedGroupValue.value = match.group || match.config_id || match.label
  } else if (currentGroup) {
    selectedGroupValue.value = currentGroup
  }
}

const displayLeverage = computed(() => {
  const lev = form.value.broker_leverage ?? props.item?.broker_leverage
  if (!lev && lev !== 0) return '-'
  return String(lev).startsWith('1:') ? lev : `1:${lev}`
})

// ─── Reset & Pre-fill form from item
const resetForm = () => {
  reason.value    = ''
  message.value   = ''
  isEditing.value = false
  if (!props.item) {
    form.value = {
      broker_group:       '',
      broker_currency:    'USD',
      broker_leverage:    100,
      group_config_id:    null,
      broker_share:       '',
      fm_share:           '',
      ib_pool_percentage: '',
      performance_fee:    '',
      settlement_type:    '',
      settlement_time:    '',
    }
    selectedGroupValue.value = ''
    return
  }
  form.value = {
    broker_group:       props.item.broker_group ?? '',
    broker_currency:    props.item.broker_currency ?? 'USD',
    broker_leverage:    props.item.broker_leverage ?? 100,
    group_config_id:    props.item.group_config_id ?? null,
    broker_share:       props.item.broker_share ?? '',
    fm_share:           props.item.fm_share ?? '',
    ib_pool_percentage: props.item.ib_pool_percentage ?? '',
    performance_fee:    props.item.performance_fee ?? '',
    settlement_type:    props.item.settlement_type ?? '',
    settlement_time:    props.item.settlement_time ?? '',
  }
  syncSelectedGroup()
}

watch(() => props.item, () => {
  resetForm()
}, { immediate: true, deep: true })

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
    fetchAvailableGroups()
  }
}, { immediate: true })

// ─── Reset on close
const closeDialog = () => {
  resetForm()
  emit('close')
}

// ─── Confirm
const handleConfirm = () => {
  if (props.action === 'accept') {
    // Always send form.value - it's pre-filled from item
    emit('confirm', {
      data:    { ...form.value },
      message: message.value.trim() || null,
    })
  } else {
    emit('confirm', { reason: reason.value })
  }
}

const isRejectDisabled  = () => props.action === 'reject' && !reason.value.trim()
const isAcceptDisabled  = () => props.isSubmitting
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="closeDialog"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg
             flex flex-col max-h-[90vh]"
      @click.stop
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between flex-shrink-0">
        <div>
          <h2 class="text-primary-text text-sm font-medium">
            {{ action === 'accept' ? 'Accept Request' : 'Reject Request' }}
          </h2>
          <p class="text-secondary-text text-xs mt-0.5">{{ item?.user_email }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Edit toggle (accept only) -->
          <button
            v-if="action === 'accept'"
            @click="isEditing = !isEditing"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer"
            :class="isEditing
              ? 'bg-accent text-card-background border-accent'
              : 'border-primary-border text-secondary-text hover:text-primary-text hover:bg-primary-border'"
          >
            <Pencil v-if="!isEditing" class="w-3 h-3" />
            <Check  v-else            class="w-3 h-3" />
            {{ isEditing ? 'Done' : 'Edit' }}
          </button>
          <button
            @click="closeDialog"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-secondary-text
                   hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1 no-scrollbar">

        <!-- ── ACCEPT mode -->
        <template v-if="action === 'accept'">

          <!-- Info row: user -->
          <div class="bg-background border border-primary-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span class="text-secondary-text text-xs">User ID</span>
            <span class="text-primary-text text-xs font-medium">{{ item?.user_id }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Currency</span>
              <span class="block text-primary-text text-xs font-medium mt-1">{{ form.broker_currency || item?.broker_currency || '-' }}</span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Min Capital</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ item?.min_capital ?? '-' }}
              </span>
            </div>
            <div
              v-if="isEditing"
              class="col-span-2 flex flex-col gap-1.5"
            >
              <label class="text-xs font-semibold text-secondary-text flex items-center justify-between">
                <span>Select Group Template</span>
                <span v-if="groupsLoading" class="text-[11px] font-normal text-secondary-text flex items-center gap-1">
                  <Loader2 class="w-3 h-3 animate-spin text-accent" /> Loading groups...
                </span>
                <span v-else class="text-[11px] font-normal text-secondary-text">
                  Auto-populates group, currency & leverage
                </span>
              </label>
              <BaseSelect
                :modelValue="selectedGroupValue"
                :options="groupOptions"
                placeholder="Choose an existing MT5 group configuration..."
                searchable
                @update:modelValue="onGroupPresetSelect"
              />
              <p v-if="form.broker_group" class="text-[11px] text-secondary-text font-mono mt-0.5">
                Active Group: <span class="text-primary-text font-medium">{{ form.broker_group }}</span>
              </p>
            </div>
            <div
              v-else
              class="bg-background border border-primary-border rounded-xl px-4 py-3 col-span-2"
            >
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Group</span>
              <span class="block text-primary-text text-xs font-medium mt-1 break-all">
                {{ form.broker_group || item?.broker_group || '-' }}
              </span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Broker Leverage</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ displayLeverage }}
              </span>
            </div>
            <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
              <span class="block text-secondary-text text-[11px] uppercase tracking-widest">Created At</span>
              <span class="block text-primary-text text-xs font-medium mt-1">
                {{ item?.created_at ?? '-' }}
              </span>
            </div>
          </div>

          <!-- Editable fields grid -->
          <div class="grid grid-cols-2 gap-3">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Broker Share (%)</label>
              <input
                v-model="form.broker_share"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">FM Share (%)</label>
              <input
                v-model="form.fm_share"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">IB Pool (%)</label>
              <input
                v-model="form.ib_pool_percentage"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Performance Fee (%)</label>
              <input
                v-model="form.performance_fee"
                type="number"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Settlement Type</label>
              <input
                v-model="form.settlement_type"
                type="text"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors capitalize"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-secondary-text">Settlement Time</label>
              <input
                v-model="form.settlement_time"
                type="text"
                :disabled="!isEditing"
                class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-sm
                       text-primary-text outline-none transition-colors"
                :class="isEditing ? 'focus:border-accent' : 'opacity-70 cursor-not-allowed'"
              />
            </div>

          </div>

          <!-- Optional message (always visible for accept) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Message <span class="font-normal text-secondary-text">(optional)</span>
            </label>
            <textarea
              v-model="message"
              rows="2"
              placeholder="Add a note for the user..."
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5
                     text-sm text-primary-text placeholder:text-secondary-text outline-none
                     resize-none focus:border-accent transition-colors"
            />
          </div>

          <!-- Edited badge -->
          <div
            v-if="isEditing"
            class="flex items-center gap-1.5 text-xs text-primary-yellow"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary-yellow" />
            Editing — changes will be sent with acceptance
          </div>

        </template>

        <!-- ── REJECT mode -->
        <template v-else>
          <div class="bg-background border border-primary-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span class="text-secondary-text text-xs">User</span>
            <span class="text-primary-text text-xs font-medium">{{ item?.user_email }}</span>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-secondary-text">
              Reason <span class="text-primary-red">*</span>
            </label>
            <textarea
              v-model="reason"
              rows="3"
              placeholder="Enter rejection reason..."
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5
                     text-sm text-primary-text placeholder:text-secondary-text outline-none
                     resize-none focus:border-primary-red transition-colors"
            />
          </div>
        </template>

      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-primary-border flex gap-2 flex-shrink-0">
        <button
          @click="closeDialog"
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2 rounded-xl text-sm text-secondary-text border border-primary-border
                 hover:text-primary-text hover:bg-primary-border transition-all cursor-pointer
                 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          @click="handleConfirm"
          :disabled="isSubmitting || isRejectDisabled()"
          class="flex-1 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center
                 gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="action === 'accept'
            ? 'bg-primary-green hover:bg-primary-green/500/20'
            : 'bg-primary-red text-primary-red hover:bg-primary-red/500/20'"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>{{ action === 'accept' ? 'Accept' : 'Reject' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
