<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl" @click.stop>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">Add Staff Member</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- First & Last Name -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs font-medium text-secondary-text mb-1.5">First Name <span class="text-primary-red">*</span></p>
            <input
              v-model="form.first_name"
              type="text"
              placeholder="John"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/60"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-secondary-text mb-1.5">Last Name <span class="text-primary-red">*</span></p>
            <input
              v-model="form.last_name"
              type="text"
              placeholder="Doe"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/60"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <p class="text-xs font-medium text-secondary-text mb-1.5">Email Address <span class="text-primary-red">*</span></p>
          <input
            v-model="form.email"
            type="email"
            placeholder="staff@company.com"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/60"
            :class="{ 'border-primary-red focus:border-primary-red': form.email && !isEmailValid }"
          />
          <p v-if="form.email && !isEmailValid" class="text-[11px] text-primary-red mt-1 font-medium">
            Please enter a valid email address.
          </p>
          <p class="text-[11px] text-secondary-text mt-1.5 flex items-start gap-1.5">
            <Info class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>An email with account details will be sent to the email address provided above.</span>
          </p>
        </div>

        <!-- Password -->
        <div>
          <p class="text-xs font-medium text-secondary-text mb-1.5">Password <span class="text-primary-red">*</span></p>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-3 pr-10 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text/60"
              :class="{ 'border-primary-red focus:border-primary-red': form.password && !isPasswordValid }"
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
          <p v-if="form.password && !isPasswordValid" class="text-[11px] text-primary-red mt-1 font-medium">
            Must contain uppercase, lowercase, number, special char & min 8 chars (e.g. Ganesh@1234).
          </p>
          <p v-else class="text-[11px] text-secondary-text mt-1">
            Password must be at least 8 characters long, contain uppercase & lowercase letters, a number, and a special character (e.g., Ganesh@1234).
          </p>
        </div>

        <!-- Role -->
        <div>
          <p class="text-xs font-medium text-secondary-text mb-1.5">Assigned Role</p>
          <BaseSelect
            v-model="form.role_id"
            :options="roleOptions"
            variant="surface"
            placeholder="Select role"
            searchable
            local-search
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="staffStore.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          @click="submit"
        >
          <Loader2 v-if="staffStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ staffStore.actionLoading ? 'Creating...' : 'Create Staff' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Loader2, Info, Eye, EyeOff } from 'lucide-vue-next'
import { useRbacStaffStore } from '@/stores/rbac/staff'
import { useRbacRolesStore } from '@/stores/rbac/roles'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const staffStore = useRbacStaffStore()
const rolesStore = useRbacRolesStore()

const showPassword = ref(false)

const form = ref({ first_name: '', last_name: '', email: '', password: '', role_id: null })

const roleOptions = computed(() =>
  rolesStore.records.map((role) => ({
    label: role.name,
    value: role.id,
  }))
)

// Regex validation rules
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

const isEmailValid = computed(() => {
  if (!form.value.email) return true
  return emailRegex.test(form.value.email)
})

const isPasswordValid = computed(() => {
  if (!form.value.password) return true
  return strongPasswordRegex.test(form.value.password)
})

const isValid = computed(() => {
  return (
    form.value.first_name.trim() !== '' &&
    form.value.last_name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    emailRegex.test(form.value.email) &&
    form.value.password !== '' &&
    strongPasswordRegex.test(form.value.password)
  )
})

watch(() => props.open, (val) => {
  if (val) {
    showPassword.value = false
    form.value = { first_name: '', last_name: '', email: '', password: '', role_id: null }
  }
})

const submit = () => {
  if (!isValid.value) return
  staffStore.createStaff({ ...form.value }, () => emit('close'))
}
</script>