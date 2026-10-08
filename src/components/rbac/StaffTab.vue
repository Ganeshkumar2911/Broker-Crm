<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="staffStore.filters.search"
          type="text"
          placeholder="Search staff..."
          class="pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-48"
          @input="onSearch"
        />
      </div>
      <button
        v-if="hasPermission('team_management.create')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
        @click="dialogOpen = true"
      >
        <Plus class="w-3.5 h-3.5" /> Add Staff
      </button>
    </div>

    <!-- Table -->
    <div class="border border-primary-border rounded-2xl bg-card-background">
      <table class="w-full border-collapse">
        <thead class="border-b border-primary-border bg-card-background">
          <tr>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3 rounded-tl-2xl">Name</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Email</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Role</th>
            <th v-if="hasPermission(['two_factor.view', 'two_factor.reset'])" class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">2FA</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3 rounded-tr-2xl">Actions</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="staffStore.loading">
          <tr v-for="n in 5" :key="n" class="border-b border-primary-border last:border-none bg-card-background animate-pulse group">
            <td class="px-4 py-3.5 group-last:rounded-bl-2xl">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-background" />
                <div class="h-3 w-28 bg-background rounded" />
              </div>
            </td>
            <td class="px-4 py-3.5"><div class="h-3 w-36 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-7 w-28 bg-background rounded-lg" /></td>
            <td v-if="hasPermission(['two_factor.view', 'two_factor.reset'])" class="px-4 py-3.5"><div class="h-5 w-14 bg-background rounded-full" /></td>
            <td class="px-4 py-3.5"><div class="h-5 w-12 bg-background rounded-full" /></td>
            <td class="px-4 py-3.5 flex justify-end group-last:rounded-br-2xl"><div class="h-7 w-16 bg-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="staffStore.records.length === 0">
          <tr>
            <td :colspan="hasPermission(['two_factor.view', 'two_factor.reset']) ? 6 : 5" class="py-20 text-center bg-card-background rounded-b-2xl">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No staff found</p>
                <p class="text-xs text-secondary-text">Add your first staff member to get started</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="staff in staffStore.records"
            :key="staff.id"
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background transition-colors group"
          >
            <td class="px-4 py-3.5 group-last:rounded-bl-2xl">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {{ staff.name?.charAt(0)?.toUpperCase() }}
                </div>
                <p class="text-xs font-medium text-primary-text">{{ staff.name }}</p>
              </div>
            </td>

            <td class="px-4 py-3.5 text-xs text-secondary-text">{{ staff.email }}</td>

            <td class="px-4 py-3.5">
              <BaseSelect
                :model-value="staff.role_id"
                :options="roleOptions"
                variant="surface"
                placeholder="Select role"
                searchable
                local-search
                @update:model-value="(val) => handleRoleSelect(staff, val)"
              />
            </td>

            <!-- 2FA Status Badge (Click to View / Manage) -->
            <td v-if="hasPermission(['two_factor.view', 'two_factor.reset'])" class="px-4 py-3.5">
              <button
                v-if="hasPermission(['two_factor.view'])"
                type="button"
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 active:scale-95"
                :class="
                  staff.totp_enabled
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-secondary-text/10 text-secondary-text border-primary-border'
                "
                title="Click to view or manage 2FA"
                @click="open2FaDetails(staff)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="staff.totp_enabled ? 'bg-primary-green' : 'bg-secondary-text'"
                />
                {{ staff.totp_enabled ? 'On' : 'Off' }}
              </button>
              <span
                v-else
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                :class="
                  staff.totp_enabled
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-secondary-text/10 text-secondary-text border-primary-border'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="staff.totp_enabled ? 'bg-primary-green' : 'bg-secondary-text'"
                />
                {{ staff.totp_enabled ? 'On' : 'Off' }}
              </span>
            </td>

            <td class="px-4 py-3.5">
              <button
                class="relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer"
                :class="staff.is_active ? 'bg-primary' : 'border border-primary-border bg-background'"
                :disabled="staffStore.actionLoading"
                @click="staffStore.updateStaffStatus(staff.id, !staff.is_active)"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                  :class="staff.is_active ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </td>

            <td class="px-4 py-3.5 text-right group-last:rounded-br-2xl">
              <DropdownMenu
                :items="getStaffActions(staff)"
                @select="(item) => onMenuSelect(item, staff)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="staffStore.pagination.total_items > staffStore.pagination.per_page"
        :pagination="staffStore.pagination"
        @page-change="staffStore.changePage"
      />
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click="deleteTarget = null">
      <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6" @click.stop>
        <div class="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center mb-4">
          <Trash2 class="w-4 h-4 text-primary-red" />
        </div>
        <p class="text-sm font-semibold text-primary-text mb-1">Delete Staff</p>
        <p class="text-xs text-secondary-text mb-5">Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer" @click="deleteTarget = null">Cancel</button>
          <button
            :disabled="staffStore.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            @click="executeDelete"
          >
            <Loader2 v-if="staffStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ staffStore.actionLoading ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

    <StaffDialog :open="dialogOpen" @close="dialogOpen = false" />

    <!-- User Permission Drawer -->
    <UserPermissionDrawer
      :open="permissionDrawerOpen"
      :staff="permissionStaff"
      @close="permissionDrawerOpen = false"
    />

    <!-- Role Change Confirmation Dialog -->
    <RoleChangeConfirmDialog
      :open="roleChangeTarget !== null"
      :staff-name="roleChangeTarget?.staff?.name || ''"
      :current-role-name="roleChangeTarget?.currentRoleName || ''"
      :new-role-name="roleChangeTarget?.newRoleName || ''"
      :loading="staffStore.actionLoading"
      @close="roleChangeTarget = null"
      @confirm="executeRoleChange"
    />

    <!-- Staff Change Password Dialog -->
    <StaffChangePasswordDialog
      :open="changePasswordDialogOpen"
      :staff="changePasswordStaff"
      @close="changePasswordDialogOpen = false"
    />

    <!-- Staff 2FA Detail Modal -->
    <Staff2FaDetailModal
      :open="staff2FaModalOpen"
      :staff="selectedStaff2Fa"
      :can-reset="hasPermission(['two_factor.reset'])"
      @close="staff2FaModalOpen = false"
      @reset="handleResetFromModal"
    />

    <!-- Reset 2FA Confirmation Dialog -->
    <Reset2FaConfirmDialog
      :open="reset2FaTarget !== null"
      :target-name="reset2FaTarget?.name || reset2FaTarget?.email || ''"
      :loading="twoFactorStore.actionLoading"
      @close="reset2FaTarget = null"
      @confirm="executeReset2Fa"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Search, Plus, Users, Trash2, Loader2, ShieldCheck, ShieldOff, KeyRound, RefreshCw } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import { useRbacRolesStore } from '@/stores/rbac/roles'
