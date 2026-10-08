<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/50"
      />
    </Transition>

    <Transition name="panel">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <h2 class="text-sm font-semibold text-primary-text">{{ headerTitle }}</h2>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="closeDialog">
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Tab Selector (Only when adding a new account) -->
        <div v-if="!isEdit" class="shrink-0">
            <div class="grid grid-cols-2">
              <button
                type="button"
                @click="selectMode('copy_trading')"
                class="py-4 text-xs font-semibold transition-all duration-150 border-b-2 cursor-pointer flex items-center justify-center gap-2"
                :class="
                  mode === 'copy_trading'
                    ? 'border-primary text-primary font-bold'
                    : 'border-primary-border text-secondary-text hover:text-primary-text'
                "
              >
                <Copy class="w-3.5 h-3.5" />
                Copy Trading
              </button>

              <button
                type="button"
                @click="selectMode('real')"
                class="py-4 text-xs font-semibold transition-all duration-150 border-b-2 cursor-pointer flex items-center justify-center gap-2"
                :class="
                  mode === 'real'
                    ? 'border-primary text-primary font-bold'
                    : 'border-primary-border text-secondary-text hover:text-primary-text'
                "
              >
                <BarChart2 class="w-3.5 h-3.5" />
                MT5 Account
              </button>
            </div>
          </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto no-scrollbar">

          <!-- Client Selection (Only when adding a new account) -->
          <div v-if="!isEdit" class="px-6 py-4 border-b border-primary-border">
            <p class="text-xs font-semibold text-secondary-text mb-1.5">Client <span class="text-primary-red">*</span></p>
            <BaseSelect
              v-model="selectedClientId"
              :options="clientOptions"
              :isLoading="isSearchingClients"
              placeholder="Search client"
              searchable
              @search="onClientSearch"
            />
          </div>

          <!-- ── Tab 1: Copy Trading Form ── -->
          <div v-if="mode === 'copy_trading'" class="px-6 py-4 space-y-4">
            <div>
              <p class="text-xs font-semibold text-secondary-text mb-1.5">Currency <span class="text-primary-red">*</span></p>
              <BaseSelect
                v-model="copyForm.currency"
                :options="currencyOptions"
                placeholder="Select currency"
              />
            </div>
            <div>
              <p class="text-xs font-semibold text-secondary-text mb-1.5">Broker Label</p>
              <input
                v-model="copyForm.broker_label"
                type="text"
                placeholder="e.g. metatrader"
                class="w-full px-3 py-2 rounded-lg border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
          </div>

          <!-- ── Tab 2: MT5 Account Form ── -->
          <div v-if="mode === 'real'" class="px-6 py-4 space-y-5">
            <!-- Environment Toggle -->
            <div>
              <p class="text-xs font-semibold text-secondary-text mb-2">Account Environment</p>
              <div class="grid grid-cols-2 p-1 bg-background border border-primary-border rounded-xl gap-1">
                <button
                  @click="changeEnv('demo')"
                  type="button"
                  class="py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  :class="selectedEnv === 'demo' ? 'bg-primary text-white shadow-sm' : 'text-secondary-text hover:text-primary-text'"
                >
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="selectedEnv === 'demo' ? 'bg-black' : 'bg-secondary-text'" />
                  Demo Account
                </button>
                <button
                  @click="changeEnv('live')"
                  type="button"
                  class="py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  :class="selectedEnv === 'live' ? 'bg-primary text-white shadow-sm' : 'text-secondary-text hover:text-primary-text'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="selectedEnv === 'live' ? 'bg-primary-green' : 'bg-secondary-text'" />
                  Live Account
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="groupsLoading" class="flex items-center justify-center py-8">
              <Loader2 class="w-5 h-5 text-secondary-text animate-spin" />
            </div>

            <template v-else-if="currentCategories.length">
              <!-- Category Dropdown -->
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Account Category <span class="text-primary-red">*</span></p>
                <BaseSelect
                  :modelValue="selectedCategory?.account_category"
                  :options="categoryOptions"
                  placeholder="Select category"
                  @update:modelValue="changeCategoryVal"
                />
                <p v-if="selectedCategory?.description" class="text-[11px] text-secondary-text mt-1.5 italic">
                  {{ selectedCategory.description }}
                </p>
              </div>

              <!-- Currency Selection -->
              <div v-if="selectedCategory">
                <p class="text-xs font-semibold text-secondary-text mb-2">Account Currency <span class="text-primary-red">*</span></p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="cur in selectedCategory.currencies"
                    :key="cur.group_config_id"
                    type="button"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer"
                    :class="selectedCurrency?.group_config_id === cur.group_config_id
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-background border-primary-border text-primary-text hover:border-primary/40'"
                    @click="selectCurrency(cur)"
                  >
                    <span class="text-sm font-bold">{{ cur.currency }}</span>
                    <span class="text-[10px] text-secondary-text mt-0.5" v-if="cur.leverage">1:{{ cur.leverage }}</span>
                  </button>
                </div>
              </div>

              <!-- Final Config Section -->
              <div v-if="selectedCurrency" class="space-y-4 border-t border-primary-border pt-4 mt-4">
                <!-- Demo Balance selection -->
                <div v-if="selectedEnv === 'demo'">
                  <p class="text-xs font-semibold text-secondary-text mb-1.5">Account Balance <span class="text-primary-red">*</span></p>
                  <div class="grid grid-cols-4 gap-1.5">
                    <button
                      v-for="bal in balanceOptions"
                      :key="bal"
                      type="button"
                      class="py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
                      :class="mt5Balance === bal
                        ? 'bg-primary text-black border-primary'
                        : 'bg-background text-secondary-text border-primary-border hover:text-primary-text hover:border-primary/40'"
                      @click="mt5Balance = bal"
                    >
                      {{ getBalanceCurrencySymbol }}{{ bal >= 1000 ? (bal / 1000) + 'k' : bal }}
                    </button>
                  </div>
                </div>

                <!-- Broker Label -->
                <div>
                  <p class="text-xs font-semibold text-secondary-text mb-1.5">Broker Label</p>
                  <input
                    v-model="mt5BrokerLabel"
                    type="text"
                    placeholder="e.g. metatrader"
                    class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                  />
                </div>

                <!-- Password -->
                <div>
                  <p class="text-xs font-semibold text-secondary-text mb-1.5">MT5 Password <span class="text-primary-red">*</span></p>
                  <div class="relative">
                    <input
                      v-model="mt5Password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Create a strong password"
                      class="w-full px-3 py-2.5 pr-10 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                      :class="{ 'border-primary-red': passwordError }"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                      @click="showPassword = !showPassword"
                    >
                      <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
                      <EyeOff v-else class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p v-if="passwordError" class="text-[11px] text-primary-red mt-1.5">{{ passwordError }}</p>
                  
                  <!-- Strength indicator -->
                  <div v-if="mt5Password" class="space-y-1.5 mt-2.5">
                    <div class="flex gap-1">
                      <div
                        v-for="n in 4"
                        :key="n"
                        class="flex-1 h-1 rounded-full transition-all"
                        :class="n <= passwordStrength
                          ? passwordStrength <= 1 ? 'bg-primary-red'
                          : passwordStrength <= 2 ? 'bg-primary-yellow'
                          : 'bg-primary-green'
                          : 'bg-background border border-primary-border/40'"
                      />
                    </div>
                    <p class="text-[10px] text-secondary-text">Password Strength: <span class="font-semibold text-primary-text">{{ strengthLabel }}</span></p>
                  </div>
                  <p class="text-[10px] text-secondary-text mt-1.5 leading-relaxed">
                    8–16 characters · letters (a-z, A-Z) · numbers (0-9) · special chars (! @ # $ % ^ & *)
                  </p>
                </div>
              </div>
            </template>

            <!-- Error or empty categories -->
            <div v-else class="py-6 text-center">
              <p class="text-xs text-secondary-text">No configurations available for this environment.</p>
            </div>
          </div>

        </div>

        <!-- Sticky footer -->
        <div
          v-if="mode === 'copy_trading' || (mode === 'real' && selectedCurrency)"
          class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background"
        >
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
            @click="closeDialog"
          >
            Cancel
          </button>
          
          <button
            v-if="mode === 'copy_trading'"
            :disabled="isLoading || !copyForm.currency || (!isEdit && !selectedClientId)"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submitCopyTrading"
          >
            <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isLoading ? 'Saving...' : 'Save' }}</span>
          </button>
          
          <button
            v-if="mode === 'real'"
            :disabled="isLoading || !!passwordError || !mt5Password || (selectedEnv === 'demo' && (!mt5Balance)) || !selectedClientId"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submitMT5"
          >
            <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isLoading ? 'Creating...' : 'Create Account' }}</span>
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  X, Copy, BarChart2,
  Eye, EyeOff, Loader2,
} from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useAccountsStore } from '@/stores/tradingAccounts/tradingAccounts'
import { useClientLedgerStore } from '@/stores/clientLedger/clientLedger'

