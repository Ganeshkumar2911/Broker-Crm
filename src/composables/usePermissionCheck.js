import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'

/**
 * Reusable Composable for Checking Permissions in Components
 */
export function usePermissionCheck() {
  const store = useMyPermissionsStore()
  
  // Extract reactive state/computed properties properly
  const { 
    hasNoPermissions, 
    userCodes, 
    permissions, 
    loading, 
    isFetched 
  } = storeToRefs(store)

  return {
    // Actions / Functions (these don't lose reactivity)
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    hasAllPermissions: store.hasAllPermissions,
    hasModulePermission: store.hasModulePermission,
    
    // Reactive State / Computed properties
    hasNoPermissions,
    userCodes,
    permissions,
    loading,
    isFetched,
  }
}
