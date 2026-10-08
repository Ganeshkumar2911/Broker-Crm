<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Top Banner / Header -->

    <!-- Segmented Tab Navigation -->
    <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        :class="activeTab === tab.value
          ? 'bg-primary text-white shadow-xs'
          : 'text-secondary-text hover:text-primary-text hover:bg-background/50'"
        @click="activeTab = tab.value"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
        <span
          class="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full"
          :class="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-background text-secondary-text'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Tab Contents -->
    <div>
      <ResourcesTab
        v-if="activeTab === 'resources'"
        @open-quick-module="quickModuleOpen = true"
      />
      <ActionsTab
        v-else-if="activeTab === 'actions'"
      />
      <PermissionsMappingTab
        v-else-if="activeTab === 'permissions'"
      />
    </div>

    <!-- Quick Module Wizard Drawer -->
    <QuickModuleDrawer
      :open="quickModuleOpen"
      @close="quickModuleOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Layers, Box, Zap, KeyRound, PlusCircle } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'
import ResourcesTab from '@/components/rbac/ResourcesTab.vue'
import ActionsTab from '@/components/rbac/ActionsTab.vue'
import PermissionsMappingTab from '@/components/rbac/PermissionsMappingTab.vue'
import QuickModuleDrawer from '@/components/rbac/QuickModuleDrawer.vue'

const store = useRbacModulesStore()

const activeTab = ref('resources')
const quickModuleOpen = ref(false)

const tabs = computed(() => [
  {
    label: 'Resources',
    value: 'resources',
    icon: Box,
    count: store.resources.length,
  },
  {
    label: 'Actions',
    value: 'actions',
    icon: Zap,
    count: store.actions.length,
  },
  {
    label: 'Permissions Mapping',
    value: 'permissions',
    icon: KeyRound,
    count: store.permissionsMapping.length,
  },
])

onMounted(() => {
  store.fetchAll()
})
</script>