import { useTwoFactorStore } from '@/stores/twoFactor/twoFactor'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import Pagination from '@/components/common/Pagination.vue'
import StaffDialog from './StaffDialog.vue'
import UserPermissionDrawer from './UserPermissionDrawer.vue'
import RoleChangeConfirmDialog from './RoleChangeConfirmDialog.vue'
import StaffChangePasswordDialog from './StaffChangePasswordDialog.vue'
import Staff2FaDetailModal from './Staff2FaDetailModal.vue'
import Reset2FaConfirmDialog from '@/components/common/Reset2FaConfirmDialog.vue'

const staffStore = useRbacStaffStore()
const rolesStore = useRbacRolesStore()
const twoFactorStore = useTwoFactorStore()
const { hasPermission } = usePermissionCheck()

const roleOptions = computed(() =>
  rolesStore.records.map((role) => ({
    label: role.name,
    value: role.id,
  }))
)

const dialogOpen = ref(false)
const deleteTarget = ref(null)

const permissionDrawerOpen = ref(false)
const permissionStaff = ref(null)

const roleChangeTarget = ref(null)

const changePasswordDialogOpen = ref(false)
const changePasswordStaff = ref(null)

// 2FA Modals State
const staff2FaModalOpen = ref(false)
const selectedStaff2Fa = ref(null)
const reset2FaTarget = ref(null)

