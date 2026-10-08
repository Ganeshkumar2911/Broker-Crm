<template>
  <div class="space-y-4">
    <!-- Info Banner -->
    <div class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
      <PlusCircle class="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div class="text-xs">
        <p class="font-medium text-primary-text">Grant Custom Permissions</p>
        <p class="text-secondary-text text-[11px] mt-0.5">
          Select permissions to <strong>grant</strong> as user-specific custom overrides (`flag_custom: true`).
        </p>
      </div>
    </div>

    <!-- Empty Search / No Data -->
    <div
      v-if="Object.keys(filteredPermissions).length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center mb-3">
        <Search v-if="searchQuery" class="w-5 h-5 text-secondary-text" />
        <CheckCircle2 v-else class="w-5 h-5 text-primary-green" />
      </div>
      <p class="text-xs font-semibold text-primary-text">
        {{ searchQuery ? 'No matching available permissions found' : 'All permissions granted' }}
      </p>
      <p class="text-[11px] text-secondary-text mt-1">
        {{ searchQuery ? 'Try adjusting your search criteria' : 'This user already has all available system permissions assigned.' }}
      </p>
    </div>

    <!-- Permission Cards by Resource -->
    <div
      v-else
      v-for="(perms, resource) in filteredPermissions"
      :key="resource"
      class="bg-background border border-primary-border rounded-xl overflow-hidden transition-all duration-150"
    >
      <!-- Header -->
      <div class="px-4 py-3 bg-card-background/50 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-primary" />
          <span class="text-xs font-semibold text-primary-text capitalize tracking-wide">
            {{ resource.replace(/_/g, ' ') }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-background text-secondary-text border border-primary-border font-medium">
            {{ getSelectedCount(perms) }} / {{ perms.length }} Selected to Grant
          </span>
        </div>

        <button
          type="button"
          class="flex items-center gap-1.5 text-[11px] text-secondary-text hover:text-primary-text font-medium cursor-pointer transition-colors"
          @click="emit('toggle-resource', perms)"
        >
          <span>{{ isResourceFullySelected(perms) ? 'Deselect Module' : 'Select Module' }}</span>
          <div
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
            :class="isResourceFullySelected(perms) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
          >
            <Check v-if="isResourceFullySelected(perms)" class="w-3 h-3 text-white" />
          </div>
        </button>
      </div>

      <!-- Grid -->
      <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="perm in perms"
          :key="getPermId(perm)"
          class="flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none"
          :class="selectedIds.includes(getPermId(perm))
            ? 'bg-primary/10 border-primary/40 text-primary-text'
            : 'bg-card-background border-primary-border/60 hover:border-primary-border text-secondary-text hover:text-primary-text'"
          @click="emit('toggle-permission', getPermId(perm))"
        >
          <div class="min-w-0 pr-2">
            <p class="text-xs font-medium capitalize truncate">
              {{ perm.action ? perm.action.replace(/_/g, ' ') : formatCodeToAction(perm.code) }}
            </p>
            <p class="text-[10px] text-secondary-text/80 truncate font-mono mt-0.5">
              {{ perm.code }}
            </p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span v-if="selectedIds.includes(getPermId(perm))" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase">
              Will Grant
            </span>
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
              :class="selectedIds.includes(getPermId(perm)) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
            >
              <Check v-if="selectedIds.includes(getPermId(perm))" class="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search, PlusCircle, CheckCircle2, Layers, Check } from 'lucide-vue-next'
import { useUserPermissions } from '@/composables/useUserPermissions'

const props = defineProps({
  permissions: { type: Object, default: () => ({}) },
  selectedIds: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['toggle-permission', 'toggle-resource'])
const { getPermId } = useUserPermissions()

const formatCodeToAction = (code) => {
  if (!code) return 'Permission'
  const parts = code.split('.')
  return parts.length > 1 ? parts.slice(1).join(' ').replace(/_/g, ' ') : code
}

const filteredPermissions = computed(() => {
  const query = props.searchQuery.trim().toLowerCase()
  if (!query) return props.permissions || {}

  const result = {}
  Object.entries(props.permissions || {}).forEach(([resource, perms]) => {
    const resourceMatch = resource.replace(/_/g, ' ').toLowerCase().includes(query)
    const matchingPerms = perms.filter((perm) => {
      const codeMatch = perm.code?.toLowerCase().includes(query)
      const actionMatch = perm.action?.replace(/_/g, ' ').toLowerCase().includes(query)
      return resourceMatch || codeMatch || actionMatch
    })
    if (matchingPerms.length > 0) {
      result[resource] = matchingPerms
    }
  })
  return result
})

const getSelectedCount = (perms) => {
  return perms.filter((p) => props.selectedIds.includes(getPermId(p))).length
}

const isResourceFullySelected = (perms) => {
  if (!perms || perms.length === 0) return false
  return perms.every((p) => props.selectedIds.includes(getPermId(p)))
}
</script>
