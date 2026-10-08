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
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0"
              >
                <FileText class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-primary-text text-sm sm:text-base truncate">
                  KYC Internal Note
                </h3>
                <p class="text-[11px] text-secondary-text">
                  Logged on {{ formattedCreatedAt }}
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

          <!-- Drawer Body -->
          <div
            class="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-card-background no-scrollbar"
          >
            <!-- Author Banner -->
            <div
              class="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary-border"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shrink-0"
                >
                  {{ (noteAuthor || 'A').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">
                    Author
                  </p>
                  <p class="font-bold text-primary-text text-xs truncate">
                    {{ noteAuthor || 'Admin User' }}
                  </p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[10px] text-secondary-text uppercase font-semibold">
                  Type
                </p>
                <span
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  Internal Note
                </span>
              </div>
            </div>

            <!-- Note Remarks Content Card -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span
                  class="font-bold text-secondary-text text-[11px] uppercase tracking-wider"
                >
                  Note / Remarks Content
                </span>
                <button
                  v-if="note?.remarks"
                  type="button"
                  @click="copyToClipboard(note.remarks)"
                  class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Copy class="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div
                class="p-4 rounded-xl bg-background border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap min-h-[140px]"
              >
                {{ note?.remarks || 'No remarks provided.' }}
              </div>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <button
              type="button"
              @click="handleDelete"
              class="px-3.5 py-2 text-xs font-semibold text-primary-red hover:bg-primary-red/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Delete
            </button>
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                @click="handleEdit"
                class="px-4 py-2 text-xs font-semibold text-primary hover:bg-background rounded-xl border border-primary-border transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil class="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                @click="closeDrawer"
                class="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { FileText, X, Copy, Pencil, Trash2 } from "lucide-vue-next";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  note: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["close", "edit", "delete"]);
const snackbar = useSnackbarStore();

const noteAuthor = computed(() => {
  return (
    props.note?.author ||
    props.note?.creator_name ||
    props.note?.uploaded_by_name ||
    "Admin User"
  );
});

const formattedCreatedAt = computed(() => {
  const dateStr = props.note?.created_at;
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
});

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Note copied to clipboard!", "success");
};

const closeDrawer = () => {
  emit("close");
};

const handleEdit = () => {
  emit("edit", props.note);
};

const handleDelete = () => {
  emit("delete", props.note);
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