const props = defineProps({ open: Boolean, editData: { type: Object, default: null } })
const emit  = defineEmits(['close'])

const snackbar              = useSnackbarStore()
const accountsStore         = useAccountsStore()
const clientLedgerStore     = useClientLedgerStore()

// ── Stepper state ──
const mode          = ref('copy_trading') // 'copy_trading' | 'real'
const selectedEnv   = ref('live')         // 'demo' | 'live'
const selectedCategory = ref(null)
const selectedCurrency = ref(null)

// ── Client state ──
const selectedClientId = ref(null)
const clientOptions = ref([])
const isSearchingClients = ref(false)
let clientSearchTimer = null

const onClientSearch = (query) => {
  clearTimeout(clientSearchTimer)
  isSearchingClients.value = true

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await clientLedgerStore.fetchAllClients(query)
      clientOptions.value = results
    } catch (err) {
      clientOptions.value = []
    } finally {
      isSearchingClients.value = false
    }
  }, 300)
}

// ── MT5 groups data ──
const groupsData    = ref({ demo: [], live: [] })
const groupsLoading = ref(false)

// ── Form states ──
const isLoading  = ref(false)
const mt5Password = ref('')
const showPassword = ref(false)

const mt5BrokerLabel = ref('')
const mt5Balance  = ref(5000)

