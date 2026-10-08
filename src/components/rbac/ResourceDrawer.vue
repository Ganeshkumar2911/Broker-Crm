<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="emit('close')"
        />
      </Transition>

      <!-- Side Panel Drawer -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Box class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">
                  {{ isEdit ? 'Edit Resource' : 'Create New Resource' }}
                </h2>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{ isEdit ? 'Update module resource details.' : 'Define a new module or system resource.' }}
                </p>
              </div>
            </div>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- Body Form -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5">
            <!-- Resource Name -->
            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">
                Resource Name <span class="text-primary-red">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Extension Dev, Client Wallet"
                class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                @input="onNameInput"
              />
              <p class="text-[11px] text-secondary-text mt-1">Human-readable label for this module or section.</p>
            </div>

            <!-- Resource Slug -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Resource Slug <span class="text-primary-red">*</span>
                </label>
                <button
                  type="button"
                  class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  @click="generateSlug"
                >
                  Auto-slugify
                </button>
              </div>
              <input
                v-model="form.slug"
                type="text"
                placeholder="e.g. xtention_dev, client_wallet"
                class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs font-mono outline-none focus:border-primary transition-all placeholder:text-secondary-text"
              />
              <p class="text-[11px] text-secondary-text mt-1">Unique identifier slug used in permission codes (must be unique).</p>
            </div>

            <!-- Code Preview Box -->
            <div class="p-4 rounded-xl bg-background/60 border border-primary-border/60 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary-text">
                <Sparkles class="w-4 h-4 text-amber-400" />
                <span>Permission Code Preview</span>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <span class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border font-mono text-[11px] text-primary font-medium">
                  {{ (form.slug || 'slug_name') }}.view
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border font-mono text-[11px] text-primary font-medium">
                  {{ (form.slug || 'slug_name') }}.edit
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border font-mono text-[11px] text-primary font-medium">
                  {{ (form.slug || 'slug_name') }}.delete
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 shrink-0 bg-card-background">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              :disabled="store.actionLoading || !form.name || !form.slug"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              @click="submit"
            >
              <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ store.actionLoading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Resource') }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Box, X, Loader2, Sparkles } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const store = useRbacModulesStore()

const isEdit = computed(() => !!props.editData)
const form = ref({ name: '', slug: '' })
const isSlugTouched = ref(false)

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '_')
}

const onNameInput = () => {
  if (!isSlugTouched.value || !isEdit.value) {
    form.value.slug = slugify(form.value.name)
  }
}

const generateSlug = () => {
  form.value.slug = slugify(form.value.name)
  isSlugTouched.value = true
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      isSlugTouched.value = false
      if (props.editData) {
        form.value = { name: props.editData.name || '', slug: props.editData.slug || '' }
      } else {
        form.value = { name: '', slug: '' }
      }
    }
  }
)

const submit = () => {
  if (!form.value.name || !form.value.slug) return
  if (isEdit.value) {
    store.updateResource(props.editData.id, form.value, () => emit('close'))
  } else {
    store.createResource(form.value, () => emit('close'))
  }
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
