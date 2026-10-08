<!-- /components/clientWallet/ClientWalletTable.vue -->
<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
})

const formatDate = (d) => new Date(d).toLocaleDateString()
</script>

<template>
  <div class="w-full border border-primary-border rounded-lg overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b border-primary-border">
          <th class="text-left text-[11px] text-secondary-text p-3">Reference</th>
          <th class="text-left text-[11px] text-secondary-text p-3">Type</th>
          <th class="text-left text-[11px] text-secondary-text p-3">Amount</th>
          <th class="text-left text-[11px] text-secondary-text p-3">Before</th>
          <th class="text-left text-[11px] text-secondary-text p-3">After</th>
          <th class="text-right text-[11px] text-secondary-text p-3">Date</th>
        </tr>
      </thead>

      <!-- Skeleton -->
      <tbody v-if="loading">
        <tr v-for="n in 5" :key="n" class="animate-pulse">
          <td class="p-3"><div class="h-3 w-16 bg-card-background rounded" /></td>
          <td class="p-3"><div class="h-3 w-12 bg-card-background rounded" /></td>
          <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
          <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
          <td class="p-3"><div class="h-3 w-14 bg-card-background rounded" /></td>
          <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
        </tr>
      </tbody>

      <!-- Empty -->
      <tbody v-else-if="data.length === 0">
        <tr>
          <td colspan="6" class="p-10 text-center text-secondary-text text-xs">
            No wallet data
          </td>
        </tr>
      </tbody>

      <!-- Data -->
      <tbody v-else>
        <tr
          v-for="item in data"
          :key="item.reference"
          class="border-b border-primary-border last:border-none hover:bg-card-background"
        >
          <td class="p-3 text-primary-text text-sm">
            {{ item.reference || '-' }}
          </td>

          <td class="p-3">
            <span class="text-[11px] px-2 py-1 rounded-full bg-primary text-black">
              {{ item.type }}
            </span>
          </td>

          <td class="p-3 text-sm text-primary-text">
            ${{ item.amount.toFixed(2) }}
          </td>

          <td class="p-3 text-sm text-primary-text">
            ${{ item.balance_before.toFixed(2) }}
          </td>

          <td class="p-3 text-sm text-primary-text">
            ${{ item.balance_after.toFixed(2) }}
          </td>

          <td class="p-3 text-right text-xs text-secondary-text">
            {{ formatDate(item.date) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>