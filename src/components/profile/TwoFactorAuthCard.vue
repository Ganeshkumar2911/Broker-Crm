<template>
  <div class="p-3.5 rounded-xl bg-background/60 border border-primary-border/60 space-y-3">
    <!-- Header & Status Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck v-if="twoFactorStore.statusData.totp_enabled" class="w-4.5 h-4.5 text-primary-green" />
          <ShieldAlert v-else class="w-4.5 h-4.5 text-secondary-text" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-bold text-primary-text truncate">
              Two-Factor Authentication (2FA)
            </h4>
            <!-- Status Badge -->
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border"
              :class="
                twoFactorStore.statusData.totp_enabled
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-secondary-text/10 text-secondary-text border-primary-border'
              "
            >
              {{ twoFactorStore.statusData.totp_enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          <p class="text-[11px] text-secondary-text truncate mt-0.5">
            Protect your admin workspace with Google Authenticator (TOTP).
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- If 2FA is OFF -->
        <button
          v-if="!twoFactorStore.statusData.totp_enabled"
          type="button"
          :disabled="twoFactorStore.loading"
          class="btn-primary"
          @click="openSetupModal"
        >
          <Key class="w-3.5 h-3.5" />
          <span>Enable 2FA</span>
        </button>

        <!-- If 2FA is ON -->
        <template v-else>
          <button
            type="button"
            class="btn-secondary px-3 py-1.5"
            @click="openRegenerateModal"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Regenerate Codes</span>
          </button>

          <button
            type="button"
            class="btn-danger px-3 py-1.5"
            @click="openDisableModal"
          >
            <ShieldOff class="w-3.5 h-3.5" />
            <span>Disable 2FA</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Active 2FA Details Bar -->
    <div
      v-if="twoFactorStore.statusData.totp_enabled"
      class="bg-card-background border border-primary-border rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
    >
      <div class="flex items-center gap-1.5 text-secondary-text text-[11px]">
        <CheckCircle2 class="w-3.5 h-3.5 text-primary-green shrink-0" />
        <span>Google Authenticator is active for your account.</span>
      </div>

      <div class="flex items-center gap-3 text-secondary-text text-[11px] flex-wrap">
        <span v-if="twoFactorStore.statusData.backup_codes_remaining !== undefined">
          Remaining Backup Codes:
          <strong class="text-primary-text font-semibold">{{ twoFactorStore.statusData.backup_codes_remaining }}</strong>
        </span>
        <span v-if="twoFactorStore.statusData.required_actions && twoFactorStore.statusData.required_actions.length > 0">
          Required for:
          <strong class="text-primary-text font-semibold capitalize">{{ twoFactorStore.statusData.required_actions.join(', ') }}</strong>
        </span>
      </div>
    </div>

    <!-- ── 1. Enable / Setup 2FA Modal ── -->
    <Teleport to="body">
      <div
        v-if="showSetupModal"
        class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click="closeSetupModal"
      >
        <div
          class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl space-y-4"
          @click.stop
        >
          <!-- Step A: Backup Codes shown after successful activation -->
          <div v-if="newBackupCodes.length > 0" class="space-y-4 text-left">
            <div class="flex items-center justify-between border-b border-primary-border pb-3">
              <h3 class="text-base font-bold text-primary-text flex items-center gap-2">
                <ShieldCheck class="w-5 h-5 text-primary-green" />
                2FA Activated Successfully!
              </h3>
              <button
                type="button"
                @click="closeSetupModal"
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <p class="text-xs text-secondary-text leading-relaxed">
              Please save these one-time backup codes safely. If you lose access to your authenticator app, you can use these codes to log in.
            </p>

            <div class="grid grid-cols-2 gap-2 bg-background p-3.5 rounded-xl border border-primary-border font-mono text-xs text-primary-text text-center select-all">
              <div
                v-for="(code, idx) in newBackupCodes"
                :key="idx"
                class="p-2 bg-card-background rounded-lg border border-primary-border tracking-wider font-semibold"
              >
                {{ code }}
              </div>
            </div>

            <div class="space-y-2.5 pt-2">
              <button
                type="button"
                class="btn-secondary w-full py-2.5"
                @click="copyBackupCodes(newBackupCodes)"
              >
                <Copy :size="14" />
                <span>{{ copiedBackup ? 'Copied to Clipboard!' : 'Copy All Backup Codes' }}</span>
              </button>

              <button
                type="button"
                class="btn-primary w-full py-2.5"
                @click="closeSetupModal"
              >
                Done
              </button>
            </div>
          </div>

          <!-- Step B: QR Code & Verification Form -->
          <div v-else class="space-y-4 text-left">
            <div class="flex items-center justify-between border-b border-primary-border pb-3">
              <h3 class="text-base font-bold text-primary-text">
                Enable Two-Factor Authentication
              </h3>
              <button
                type="button"
                @click="closeSetupModal"
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div v-if="setupLoading" class="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 class="w-8 h-8 animate-spin text-primary" />
              <span class="text-xs text-secondary-text">Generating authenticator QR code…</span>
            </div>

            <template v-else>
              <div class="text-xs text-secondary-text space-y-1.5">
                <p>1. Scan the QR code using Google Authenticator, Microsoft Authenticator, or Authy.</p>
                <p>2. Or enter the secret key manually if you cannot scan.</p>
              </div>

              <!-- QR Display -->
              <div class="flex justify-center p-3 bg-white rounded-xl border border-primary-border w-fit mx-auto shadow-xs">
                <img
                  v-if="qrCodeDataUrl"
                  :src="qrCodeDataUrl"
                  alt="2FA QR Code"
                  class="w-36 h-36 object-contain rounded"
                />
              </div>

              <!-- Secret Key with Copy -->
              <div v-if="setupSecret" class="bg-background p-2.5 rounded-xl border border-primary-border flex items-center justify-between gap-2">
                <div class="overflow-hidden">
                  <span class="block text-[10px] text-secondary-text font-medium">Secret Key:</span>
                  <code class="text-xs font-mono font-bold text-primary-text tracking-wider truncate block">
                    {{ setupSecret }}
                  </code>
                </div>
                <button
                  type="button"
                  class="shrink-0 p-1.5 rounded-lg hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Copy Secret Key"
                  @click="copySecret"
                >
                  <Copy :size="15" />
                </button>
              </div>

              <!-- 6-digit confirmation code -->
              <form @submit.prevent="handleConfirmSetup" class="space-y-3 pt-1">
                <div>
                  <label class="block text-xs font-semibold text-primary-text mb-1.5">
                    Enter 6-digit verification code from app:
                  </label>
                  <input
                    v-model="setupCode"
                    type="text"
                    inputmode="numeric"
                    maxlength="6"
                    placeholder="123456"
                    class="input-field px-4 py-2.5 text-center font-mono text-base tracking-widest"
                  />
                </div>

                <p v-if="setupError" class="text-[11px] text-primary-red text-center">
                  {{ setupError }}
                </p>

                <button
                  type="submit"
                  :disabled="confirmingSetup || setupCode.trim().length !== 6"
                  class="btn-primary w-full py-2.5"
                >
                  <Loader2 v-if="confirmingSetup" :size="15" class="animate-spin text-white" />
                  <span>{{ confirmingSetup ? 'Verifying…' : 'Activate 2FA' }}</span>
                </button>
              </form>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── 2. Disable 2FA Modal ── -->
    <Teleport to="body">
      <div
        v-if="showDisableModal"
        class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click="showDisableModal = false"
      >
        <div
          class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md p-6 shadow-2xl"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-primary-border pb-3 mb-4">
            <h3 class="text-base font-bold text-primary-text flex items-center gap-2">
              <ShieldOff class="w-4.5 h-4.5 text-primary-red" />
              Disable Two-Factor Authentication
            </h3>
            <button
              type="button"
              @click="showDisableModal = false"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <p class="text-xs text-secondary-text mb-4">
            To disable 2FA, enter your account password and your current authenticator code (or backup code).
          </p>

          <form @submit.prevent="handleDisable2fa" class="space-y-3.5">
            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1">
                Current Password
              </label>
              <div class="relative">
                <input
                  v-model="disableForm.password"
                  :type="showDisablePassword ? 'text' : 'password'"
                  placeholder="Enter your account password"
                  class="input-field px-4 py-2.5 pr-10"
                />
                <button
                  type="button"
                  @click="showDisablePassword = !showDisablePassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
                >
                  <Eye v-if="showDisablePassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Code / Backup Code -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-primary-text">
                  {{ disableUseBackup ? 'Backup Code' : 'Authenticator Code' }}
                </label>
                <button
                  type="button"
                  class="text-[11px] text-primary hover:underline cursor-pointer"
                  @click="disableUseBackup = !disableUseBackup; disableForm.code = ''"
                >
                  {{ disableUseBackup ? 'Use App Code' : 'Use Backup Code' }}
                </button>
              </div>
              <input
                v-model="disableForm.code"
                type="text"
                :placeholder="disableUseBackup ? 'e.g. A1B2-C3D4' : '6-digit code'"
                :maxlength="disableUseBackup ? 14 : 6"
                class="input-field px-4 py-2.5 font-mono text-center tracking-wider"
              />
            </div>

            <p v-if="disableError" class="text-[11px] text-primary-red text-center">
              {{ disableError }}
            </p>

            <button
              type="submit"
              :disabled="disabling || !disableForm.password || !disableForm.code"
              class="btn-danger w-full py-2.5 mt-4"
            >
              <Loader2 v-if="disabling" :size="15" class="animate-spin text-white" />
              <span>{{ disabling ? 'Disabling 2FA…' : 'Disable 2FA' }}</span>
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── 3. Regenerate Backup Codes Modal ── -->
    <Teleport to="body">
      <div
        v-if="showRegenerateModal"
        class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click="showRegenerateModal = false"
      >
        <div
          class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md p-6 shadow-2xl space-y-4"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-primary-border pb-3">
            <h3 class="text-base font-bold text-primary-text flex items-center gap-2">
              <RefreshCw class="w-4.5 h-4.5 text-primary" />
              Regenerate Backup Codes
            </h3>
            <button
              type="button"
              @click="showRegenerateModal = false"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Generated Codes Result Display -->
          <div v-if="regeneratedCodes.length > 0" class="space-y-4">
            <p class="text-xs text-secondary-text">
              New backup codes have been generated. Old backup codes will no longer work. Save these immediately.
            </p>

            <div class="grid grid-cols-2 gap-2 bg-background p-3.5 rounded-xl border border-primary-border font-mono text-xs text-primary-text text-center select-all">
              <div
                v-for="(code, idx) in regeneratedCodes"
                :key="idx"
                class="p-2 bg-card-background rounded-lg border border-primary-border tracking-wider font-semibold"
              >
                {{ code }}
              </div>
            </div>

            <div class="space-y-2.5 pt-2">
              <button
                type="button"
                class="btn-secondary w-full py-2.5"
                @click="copyBackupCodes(regeneratedCodes)"
              >
                <Copy :size="14" />
                <span>{{ copiedBackup ? 'Copied to Clipboard!' : 'Copy All Backup Codes' }}</span>
              </button>

              <button
                type="button"
                class="btn-primary w-full py-2.5"
                @click="showRegenerateModal = false"
              >
                Done
              </button>
            </div>
          </div>

          <!-- Prompt Code Form -->
          <form v-else @submit.prevent="handleRegenerateCodes" class="space-y-4">
            <p class="text-xs text-secondary-text">
              Enter your current 6-digit Authenticator app code to regenerate your backup codes.
            </p>

            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">
                Authenticator Code
              </label>
              <input
                v-model="regenerateCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="123456"
                class="input-field px-4 py-2.5 text-center font-mono text-base tracking-widest"
              />
            </div>

            <p v-if="regenerateError" class="text-[11px] text-primary-red text-center">
              {{ regenerateError }}
            </p>

            <button
              type="submit"
              :disabled="regenerating || regenerateCode.trim().length !== 6"
              class="btn-primary w-full py-2.5"
            >
              <Loader2 v-if="regenerating" :size="15" class="animate-spin text-white" />
              <span>{{ regenerating ? 'Generating…' : 'Generate New Codes' }}</span>
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Key,
  Copy,
  RefreshCw,
  Loader2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-vue-next'
import QRCode from 'qrcode'
import { useTwoFactorStore } from '@/stores/twoFactor/twoFactor'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import authToken from '@/common/authToken'

const twoFactorStore = useTwoFactorStore()
const snackbar = useSnackbarStore()

// Setup Modal State
const showSetupModal = ref(false)
const setupLoading = ref(false)
const confirmingSetup = ref(false)
const setupSecret = ref('')
const qrCodeDataUrl = ref('')
const setupCode = ref('')
const setupError = ref('')
const newBackupCodes = ref([])
const copiedBackup = ref(false)

// Disable Modal State
const showDisableModal = ref(false)
const disabling = ref(false)
const showDisablePassword = ref(false)
const disableUseBackup = ref(false)
const disableForm = ref({ password: '', code: '' })
const disableError = ref('')

// Regenerate Modal State
const showRegenerateModal = ref(false)
const regenerating = ref(false)
const regenerateCode = ref('')
const regenerateError = ref('')
const regeneratedCodes = ref([])

onMounted(() => {
  if (authToken.isStaff()) {
    twoFactorStore.get2faStatus()
  }
})

// ── Setup 2FA Flow ─────────────────────────────────────
const openSetupModal = async () => {
  showSetupModal.value = true
  setupLoading.value = true
  setupSecret.value = ''
  qrCodeDataUrl.value = ''
  setupCode.value = ''
  setupError.value = ''
  newBackupCodes.value = []

  try {
    const res = await twoFactorStore.setup2fa()
    const data = res?.data || res
    setupSecret.value = data?.secret || ''
    const otpauthUri = data?.otpauth_uri || ''
    if (otpauthUri) {
      qrCodeDataUrl.value = await QRCode.toDataURL(otpauthUri, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
    }
  } catch (err) {
    setupError.value = err?.message || err?.error || 'Failed to initialize 2FA setup.'
  } finally {
    setupLoading.value = false
  }
}

const copySecret = () => {
  if (!setupSecret.value) return
  navigator.clipboard.writeText(setupSecret.value)
  snackbar.show('Secret key copied!', 'success')
}

const handleConfirmSetup = async () => {
  if (setupCode.value.trim().length !== 6) return
  confirmingSetup.value = true
  setupError.value = ''

  try {
    const res = await twoFactorStore.confirm2fa(setupCode.value.trim())
    const data = res?.data || res
    if (data?.backup_codes && Array.isArray(data.backup_codes)) {
      newBackupCodes.value = data.backup_codes
    } else {
      closeSetupModal()
    }
    snackbar.show('Two-Factor Authentication enabled successfully!', 'success')
    twoFactorStore.get2faStatus(true)
  } catch (err) {
    setupError.value = err?.message || err?.error || 'Invalid verification code.'
  } finally {
    confirmingSetup.value = false
  }
}

const closeSetupModal = () => {
  showSetupModal.value = false
  newBackupCodes.value = []
}

// ── Disable 2FA Flow ───────────────────────────────────
const openDisableModal = () => {
  disableForm.value = { password: '', code: '' }
  disableError.value = ''
  disableUseBackup.value = false
  showDisablePassword.value = false
  showDisableModal.value = true
}

const handleDisable2fa = async () => {
  if (!disableForm.value.password || !disableForm.value.code) return
  disabling.value = true
  disableError.value = ''

  const payload = {
    password: disableForm.value.password,
  }
  if (disableUseBackup.value) {
    payload.backup_code = disableForm.value.code.trim()
  } else {
    payload.totp_code = disableForm.value.code.trim()
  }

  try {
    await twoFactorStore.disable2fa(payload)
    showDisableModal.value = false
    twoFactorStore.get2faStatus(true)
  } catch (err) {
    disableError.value = err?.message || err?.error || 'Failed to disable 2FA. Check password and code.'
  } finally {
    disabling.value = false
  }
}

// ── Regenerate Backup Codes Flow ───────────────────────
const openRegenerateModal = () => {
  regenerateCode.value = ''
  regenerateError.value = ''
  regeneratedCodes.value = []
  showRegenerateModal.value = true
}

const handleRegenerateCodes = async () => {
  if (regenerateCode.value.trim().length !== 6) return
  regenerating.value = true
  regenerateError.value = ''

  try {
    const res = await twoFactorStore.regenerateBackupCodes(regenerateCode.value.trim())
    const data = res?.data || res
    if (data?.backup_codes && Array.isArray(data.backup_codes)) {
      regeneratedCodes.value = data.backup_codes
    }
  } catch (err) {
    regenerateError.value = err?.message || err?.error || 'Invalid code. Could not regenerate backup codes.'
  } finally {
    regenerating.value = false
  }
}

const copyBackupCodes = (codes) => {
  if (!codes || codes.length === 0) return
  navigator.clipboard.writeText(codes.join('\n'))
  copiedBackup.value = true
  snackbar.show('Backup codes copied to clipboard!', 'success')
  setTimeout(() => {
    copiedBackup.value = false
  }, 3000)
}
</script>
