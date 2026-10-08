<script setup>
import { ref, watch } from 'vue'
import { useLeadStageStore } from '@/stores/leadStage/leadStage'
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Layers,
  Check,
  Loader2,
  ArrowUpDown,
  AlertCircle
} from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'stages-updated'])

const stageStore = useLeadStageStore()

// State
const isEditing = ref(false)
const editingStageId = ref(null)
const deleteConfirmId = ref(null)

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#0EA5E9', // Sky
  '#F97316', // Orange
  '#64748B', // Slate
  '#14B8A6', // Teal
  '#EF4444', // Red
]

const form = ref({
  code: '',
  name: '',
  description: '',
  color: '#3B82F6',
  display_order: 1,
  is_active: true,
  is_system: false,
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      stageStore.fetchStages()
      resetForm()
    }
  }
)

const originalStage = ref(null)

function resetForm() {
  isEditing.value = false
  editingStageId.value = null
  deleteConfirmId.value = null
  originalStage.value = null
  const nextOrder = stageStore.stages.length ? Math.max(...stageStore.stages.map(s => s.display_order || 0)) + 1 : 1
  form.value = {
    code: '',
    name: '',
    description: '',
    color: '#3B82F6',
    display_order: nextOrder,
    is_active: true,
    is_system: false,
  }
}

function handleStartCreate() {
  resetForm()
  isEditing.value = true
}

function handleStartEdit(stage) {
  deleteConfirmId.value = null
  editingStageId.value = stage.id
  isEditing.value = true
  originalStage.value = { ...stage }
  form.value = {
    code: stage.code || '',
    name: stage.name || '',
    description: stage.description || '',
    color: stage.color || '#3B82F6',
    display_order: stage.display_order ?? 1,
    is_active: stage.is_active ?? true,
    is_system: stage.is_system ?? false,
  }
}

function getChangedPayload(original, current) {
  if (!original) return current
  const diff = {}

  if (current.name !== undefined && current.name !== original.name) {
    diff.name = current.name
  }
  if (current.code !== undefined && current.code !== original.code) {
    diff.code = current.code
  }
  if (current.description !== undefined && (current.description || '') !== (original.description || '')) {
    diff.description = current.description
  }
  if (current.color !== undefined && current.color !== original.color) {
    diff.color = current.color
  }
  if (current.display_order !== undefined && Number(current.display_order) !== Number(original.display_order)) {
    diff.display_order = Number(current.display_order)
  }
  if (current.is_active !== undefined && Boolean(current.is_active) !== Boolean(original.is_active)) {
    diff.is_active = Boolean(current.is_active)
  }
  if (current.is_system !== undefined && Boolean(current.is_system) !== Boolean(original.is_system)) {
    diff.is_system = Boolean(current.is_system)
  }

  return diff
}

async function handleSave() {
  if (!form.value.name.trim()) return

  try {
    if (editingStageId.value) {
      const changedPayload = getChangedPayload(originalStage.value, form.value)
      if (Object.keys(changedPayload).length > 0) {
        await stageStore.updateStage(editingStageId.value, changedPayload)
      }
    } else {
      if (!form.value.code.trim()) {
        form.value.code = form.value.name.trim().toUpperCase().replace(/\s+/g, '_')
      }
      await stageStore.createStage(form.value)
    }
    resetForm()
    emit('stages-updated')
  } catch (err) {
    // Error is handled in store with snackbar
  }
}

