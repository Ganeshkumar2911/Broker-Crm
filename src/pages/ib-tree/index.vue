<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
        <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 shrink-0 self-start sm:self-auto">
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="viewMode === 'table' ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
            @click="viewMode = 'table'"
          >
            Table
          </button>
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            :class="viewMode === 'tree' ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
            @click="viewMode = 'tree'"
          >
            Tree
          </button>
        </div>

        <div class="relative w-full sm:max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search IB..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
        </div>
         <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="
              () => {
                store.fetchIbTree(true);
              }
            "
          >
      <RefreshCw
      class="h-3.5 w-3.5"
      :class="{ 'animate-spin': store.loading }"
    />
            
          </button>
        </Tooltip>

      </div>

      <button
        v-if="hasPermission('ib.create')"
        class="btn-primary shrink-0 self-start md:self-auto"
        @click="openAdd"
      >
        <Plus class="w-3.5 h-3.5" /> Add Master IB
      </button>
    </div>

    <!-- Tree View -->
    <div v-if="viewMode === 'tree'">
      <div v-if="store.isLoading" class="space-y-2 animate-pulse">
        <div v-for="n in 4" :key="n" class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-card-background">
          <div class="flex items-center gap-2.5">
            <div class="w-3.5 h-3.5 bg-background rounded" />
            <div class="h-3 w-36 bg-background rounded" />
          </div>
          <div class="flex items-center gap-3">
            <div class="h-3 w-8 bg-background rounded" />
            <div class="h-5 w-8 bg-background rounded-full" />
          </div>
        </div>
      </div>
      <div v-else-if="filteredData.length === 0" class="py-16 text-center bg-card-background border border-primary-border rounded-xl">
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center mx-auto">
            <Users class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-semibold text-primary-text">No IBs found</p>
          <p class="text-xs text-secondary-text">Try adjusting your search</p>
        </div>
      </div>
      <IbTree
        v-else
        :items="filteredData"
        :expanded="expanded"
        @toggle="toggleRow"
        @edit="openEdit"
        @add-sub="openAddSub"
        @transfer-parent="openTransferParent"
        @client-login="handleClientLogin"
      />
    </div>

    <!-- Table View -->
    <div v-else class="w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <!-- <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">IB ID</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">IB Name</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Referral Code</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Split</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Level</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest pb-3 px-3">Actions</th>
          </tr>
        </thead> -->

        <tbody v-if="store.isLoading">
          <tr v-for="n in 5" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="px-3 py-3.5 align-middle">
              <div class="flex items-center gap-2">
                <div class="w-3.5 h-3.5 bg-card-background rounded" />
                <div class="h-3 w-12 bg-card-background rounded" />
              </div>
            </td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-28 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-16 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-24 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-3 w-10 bg-card-background rounded" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-5 w-8 bg-card-background rounded-full" /></td>
            <td class="px-3 py-3.5 align-middle"><div class="h-5 w-8 bg-card-background rounded ml-auto" /></td>
          </tr>
        </tbody>

        <tbody v-else-if="filteredData.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center bg-card-background">
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center mx-auto">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No IBs found</p>
                <p class="text-xs text-secondary-text">Try adjusting your search</p>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <IbTreeRow
            :nodes="filteredData"
            :staff-options="staffOptions"
            :expanded="expanded"
            @toggle="toggleRow"
            @add-sub="openAddSub"
            @edit="openEdit"
            @transfer-parent="openTransferParent"
            @assign-staff="handleAssignStaff"
            @client-login="handleClientLogin"
          />
        </tbody>
      </table>
    </div>

    <IbDialog
      :open="dialog.open"
      :edit-data="dialog.editData"
      :parent-ib-id="dialog.parentIbId"
      @close="dialog.open = false"
    />

    <TransferIbDialog
      :open="transferDialog.open"
      :ib="transferDialog.ib"
      @close="transferDialog.open = false"
      @success="onTransferSuccess"
    />

    <!-- Assign / Reassign Staff Confirmation Dialog -->
    <ConfirmationDialog
      :open="assignDialog.open"
      :title="assignDialog.isEdit ? 'Reassign Staff Member' : 'Assign Staff Member'"
      :message="
        assignDialog.isEdit
          ? `Are you sure you want to reassign staff for IB '${
              assignDialog.node?.name ||
              (assignDialog.node?.first_name
                ? `${assignDialog.node.first_name} ${assignDialog.node.last_name || ''}`.trim()
                : assignDialog.node?.email || 'Selected IB')
            }' to ${assignDialog.staffName}?`
          : `Are you sure you want to assign ${assignDialog.staffName} to IB '${
              assignDialog.node?.name ||
              (assignDialog.node?.first_name
                ? `${assignDialog.node.first_name} ${assignDialog.node.last_name || ''}`.trim()
                : assignDialog.node?.email || 'Selected IB')
            }'?`
      "
      :confirm-text="assignDialog.isEdit ? 'Reassign Staff' : 'Assign Staff'"
      cancel-text="Cancel"
      type="info"
      :loading="assignDialog.loading"
      @confirm="handleConfirmAssignStaff"
      @cancel="handleCancelAssignStaff"
    />

    <!-- Client Login Confirmation Modal -->
    <ClientLoginModal
      :open="clientLoginModalOpen"
      :client="selectedClientForLogin || {}"
      @close="closeClientLoginModal"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, Search, Users, RefreshCw } from 'lucide-vue-next'
