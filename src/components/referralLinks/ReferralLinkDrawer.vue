<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs cursor-pointer"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-primary-text">
              {{ isEdit ? 'Edit Campaign' : 'Create Referral Link' }}
            </h3>
            <p class="text-[11px] text-secondary-text mt-0.5">
              {{ isEdit ? 'Update details and group configurations' : 'Generate standard and tracking affiliate URLs' }}
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Campaign Name -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Campaign Name</label>
            <input
              v-model="modalForm.name"
              type="text"
              placeholder="e.g. RAW Campaign"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
            />
          </div>

          <!-- Referral Code (Auto-generated & read-only, regeneratable on create) -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Referral Code</label>
            <div class="flex items-center gap-2">
              <input
                v-model="modalForm.code"
                type="text"
                readonly
                class="flex-1 px-3 py-2.5 rounded-lg bg-background/50 border border-primary-border text-primary-text text-sm outline-none placeholder:text-secondary-text/50 font-mono uppercase"
              />
              <button
                v-if="!isEdit"
                type="button"
                class="p-2.5 rounded-lg border border-primary-border bg-background hover:bg-primary-border/20 text-secondary-text hover:text-primary-text transition cursor-pointer flex items-center justify-center shrink-0"
                title="Regenerate random code"
                @click="regenerateCode"
              >
                <RefreshCw :size="16" />
              </button>
            </div>
            <p v-if="!isEdit" class="text-[10px] text-secondary-text mt-1">Unique affiliate parameter. Auto-generated and regeneratable.</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1.5">Description</label>
            <textarea
              v-model="modalForm.description"
              placeholder="Explain the focus or purpose of this campaign link..."
              rows="3"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
            />
          </div>

          <!-- Category Configuration Blocks -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">Group Configurations</h4>
            
            <div
              v-for="(block, index) in categoryBlocks"
              :key="index"
              class="border border-primary-border rounded-2xl p-4 bg-background/20 space-y-3.5 relative"
            >
              <!-- Remove Block Button -->
              <button
                v-if="categoryBlocks.length > 1"
                type="button"
                class="absolute top-3 right-3 p-1 text-secondary-text hover:text-primary-red transition cursor-pointer"
                title="Remove Category Block"
                @click="removeCategoryBlock(index)"
              >
                <Trash2 :size="14" />
              </button>

              <!-- Category Dropdown Selector -->
              <div>
                <label class="block text-[10px] font-semibold text-secondary-text uppercase tracking-wider mb-1">
                  Category Group {{ index + 1 }}
                </label>
                <BaseSelect
                  v-model="block.categoryIndex"
                  :options="categoryOptions"
                  placeholder="Select an account category"
                  @update:modelValue="onCategorySelect(index)"
                />
              </div>

              <!-- Selected Group Chips for this Category block -->
              <div v-if="block.selectedGroupIds.length > 0" class="flex flex-wrap gap-1.5 p-2 bg-background border border-primary-border rounded-xl">
                <div
                  v-for="id in block.selectedGroupIds"
                  :key="id"
                  class="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-2.5 py-0.5 rounded-full"
                >
                  <span>{{ getGroupLabel(id) }}</span>
                  <button
                    type="button"
                    class="text-primary-blue/60 hover:text-primary-red transition cursor-pointer"
                    @click="removeGroupFromBlock(index, id)"
                  >
                    <X :size="10" />
                  </button>
                </div>
              </div>

              <!-- Groups Multi-Select under this category block -->
              <div v-if="block.categoryIndex !== null" class="space-y-2.5 pt-1">
                <!-- Search field -->
                <div class="relative">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                  <input
                    v-model="block.searchQuery"
                    type="text"
                    placeholder="Search groups inside this category..."
                    class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
                  />
                </div>

                <!-- Loading state -->
                <div v-if="block.groupsLoading" class="text-xs text-secondary-text py-3 text-center">
                  <Loader2 class="w-4 h-4 animate-spin mx-auto mb-1" /> Loading groups...
                </div>

                <!-- Groups checkboxes -->
                <div v-else class="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                  <label
                    v-for="grp in getFilteredGroups(index)"
                    :key="grp.config_id"
                    class="flex items-start gap-2.5 p-2 rounded-lg bg-card-background/60 hover:bg-card-background border border-primary-border/40 hover:border-primary-border/80 cursor-pointer select-none transition"
                  >
                    <input
                      type="checkbox"
                      :value="grp.config_id"
                      v-model="block.selectedGroupIds"
                      class="mt-0.5 rounded accent-primary cursor-pointer w-3.5 h-3.5 border-primary-border"
                    />
                    <div class="text-[11px] leading-normal flex-1">
                      <p class="font-bold text-primary-text">{{ grp.badge || grp.label }}</p>
                      <p class="text-[9px] text-secondary-text mt-0.5">
                        Platform: {{ grp.platform || 'MT5' }} · Currency: {{ grp.currency }} · Margin Mode: {{ grp.margin_mode || '—' }}
                      </p>
                    </div>
                  </label>
                  <div v-if="getFilteredGroups(index).length === 0" class="text-xs text-secondary-text/60 italic text-center py-2">
                    No matching groups found in this category.
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Another Block Button -->
            <button
              type="button"
              class="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-primary-border hover:border-primary text-secondary-text hover:text-primary-text rounded-xl text-xs font-semibold transition cursor-pointer"
              @click="addCategoryBlock"
            >
              <Plus :size="14" />
              <span>Add Another Category</span>
            </button>
          </div>

          <!-- Selected Group Chips Summary -->
          <div v-if="allSelectedGroupChips.length > 0" class="space-y-1.5">
            <label class="block text-xs font-semibold text-primary-text">
              Selected Groups Summary ({{ allSelectedGroupChips.length }})
            </label>
            <div class="flex flex-wrap gap-1.5 p-2.5 bg-background border border-primary-border rounded-xl">
              <div
                v-for="chip in allSelectedGroupChips"
                :key="chip.config_id"
                class="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-2.5 py-0.5 rounded-full"
              >
                <span>{{ chip.label }}</span>
                <span class="text-[8px] opacity-75">({{ chip.account_type || 'live' }})</span>
                <button
                  type="button"
                  class="text-primary-blue/60 hover:text-primary-red transition cursor-pointer"
                  @click="removeGlobalGroup(chip.config_id)"
                >
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background">
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="store.actionLoading || !isValid"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submit"
          >
            <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.actionLoading ? 'Saving...' : 'Save' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Search, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-vue-next'
