<template>
  <div class="space-y-2">
    <div v-for="node in items" :key="node.ib_id" class="relative">

      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-primary-border bg-card-background hover:bg-background transition-colors group cursor-pointer"
        @click="toggle(node.ib_id)"
      >
        <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <!-- Left: expand indicator -->
          <div class="shrink-0 flex flex-col items-center gap-0.5 mt-0.5 sm:mt-0">
            <div class="w-7 h-7 rounded-lg bg-background border border-primary-border flex items-center justify-center">
              <ChevronRight
                v-if="node.children?.length"
                class="w-3.5 h-3.5 text-secondary-text transition-transform duration-200"
                :class="{ 'rotate-90': expanded[node.ib_id] }"
              />
              <Minus v-else class="w-3 h-3 text-secondary-text opacity-30" />
            </div>
          </div>

          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-medium text-white shrink-0">
            {{ (node.name || node.email || 'I').charAt(0).toUpperCase() }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-primary-text truncate">
              {{ node.name || node.email || `IB #${node.ib_id}` }}
            </p>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span class="text-[10px] text-secondary-text">Ref: {{ node.referral_code || 'No referral' }}</span>
              <span class="text-[10px] text-secondary-text opacity-40">·</span>
              <span class="text-[10px] text-secondary-text">{{ node.children?.length ?? 0 }} sub-IB{{ node.children?.length !== 1 ? 's' : '' }}</span>
              <span class="text-[10px] text-secondary-text opacity-40">·</span>
              <span class="text-[10px] text-secondary-text">ID: {{ node.ib_id || '-' }}</span>
            </div>

            <!-- Badges line: Parent & Staff -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
              <div v-if="node.level > 0 && node.parent_ib_id" class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-secondary-text bg-background/50 border border-primary-border/20 px-2 py-0.5 rounded-lg">
                <span class="font-semibold text-primary-text text-[9px] uppercase tracking-wider">Parent:</span>
                <span class="font-medium text-primary-text">{{ node.parent_name || '—' }} ({{ node.parent_email || '—' }})</span>
                <span class="text-secondary-text/40">|</span>
                <span class="font-mono">ID: {{ node.parent_ib_id }}</span>
              </div>

              <div v-if="node.staff_assigned?.name" class="flex items-center gap-1 text-[10px] text-secondary-text bg-background/50 border border-primary-border/20 px-2 py-0.5 rounded-lg">
                <UserCheck class="w-3 h-3 text-primary shrink-0" />
                <span class="font-semibold text-primary-text text-[9px] uppercase tracking-wider">Staff:</span>
                <span class="font-medium text-primary-text">{{ node.staff_assigned.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Badges & Actions -->
        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-primary-border/40">
          <!-- Badges -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="text-center">
              <p class="text-[10px] text-secondary-text uppercase tracking-wide leading-none mb-0.5">Split</p>
              <p class="text-xs font-medium text-primary-text">{{ node.split }}%</p>
            </div>
            <div class="w-px h-6 bg-primary-border" />
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text">
              L{{ node.level }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            <Tooltip text="View Clients">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="$router.push(`/ib-clients/${node.ib_id}`)"
              >
                <Users class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>

            <Tooltip v-if="hasPermission('ib.referal_link_view')" text="Referral Links">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="$router.push(`/ib-referral-links/${node.ib_id}`)"
              >
                <Link class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>

            <Tooltip v-if="hasPermission('ib.update')" text="Transfer Parent">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="emit('transfer-parent', node)"
              >
                <ArrowLeftRight class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>

            <Tooltip v-if="hasPermission('ib.update')" text="Edit IB">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="emit('edit', node)"
              >
                <Pencil class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>

            <Tooltip v-if="hasPermission('ib.create')" text="Add Sub-IB">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="emit('add-sub', node.ib_id)"
              >
                <Plus class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>

            <Tooltip v-if="hasPermission('xtention_dev.login_as_client')" text="Client Login">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card-background border border-transparent hover:border-primary-border transition-colors cursor-pointer"
                @click.stop="emit('client-login', node)"
              >
                <LogIn class="w-3.5 h-3.5 text-secondary-text" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Children -->
      <div
        v-if="node.children?.length && expanded[node.ib_id]"
        class="mt-2 ml-2 pl-2 sm:ml-6 sm:pl-4 border-l-2 border-primary-border space-y-2"
      >
        <IbTree
          :items="node.children"
          :expanded="expanded"
          @toggle="emit('toggle', $event)"
          @edit="emit('edit', $event)"
          @add-sub="emit('add-sub', $event)"
          @transfer-parent="emit('transfer-parent', $event)"
          @view-clients="emit('view-clients', $event)"
          @client-login="emit('client-login', $event)"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ChevronRight, Minus, Pencil, Plus, ArrowLeftRight, Users, Link, UserCheck, LogIn } from 'lucide-vue-next'
import Tooltip from '@/components/common/Tooltip.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const { hasPermission } = usePermissionCheck()

defineProps({
  items: { type: Array, default: () => [] },
  expanded: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['toggle', 'edit', 'add-sub', 'transfer-parent', 'view-clients', 'client-login'])
const toggle = (id) => emit('toggle', id)
</script>

