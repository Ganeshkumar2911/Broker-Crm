<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="closeDialog"
        />
      </Transition>

      <!-- Side Panel Drawer -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <UserPen v-if="isEditing" class="w-5 h-5 text-primary" />
                <User v-else class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">
                  {{ showFmForm ? 'FM Registration' : (isEditing ? 'Update User Profile' : 'User Profile') }}
                </h2>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{ showFmForm ? 'Complete your Fund Manager details.' : (isEditing ? 'Modify personal details and location info.' : 'Account information and settings.') }}
                </p>
              </div>
            </div>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              @click="closeDialog"
              title="Close"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- ── FM Registration Form ── -->
          <template v-if="showFmForm">
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <p v-if="fmFormError" class="text-primary-red text-xs p-3 rounded-xl bg-primary-red/10 border border-primary-red/20">
                {{ fmFormError }}
              </p>

              <div class="grid grid-cols-2 gap-3">
                <div v-for="field in ['performance_fee', 'fm_share', 'broker_share', 'ib_pool_percentage']" :key="field" class="flex flex-col gap-1">
                  <label class="text-secondary-text text-xs font-medium">{{ formatLabel(field) }} (%)</label>
                  <input
                    v-model="fmForm[field]"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs focus:outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-xs font-medium">Settlement Type</label>
                <select
                  v-model="fmForm.settlement_type"
                  class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-xs font-medium">Settlement Time (HH:MM)</label>
                <input
                  v-model="fmForm.settlement_time"
                  type="time"
                  class="bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <!-- FM Form Footer -->
            <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 shrink-0 bg-card-background">
              <button
                @click="closeFmForm"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="submitFmRegistration"
                :disabled="fmFormLoading"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Loader2 v-if="fmFormLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ fmFormLoading ? 'Submitting...' : 'Submit Request' }}</span>
              </button>
            </div>
          </template>

          <!-- ── Edit Profile View ── -->
          <template v-else-if="isEditing">
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">
                  Full Name
                </label>
                <input
                  v-model="editForm.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                />
              </div>

              <!-- Date of Birth & Phone -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    Date of Birth (YYYY-MM-DD)
                  </label>
                  <input
                    v-model="editForm.date_of_birth"
                    type="date"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    Phone Number
                  </label>
                  <input
                    v-model="editForm.phone_number"
                    type="text"
                    placeholder="+1234567890"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                  />
                </div>
              </div>

              <!-- Country & State -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    Country
                  </label>
                  <BaseSelect
                    v-model="editForm.country"
                    :options="countries"
                    placeholder="Select Country..."
                    variant="surface"
                    searchable
                    local-search
                    show-flags
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    State / Region
                  </label>
                  <input
                    v-model="editForm.state"
                    type="text"
                    placeholder="California"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                  />
                </div>
              </div>

              <!-- City & Zip Code -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    City
                  </label>
                  <input
                    v-model="editForm.city"
                    type="text"
                    placeholder="Los Angeles"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    Zip / Postal Code
                  </label>
                  <input
                    v-model="editForm.zip_code"
                    type="text"
                    placeholder="90001"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text"
                  />
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">
                  Street Address
                </label>
                <textarea
                  v-model="editForm.address"
                  rows="2"
                  placeholder="123 Main Street"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text resize-none"
                />
              </div>
            </div>

            <!-- Edit Mode Footer -->
            <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 shrink-0 bg-card-background">
              <button
                @click="cancelEdit"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="submitProfileUpdate"
                :disabled="profileStore.updateLoading"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Loader2 v-if="profileStore.updateLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ profileStore.updateLoading ? 'Saving...' : 'Save Profile' }}</span>
              </button>
            </div>
          </template>

          <!-- ── Main Profile Details View ── -->
          <template v-else>
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Avatar + User Summary Header -->
              <div class="flex items-center gap-4 p-4 rounded-2xl bg-background border border-primary-border">
                <div class="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span class="text-primary text-base font-bold">
                    {{ (profileStore.user?.name || profileStore.user?.email || 'U').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-primary-text truncate">
                      {{ profileStore.user?.name || 'User Profile' }}
                    </h3>
                    <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      :class="profileStore.user?.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary-red/10 text-primary-red border border-primary-red/20'"
                    >
                      {{ profileStore.user?.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <p class="text-xs text-secondary-text truncate mt-0.5">
                    {{ profileStore.user?.email || 'No email registered' }}
                  </p>
                  <p v-if="role" class="text-[11px] text-primary font-medium capitalize mt-1">
                    Role: {{ role === "staff" ? "admin" : role }}
                  </p>
                </div>
              </div>

              <!-- Personal Information Grid -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">
                    Personal Information
                  </h4>
                  <button
                    class="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold cursor-pointer"
                    @click="startEdit"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Full Name</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.name || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Date of Birth</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.date_of_birth || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Phone Number</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.phone_number || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Country</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate flex items-center gap-1.5">
                      <span
                        v-if="profileStore.user?.country && getFlagCode(profileStore.user.country)"
                        :class="['fi', `fi-${getFlagCode(profileStore.user.country)}`, 'fis', 'w-4 h-3 shrink-0']"
                      ></span>
                      <span>{{ getCountryLabel(profileStore.user?.country) }}</span>
                    </p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">State / Region</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.state || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">City</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.city || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60 col-span-2">
                    <p class="text-[10px] text-secondary-text">Street Address</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5">{{ profileStore.user?.address || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Zip / Postal Code</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.zip_code || '—' }}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-background/60 border border-primary-border/60">
                    <p class="text-[10px] text-secondary-text">Joined Date</p>
                    <p class="text-xs font-semibold text-primary-text mt-0.5 truncate">{{ profileStore.user?.created_at || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- ── Two-Factor Authentication Section (Only for Staff) ── -->
              <div v-if="isStaff" class="pt-2">
                <TwoFactorAuthCard />
              </div>

              <!-- ── FM Section ── -->
              <template v-if="isFm">
                <div class="pt-4 border-t border-primary-border space-y-3">
                  <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">
                    Fund Manager Info
                  </h4>

                  <!-- Approved -->
                  <template v-if="fmStatus === 'approved'">
                    <div class="flex items-center gap-2 mb-2">
                      <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                      <span class="text-emerald-400 text-xs font-semibold">FM Account Approved</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div
                        v-for="[key, val] in fmInfoEntries"
                        :key="key"
                        class="bg-background rounded-xl p-3 border border-primary-border/60"
                      >
                        <p class="text-secondary-text text-[10px]">{{ formatLabel(key) }}</p>
                        <p class="text-primary-text text-xs font-medium mt-0.5">{{ val }}</p>
                      </div>
                    </div>
                  </template>

                  <!-- Pending -->
                  <template v-else-if="fmStatus === 'pending'">
                    <div class="flex items-center gap-2 mb-2">
                      <Clock class="w-4 h-4 text-amber-400" />
                      <span class="text-amber-400 text-xs font-semibold">FM Request Pending</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div
                        v-for="[key, val] in fmRequestEntries"
                        :key="key"
                        class="bg-background rounded-xl p-3 border border-primary-border/60"
                      >
                        <p class="text-secondary-text text-[10px]">{{ formatLabel(key) }}</p>
                        <p class="text-primary-text text-xs font-medium mt-0.5">{{ val }}</p>
                      </div>
                    </div>
                  </template>

                  <!-- Incomplete -->
                  <template v-else>
                    <div class="flex items-center gap-2 mb-2">
                      <AlertCircle class="w-4 h-4 text-primary-red" />
                      <span class="text-primary-red text-xs font-semibold">FM Registration Incomplete</span>
                    </div>
                    <p class="text-secondary-text text-xs mb-3">
                      Complete your Fund Manager registration to get started.
                    </p>
                    <button
                      @click="openFmForm"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      <ClipboardList class="w-3.5 h-3.5" />
                      Complete FM Registration
                    </button>
                  </template>
                </div>
              </template>
            </div>

            <!-- Footer Actions -->
            <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 shrink-0 bg-card-background">
              <button
                @click="startEdit"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-text bg-background border border-primary-border hover:border-primary/40 transition-colors cursor-pointer"
              >
                <UserPen class="w-4 h-4 text-primary" />
                <span>Update Profile</span>
              </button>

              <button
                @click="logout"
                class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-red bg-primary-red/10 border border-primary-red/20 hover:bg-primary-red/20 transition-colors cursor-pointer"
              >
                <LogOut class="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { LogOut, ClipboardList, Clock, CheckCircle2, AlertCircle, User, UserPen, X, Loader2, Pencil } from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'
import { useAuthStore } from '@/stores/auth'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import { countries, getFlagCode, cleanCountryLabel } from '@/utils/countries'
import BaseSelect from '@/components/common/BaseSelect.vue'
import TwoFactorAuthCard from '@/components/profile/TwoFactorAuthCard.vue'
import authToken from '@/common/authToken'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const profileStore = useProfileStore()
const authStore = useAuthStore()
const myPermissionsStore = useMyPermissionsStore()

// ─── Edit Mode State ────────────────────────────────
const isEditing = ref(false)
const editForm = ref({
  name: '',
  date_of_birth: '',
  country: '',
  state: '',
  city: '',
  address: '',
  zip_code: '',
  phone_number: '',
})

function startEdit() {
  const u = profileStore.user || {}
  editForm.value = {
    name: u.name || '',
    date_of_birth: u.date_of_birth || '',
    country: u.country || '',
    state: u.state || '',
    city: u.city || '',
    address: u.address || '',
    zip_code: u.zip_code || '',
    phone_number: u.phone_number || '',
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function submitProfileUpdate() {
  const userId =
    profileStore.user?.id ||
    profileStore.user?.user_id ||
    profileStore.user?.user?.id ||
    profileStore.user?.user?.user_id ||
    myPermissionsStore.userId

  try {
    await profileStore.updateUserProfile(userId, editForm.value)
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update profile:', err)
  }
}

// ─── Country Label Helper ───────────────────────────
function getCountryLabel(val) {
  if (!val) return '—'
  const found = countries.find((c) => c.value === val || c.label.includes(val))
  return found ? cleanCountryLabel(found.label) : cleanCountryLabel(val)
}

// ─── Role Detection ─────────────────────────────────
const rawRole = computed(() => {
  return authToken.getRole() || localStorage.getItem('role') || profileStore.user?.role || null;
})

const isStaff = computed(() => {
  return rawRole.value === 'staff';
})

const role = computed(() => {
  let r = rawRole.value;
  if (!r) {
    try {
      r = JSON.parse(localStorage.getItem('user') || '{}')?.role || null;
    } catch {
      r = null;
    }
  }
  return r === 'staff' ? 'admin' : r;
})

const isFm = computed(() => role.value === 'fm')

// ─── FM Status ──────────────────────────────────────
const fmStatus = computed(() => {
  if (!isFm.value) return null
  const { fm_info, fm_request } = profileStore.user || {}
  if (fm_info && (Array.isArray(fm_info) ? fm_info.length > 0 : Object.keys(fm_info).length > 0)) return 'approved'
  if (fm_request) return 'pending'
  return 'incomplete'
})

// ─── FM Registration Form ───────────────────────────
const showFmForm = ref(false)
const fmForm = ref({
  performance_fee: '',
  fm_share: '',
  broker_share: '',
  ib_pool_percentage: '',
  settlement_type: 'monthly',
  settlement_time: '00:00',
})
const fmFormLoading = ref(false)
const fmFormError = ref(null)

function openFmForm() {
  fmFormError.value = null
  showFmForm.value = true
}

function closeFmForm() {
  showFmForm.value = false
  fmFormError.value = null
}

async function submitFmRegistration() {
  fmFormLoading.value = true
  fmFormError.value = null
  try {
    await profileStore.submitFmRequest({ ...fmForm.value })
    closeFmForm()
    profileStore.fetchUserProfile()
  } catch (err) {
    fmFormError.value = err?.error || 'Submission failed. Please try again.'
  } finally {
    fmFormLoading.value = false
  }
}

// ─── Helpers ────────────────────────────────────────
function logout() {
  emit('close')
  authStore.logout()
}

function closeDialog() {
  if (showFmForm.value) {
    closeFmForm()
    return
  }
  if (isEditing.value) {
    cancelEdit()
    return
  }
  emit('close')
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const fmInfoEntries = computed(() => {
  const info = profileStore.user?.fm_info
  if (!info || (Array.isArray(info) && info.length === 0)) return []
  return Object.entries(info).filter(([k]) => k !== 'created_at')
})

const fmRequestEntries = computed(() => {
  const req = profileStore.user?.fm_request
  if (!req) return []
  return Object.entries(req).filter(([k]) => k !== 'created_at' && k !== 'status')
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      isEditing.value = false
      showFmForm.value = false
      if (!profileStore.user) {
        profileStore.fetchUserProfile()
      }
    }
  }
)
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>