const balanceOptions  = [1000, 2500, 5000, 10000, 25000, 50000, 100000]

const generateAccountNumber = () => {
  const min = 1_000_000_000
  const max = 9_999_999_999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

const copyForm = ref({ account_number: generateAccountNumber(), broker: 'MT5', broker_label: '', currency: '', server: 'mt-5' })

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'USC', value: 'USC' },
]

// ── Computed ──
const isEdit = computed(() => !!props.editData)

const headerTitle = computed(() => {
  if (isEdit.value) return 'Edit Account'
  return mode.value === 'copy_trading' ? 'Add Copy Trading Account' : 'Add MT5 Account'
})

const currentCategories = computed(() => groupsData.value[selectedEnv.value] ?? [])

const categoryOptions = computed(() =>
  currentCategories.value.map(c => ({
    label: c.label,
    value: c.account_category
  }))
)

const passwordError = computed(() => {
  if (!mt5Password.value) return ''
  const p = mt5Password.value
  if (p.length < 8 || p.length > 16) return 'Password must be 8–16 characters'
  if (!/[a-z]/.test(p)) return 'Must include a lowercase letter'
  if (!/[A-Z]/.test(p)) return 'Must include an uppercase letter'
  if (!/[0-9]/.test(p)) return 'Must include a number'
  if (!/[!@#$%^&*]/.test(p)) return 'Must include a special character (! @ # $ % ^ & *)'
  return ''
})

const passwordStrength = computed(() => {
  const p = mt5Password.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[!@#$%^&*]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value] ?? ''
})

const getBalanceCurrencySymbol = computed(() => {
  return selectedCurrency.value?.currency === 'USC' ? 'C' : '$'
})

// ── Watchers ──
watch(() => props.open, (val) => {
  if (val) resetAll()
})

watch(() => props.editData, (val) => {
  if (val) {
    mode.value = 'copy_trading'
    copyForm.value.account_number = val.account_number || ''
    copyForm.value.broker         = val.platform || 'MT5'
    copyForm.value.broker_label   = val.broker_label || ''
    copyForm.value.currency       = val.currency || ''
  }
})

// ── Methods ──
const resetAll = () => {
  mode.value = 'copy_trading'
  selectedEnv.value = 'live'
  selectedCategory.value = null
  selectedCurrency.value = null
  mt5Password.value = ''
  showPassword.value = false
  isLoading.value = false
  mt5BrokerLabel.value = ''
  copyForm.value = { account_number: generateAccountNumber(), broker: 'MT5', broker_label: '', currency: '', server: 'mt-5' }
  mt5Balance.value  = 5000
  selectedClientId.value = null
  clientOptions.value = []
  isSearchingClients.value = false
  clientLedgerStore.fetchAllClients('').then((res) => {
    clientOptions.value = res
  }).catch(() => {})
  fetchGroups()
}

const closeDialog = () => { emit('close') }

const selectMode = (m) => {
  mode.value = m
}

const changeEnv = (env) => {
  if (selectedEnv.value === env) return
  selectedEnv.value = env
  selectedCategory.value = null
  selectedCurrency.value = null
  mt5Password.value = ''
}

const changeCategoryVal = (catVal) => {
  const cat = currentCategories.value.find(c => c.account_category === catVal)
  selectedCategory.value = cat || null
  selectedCurrency.value = null
  mt5Password.value = ''
}

const selectCurrency = (cur) => {
  selectedCurrency.value = cur
}

const fetchGroups = () => {
  groupsLoading.value = true
  apiRequest(urls.KEYS.GET, urls.tradingAccounts.groups, {
    isTokenRequired: true,
    onSuccess: (res) => {
      groupsData.value = res?.data ?? { demo: [], live: [] }
      groupsLoading.value = false
    },
    onFailure: (err) => {
      groupsLoading.value = false
      snackbar.show(err?.message || 'Failed to load groups', 'error')
    },
  })
}

const submitCopyTrading = () => {
  isLoading.value = true

  const payload = {
    broker_label: copyForm.value.broker_label,
    currency: copyForm.value.currency,
    trading_type: 'copy_trading',
  }

  if (!isEdit.value && selectedClientId.value) {
    payload.user_id = selectedClientId.value
  }

  apiRequest(urls.KEYS.POST, urls.tradingAccounts.create, {
    data: payload,
    isTokenRequired: true,
    onSuccess: () => {
      isLoading.value = false
      accountsStore.fetchAccounts(true)
      closeDialog()
    },
    onFailure: (err) => {
      isLoading.value = false
      snackbar.show(err?.message || 'Something went wrong.', 'error')
    },
  })
}

const submitMT5 = () => {
  if (passwordError.value) return
  isLoading.value = true

  const payload = {
    trading_type:    'real',
    group_config_id: selectedCurrency.value?.group_config_id,
    password:        mt5Password.value,
    broker_label:    mt5BrokerLabel.value,
  }

  if (selectedClientId.value) {
    payload.user_id = selectedClientId.value
  }

  if (selectedEnv.value === 'demo') {
    payload.balance  = mt5Balance.value
  }

  apiRequest(urls.KEYS.POST, urls.tradingAccounts.create, {
    data: payload,
    isTokenRequired: true,
    onSuccess: () => {
      isLoading.value = false
      accountsStore.fetchAccounts(true)
      closeDialog()
    },
    onFailure: (err) => {
      isLoading.value = false
      snackbar.show(err?.message || 'Something went wrong.', 'error')
    },
  })
}
</script>
