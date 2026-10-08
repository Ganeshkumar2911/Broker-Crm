<script setup>
import { ref, computed, watch } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  Folder01Icon,
  Tick02Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  symbols: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "assigned"]);

const store = useCommissionEngineStore();

const selectedGroupId = ref(null);
const replaceExisting = ref(false);

const groupOptions = computed(() => {
  return (store.symbolGroups || []).map((g) => ({
    label: `${g.name}${g.code ? ` (${g.code})` : ""}`,
    value: g.id,
  }));
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (!store.isFetched.symbolGroups) {
        store.fetchSymbolGroups({ active_only: false });
      }
      if (store.symbolGroups?.length && !selectedGroupId.value) {
        selectedGroupId.value = store.symbolGroups[0].id;
      }
      replaceExisting.value = false;
    }
  },
  { immediate: true }
);

const closeModal = () => {
  emit("update:modelValue", false);
};

const handleAssign = async () => {
  if (!selectedGroupId.value || props.symbols.length === 0) return;

  try {
    await store.assignSymbolsToGroup(selectedGroupId.value, {
      symbols: props.symbols,
      replace: replaceExisting.value,
    });
    closeModal();
    emit("assigned");
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
                <HugeIcon :icon="Tag01Icon" :size="18" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  Assign Symbols to Group
                </h3>
                <p class="text-xs text-secondary-text">
                  Map {{ symbols.length }} selected symbol{{ symbols.length === 1 ? "" : "s" }} into a group
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

          <!-- Body -->
          <form @submit.prevent="handleAssign" class="p-5 space-y-4 overflow-y-auto">
            <!-- Selected Symbols Preview -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Selected Symbols ({{ symbols.length }})
              </label>
              <div
                class="p-2.5 rounded-xl bg-background border border-primary-border max-h-24 overflow-y-auto flex flex-wrap gap-1.5 no-scrollbar"
              >
                <span
                  v-for="sym in symbols"
                  :key="sym"
                  class="px-2 py-0.5 rounded-md bg-card-background border border-primary-border text-[11px] font-mono font-medium text-primary-text"
                >
                  {{ sym }}
                </span>
              </div>
            </div>

            <!-- Target Symbol Group Select -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Target Symbol Group <span class="text-primary-red">*</span>
              </label>
              <BaseSelect
                v-model="selectedGroupId"
                :options="groupOptions"
                placeholder="Select a symbol group..."
                variant="surface"
                :searchable="true"
                :local-search="true"
              />
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-primary-border">
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="store.actionLoading || !selectedGroupId || symbols.length === 0"
                class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="Tick02Icon" :size="14" />
                <span>Confirm Assignment</span>
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
