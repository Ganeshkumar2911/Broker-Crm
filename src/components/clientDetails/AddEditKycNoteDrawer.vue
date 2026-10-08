<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
        @click="closeDrawer"
      >
        <div
          class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-lg h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
          @click.stop
        >
          <!-- Drawer Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
              >
                <component :is="isEditing ? Pencil : Plus" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm sm:text-base">
                  {{ isEditing ? 'Edit KYC Note' : 'Add KYC Internal Note' }}
                </h3>
                <p class="text-[11px] text-secondary-text">
                  Log verification remarks, client conversation summary or audit observations.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeDrawer"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Drawer Form Body -->
          <form
            @submit.prevent="submitForm"
            class="flex-1 flex flex-col min-h-0 overflow-hidden bg-card-background"
          >
            <div
              class="flex-1 overflow-y-auto p-6 space-y-4.5 text-xs bg-card-background no-scrollbar"
            >
              <!-- Note / Remarks Textarea -->
              <div class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Remarks / Internal Notes <span class="text-primary-red">*</span>
                </label>
                <textarea
                  v-model="formRemarks"
                  rows="6"
                  placeholder="e.g. Identity verified via telephonic consultation, government registry match confirmed..."
                  class="w-full p-3.5 resize-none border border-primary-border rounded-xl bg-background text-primary-text placeholder:text-secondary-text/60 focus:outline-hidden focus:border-primary text-xs leading-relaxed font-medium"
                  required
                ></textarea>
                <p class="text-[10px] text-secondary-text">
                  This note will be saved in the client audit history with your account as author.
                </p>
              </div>
            </div>

            <!-- Sticky Footer Buttons -->
            <div
              class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-2.5 bg-card-background shrink-0"
            >
              <button
                type="button"
                @click="closeDrawer"
                class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-xl border border-primary-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="clientDepthStore.isSubmittingReference || !formRemarks.trim()"
                class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Loader2
                  v-if="clientDepthStore.isSubmittingReference"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>{{ isEditing ? 'Save Changes' : 'Submit Note' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { Plus, Pencil, X, Loader2 } from "lucide-vue-next";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [String, Number],
    default: null,
  },
  existingNote: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["close", "success"]);
const clientDepthStore = useClientDepthStore();

const formRemarks = ref("");

const isEditing = computed(() => {
  return Boolean(props.existingNote?.id);
});

watch(
  () => [props.open, props.existingNote],
  ([isOpen, note]) => {
    if (isOpen) {
      formRemarks.value = note?.remarks || note?.note || note?.text || "";
    } else {
      formRemarks.value = "";
    }
  },
  { immediate: true }
);

const closeDrawer = () => {
  emit("close");
};

const submitForm = () => {
  if (!props.userId || !formRemarks.value.trim()) return;

  const payload = {
    user_id: props.userId,
    remarks: formRemarks.value.trim(),
    ...(isEditing.value && props.existingNote?.id
      ? { id: props.existingNote.id, note_id: props.existingNote.id }
      : {}),
  };

  if (isEditing.value) {
    clientDepthStore.updateUserReference(props.userId, payload, (err, res) => {
      if (!err) {
        emit("success", res);
        closeDrawer();
      }
    });
  } else {
    clientDepthStore.addUserReference(props.userId, payload, (err, res) => {
      if (!err) {
        emit("success", res);
        closeDrawer();
      }
    });
  }
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .transform,
.drawer-fade-leave-active .transform {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .transform,
.drawer-fade-leave-to .transform {
  transform: translateX(100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
