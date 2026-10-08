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
                <KeyRound class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">Create Permission Mapping</h2>
                <p class="text-xs text-secondary-text mt-0.5">
                  Link a resource and an action together to register a permission.
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
            <!-- Resource Select -->
            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">
                Select Resource <span class="text-primary-red">*</span>
              </label>
              <BaseSelect
                v-model="form.resource_id"
                :options="resourceOptions"
                placeholder="Select Resource..."
                variant="surface"
                searchable
                local-search
              />
              <p class="text-[11px] text-secondary-text mt-1">The target module/resource to control access for.</p>
            </div>

            <!-- Action Select -->
            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">
                Select Action <span class="text-primary-red">*</span>
              </label>
              <BaseSelect
                v-model="form.action_id"
                :options="actionOptions"
                placeholder="Select Action..."
                variant="surface"
                searchable
                local-search
              />
              <p class="text-[11px] text-secondary-text mt-1">The operation or action permitted on this resource.</p>
            </div>

            <!-- Permission Code -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Permission Code <span class="text-primary-red">*</span>
                </label>
                <button
                  type="button"
                  class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  @click="generateCode"
                >
                  Reset Code Format
                </button>
              </div>
              <input
                v-model="form.code"
                type="text"
                placeholder="e.g. xtention_dev.view"
                class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs font-mono outline-none focus:border-primary transition-all placeholder:text-secondary-text"
              />
              <p class="text-[11px] text-secondary-text mt-1">
                Unique code string referenced in application code (convention: <code class="text-primary font-mono">resource_slug.action_slug</code>).
              </p>
            </div>

            <!-- Summary Box -->
            <div
              v-if="selectedResource && selectedAction"
              class="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2"
            >
              <h4 class="text-xs font-semibold text-primary">Summary Mapping</h4>
              <div class="text-xs text-primary-text space-y-1">
                <div class="flex justify-between">
                  <span class="text-secondary-text">Resource:</span>
                  <span class="font-medium">{{ selectedResource.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary-text">Action:</span>
                  <span class="font-medium">{{ selectedAction.name }}</span>
                </div>
                <div class="flex justify-between border-t border-primary/10 pt-1.5 mt-1.5">
                  <span class="text-secondary-text">Final Code:</span>
                  <span class="font-mono text-primary font-bold">{{ form.code }}</span>
                </div>
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
              :disabled="store.actionLoading || !form.resource_id || !form.action_id || !form.code"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              @click="submit"
            >
              <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ store.actionLoading ? 'Creating...' : 'Create Permission' }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { KeyRound, X, Loader2 } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
const store = useRbacModulesStore()

const form = ref({
  resource_id: null,
  action_id: null,
  code: '',
})

const resourceOptions = computed(() => {
  return store.resources.map((r) => ({
    label: `${r.name} (${r.slug})`,
    value: r.id,
  }))
})

const actionOptions = computed(() => {
  return store.actions.map((a) => ({
    label: `${a.name} (${a.slug})`,
    value: a.id,
  }))
})

const selectedResource = computed(() => {
  return store.resources.find((r) => r.id === form.value.resource_id) || null
})

const selectedAction = computed(() => {
  return store.actions.find((a) => a.id === form.value.action_id) || null
})

const generateCode = () => {
  if (selectedResource.value && selectedAction.value) {
    form.value.code = `${selectedResource.value.slug}.${selectedAction.value.slug}`
  }
}

watch(
  [() => form.value.resource_id, () => form.value.action_id],
  () => {
    generateCode()
  }
)

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = { resource_id: null, action_id: null, code: '' }
      if (store.resources.length > 0) {
        form.value.resource_id = store.resources[0].id
      }
      if (store.actions.length > 0) {
        form.value.action_id = store.actions[0].id
      }
      generateCode()
    }
  }
)

const submit = () => {
  if (!form.value.resource_id || !form.value.action_id || !form.value.code) return
  store.createPermissionMapping(
    {
      resource_id: form.value.resource_id,
      action_id: form.value.action_id,
      code: form.value.code,
    },
    () => emit('close')
  )
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