import { useIbReferralLinksStore } from '@/stores/ibTree/ibReferralLinks'
import apiRequest from '@/api/request'
import urls from '@/api/urls'

const props = defineProps({
  open: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  ibId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'success'])

const store = useIbReferralLinksStore()

// State
const groupCache = ref({})
const modalForm = ref({
  name: '',
  code: '',
  description: '',
  broker_group_config_ids: []
})

// Dynamic Category Blocks State
const categoryBlocks = ref([
  {
    categoryIndex: null,
    searchQuery: '',
    availableGroups: [],
    groupsLoading: false,
    selectedGroupIds: []
  }
])

// Helpers for random alphanumeric code generation
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const regenerateCode = () => {
  modalForm.value.code = generateRandomCode()
}

// Block Operations
const addCategoryBlock = () => {
  categoryBlocks.value.push({
    categoryIndex: null,
    searchQuery: '',
    availableGroups: [],
    groupsLoading: false,
    selectedGroupIds: []
  })
}

const removeCategoryBlock = (index) => {
  categoryBlocks.value.splice(index, 1)
}

const getGroupLabel = (id) => {
  return groupCache.value[id]?.label || `ID: ${id}`
}

const removeGroupFromBlock = (blockIndex, id) => {
  const block = categoryBlocks.value[blockIndex]
  if (block) {
    block.selectedGroupIds = block.selectedGroupIds.filter(val => val !== id)
  }
}

// Fetch groups locally inside specific block
const fetchGroupsForBlock = (index) => {
  const block = categoryBlocks.value[index]
  if (!block || block.categoryIndex === null || block.categoryIndex === undefined) {
    if (block) block.availableGroups = []
    return
  }
  const categoryObj = store.categories[block.categoryIndex]
  if (!categoryObj) return

  block.groupsLoading = true
  block.availableGroups = []

  apiRequest('get', urls.groupConfig.groups, {
    isTokenRequired: true,
    params: {
      page: 1,
      per_page: 100,
      status: 'added',
      account_category: categoryObj.account_category,
      account_type: categoryObj.account_type,
    },
    onSuccess: (res) => {
      block.availableGroups = res?.data || []
      block.groupsLoading = false
    },
    onFailure: () => {
      block.groupsLoading = false
    }
  })
}

const onCategorySelect = (index) => {
  fetchGroupsForBlock(index)
}

const getFilteredGroups = (index) => {
  const block = categoryBlocks.value[index]
  if (!block) return []
  const query = block.searchQuery.trim().toLowerCase()
  if (!query) return block.availableGroups
  return block.availableGroups.filter(g =>
    g.label?.toLowerCase().includes(query) ||
    g.group?.toLowerCase().includes(query)
  )
}

