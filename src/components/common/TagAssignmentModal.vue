<script setup>
import { ref, computed, watch } from 'vue'
import { X, Tag as TagIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useTagsStore } from '@/stores/tags/tags'
import TagSelector from '@/components/common/TagSelector.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  entityType: {
    type: String,
    default: 'lead', // 'lead' or 'user'
  },
  entityId: {
    type: [Number, String],
    default: null,
  },
  entityIds: {
    type: Array,
    default: () => [],
  },
  currentTags: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'updated'])

const tagsStore = useTagsStore()

const mode = ref('replace') // 'replace', 'assign', 'remove'
const selectedTags = ref([])
const saving = ref(false)
const failedResults = ref([])
const showSummary = ref(false)

const isBulk = computed(() => props.entityIds && props.entityIds.length > 0)

const modalTitle = computed(() => {
  if (props.title) return props.title
  if (isBulk.value) {
    return `Manage Tags (${props.entityIds.length} ${props.entityType === 'user' ? 'Clients' : 'Leads'})`
  }
  return `Manage Tags (${props.entityType === 'user' ? 'Client' : 'Lead'} #${props.entityId || ''})`
})

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      failedResults.value = []
      showSummary.value = false
      mode.value = isBulk.value ? 'assign' : 'replace'
      selectedTags.value = [...(props.currentTags || [])]
    }
  }
)

const handleSave = async () => {
  saving.value = true
  failedResults.value = []

  const tagIds = selectedTags.value.map((t) => (typeof t === 'object' ? t.id : t))

  try {
    if (isBulk.value) {
      const res = await tagsStore.bulkMutateTags(
        props.entityType,
        props.entityIds,
        tagIds,
        mode.value
      )
      if (res?.failed && res.failed.length > 0) {
        failedResults.value = res.failed
        showSummary.value = true
      } else {
        emit('updated', res)
        emit('close')
      }
    } else {
      const res = await tagsStore.mutateEntityTags(
        props.entityType,
        props.entityId,
        tagIds,
        mode.value
      )
      emit('updated', res)
      emit('close')
    }
  } catch (err) {
    // Error notification handled in store
  } finally {
    saving.value = false
  }
}

const handleCloseSummary = () => {
  emit('updated')
  emit('close')
}
</script>

<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/45 backdrop-blur-xs cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Side Panel Drawer -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-primary/10 text-primary">
              <TagIcon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-primary-text">{{ modalTitle }}</h3>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ isBulk ? 'Bulk update tag assignments for selected records' : 'Assign or update tags for this record' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Summary View after Partial Failure in Bulk -->
          <div v-if="showSummary" class="space-y-4">
            <div class="p-4 rounded-xl bg-primary-yellow/10 border border-primary-yellow/30 text-xs text-primary-yellow">
              <div class="flex items-center gap-2 font-medium text-sm mb-1">
                <AlertCircle class="w-4 h-4" />
                Bulk Tag Operation Completed with Warnings
              </div>
              <p>Some items could not be updated due to tag limits or errors.</p>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 class="text-xs font-semibold text-primary-text">Failed Items ({{ failedResults.length }}):</h4>
              <div
                v-for="item in failedResults"
                :key="item.entity_id"
                class="p-2.5 rounded-lg bg-background border border-primary-border text-xs flex justify-between items-center"
              >
                <span class="font-mono text-primary-text">ID #{{ item.entity_id }}</span>
                <span class="text-primary-red font-medium">{{ item.message || item.code }}</span>
              </div>
            </div>
          </div>

          <!-- Normal Form -->
          <template v-else>
            <!-- Assignment Mode Switch -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-primary-text uppercase tracking-wider block">Assignment Mode</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  class="py-2 px-2.5 text-xs font-medium rounded-lg border transition-all cursor-pointer text-center"
                  :class="
                    mode === 'replace'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'
                  "
                  @click="mode = 'replace'"
                >
                  Replace
                </button>
                <button
                  type="button"
                  class="py-2 px-2.5 text-xs font-medium rounded-lg border transition-all cursor-pointer text-center"
                  :class="
                    mode === 'assign'
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'
                  "
                  @click="mode = 'assign'"
                >
                  Assign (Add)
                </button>
                <button
                  type="button"
                  class="py-2 px-2.5 text-xs font-medium rounded-lg border transition-all cursor-pointer text-center"
                  :class="
                    mode === 'remove'
                      ? 'bg-primary-red/10 border-primary-red text-primary-red font-semibold'
                      : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'
                  "
                  @click="mode = 'remove'"
                >
                  Remove
                </button>
              </div>
              <p class="text-[11px] text-secondary-text bg-background/50 border border-primary-border p-2.5 rounded-lg">
                <span v-if="mode === 'replace'">Overwrites existing tags with the exact tag set selected below.</span>
                <span v-else-if="mode === 'assign'">Adds the selected tags without modifying existing tags.</span>
                <span v-else>Removes the selected tags from the record.</span>
              </p>
            </div>

            <!-- Tag Selector Input -->
            <div class="space-y-2 pt-2">
              <label class="text-xs font-semibold text-primary-text uppercase tracking-wider block">Tag Assignment</label>
              <TagSelector
                v-model="selectedTags"
                :entity-type="entityType"
                :disabled="saving"
              />
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-border bg-background/50 shrink-0">
          <template v-if="showSummary">
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary transition-colors cursor-pointer"
              @click="handleCloseSummary"
            >
              Done
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium rounded-lg border border-primary-border text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
              :disabled="saving"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary transition-colors flex items-center gap-2 cursor-pointer"
              :disabled="saving"
              @click="handleSave"
            >
              <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <span>Save Changes</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

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
