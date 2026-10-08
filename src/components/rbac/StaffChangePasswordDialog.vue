<script setup>
import { computed, ref, watch } from 'vue'
import { AlertCircle, Eye, EyeOff, Loader2, X } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'

const props = defineProps({
  open: { type: Boolean, default: false },
  staff: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const staffStore = useRbacStaffStore()

const newPassword = ref('')
const showPassword = ref(false)

const staffName = computed(() => props.staff?.name ?? '—')
const staffEmail = computed(() => props.staff?.email ?? '—')

const passwordError = computed(() => {
  if (!newPassword.value) return ''
  const p = newPassword.value
  if (p.length < 8 || p.length > 16) return 'Password must be 8–16 characters'
  if (!/[a-z]/.test(p)) return 'Must include a lowercase letter'
  if (!/[A-Z]/.test(p)) return 'Must include an uppercase letter'
  if (!/[0-9]/.test(p)) return 'Must include a number'
  if (!/[!@#$%^&*]/.test(p)) return 'Must include a special character (! @ # $ % ^ & *)'
  return ''
})

const passwordStrength = computed(() => {
  const p = newPassword.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[!@#$%^&*]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value] ?? ''
})

const strengthColor = computed(() => {
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500']
  return colors[passwordStrength.value] ?? ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      newPassword.value = ''
      showPassword.value = false
    }
  }
)

const closeDialog = () => {
  if (staffStore.actionLoading) return
  emit('close')
}

const submitResetPassword = () => {
  if (staffStore.actionLoading || passwordError.value || !newPassword.value || !props.staff?.id) return

  staffStore.resetStaffPassword(props.staff.id, newPassword.value, () => {
    emit('close')
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="closeDialog"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-primary-border bg-card-background shadow-lg"
      @click.stop
    >
      <div class="flex items-center justify-between border-b border-primary-border px-6 py-4">
        <div class="flex items-center gap-2">
          <AlertCircle class="h-4 w-4 text-yellow-500" />
          <h2 class="text-sm font-semibold text-primary-text">Reset Staff Password</h2>
        </div>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-background cursor-pointer"
          @click="closeDialog"
        >
          <X class="h-4 w-4 text-secondary-text" />
        </button>
      </div>

      <div class="space-y-3 px-6 py-5">
        <p class="text-sm text-primary-text">
          Set a new password for this staff member.
        </p>

        <div class="rounded-xl border border-primary-border bg-background p-4 space-y-2">
          <div class="flex items-center justify-between gap-3 text-xs">
            <span class="text-secondary-text">Name</span>
            <span class="font-medium text-primary-text">{{ staffName }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 text-xs">
            <span class="text-secondary-text">Email</span>
            <span class="font-medium text-primary-text">{{ staffEmail }}</span>
          </div>
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">New Password</p>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a strong password"
              class="w-full px-3 py-2.5 pr-10 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              :class="{ 'border-primary-red': passwordError }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text transition-colors p-0.5 cursor-pointer"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>

          <p v-if="passwordError" class="text-[11px] text-primary-red mt-1 font-medium">
            {{ passwordError }}
          </p>

          <!-- Strength bar -->
          <div v-if="newPassword" class="mt-2 space-y-1">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="i <= passwordStrength ? strengthColor : 'bg-primary-border'"
              />
            </div>
            <p class="text-[11px] text-secondary-text">
              Strength: <span class="font-medium text-primary-text">{{ strengthLabel }}</span>
            </p>
          </div>

          <p v-else class="text-[11px] text-secondary-text mt-1">
            Password must be 8–16 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>
      </div>

      <div class="flex gap-3 px-6 py-4 border-t border-primary-border">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
          :disabled="staffStore.actionLoading"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="staffStore.actionLoading || !!passwordError || !newPassword"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="submitResetPassword"
        >
          <Loader2 v-if="staffStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ staffStore.actionLoading ? 'Resetting...' : 'Reset Password' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
