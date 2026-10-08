import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'

/**
 * Reusable Composable for Checking Permissions in Components
 */
export function usePermissionCheck() {
  const store = useMyPermissionsStore()

  return {
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    hasAllPermissions: store.hasAllPermissions,
    hasModulePermission: store.hasModulePermission,
    hasNoPermissions: store.hasNoPermissions,
    userCodes: store.userCodes,
    permissions: store.permissions,
    loading: store.loading,
    isFetched: store.isFetched,
  }
}
