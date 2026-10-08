<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
      <!-- Action buttons -->
      <div v-if="hasPermission('ib.referal_link_create')" class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          @click="openCreateDrawer"
        >
          <PlusCircle :size="14" />
          <span>Create New Campaign</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton State (Table style) -->
    <div v-if="store.loading" class="border border-primary-border rounded-2xl overflow-hidden bg-card-background animate-pulse">
      <div class="h-12 bg-background/50 border-b border-primary-border flex items-center px-5 space-x-6">
        <div class="h-3 w-32 bg-primary-border rounded" />
        <div class="h-3 w-16 bg-primary-border rounded" />
        <div class="h-3 w-40 bg-primary-border rounded" />
        <div class="h-3 w-16 bg-primary-border rounded" />
        <div class="h-3 w-20 bg-primary-border rounded ml-auto" />
      </div>
      <div class="divide-y divide-primary-border">
        <div v-for="n in 4" :key="n" class="px-5 py-4 flex items-center justify-between space-x-6">
          <div class="space-y-2 flex-1">
            <div class="h-4 w-40 bg-background rounded" />
            <div class="h-3 w-56 bg-background rounded" />
          </div>
          <div class="h-5 w-24 bg-background rounded shrink-0" />
          <div class="h-6 w-48 bg-background rounded shrink-0" />
          <div class="h-5 w-16 bg-background rounded-full shrink-0" />
          <div class="h-8 w-24 bg-background rounded-lg shrink-0 ml-auto" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="store.records.length === 0"
      class="border border-primary-border rounded-2xl min-h-[400px] flex flex-col items-center justify-center text-center bg-card-background p-8 space-y-6"
    >
      <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
        <Link2 :size="32" class="animate-pulse" />
      </div>
      <div class="space-y-2">
        <h3 class="text-base font-bold text-primary-text">No Referral Campaigns Created Yet</h3>
        <p class="text-xs text-secondary-text max-w-sm leading-relaxed mx-auto">
          Set up customizable campaigns with MT5 broker group configurations to dynamically register accounts using tracking links.
        </p>
      </div>
      <button
        v-if="hasPermission('ib.referal_link_create')"
        class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition"
        @click="openCreateDrawer"
      >
        <PlusCircle :size="14" />
        <span>Create Your First Campaign</span>
      </button>
    </div>

    <!-- Table View -->
    <div v-else class="space-y-4">
      <!-- Table Header Action/Search Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 class="text-sm font-bold text-primary-text">All Campaigns</h2>
          <p class="text-[11px] text-secondary-text mt-0.5">List of all customizable referral configurations</p>
        </div>
        
        <div class="relative w-full sm:max-w-xs shrink-0">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="tableSearchQuery"
            type="text"
            placeholder="Filter campaigns by name or code..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text/50"
          />
        </div>
      </div>

      <!-- Table Container -->
      <div class="border border-primary-border rounded-2xl overflow-x-auto bg-card-background shadow-xs">
        <table class="w-full border-collapse min-w-[700px]">
          <thead class="border-b border-primary-border bg-card-background">
            <tr class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
              <th class="px-6 py-4">Name & Description</th>
              <th class="px-6 py-4 w-[160px]">Code & URL</th>
              <th class="px-6 py-4">Attached Groups</th>
              <th class="px-6 py-4 w-[110px]">Status</th>
              <th class="px-6 py-4 text-right w-[140px]">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="item in filteredRecords"
              :key="item.id"
              class="bg-card-background hover:bg-background/40 transition-colors"
            >
              <!-- Name & Description -->
              <td class="px-6 py-4 align-middle">
                <div class="font-bold text-primary-text text-xs leading-normal">{{ item.name }}</div>
                <div class="text-[10px] text-secondary-text mt-0.5 line-clamp-1" :title="item.description">
                  {{ item.description || 'No description provided' }}
                </div>
              </td>

              <!-- Code & Quick Copy -->
              <td class="px-6 py-4 align-middle">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold bg-background border border-primary-border px-2 py-0.5 rounded text-secondary-text select-all">
                    {{ item.code }}
                  </span>
                  <button
                    class="p-1 rounded hover:bg-background border border-transparent hover:border-primary-border text-secondary-text hover:text-primary-text transition cursor-pointer"
                    title="Copy Referral URL"
                    @click="copyToClipboard(getReferralUrl(item.code))"
                  >
                    <Copy :size="12" />
                  </button>
                </div>
              </td>

              <!-- Groups Badges (Displays Group label & category) -->
              <td class="px-6 py-4 align-middle">
                <div v-if="item.groups && item.groups.length > 0" class="flex flex-wrap gap-1.5 max-w-sm">
                  <span
                    v-for="grp in item.groups"
                    :key="grp.id"
                    class="inline-flex items-center text-[10px] font-medium border px-2.5 py-0.5 rounded-full"
                    :class="getCategoryBadgeClass(grp.category)"
                  >
                    {{ grp.label }}
                    <span class="text-[8px] opacity-75 ml-1">({{ grp.category || 'MT5' }})</span>
                  </span>
                </div>
                <span v-else class="text-xs text-secondary-text italic">—</span>
              </td>

              <!-- Active Status badge -->
              <td class="px-6 py-4 align-middle">
                <span
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                  :class="item.is_active !== false
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active !== false ? 'bg-primary-green' : 'bg-primary-red'" />
                  {{ item.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Inline Action buttons -->
              <td class="px-6 py-4 align-middle text-right">
                <div class="flex justify-end items-center gap-2">
                  <button
                    class="flex items-center gap-1 px-2 py-1 rounded bg-background border border-primary-border hover:bg-primary-border/20 text-secondary-text hover:text-primary-text transition text-[11px] font-semibold cursor-pointer"
                    @click="openDetailsModal(item)"
                  >
                    <Eye :size="12" />
                    <span>Details</span>
                  </button>

                  <button
                    v-if="hasPermission('ib.referal_link_update')"
                    class="p-1.5 rounded bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:bg-primary-border/20 transition cursor-pointer"
                    title="Edit Campaign"
                    @click="openEditDrawer(item)"
                  >
                    <Pencil :size="13" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- No Search Results Row -->
            <tr v-if="filteredRecords.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-xs text-secondary-text italic">
                No campaigns match your search query.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details View Modal -->
    <ReferralLinkDetailsModal
      :open="detailsModal.open"
      :item="detailsModal.item"
      @close="closeDetailsModal"
      @copy="copyToClipboard"
    />

    <!-- Drawer component -->
    <ReferralLinkDrawer
      :open="drawerOpen"
      :is-edit="isEdit"
      :edit-data="editData"
      :ib-id="ibId"
      @close="closeDrawer"
      @success="onDrawerSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Plus,
  Copy,
  Pencil,
  PlusCircle,
  Eye,
  Search,
  Link2
} from 'lucide-vue-next'
import { useIbReferralLinksStore } from '@/stores/ibTree/ibReferralLinks'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import ReferralLinkDrawer from '@/components/referralLinks/ReferralLinkDrawer.vue'
import ReferralLinkDetailsModal from '@/components/referralLinks/ReferralLinkDetailsModal.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const route = useRoute()
const store = useIbReferralLinksStore()
const snackbar = useSnackbarStore()
const { hasPermission } = usePermissionCheck()

// Route IB ID
const ibId = computed(() => route.params.id)

// Drawer State
const drawerOpen = ref(false)
const isEdit = ref(false)
const editData = ref(null)

// Table Search Filter
const tableSearchQuery = ref('')

const filteredRecords = computed(() => {
  const query = tableSearchQuery.value.trim().toLowerCase()
  if (!query) return store.records
  return store.records.filter(item =>
    item.name?.toLowerCase().includes(query) ||
    item.code?.toLowerCase().includes(query)
  )
})

// Details Modal State
const detailsModal = ref({
  open: false,
  item: {}
})

const openDetailsModal = (item) => {
  detailsModal.value = {
    open: true,
    item
  }
}

const closeDetailsModal = () => {
  detailsModal.value.open = false
}

// Category Badge Color Stylers
const getCategoryBadgeClass = (category) => {
  const cat = String(category || '').toUpperCase()
  if (cat.includes('RAW')) {
    return 'bg-accent/10 text-accent border-accent/20'
  }
  if (cat.includes('STANDARD') || cat.includes('STD')) {
    return 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
  }
  return 'bg-primary-green/10 text-primary-green border-primary-green/20'
}

// Copy URL
const copyToClipboard = (text) => {
  if (!text) return
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        snackbar.show('Referral URL copied to clipboard!', 'success')
      })
      .catch(() => {
        snackbar.show('Failed to copy to clipboard.', 'error')
      })
  } else {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    try {
      document.execCommand('copy')
      snackbar.show('Referral URL copied to clipboard!', 'success')
    } catch (err) {
      snackbar.show('Failed to copy to clipboard.', 'error')
    }
    document.body.removeChild(input)
  }
}

// Generate Referral URL dynamically
const getReferralUrl = (code) => {
  return `https://portal.panthercapitals.com/register?ref=${code || ''}`
}

// Drawer Open/Close
const openCreateDrawer = () => {
  isEdit.value = false
  editData.value = null
  drawerOpen.value = true
}

const openEditDrawer = (item) => {
  isEdit.value = true
  editData.value = item
  drawerOpen.value = true
}

const closeDrawer = () => {
  drawerOpen.value = false
}

const onDrawerSuccess = () => {
  // Store handles automatic reload
}

onMounted(() => {
  if (ibId.value) {
    store.fetchReferralLinks(ibId.value)
  }
})
</script>