async function handleDelete(stage) {
  if (stage.is_system) return
  try {
    await stageStore.deleteStage(stage.id)
    deleteConfirmId.value = null
    emit('stages-updated')
  } catch (err) {
    // Error handled in store
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[540px] md:w-[620px] max-w-full bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-primary-text flex items-center gap-2">
                Lead Stages Management
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 border border-primary/20 text-primary font-medium">
                  {{ stageStore.stages.length }} Stages
                </span>
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Configure dynamic onboarding pipeline stages for lead management
              </p>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-lg hover:bg-background/80 flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <!-- Add / Edit Form Card -->
          <div v-if="isEditing" class="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
            <div class="flex items-center justify-between border-b border-primary/20 pb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">
                {{ editingStageId ? 'Edit Stage' : 'Create New Stage' }}
              </span>
              <button
                @click="resetForm"
                class="text-xs text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form @submit.prevent="handleSave" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Name -->
                <div>
                  <label class="block text-xs font-medium text-secondary-text mb-1">
                    Stage Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="e.g. KYC Pending"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border focus:border-primary focus:ring-1 focus:ring-primary text-xs text-primary-text outline-none transition-all"
                  />
                </div>

                <!-- Code -->
                <div>
                  <label class="block text-xs font-medium text-secondary-text mb-1">
                    Stage Code <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.code"
                    type="text"
                    :disabled="Boolean(editingStageId)"
                    placeholder="e.g. KYC_PENDING"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border focus:border-primary focus:ring-1 focus:ring-primary text-xs text-primary-text outline-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-medium text-secondary-text mb-1">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="Enter stage description..."
                  class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border focus:border-primary focus:ring-1 focus:ring-primary text-xs text-primary-text outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <!-- Display Order -->
                <div>
                  <label class="block text-xs font-medium text-secondary-text mb-1">
                    Display Order
                  </label>
                  <input
                    v-model.number="form.display_order"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border focus:border-primary focus:ring-1 focus:ring-primary text-xs text-primary-text outline-none transition-all"
                  />
                </div>

                <!-- Active Switch -->
                <div class="flex items-center gap-3 pt-4">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="form.is_active"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-primary-border"></div>
                  </label>
                  <span class="text-xs font-medium text-primary-text">
                    {{ form.is_active ? 'Active Stage' : 'Inactive Stage' }}
                  </span>
                </div>

                <!-- System Stage Switch -->
                <div class="flex items-center gap-3 pt-4">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="form.is_system"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 border border-primary-border"></div>
                  </label>
                  <span class="text-xs font-medium text-primary-text">
                    {{ form.is_system ? 'System Stage' : 'Standard Stage' }}
                  </span>
                </div>
              </div>

              <!-- Color Palette -->
              <div>
                <label class="block text-xs font-medium text-secondary-text mb-1.5">
                  Stage Tag Color
                </label>
                <div class="flex items-center gap-2 flex-wrap">
                  <button
                    v-for="c in defaultColors"
                    :key="c"
                    type="button"
                    @click="form.color = c"
                    class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer"
                    :style="{ backgroundColor: c }"
                    :class="form.color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'"
                  >
                    <Check v-if="form.color === c" class="w-3.5 h-3.5 text-white drop-shadow-xs" />
                  </button>
                  <input
                    v-model="form.color"
                    type="color"
                    class="w-7 h-7 rounded-lg border border-primary-border bg-background cursor-pointer p-0.5"
                  />
                </div>
              </div>

              <!-- Form Submit -->
              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-3 py-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-xs font-medium text-secondary-text transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="stageStore.actionLoading"
                  class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Loader2 v-if="stageStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
                  <span>{{ editingStageId ? 'Update Stage' : 'Save Stage' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Header Action to Add Stage if not editing -->
          <div v-else class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-secondary-text">
              Current Pipeline Stages
            </span>
            <button
              @click="handleStartCreate"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add New Stage</span>
            </button>
          </div>

          <!-- Stages List -->
          <div v-if="stageStore.loading" class="py-12 flex flex-col items-center justify-center gap-2 text-secondary-text">
            <Loader2 class="w-6 h-6 animate-spin text-primary" />
            <span class="text-xs">Loading stages...</span>
          </div>

          <div v-else-if="stageStore.stages.length === 0" class="py-12 text-center border border-dashed border-primary-border rounded-xl p-6">
            <Layers class="w-8 h-8 text-secondary-text mx-auto mb-2 opacity-50" />
            <p class="text-xs font-medium text-primary-text">No custom stages found</p>
            <p class="text-[11px] text-secondary-text mt-1">Click 'Add New Stage' to create your first dynamic stage.</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="stage in stageStore.stages"
              :key="stage.id || stage.code"
              class="flex items-center justify-between p-3.5 rounded-xl border border-primary-border bg-background/60 hover:bg-background transition-all group"
            >
              <!-- Left Details -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-secondary-text bg-card-background border border-primary-border shrink-0">
                  {{ stage.display_order ?? '#' }}
                </div>

                <div
                  class="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-xs"
                  :style="{ backgroundColor: stage.color || '#3B82F6' }"
                ></div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-primary-text truncate">
                      {{ stage.name }}
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-border/30 text-secondary-text uppercase">
                      {{ stage.code }}
                    </span>
                    <span
                      v-if="stage.is_system"
                      class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      title="System stage cannot be deleted"
                    >
                      <Lock class="w-2.5 h-2.5" />
                      System
                    </span>
                  </div>
                  <p v-if="stage.description" class="text-[11px] text-secondary-text truncate mt-0.5">
                    {{ stage.description }}
                  </p>
                </div>
              </div>

              <!-- Right Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <!-- Active Status Pill -->
                <span
                  :class="[
                    'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                    stage.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                  ]"
                >
                  {{ stage.is_active ? 'Active' : 'Inactive' }}
                </span>

                <!-- Delete confirmation toggle or buttons -->
                <template v-if="deleteConfirmId === stage.id">
                  <button
                    @click="handleDelete(stage)"
                    :disabled="stageStore.actionLoading"
                    class="px-2 py-1 rounded text-[11px] font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    @click="deleteConfirmId = null"
                    class="px-2 py-1 rounded text-[11px] font-medium bg-card-background border border-primary-border text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </template>

                <template v-else>
                  <!-- Edit Button -->
                  <button
                    @click="handleStartEdit(stage)"
                    class="p-1.5 rounded-lg hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    title="Edit Stage"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete Button -->
                  <button
                    @click="deleteConfirmId = stage.id"
                    :disabled="Boolean(stage.is_system)"
                    :class="[
                      'p-1.5 rounded-lg transition-colors cursor-pointer',
                      stage.is_system
                        ? 'opacity-30 cursor-not-allowed text-secondary-text'
                        : 'hover:bg-red-500/10 text-secondary-text hover:text-red-400'
                    ]"
                    :title="stage.is_system ? 'System stages cannot be deleted' : 'Delete Stage'"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-background/50 text-xs text-secondary-text shrink-0">
          <span class="flex items-center gap-1 text-[11px]">
            <AlertCircle class="w-3.5 h-3.5 text-primary" />
            Changes update pipeline steppers and filters automatically.
          </span>
          <button
            @click="emit('close')"
            class="px-4 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