// Global selected chips summary computed
const allSelectedGroupChips = computed(() => {
  const ids = []
  categoryBlocks.value.forEach(block => {
    ids.push(...block.selectedGroupIds)
  })
  const uniqueIds = [...new Set(ids)]
  return uniqueIds.map(id => {
    return groupCache.value[id] || { config_id: id, label: `ID: ${id}` }
  })
})

const removeGlobalGroup = (configId) => {
  categoryBlocks.value.forEach(block => {
    block.selectedGroupIds = block.selectedGroupIds.filter(id => id !== configId)
  })
}

// Populate chip details cache from loaded groups
watch(() => categoryBlocks.value, (newBlocks) => {
  if (!newBlocks) return
  newBlocks.forEach(block => {
    if (block.availableGroups) {
      block.availableGroups.forEach(g => {
        groupCache.value[g.config_id] = {
          config_id: g.config_id,
          label: g.badge || g.label,
          platform: g.platform || 'MT5',
          currency: g.currency,
          account_type: g.account_type
        }
      })
    }
  })
}, { deep: true })

// Categories mapping list options
const categoryOptions = computed(() => {
  return store.categories.map((c, index) => ({
    label: `${c.account_category} (${c.account_type.toUpperCase()})`,
    value: index
  }))
})

// Initialize/Restore campaign forms
const initializeBlocks = () => {
  if (!props.open || store.categories.length === 0) return

  if (props.isEdit && props.editData) {
    modalForm.value = {
      name: props.editData.name || '',
      code: props.editData.code || '',
      description: props.editData.description || '',
      broker_group_config_ids: props.editData.groups?.map(g => g.id) || []
    }

    // Populate cache for edit items
    if (props.editData.groups) {
      props.editData.groups.forEach(g => {
        groupCache.value[g.id] = {
          config_id: g.id,
          label: g.badge || g.label,
          platform: g.platform || 'MT5',
          currency: g.currency,
          account_type: g.account_type
        }
      })
    }

    // Group attached edit groups by account_category / account_type
    const grouped = {}
    const editGroups = props.editData.groups || []

    editGroups.forEach(g => {
      // Backend properties standard mapping: category & account_type
      const cat = g.category || 'STANDARD'
      const type = g.account_type || 'live'
      const key = `${cat.toUpperCase()}_${type.toLowerCase()}`

      if (!grouped[key]) {
        grouped[key] = {
          category: cat,
          account_type: type,
          groupIds: []
        }
      }
      grouped[key].groupIds.push(g.id)
    })

    const blocks = []
    Object.values(grouped).forEach(gInfo => {
      const catIndex = store.categories.findIndex(c =>
        c.account_category.toUpperCase() === gInfo.category.toUpperCase() &&
        c.account_type.toLowerCase() === gInfo.account_type.toLowerCase()
      )

      if (catIndex !== -1) {
        blocks.push({
          categoryIndex: catIndex,
          searchQuery: '',
          availableGroups: [],
          groupsLoading: false,
          selectedGroupIds: gInfo.groupIds
        })
      }
    })

    if (blocks.length === 0) {
      blocks.push({
        categoryIndex: null,
        searchQuery: '',
        availableGroups: [],
        groupsLoading: false,
        selectedGroupIds: []
      })
    }

    categoryBlocks.value = blocks

    // Trigger async group queries for each loaded block
    categoryBlocks.value.forEach((_, idx) => {
      fetchGroupsForBlock(idx)
    })
  } else {
    modalForm.value = {
      name: '',
      code: generateRandomCode(),
      description: '',
      broker_group_config_ids: []
    }
    categoryBlocks.value = [
      {
        categoryIndex: null,
        searchQuery: '',
        availableGroups: [],
        groupsLoading: false,
        selectedGroupIds: []
      }
    ]
  }
}

// Watch open state changes
watch(() => props.open, (val) => {
  if (val) {
    store.fetchCategories()
  }
})

// Trigger block initialization once categories load
watch([() => props.open, () => store.categories], () => {
  initializeBlocks()
}, { deep: true })

// Validity checks
const isValid = computed(() => {
  if (!modalForm.value.name) return false
  if (!props.isEdit && !modalForm.value.code) return false
  return true
})

// Submit
const submit = () => {
  if (!isValid.value) return

  // Merge selected ids across all blocks
  const ids = []
  categoryBlocks.value.forEach(block => {
    ids.push(...block.selectedGroupIds)
  })

  const payload = {
    name: modalForm.value.name,
    code: modalForm.value.code,
    description: modalForm.value.description,
    broker_group_config_ids: [...new Set(ids)]
  }

  const successCb = () => {
    emit('success')
    emit('close')
  }

  if (props.isEdit && props.editData) {
    store.updateReferralLink(props.ibId, props.editData.id, payload, successCb)
  } else {
    store.createReferralLink(props.ibId, payload, successCb)
  }
}
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
