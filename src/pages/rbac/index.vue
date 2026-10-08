<template>
  <div class="px-4 pb-8">
    <div
      v-if="tabs.length > 1"
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-6"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
        :class="activeTab === tab.value ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <StaffTab
      v-if="activeTab === 'staff' && hasPermission(['team_management.view', 'team_management.create', 'team_management.role_manage', 'team_management.role_view'])"
    />
    <RolesTab
      v-if="activeTab === 'roles' && hasPermission(['team_management.role_manage', 'role.manage'])"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StaffTab from '@/components/rbac/StaffTab.vue'
import RolesTab from '@/components/rbac/RolesTab.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const { hasPermission } = usePermissionCheck()

const allTabs = [
  {
    label: 'Staff',
    value: 'staff',
    permission: ['team_management.view', 'team_management.create', 'team_management.role_manage', 'team_management.role_view', 'role.manage'],
  },
  {
    label: 'Roles',
    value: 'roles',
    permission: ['team_management.role_manage', 'role.manage'],
  },
]

const tabs = computed(() => {
  return allTabs.filter((tab) => hasPermission(tab.permission))
})

const activeTab = ref('staff')

watch(
  tabs,
  (newTabs) => {
    if (newTabs.length > 0 && !newTabs.some((t) => t.value === activeTab.value)) {
      activeTab.value = newTabs[0].value
    }
  },
  { immediate: true }
)
</script>