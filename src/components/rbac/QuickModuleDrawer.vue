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
          class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Layers class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">Add New Module</h2>
                <p class="text-xs text-secondary-text mt-0.5">
                  Create a resource and generate permission mappings in one step.
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
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Resource / Module Section -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider text-secondary-text border-b border-primary-border pb-2">
                1. Resource / Module Info
              </h3>

              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">
                  Module Name <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Extension Dev, Crypto Wallet, KYC Verification"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                  @input="onNameInput"
                />
              </div>

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
                  placeholder="e.g. xtention_dev, crypto_wallet, kyc"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs font-mono outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                />
              </div>
            </div>

            <!-- Actions Selection -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-primary-border pb-2">
                <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider text-secondary-text">
                  2. Select Actions to Register
                </h3>
                <div class="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    class="text-primary hover:underline font-medium cursor-pointer"
                    @click="selectAllActions"
                  >
                    Select All
                  </button>
                  <span class="text-secondary-text">•</span>
                  <button
                    type="button"
                    class="text-secondary-text hover:text-primary-text font-medium cursor-pointer"
                    @click="deselectAllActions"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div
                v-if="store.actions.length === 0"
                class="p-4 rounded-xl bg-background border border-primary-border text-center text-xs text-secondary-text"
              >
                No actions registered yet. Standard actions will be used.
              </div>

              <div v-else class="grid grid-cols-2 gap-2.5">
                <label
                  v-for="act in store.actions"
                  :key="act.id"
                  class="flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none"
                  :class="selectedActionIds.includes(act.id)
                    ? 'bg-primary/10 border-primary/40 text-primary-text'
                    : 'bg-background border-primary-border text-secondary-text hover:border-primary-border/80'"
                >
                  <input
                    type="checkbox"
                    :value="act.id"
                    v-model="selectedActionIds"
                    class="w-4 h-4 rounded text-primary border-primary-border focus:ring-primary bg-background cursor-pointer"
                  />
                  <div class="min-w-0">
                    <p class="text-xs font-semibold truncate">{{ act.name }}</p>
                    <p class="text-[10px] font-mono text-secondary-text truncate">{{ act.slug }}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Permission Mappings Preview -->
            <div
              v-if="form.slug && selectedActionIds.length > 0"
              class="p-4 rounded-xl bg-background/80 border border-primary-border space-y-2.5"
            >
              <div class="flex items-center justify-between text-xs font-semibold text-primary-text">
                <span class="flex items-center gap-1.5">
                  <Sparkles class="w-4 h-4 text-amber-400" />
                  Generated Permission Codes ({{ selectedActionIds.length }})
                </span>
              </div>

              <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                <span
                  v-for="code in generatedCodes"
                  :key="code"
                  class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-[11px] font-mono text-primary font-medium flex items-center gap-1"
                >
                  <Check class="w-3 h-3 text-emerald-400" />
                  {{ code }}
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
              :disabled="loading || !form.name || !form.slug"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              @click="submit"
            >
              <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ loading ? 'Creating Module...' : 'Create Module & Permissions' }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Layers, X, Loader2, Sparkles, Check } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
const store = useRbacModulesStore()
const snackbar = useSnackbarStore()

const loading = ref(false)
const form = ref({ name: '', slug: '' })
const selectedActionIds = ref([])

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
  form.value.slug = slugify(form.value.name)
}

const generateSlug = () => {
  form.value.slug = slugify(form.value.name)
}

const selectAllActions = () => {
  selectedActionIds.value = store.actions.map((a) => a.id)
}

const deselectAllActions = () => {
  selectedActionIds.value = []
}

const generatedCodes = computed(() => {
  if (!form.value.slug) return []
  return selectedActionIds.value.map((actionId) => {
    const act = store.actions.find((a) => a.id === actionId)
    return act ? `${form.value.slug}.${act.slug}` : `${form.value.slug}.action`
  })
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = { name: '', slug: '' }
      // Default to selecting view, create, edit, delete if available
      selectedActionIds.value = store.actions
        .filter((a) => ['view', 'create', 'edit', 'delete'].includes(a.slug))
        .map((a) => a.id)
      if (selectedActionIds.value.length === 0 && store.actions.length > 0) {
        selectedActionIds.value = store.actions.map((a) => a.id)
      }
    }
  }
)

const submit = async () => {
  if (!form.value.name || !form.value.slug) return

  loading.value = true
  try {
    // Step 1: Create Resource
    const resResponse = await new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.rbac.resources.create, {
        isTokenRequired: true,
        data: {
          name: form.value.name,
          slug: form.value.slug,
        },
        onSuccess: (res) => resolve(res),
        onFailure: (err) => reject(err),
      })
    })

    const newResourceId = resResponse?.data?.id || resResponse?.id

    // Step 2: Create Permission Mappings for selected actions
    if (newResourceId && selectedActionIds.value.length > 0) {
      for (const actionId of selectedActionIds.value) {
        const act = store.actions.find((a) => a.id === actionId)
        if (act) {
          const code = `${form.value.slug}.${act.slug}`
          await new Promise((resolve) => {
            apiRequest(urls.KEYS.POST, urls.rbac.permissionsMapping.create, {
              isTokenRequired: true,
              data: {
                resource_id: newResourceId,
                action_id: actionId,
                code: code,
              },
              onSuccess: () => resolve(),
              onFailure: () => resolve(), // Continue even if individual mapping fails
            })
          })
        }
      }
    }

    snackbar.show(`Module "${form.value.name}" and permissions created successfully!`, 'success')
    store.fetchAll(true)
    loading.value = false
    emit('close')
  } catch (err) {
    loading.value = false
    snackbar.show(err?.message || 'Failed to create module.', 'error')
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
