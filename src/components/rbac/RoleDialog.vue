<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="emit('close')">
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">{{ isEdit ? 'Edit Role' : 'Create Role' }}</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Role Name</p>
          <input v-model="form.name" type="text" placeholder="e.g. Support Agent"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text" />
        </div>
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Description</p>
          <textarea v-model="form.description" rows="2" placeholder="Brief role description..."
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-none" />
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors" @click="emit('close')">Cancel</button>
        <button
          :disabled="store.actionLoading || !form.name"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { useRbacRolesStore } from '@/stores/rbac/roles'

const props = defineProps({ open: { type: Boolean, default: false }, editData: { type: Object, default: null } })
const emit  = defineEmits(['close'])
const store = useRbacRolesStore()

const isEdit = computed(() => !!props.editData)
const form = ref({ name: '', description: '' })

watch(() => props.open, (val) => {
  if (val) form.value = { name: props.editData?.name ?? '', description: props.editData?.description ?? '' }
})

const submit = () => {
  if (isEdit.value) {
    store.updateRole(props.editData.id, form.value, () => emit('close'))
  } else {
    store.createRole(form.value, () => emit('close'))
  }
}
</script>