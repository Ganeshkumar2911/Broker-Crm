<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-sm font-semibold text-primary-text">
              Update Referral Link
            </h3>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Select or clear referral campaign links for the client
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Client Card -->
          <div class="bg-background/50 border border-primary-border rounded-xl px-4 py-3 space-y-1">
            <p class="text-[9px] uppercase tracking-wider text-secondary-text font-bold">Client Info</p>
            <p class="text-xs font-semibold text-primary-text">{{ client?.name }}</p>
            <p class="text-[11px] text-secondary-text">{{ client?.email }}</p>
          </div>

          <!-- Current Link Status Info (for context) -->
          <div class="bg-background/20 border border-primary-border rounded-xl px-4 py-3 space-y-2">
            <p class="text-[9px] uppercase tracking-wider text-secondary-text font-bold">Current Assignment</p>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span class="text-secondary-text block">Current IB</span>
                <span class="font-medium text-primary-text">{{ client?.ib_name || 'None' }}</span>
              </div>
              <div>
                <span class="text-secondary-text block">Campaign Code</span>
                <span v-if="client?.referral_link_code" class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-1.5 py-0.5 rounded-full select-all mt-0.5">
                  <Link2 class="w-2.5 h-2.5 shrink-0" />
                  <span>{{ client.referral_link_code }}</span>
                </span>
                <span v-else class="font-medium text-secondary-text/50">—</span>
              </div>
            </div>
          </div>

          <!-- Referral Link Card Selector -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-primary-text">Select Referral Campaign</label>
            
            <!-- Loading -->
            <div v-if="linksLoading" class="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 class="w-5 h-5 animate-spin text-primary" />
              <span class="text-xs text-secondary-text">Fetching campaign links...</span>
            </div>

            <!-- Client has no IB -->
            <div v-else-if="!client?.ib_id" class="border border-red-500/20 rounded-xl p-6 text-center bg-red-500/5 space-y-2">
              <Users class="w-5 h-5 text-red-500/60 mx-auto" />
              <p class="text-xs text-red-400 font-semibold">No IB Assigned</p>
              <p class="text-[10px] text-secondary-text">This client has no assigned IB. You must assign an IB to the client before you can configure a referral campaign link.</p>
            </div>

            <!-- IB Selected but has no links -->
            <div v-else-if="referralLinks.length === 0" class="border border-primary-border border-dashed rounded-xl p-6 text-center bg-background/10 space-y-2">
              <Link2 class="w-5 h-5 text-secondary-text/60 mx-auto" />
              <p class="text-xs text-secondary-text font-medium">This IB has no active referral links</p>
              <p class="text-[10px] text-secondary-text/75">Only "No Campaign" option can be applied.</p>
              
              <!-- Offer the No Campaign option directly -->
              <div
                class="border rounded-xl p-3 text-left cursor-pointer transition-all duration-200 flex items-center justify-between mt-2"
                :class="selectedLinkId === null
                  ? 'border-primary bg-primary/5 text-primary-text'
                  : 'border-primary-border bg-background hover:bg-card-background/60 text-secondary-text'"
                @click="selectedLinkId = null"
              >
                <div>
                  <p class="text-xs font-bold" :class="selectedLinkId === null ? 'text-primary' : 'text-primary-text'">
                    No Campaign (Clear Link)
                  </p>
                </div>
                <div
                  v-if="selectedLinkId === null"
                  class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shrink-0"
                >
                  <Check class="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <!-- List of options -->
            <div v-else class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              <!-- No Campaign option -->
              <div
                class="border rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex items-center justify-between"
                :class="selectedLinkId === null
                  ? 'border-primary bg-primary/5 text-primary-text'
                  : 'border-primary-border bg-background hover:bg-card-background/60 text-secondary-text'"
                @click="selectedLinkId = null"
              >
                <div>
                  <p class="text-xs font-bold" :class="selectedLinkId === null ? 'text-primary' : 'text-primary-text'">
                    No Campaign (Clear Link)
                  </p>
                  <p class="text-[10px] text-secondary-text mt-0.5">Remove tracking code and referral link from client</p>
                </div>
                <div
                  v-if="selectedLinkId === null"
                  class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shrink-0"
                >
                  <Check class="w-2.5 h-2.5" />
                </div>
              </div>

              <!-- Links -->
              <div
                v-for="link in referralLinks"
                :key="link.id"
                class="border rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex items-start justify-between"
                :class="selectedLinkId === link.id
                  ? 'border-primary bg-primary/5 text-primary-text'
                  : 'border-primary-border bg-background hover:bg-card-background/60 text-secondary-text'"
                @click="selectedLinkId = link.id"
              >
                <div class="space-y-1 min-w-0 flex-1 pr-2">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span
                      class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full select-all"
                      :class="selectedLinkId === link.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20'"
                    >
                      <Link2 class="w-2.5 h-2.5 shrink-0" />
                      <span>{{ link.code }}</span>
                    </span>
                    <p class="text-xs font-bold truncate" :class="selectedLinkId === link.id ? 'text-primary' : 'text-primary-text'">
                      {{ link.name }}
                    </p>
                  </div>
                  <p v-if="link.description" class="text-[10px] text-secondary-text line-clamp-2">
                    {{ link.description }}
                  </p>
                </div>
                <div
                  v-if="selectedLinkId === link.id"
                  class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shrink-0 mt-0.5"
                >
                  <Check class="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background shrink-0">
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="isSubmitting || linksLoading || !client?.ib_id"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="handleSubmit"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Updating...' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Loader2, Check, Link2, Users } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()

// State
const referralLinks = ref([])
const linksLoading = ref(false)
const selectedLinkId = ref(null)

const isSubmitting = ref(false)

// Watch open state and client changes to initialize
watch(
  () => [props.open, props.client],
  ([isOpen, clientVal]) => {
    if (isOpen && clientVal) {
      selectedLinkId.value = null
      referralLinks.value = []

      if (clientVal.ib_id) {
        fetchReferralLinks(clientVal.ib_id)
      }
    }
  },
  { immediate: true }
)

// Fetch Referral Links for the chosen IB
const fetchReferralLinks = (ibId) => {
  if (!ibId) {
    referralLinks.value = []
    return
  }
  linksLoading.value = true
  selectedLinkId.value = null

  apiRequest(urls.KEYS.GET, urls.referralLinks.list, {
    isTokenRequired: true,
    look_up_key: ibId,
    onSuccess: (res) => {
      referralLinks.value = res?.data || []
      linksLoading.value = false

      // Try to pre-select current client link if it matches code
      if (props.client?.referral_link_code) {
        const match = referralLinks.value.find(lnk => lnk.code === props.client.referral_link_code)
        if (match) {
          selectedLinkId.value = match.id
        }
      }
    },
    onFailure: (err) => {
      referralLinks.value = []
      linksLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch referral links.', 'error')
    }
  })
}

// Submit details to backend
const handleSubmit = () => {
  if (!props.client?.id) return
  isSubmitting.value = true

  apiRequest(urls.KEYS.PUT, urls.clientList.updateReferralLink, {
    look_up_key: props.client.id,
    data: {
      referral_link_id: selectedLinkId.value
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      snackbar.show(res?.message || 'Referral link updated successfully.', 'success')
      isSubmitting.value = false
      emit('success')
      emit('close')
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to update referral link.', 'error')
      isSubmitting.value = false
    }
  })
}
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
