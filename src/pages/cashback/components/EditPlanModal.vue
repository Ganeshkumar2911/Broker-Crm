<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div
      class="bg-card-background border border-primary-border rounded-xl shadow-lg w-full max-w-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex justify-between items-center p-5 border-b border-primary-border"
      >
        <h3 class="text-lg font-semibold text-primary-text">Edit Plan</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text cursor-pointer"
        >
          <HugeIcon :icon="Cancel01Icon" :size="20" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Plan Name</label
          >
          <input
            v-model="formData.name"
            type="text"
            placeholder="Enter Plan Name"
            class="input-field px-3 py-2 text-sm w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Status</label
          >
          <BaseSelect
            v-model="formData.status"
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Paused', value: 'paused' },
            ]"
            placeholder="Select Status"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Rate per Lot</label
          >
          <input
            v-model="formData.rate_per_lot"
            type="number"
            step="0.01"
            min="0"
            class="input-field px-3 py-2 text-sm w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Sort Order</label
          >
          <input
            v-model="formData.sort_order"
            type="number"
            step="1"
            class="input-field px-3 py-2 text-sm w-full"
          />
        </div>
      </div>

      <div
        class="flex justify-end gap-3 p-5 border-t border-primary-border bg-background/50"
      >
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg cursor-pointer"
          @click="$emit('close')"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 cursor-pointer"
          @click="handleSubmit"
          :disabled="store.actionLoading"
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="16"
            class="animate-spin"
          />
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useCashbackStore } from "@/stores/cashback/cashback";

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const store = useCashbackStore();

const formData = ref({
  name: props.plan.name,
  status: props.plan.status,
  rate_per_lot: props.plan.rate_per_lot,
  sort_order: props.plan.sort_order,
});

const handleSubmit = async () => {
  await store.updatePlan(props.plan.id, formData.value);
  if (!store.error) {
    emit("close");
  }
};
</script>
