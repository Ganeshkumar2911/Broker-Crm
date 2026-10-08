<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h3 class="text-sm font-semibold text-primary-text">Campaign Details</h3>
        <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="$emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- Campaign General Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-[10px] text-secondary-text uppercase font-semibold">Campaign Name</p>
            <p class="text-xs text-primary-text font-bold mt-1">{{ item.name }}</p>
          </div>
          <div>
            <p class="text-[10px] text-secondary-text uppercase font-semibold">Referral Code</p>
            <p class="text-xs text-primary-text font-mono font-bold mt-1 uppercase">{{ item.code }}</p>
          </div>
        </div>

        <div>
          <p class="text-[10px] text-secondary-text uppercase font-semibold">Description</p>
          <p class="text-xs text-secondary-text mt-1 leading-normal">{{ item.description || 'No description provided.' }}</p>
        </div>

        <!-- Referral URL read-only with copy button -->
        <div class="space-y-1.5">
          <p class="text-[10px] text-secondary-text uppercase font-semibold">Referral URL</p>
          <div class="flex items-center gap-2 bg-background border border-primary-border rounded-xl px-3 py-2">
            <span class="flex-1 text-xs font-mono text-secondary-text truncate select-all">{{ getReferralUrl(item.code) }}</span>
            <button
              class="p-1.5 rounded-lg hover:bg-primary-border text-secondary-text hover:text-primary-text transition shrink-0 cursor-pointer"
              title="Copy URL"
              @click="$emit('copy', getReferralUrl(item.code))"
            >
              <Copy :size="13" />
            </button>
          </div>
        </div>

        <!-- Configured Groups list -->
        <div class="space-y-2">
          <p class="text-[10px] text-secondary-text uppercase font-semibold">
            Configured MT5 Groups ({{ item.groups?.length || 0 }})
          </p>
          <div v-if="item.groups && item.groups.length > 0" class="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
            <div
              v-for="grp in item.groups"
              :key="grp.id"
              class="flex items-center justify-between p-2.5 rounded-xl border border-primary-border bg-background/50 hover:bg-background transition"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-primary-text truncate">{{ grp.label }}</p>
                <p class="text-[10px] text-secondary-text truncate mt-0.5">
                  Category: {{ grp.category || 'STANDARD' }} · Type: {{ grp.account_type || 'live' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[10px] font-semibold bg-primary-blue/10 text-primary-blue px-2 py-0.5 rounded">
                  {{ grp.currency || 'USD' }}
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-secondary-text italic py-2">No groups configured for this campaign.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex justify-end">
        <button
          class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Copy, X } from 'lucide-vue-next'

defineProps({
  open: {
    type: Boolean,
    required: true
  },
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'copy'])

const getReferralUrl = (code) => {
  return `https://portal.panthercapitals.com/register?ref=${code || ''}`
}
</script>
