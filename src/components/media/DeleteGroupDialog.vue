<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="emit('close')"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6"
      @click.stop
    >
      <div
        class="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center mb-4"
      >
        <Trash2 class="w-4 h-4 text-primary-red" />
      </div>
      <p class="text-sm font-semibold text-primary-text mb-1">Delete Group</p>
      <p class="text-xs text-secondary-text mb-5">
        Are you sure you want to delete
        <strong class="text-primary-text">{{ group?.title }}</strong
        >? This will remove all associated images.
      </p>
      <div class="flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="store.actionLoading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          @click="confirm"
        >
          <Loader2
            v-if="store.actionLoading"
            class="w-3.5 h-3.5 animate-spin"
          />
          <span>{{ store.actionLoading ? "Deleting..." : "Delete" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2, Loader2 } from "lucide-vue-next";
import { useMediaGroupsStore } from "@/stores/media/mediaGroups";

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null },
});
const emit = defineEmits(["close"]);
const store = useMediaGroupsStore();

const confirm = () => store.deleteGroup(props.group.id, () => emit("close"));
</script>
