<script setup>
import { ref, watch, computed } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  Folder01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import BaseSelect from "@/components/common/BaseSelect.vue";

const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "USC", value: "USC" },
];

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  group: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const store = useCommissionEngineStore();

const isEdit = computed(() => !!props.group?.id);

const formData = ref({
  name: "",
  code: "",
  currency: "",
  sort_order: 1,
  is_active: true,
});

const formErrors = ref({});

watch(
  () => props.group,
  (val) => {
    if (val) {
      formData.value = {
        name: val.name || "",
        code: val.code || "",
        currency: val.currency || "",
        sort_order: val.sort_order ?? 1,
        is_active: val.is_active !== undefined ? val.is_active : true,
      };
    } else {
      formData.value = {
        name: "",
        code: "",
        currency: "",
        sort_order: (store.symbolGroups?.length || 0) + 1,
        is_active: true,
      };
    }
    formErrors.value = {};
  },
  { immediate: true },
);

const closeModal = () => {
  emit("update:modelValue", false);
};

const validate = () => {
  formErrors.value = {};
  let isValid = true;
  if (!formData.value.name.trim()) {
    formErrors.value.name = "Group name is required";
    isValid = false;
  }
  if (!formData.value.currency) {
    formErrors.value.currency = "Currency is required";
    isValid = false;
  }
  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) return;

  const payload = {
    name: formData.value.name.trim(),
    code: formData.value.code
      ? formData.value.code.trim().toLowerCase().replace(/\s+/g, "_")
      : undefined,
    currency: formData.value.currency
      ? formData.value.currency.trim().toUpperCase()
      : undefined,
    sort_order: Number(formData.value.sort_order) || 1,
    is_active: !!formData.value.is_active,
  };

  try {
    if (isEdit.value) {
      await store.updateSymbolGroup(props.group.id, payload);
    } else {
      await store.createSymbolGroup(payload);
    }
    closeModal();
    emit("saved");
  } catch (err) {
    // Handled in store via snackbar
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="Folder01Icon" :size="18" />
              </div>
              <div>
                <h3
                  class="title-text text-base text-primary-text font-semibold"
                >
                  {{ isEdit ? "Edit Symbol Group" : "Create Symbol Group" }}
                </h3>
                <p class="text-xs text-secondary-text">
                  {{
                    isEdit
                      ? "Update group name and display order"
                      : "Define a new group to categorize MT5 trading symbols"
                  }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="16" />
            </button>
          </div>

          <!-- Form Body -->
          <form
            @submit.prevent="handleSubmit"
            class="p-5 space-y-4 overflow-y-auto"
          >
            <!-- Group Name -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Group Name <span class="text-primary-red">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="e.g. Forex Major, Gold, Indices"
                class="input-field px-3 py-2 text-xs"
                :class="{ 'border-primary-red': formErrors.name }"
                autofocus
              />
              <p v-if="formErrors.name" class="text-[11px] text-primary-red">
                {{ formErrors.name }}
              </p>
            </div>

            <!-- Group Code -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Group Code
                <span class="text-[10px] text-secondary-text font-normal ml-1"
                  >(Optional identifier)</span
                >
              </label>
              <input
                v-model="formData.code"
                type="text"
                placeholder="e.g. forex_major, gold, indices"
                class="input-field px-3 py-2 text-xs font-mono"
              />
              <p class="text-[11px] text-secondary-text">
                Unique identifier string used for matrix mapping headers.
              </p>
            </div>

            <!-- Currency -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Currency <span class="text-primary-red">*</span>
              </label>
              <BaseSelect
                v-model="formData.currency"
                :options="currencyOptions"
                placeholder="Select Currency"
                :class="{ 'ring-1 ring-primary-red': formErrors.currency }"
              />
              <p v-if="formErrors.currency" class="text-[11px] text-primary-red">
                {{ formErrors.currency }}
              </p>
            </div>

            <!-- Sort Order -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Sort Order
                </label>
                <input
                  v-model.number="formData.sort_order"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  class="input-field px-3 py-2 text-xs font-mono"
                />
              </div>

              <!-- Active Status Toggle -->
              <div class="space-y-1.5 flex flex-col justify-end">
                <label
                  class="block text-xs font-semibold text-primary-text mb-2"
                >
                  Status
                </label>
                <label
                  class="inline-flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    v-model="formData.is_active"
                    type="checkbox"
                    class="custom-checkbox h-4 w-4 rounded text-primary focus:ring-0"
                  />
                  <span class="text-xs font-medium text-primary-text">
                    {{ formData.is_active ? "Active" : "Inactive" }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="pt-4 flex items-center justify-end gap-2.5 border-t border-primary-border"
            >
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="store.actionLoading"
                class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="Tick02Icon" :size="14" />
                <span>{{ isEdit ? "Update Group" : "Create Group" }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
