<template>
  <div class="min-h-screen bg-background">
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

      <div class="mb-5">
        <h1 class="text-2xl font-bold text-primary-text">Email Configuration</h1>
        <p class="text-xs text-secondary-text mt-1">Manage your email provider settings and sender information</p>
      </div>

      <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        <div v-for="i in 3" :key="i" class="bg-card-background border border-primary-border rounded-xl p-4">
          <div class="h-4 w-32 bg-primary-border rounded mb-4" />
          <div class="space-y-3">
            <div class="h-3 w-48 bg-primary-border rounded" />
            <div class="h-3 w-64 bg-primary-border rounded" />
          </div>
        </div>
      </div>

      <div v-else-if="!store.settings" class="flex flex-col items-center justify-center text-secondary-text bg-card-background border border-primary-border rounded-xl p-12 min-h-100 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center mb-2">
          <Mail class="w-4 h-4 text-secondary-text" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-primary-text mb-1">No Email Settings Yet</h3>
          <p class="text-xs text-secondary-text">Configure your email provider to start sending notifications</p>
        </div>
        <button
          v-if="hasPermission('email.update')"
          @click="openDialog"
          class="bg-primary text-white hover:bg-primary-hover transition-colors rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          <Settings class="w-4 h-4 text-white" />
          Configure Email Settings
        </button>
      </div>

      <div v-else class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-card-background border border-primary-border rounded-xl p-4 hover:bg-background transition-colors">
            <div class="mb-2">
              <h3 class="text-[11px] font-medium uppercase tracking-widest text-secondary-text">Provider</h3>
            </div>
            <p class="text-xl font-bold text-primary-text capitalize">{{ store.settings.provider }}</p>
            <p class="text-xs text-secondary-text mt-1">Email delivery service</p>
          </div>

          <div class="bg-card-background border border-primary-border rounded-xl p-4 hover:bg-background transition-colors">
            <div class="mb-2">
              <h3 class="text-[11px] font-medium uppercase tracking-widest text-secondary-text">API Key</h3>
            </div>
            <p class="text-base font-mono text-primary-text tabular-nums">
              {{ store.settings.api_key ? `${store.settings.api_key.substring(0, 8)}...${store.settings.api_key.substring(store.settings.api_key.length - 4)}` : '—' }}
            </p>
            <p class="text-xs text-secondary-text mt-1">Securely stored credential</p>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-xl p-4 hover:bg-background transition-colors">
          <h3 class="text-[11px] font-medium uppercase tracking-widest text-secondary-text mb-4">Sender Information</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border-b border-primary-border md:border-b-0 pb-3 md:pb-0">
              <p class="text-[11px] font-medium text-secondary-text uppercase tracking-widest mb-1">From Name</p>
              <p class="text-sm text-primary-text font-medium">{{ store.settings.from_name || '—' }}</p>
            </div>

            <div class="border-b border-primary-border md:border-b-0 pb-3 md:pb-0">
              <p class="text-[11px] font-medium text-secondary-text uppercase tracking-widest mb-1">From Email</p>
              <p class="text-sm text-primary-text font-medium">{{ store.settings.from_email || '—' }}</p>
            </div>

            <div class="md:col-span-2 pt-1">
              <p class="text-[11px] font-medium text-secondary-text uppercase tracking-widest mb-1">Reply To Email</p>
              <p class="text-sm text-primary-text font-medium">{{ store.settings.reply_to_email || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-xl p-4 hover:bg-background transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-[11px] font-medium uppercase tracking-widest text-secondary-text">Status:</h3>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-[11px] font-medium inline-flex items-center',
                  store.settings.is_active ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="store.settings.is_active ? 'bg-primary-green' : 'bg-primary-red'" />
                {{ store.settings.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            
            <button
              v-if="hasPermission('email.update')"
              @click="openDialog"
              class="border border-primary-border bg-primary text-white transition-colors rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <Pencil class="w-4 h-4 text-white" />
              Edit Settings
            </button>
          </div>
        </div>

      </div>

    </main>
  </div>

  <EmailSettingsDialog
    v-if="dialogOpen"
    :settings="store.settings"
    :loading="store.updateLoading"
    @close="dialogOpen = false"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Mail, Pencil, Settings } from 'lucide-vue-next'
import { useEmailSettingsStore } from '@/stores/emails/emailSettings'
import EmailSettingsDialog from '@/components/emails/EmailSettingsDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useEmailSettingsStore()
const { hasPermission } = usePermissionCheck()
const dialogOpen = ref(false)

onMounted(() => store.fetchSettings())

function openDialog() {
  dialogOpen.value = true
}

async function handleSubmit(payload) {
  await store.saveSettings(payload)
  dialogOpen.value = false
}
</script>