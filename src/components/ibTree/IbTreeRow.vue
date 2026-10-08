<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Plus, ArrowLeftRight, Users, Link, X, LogIn } from 'lucide-vue-next'
import DropdownMenu from '@/components/common/DropdownMenu.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

import { usePermissionCheck } from '@/composables/usePermissionCheck'

const router = useRouter()
const { hasPermission } = usePermissionCheck()

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  staffOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['add-sub', 'edit', 'transfer-parent', 'view-clients', 'assign-staff', 'client-login'])

const editingStaffNodeId = ref(null)

// Flatten the nested tree into a flat list for table display
function flattenTree(nodes, result = []) {
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) {
      flattenTree(node.children, result)
    }
  }
  return result
}

const flatRows = computed(() => flattenTree(props.nodes))

const getActions = (node) => {
  const actions = [
    {
      label: 'View Clients',
      icon: Users,
      handler: () => router.push(`/ib-clients/${node.ib_id}`),
    },
  ]

  if (hasPermission('ib.referal_link_view')) {
    actions.push({
      label: 'Referral Links',
      icon: Link,
      handler: () => router.push(`/ib-referral-links/${node.ib_id}`),
    })
  }

  if (hasPermission('ib.update')) {
    actions.push(
      {
        label: 'Transfer Parent',
        icon: ArrowLeftRight,
        handler: () => emit('transfer-parent', node),
      },
      {
        label: 'Edit IB',
        icon: Pencil,
        handler: () => emit('edit', node),
      }
    )
  }

  if (hasPermission('ib.create')) {
    actions.push({
      label: 'Add Sub-IB',
      icon: Plus,
      handler: () => emit('add-sub', node.ib_id),
    })
  }

  if (hasPermission('xtention_dev.login_as_client')) {
    actions.push({
      label: 'Client Login',
      icon: LogIn,
      handler: () => emit('client-login', node),
    })
  }

  return actions
}
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl border border-primary-border">
    <table class="w-full text-xs border-collapse">
      <!-- Header -->
      <thead>
        <tr class="bg-card-background border-b border-primary-border">
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            IB ID
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Name / Email
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Referral Code
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Parent IB
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Assigned Staff
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Split
          </th>
          <th class="px-4 py-3 text-left font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Level
          </th>
          <th class="px-4 py-3 text-right font-semibold text-secondary-text uppercase tracking-wider whitespace-nowrap">
            Actions
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="node in flatRows"
          :key="node.ib_id"
          :class="[
            'border-b border-primary-border transition-colors',
            node.level > 0 ? 'bg-child-row hover:bg-child-row-hover' : 'hover:bg-card-background'
          ]"
        >
          <!-- IB ID -->
          <td class="px-4 py-3 align-middle font-medium text-primary-text whitespace-nowrap">
            {{ node.ib_id }}
          </td>

          <!-- Name / Email -->
          <td class="px-4 py-3 align-middle">
            <div class="text-primary-text font-medium">{{ node.name || '—' }}</div>
            <div class="text-secondary-text mt-0.5">{{ node.email || '—' }}</div>
          </td>

          <!-- Referral Code -->
          <td class="px-4 py-3 align-middle text-primary-text whitespace-nowrap">
            {{ node.referral_code || '—' }}
          </td>

          <!-- Parent IB -->
          <td class="px-4 py-3 align-middle text-primary-text whitespace-nowrap">
            <div v-if="node.level > 0 && node.parent_ib_id">
              <div class="font-medium text-primary-text">{{ node.parent_name || '—' }}</div>
              <div class="text-[10px] text-secondary-text mt-0.5">{{ node.parent_email || '—' }}</div>
              <div class="text-[10px] font-mono text-secondary-text uppercase mt-0.5">ID: {{ node.parent_ib_id }}</div>
            </div>
            <div v-else class="text-secondary-text">—</div>
          </td>

          <!-- Assigned Staff -->
          <td class="px-4 py-3 align-middle whitespace-nowrap" @click.stop>
            <div
              v-if="
                (node.staff_assigned?.name || node.assigned_staff?.name) &&
                editingStaffNodeId !== (node.ib_id || node.id)
              "
              class="flex items-center justify-between gap-2 group"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-btn-text-primary shrink-0"
                >
                  {{
                    (
                      node.staff_assigned?.name ||
                      node.assigned_staff?.name ||
                      ''
                    )
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>
                <span class="text-primary-text font-medium text-xs">{{
                  node.staff_assigned?.name || node.assigned_staff?.name
                }}</span>
              </div>
              <button
                v-if="hasPermission('ib.update')"
                type="button"
                @click="editingStaffNodeId = (node.ib_id || node.id)"
                class="p-1 rounded-md text-secondary-text hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Assigned Staff"
              >
                <Pencil class="w-3 h-3" />
              </button>
            </div>
            <div v-else-if="hasPermission('ib.update')" class="w-44 flex items-center gap-1">
              <div class="flex-1">
                <BaseSelect
                  :model-value="
                    node.staff_assigned?.id ||
                    node.assigned_staff?.id ||
                    node.assigned_staff_id ||
                    null
                  "
                  :options="staffOptions"
                  :placeholder="
                    node.staff_assigned?.name || node.assigned_staff?.name
                      ? 'Change Staff...'
                      : 'Assign Staff...'
                  "
                  searchable
                  variant="surface"
                  @update:model-value="
                    (staffId) =>
                      emit('assign-staff', {
                        node,
                        ibId: node.ib_id,
                        leadId: node.lead_id,
                        staffId,
                      })
                  "
                />
              </div>
              <button
                v-if="editingStaffNodeId === (node.ib_id || node.id)"
                type="button"
                @click="editingStaffNodeId = null"
                class="p-1 rounded-md text-secondary-text hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Cancel Edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <span v-else class="text-xs text-secondary-text">Unassigned</span>
          </td>

          <!-- Split -->
          <td class="px-4 py-3 align-middle text-primary-text whitespace-nowrap">
            {{ node.split }}%
          </td>

          <!-- Level badge -->
          <td class="px-4 py-3 align-middle whitespace-nowrap">
            <span
              class="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text"
            >
              L{{ node.level }}
            </span>
          </td>

          <!-- Actions -->
          <td class="px-4 py-3 align-middle text-right whitespace-nowrap">
            <div class="flex items-center justify-end">
              <DropdownMenu :items="getActions(node)" position="bottom-end" />
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="flatRows.length === 0">
          <td colspan="8" class="px-4 py-10 text-center text-secondary-text">
            No IB records found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