import { useIbTreeStore } from '@/stores/ibTree/ibTree'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import IbTreeRow from '@/components/ibTree/IbTreeRow.vue'
import IbTree from '@/components/ibTree/IbTree.vue'
import IbDialog from '@/components/ibTree/IbDialog.vue'
import TransferIbDialog from '@/components/ibTree/TransferIbDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import ClientLoginModal from '@/components/common/ClientLoginModal.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useIbTreeStore()
const rbacStaffStore = useRbacStaffStore()
const { hasPermission } = usePermissionCheck()
const { searchQuery } = storeToRefs(store)
const expanded = ref({})
const viewMode = ref('table')
const dialog = ref({ open: false, editData: null, parentIbId: null })
const transferDialog = ref({ open: false, ib: null })

import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const snackbar = useSnackbarStore()

const clientLoginModalOpen = ref(false)
const selectedClientForLogin = ref(null)

const handleClientLogin = (node) => {
  if (!node) return
  // An IB node usually has `user_id` which corresponds to the client ID
  const clientId = node.user_id || node.lead_id || node.ib_id || node.id
  if (!clientId) return
  
  // Pass the node as the client object, ensuring it has an `id` field that matches the client ID
  selectedClientForLogin.value = { ...node, id: clientId }
  clientLoginModalOpen.value = true
}

const closeClientLoginModal = () => {
  clientLoginModalOpen.value = false
  selectedClientForLogin.value = null
}

const assignDialog = ref({
  open: false,
  loading: false,
  node: null,
  ibId: null,
  leadId: null,
  staffId: null,
  staffName: '',
  isEdit: false,
})

const staffOptions = computed(() => {
  return (rbacStaffStore.records || []).map(s => ({
    value: s.id,
    label: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
  }))
})

const handleAssignStaff = ({ node, ibId, leadId, staffId }) => {
  if (!hasPermission('ib.update')) {
    snackbar.show('You do not have permission to assign or update staff.', 'error')
    return
  }

  const targetId = leadId || ibId || node?.lead_id || node?.ib_id || node?.id
  if (!targetId) {
    snackbar.show('Invalid IB record.', 'error')
    return
  }

  if (!staffId) {
    snackbar.show('Please select a staff member.', 'warning')
    return
  }

  const currentStaffId =
    node?.staff_assigned?.id ||
    node?.assigned_staff?.id ||
    node?.assigned_staff_id

  if (currentStaffId && Number(currentStaffId) === Number(staffId)) {
    snackbar.show(
      'This staff member is already assigned to this IB.',
      'info'
    )
    return
  }

  const currentStaffName =
    node?.staff_assigned?.name || node?.assigned_staff?.name || null
  const isEdit = !!currentStaffName

  const staffObj = (rbacStaffStore.records || []).find((s) => s.id === staffId)
  const staffName = staffObj
    ? staffObj.name ||
      `${staffObj.first_name || ''} ${staffObj.last_name || ''}`.trim() ||
      staffObj.email
    : 'selected staff member'

  assignDialog.value = {
    open: true,
    loading: false,
    node,
    ibId,
    leadId,
    staffId,
    staffName,
    isEdit,
  }
}

