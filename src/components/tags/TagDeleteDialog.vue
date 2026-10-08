<script setup>
import { ref, watch, computed } from 'vue'
import { AlertTriangle, Trash2, X, Loader2, Info } from 'lucide-vue-next'
import { useTagsStore } from '@/stores/tags/tags'
import TagChip from '@/components/common/TagChip.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'deleted'])

const tagsStore = useTagsStore()

const force = ref(false)
const isDeleting = ref(false)
const inUseError = ref(null)

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      force.value = false
      inUseError.value = null
      if (props.tag && props.tag.total_usage_count > 0) {
        force.value = true
      }
    }
  }
)

const hasUsage = computed(() => {
  if (!props.tag) return false
  return (props.tag.total_usage_count || 0) > 0
})

const handleDelete = async () => {
  if (!props.tag) return
  isDeleting.value = true
  inUseError.value = null

  try {
    await tagsStore.deleteTag(props.tag.id, force.value)
    emit('deleted')
    emit('close')
  } catch (err) {
    const errData = err?.response?.data
    if (errData?.code === 'tag_in_use' || errData?.message?.includes('assigned')) {
      inUseError.value = errData.message || 'Tag is currently assigned to entities.'
      force.value = true // Automatically enable force option for user confirmation
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open && tag"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-card-background border border-primary-border shadow-2xl overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-background/50">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-primary-text">Delete Tag</h3>
              <p class="text-xs text-secondary-text">Confirm soft deletion of tag</p>
            </div>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between p-3 rounded-xl bg-background border border-primary-border">
            <span class="text-xs text-secondary-text">Tag to delete:</span>
            <TagChip :tag="tag" />
          </div>

          <!-- Usage Warning -->
          <div v-if="hasUsage || inUseError" class="p-4 rounded-xl bg-primary-red/10 border border-primary-red/30 text-xs space-y-2">
            <div class="flex items-center gap-2 text-primary-red font-semibold text-sm">
              <AlertTriangle class="w-4 h-4" />
              Tag is currently in use!
            </div>
            <p class="text-primary-text">
              {{ inUseError || 'This tag is assigned to active entities across the system:' }}
            </p>
            <div class="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
              <div class="p-2 rounded-lg bg-background border border-primary-border">
                <span class="block text-secondary-text">Leads</span>
                <span class="font-bold text-primary-text">{{ tag.lead_usage_count || 0 }}</span>
              </div>
              <div class="p-2 rounded-lg bg-background border border-primary-border">
                <span class="block text-secondary-text">Clients</span>
                <span class="font-bold text-primary-text">{{ tag.user_usage_count || 0 }}</span>
              </div>
              <div class="p-2 rounded-lg bg-background border border-primary-border">
                <span class="block text-secondary-text">Total</span>
                <span class="font-bold text-primary-red">{{ tag.total_usage_count || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Force Checkbox -->
          <div v-if="hasUsage || inUseError" class="flex items-start gap-2 pt-1">
            <input
              id="force-delete-checkbox"
              v-model="force"
              type="checkbox"
              class="mt-0.5 rounded border-primary-border bg-background text-primary-red focus:ring-primary-red cursor-pointer"
            />
            <label for="force-delete-checkbox" class="text-xs text-primary-text select-none cursor-pointer">
              Force delete (Remove all assignments from leads/users then soft-delete tag)
            </label>
          </div>

          <p v-else class="text-xs text-primary-text">
            Are you sure you want to delete <strong class="text-primary-text">{{ tag.name }}</strong>? This action will soft-delete the tag.
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-border bg-background/50">
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium rounded-lg border border-primary-border text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            :disabled="isDeleting"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium rounded-lg bg-primary-red hover:bg-red-600 text-white transition-colors flex items-center gap-2 cursor-pointer"
            :disabled="isDeleting || (hasUsage && !force)"
            @click="handleDelete"
          >
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
            <Trash2 v-else class="w-3.5 h-3.5" />
            <span>{{ force ? 'Force Delete Tag' : 'Delete Tag' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