const getStaffActions = (staff) => {
  const actions = [
    {
      action: 'permissions',
      label: 'Permissions',
      icon: ShieldCheck,
    },
  ]

  actions.push({
    action: 'changePassword',
    label: 'Change Password',
    icon: KeyRound,
  })

  // 2FA Actions strictly check two_factor permissions
  if (hasPermission(['two_factor.view'])) {
    actions.push({
      action: 'view2fa',
      label: 'View 2FA Details',
      icon: ShieldCheck,
    })
  }

  if (hasPermission(['two_factor.reset'])) {
    actions.push({
      action: 'reset2fa',
      label: staff.totp_enabled ? 'Disable 2FA' : 'Reset 2FA',
      icon: staff.totp_enabled ? ShieldOff : RefreshCw,
      danger: true,
    })
  }

  actions.push(
    { divider: true },
    {
      action: 'delete',
      label: 'Delete Staff',
      icon: Trash2,
      danger: true,
      disabled: staffStore.actionLoading,
    },
  )

  return actions
}

const open2FaDetails = (staff) => {
  selectedStaff2Fa.value = staff
  staff2FaModalOpen.value = true
}

const onMenuSelect = (item, staff) => {
  switch (item.action) {
    case 'permissions':
      openPermissionsDrawer(staff)
      break
    case 'changePassword':
      changePasswordStaff.value = staff
      changePasswordDialogOpen.value = true
      break
    case 'view2fa':
      open2FaDetails(staff)
      break
    case 'reset2fa':
      reset2FaTarget.value = staff
      break
    case 'delete':
      confirmDelete(staff)
      break
  }
}

const handleResetFromModal = (staff) => {
  staff2FaModalOpen.value = false
  reset2FaTarget.value = staff
}

const executeReset2Fa = async () => {
  if (!reset2FaTarget.value) return
  const staffId = reset2FaTarget.value.id
  try {
    await twoFactorStore.resetStaff2fa(staffId)
    reset2FaTarget.value = null
    staffStore.fetchStaff()
  } catch (_) {
    // snackbar is handled in store
  }
}

const handleRoleSelect = (staff, newRoleIdVal) => {
  const newRoleId = Number(newRoleIdVal)
  if (Number(staff.role_id) === newRoleId) {
    // Feature 1: Selected existing role again -> skip API call
    return
  }

  // Feature 2: Open confirmation dialog before updating
  const currentRole = roleOptions.value.find((r) => Number(r.value) === Number(staff.role_id))
  const newRole = roleOptions.value.find((r) => Number(r.value) === newRoleId)

  roleChangeTarget.value = {
    staff,
    newRoleId,
    currentRoleName: currentRole?.label || '',
    newRoleName: newRole?.label || '',
  }
}

const executeRoleChange = () => {
  if (!roleChangeTarget.value) return
  const { staff, newRoleId } = roleChangeTarget.value
  staffStore.updateStaffRole(staff.id, newRoleId, () => {
    roleChangeTarget.value = null
  })
}

const openPermissionsDrawer = (staff) => {
  permissionStaff.value = staff
  permissionDrawerOpen.value = true
}

const confirmDelete = (staff) => { deleteTarget.value = staff }
const executeDelete = () => {
  staffStore.deleteStaff(deleteTarget.value.id, () => { deleteTarget.value = null })
}

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => staffStore.applyFilters(), 400)
}

onMounted(() => {
  staffStore.fetchStaff()
  rolesStore.fetchRoles()
})
</script>