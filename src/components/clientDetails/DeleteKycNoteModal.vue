<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
        @click="closeModal"
      >
        <div
          class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 cursor-default"
          @click.stop
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary-red/10 border border-primary-red/20 text-primary-red flex items-center justify-center shrink-0"
            >
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-primary-text text-base">
                Delete KYC Note?
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Are you sure you want to delete this internal note? This action cannot be undone.
              </p>
            </div>
          </div>

          <div
            class="p-3.5 rounded-xl bg-background border border-primary-border text-xs text-primary-text font-medium"
          >
            <p class="text-[11px] text-secondary-text line-clamp-3">
              {{ note?.remarks || '—' }}
            </p>
          </div>

          <div
            class="flex items-center justify-end gap-2 pt-2 border-t border-primary-border"
          >
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmDelete"
              :disabled="clientDepthStore.isDeletingReference"
              class="px-4 py-2 text-xs font-semibold text-white bg-primary-red hover:bg-primary-red/90 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Loader2
                v-if="clientDepthStore.isDeletingReference"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { AlertTriangle, Loader2 } from "lucide-vue-next";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [String, Number],
    default: null,
  },
  note: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["close", "success"]);
const clientDepthStore = useClientDepthStore();

const closeModal = () => {
  emit("close");
};

const confirmDelete = () => {
  if (!props.note?.id || !props.userId) return;

  const payload = {
    user_id: props.userId,
    id: props.note.id,
    note_id: props.note.id,
  };

  clientDepthStore.deleteUserReference(props.userId, payload, (err, res) => {
    if (!err) {
      emit("success", res);
      closeModal();
    }
  });
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
