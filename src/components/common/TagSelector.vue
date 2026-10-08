<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search, Loader2, Plus, Tag as TagIcon, AlertCircle } from 'lucide-vue-next'
import { useTagsStore } from '@/stores/tags/tags'
import TagChip from '@/components/common/TagChip.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [], // Array of tag objects or tag IDs
  },
  entityType: {
    type: String,
    default: 'lead', // 'lead' or 'user'
  },
  maxLimit: {
    type: Number,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: 'Search and select tags...',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const tagsStore = useTagsStore()
const searchInput = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const isOpen = ref(false)
const dropdownRef = ref(null)

let searchTimer = null
let lastSearchedQuery = null

// Compute current limit
const effectiveLimit = computed(() => {
  if (props.maxLimit !== null && props.maxLimit !== undefined) return props.maxLimit
  return tagsStore.limits[props.entityType] || (props.entityType === 'user' ? 5 : 10)
})

// Current selected tags list (normalized as objects)
const selectedTags = computed(() => {
  return props.modelValue || []
})

const isLimitReached = computed(() => {
  return selectedTags.value.length >= effectiveLimit.value
})

// Search tags endpoint call with debouncing and caching
const performSearch = async (q) => {
  if (lastSearchedQuery === q && searchResults.value.length > 0) {
    isOpen.value = true
    return
  }
  searchLoading.value = true
  isOpen.value = true
  try {
    const results = await tagsStore.searchTags(q, {
      page: 1,
      perPage: 20,
      status: 'active',
      sortBy: 'usage_count',
      sortOrder: 'desc',
    })
    searchResults.value = results
    lastSearchedQuery = q
  } catch (err) {
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const handleSearchInput = () => {
  clearTimeout(searchTimer)
  const q = searchInput.value.trim()
  searchTimer = setTimeout(() => {
    performSearch(q)
  }, 300)
}

const handleFocus = () => {
  if (!props.disabled) {
    isOpen.value = true
    const q = searchInput.value.trim()
    if (searchResults.value.length === 0 || lastSearchedQuery !== q) {
      performSearch(q)
    }
  }
}

// Click outside handler
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  tagsStore.fetchLimits()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(searchTimer)
})

// Select a tag
const selectTag = (tag) => {
  if (isLimitReached.value) return
  
  const existing = selectedTags.value.find((t) => (t.id || t) === tag.id)
  if (!existing) {
    const updated = [...selectedTags.value, tag]
    emit('update:modelValue', updated)
    emit('change', updated)
  }
  searchInput.value = ''
  isOpen.value = false
}

// Remove a tag
const removeTag = (tagToRemove) => {
  if (props.disabled) return
  const tagId = tagToRemove.id || tagToRemove
  const updated = selectedTags.value.filter((t) => (t.id || t) !== tagId)
  emit('update:modelValue', updated)
  emit('change', updated)
}

// Filter out tags that are already selected
const availableSearchResults = computed(() => {
  const selectedIds = new Set(selectedTags.value.map((t) => t.id || t))
  return searchResults.value.filter((t) => !selectedIds.has(t.id))
})
</script>

<template>
  <div ref="dropdownRef" class="relative w-full space-y-2">
    <!-- Selected Chips Container -->
    <div
      class="flex flex-wrap items-center gap-1.5 min-h-10.5 p-2 rounded-lg border border-primary-border bg-background focus-within:border-primary transition-colors"
      :class="{ 'opacity-60 pointer-events-none': disabled }"
    >
      <TagChip
        v-for="tag in selectedTags"
        :key="tag.id || tag"
        :tag="typeof tag === 'object' ? tag : { id: tag, name: `Tag #${tag}`, color: '#3B82F6' }"
        :removable="!disabled"
        size="md"
        @remove="removeTag"
      />

      <!-- Search Input inline -->
      <div v-if="!isLimitReached" class="flex-1 min-w-30">
        <input
          v-model="searchInput"
          type="text"
          :placeholder="selectedTags.length === 0 ? placeholder : 'Add tag...'"
          :disabled="disabled"
          class="w-full bg-transparent border-none text-xs text-primary-text placeholder-secondary-text focus:outline-none focus:ring-0 py-1 px-1"
          @input="handleSearchInput"
          @focus="handleFocus"
        />
      </div>

      <span v-else class="text-xs text-primary-yellow font-medium py-1 px-2 flex items-center gap-1">
        <AlertCircle class="w-3.5 h-3.5" />
        Max limit reached ({{ effectiveLimit }})
      </span>
    </div>

    <!-- Tag Limit Indicator -->
    <div class="flex justify-between items-center text-[11px] text-secondary-text px-1">
      <span>Entity: <strong class="capitalize text-primary-text">{{ entityType }}</strong></span>
      <span>
        {{ selectedTags.length }} / {{ effectiveLimit }} tags
      </span>
    </div>

    <!-- Dropdown Results -->
    <div
      v-if="isOpen && !disabled && !isLimitReached"
      class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg bg-card-background border border-primary-border shadow-2xl no-scrollbar py-1"
    >
      <!-- Loading indicator -->
      <div v-if="searchLoading" class="p-3 text-center text-xs text-secondary-text flex items-center justify-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin text-primary" />
        Searching tags...
      </div>

      <!-- No results -->
      <div v-else-if="availableSearchResults.length === 0" class="p-3 text-center text-xs text-secondary-text">
        No assignable tags found matching "{{ searchInput }}"
      </div>

      <!-- Result items -->
      <div v-else class="divide-y divide-primary-border/60">
        <button
          v-for="tag in availableSearchResults"
          :key="tag.id"
          type="button"
          class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-background transition-colors"
          @click="selectTag(tag)"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: tag.color || '#3B82F6' }" />
            <div>
              <span class="font-medium text-primary-text">{{ tag.name }}</span>
              <p v-if="tag.description" class="text-[10px] text-secondary-text truncate max-w-xs">{{ tag.description }}</p>
            </div>
          </div>
          <Plus class="w-3.5 h-3.5 text-secondary-text hover:text-primary-text" />
        </button>
      </div>
    </div>
  </div>
</template>