const handleConfirmAssignStaff = () => {
  const { node, ibId, leadId, staffId } = assignDialog.value
  const targetId = leadId || ibId || node?.lead_id || node?.ib_id || node?.id

  if (!targetId) {
    snackbar.show('Invalid IB lead ID for assignment.', 'error')
    assignDialog.value.open = false
    return
  }

  if (!staffId) {
    snackbar.show('Please select a staff member.', 'warning')
    assignDialog.value.open = false
    return
  }

  assignDialog.value.loading = true

  apiRequest(urls.KEYS.PATCH, urls.lead.assign, {
    look_up_key: targetId,
    data: {
      assigned_staff_id: staffId,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      assignDialog.value.loading = false
      assignDialog.value.open = false

      snackbar.show(
        res?.message || res?.data?.message || 'Staff assigned successfully.',
        'success'
      )
      store.fetchIbTree(true)
    },
    onFailure: (err) => {
      assignDialog.value.loading = false
      snackbar.show(
        err?.response?.data?.message ||
          err?.message ||
          err?.error ||
          'Failed to assign staff.',
        'error'
      )
    },
  })
}

const handleCancelAssignStaff = () => {
  assignDialog.value.open = false
}

const openAdd = () => { dialog.value = { open: true, editData: null, parentIbId: null } }
const openAddSub = (id) => { dialog.value = { open: true, editData: null, parentIbId: id } }
const openEdit = (node) => { dialog.value = { open: true, editData: node, parentIbId: null } }
const toggleRow = (id) => { expanded.value[id] = !expanded.value[id] }

const openTransferParent = (node) => {
  transferDialog.value = { open: true, ib: node }
}

const onTransferSuccess = () => {
  store.fetchIbTree(true)
}

// Helper to find parent node IDs that should be expanded based on matching child nodes
const getNodesToExpand = (nodes, query) => {
  const ids = []
  if (!query) return ids

  const lowerQuery = query.toLowerCase()

  const checkNode = (node) => {
    const matchesSelf = (
      node.name?.toLowerCase().includes(lowerQuery) ||
      node.email?.toLowerCase().includes(lowerQuery) ||
      node.referral_code?.toLowerCase().includes(lowerQuery) ||
      node.staff_assigned?.name?.toLowerCase().includes(lowerQuery) ||
      String(node.ib_id).includes(lowerQuery)
    )

    let matchesAnyChild = false
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (checkNode(child)) {
          matchesAnyChild = true
        }
      }
    }

    if (matchesAnyChild) {
      ids.push(node.ib_id)
    }

    return matchesSelf || matchesAnyChild
  }

  for (const node of nodes) {
    checkNode(node)
  }

  return ids
}

// Watch searchQuery and data to automatically expand matching branches
watch([searchQuery, () => store.data], ([newQuery, newData]) => {
  if (newQuery && newQuery.trim() && newData) {
    const idsToExpand = getNodesToExpand(newData, newQuery)
    idsToExpand.forEach(id => {
      expanded.value[id] = true
    })
  }
}, { deep: false })

// Filter logic: if a node or any of its children match, keep it.
// If a node matches, keep all its descendants.
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return store.data

  const lowerQuery = searchQuery.value.toLowerCase().trim()

  const filterNodes = (nodes, isParentMatched = false) => {
    return nodes.reduce((acc, node) => {
      const matchesSelf = isParentMatched || (
        node.name?.toLowerCase().includes(lowerQuery) ||
        node.email?.toLowerCase().includes(lowerQuery) ||
        node.referral_code?.toLowerCase().includes(lowerQuery) ||
        node.staff_assigned?.name?.toLowerCase().includes(lowerQuery) ||
        String(node.ib_id).includes(lowerQuery)
      )

      const filteredChildren = node.children ? filterNodes(node.children, matchesSelf) : []

      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        })
      }
      return acc
    }, [])
  }

  return filterNodes(store.data)
})

onMounted(() => {
  store.fetchIbTree()
  rbacStaffStore.fetchStaff(false)
})
</script>
