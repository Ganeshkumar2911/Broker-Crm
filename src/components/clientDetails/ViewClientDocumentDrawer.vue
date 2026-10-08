<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
        @click="closeDrawer"
      >
        <div
          class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
          @click.stop
        >
          <!-- Drawer Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 bg-blue-500/10 border-blue-500/20 text-blue-500"
              >
                <component
                  :is="isImage ? ImageIcon : FileText"
                  class="w-4 h-4"
                />
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-primary-text text-sm sm:text-base truncate">
                  {{ docTitle }}
                </h3>
                <p class="text-[11px] text-secondary-text">
                  Uploaded on {{ formattedCreatedAt }}
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

          <!-- Drawer Body (Scrollable) -->
          <div
            class="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-card-background no-scrollbar"
          >
            <!-- Author / Uploader Banner -->
            <div
              class="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary-border"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs shrink-0"
                >
                  {{ (docAuthor || "A").charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] text-secondary-text uppercase font-semibold">
                    Uploader
                  </p>
                  <p class="font-bold text-primary-text text-xs truncate">
                    {{ docAuthor }}
                  </p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[10px] text-secondary-text uppercase font-semibold">
                  Type
                </p>
                <span
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                >
                  {{ isImage ? "Image" : "Document" }}
                </span>
              </div>
            </div>

            <!-- Document Name Box -->
            <div
              class="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1"
            >
              <p
                class="text-[10px] font-bold uppercase tracking-wider text-secondary-text"
              >
                Document Name / Identifier
              </p>
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-sm text-primary font-mono truncate">
                  {{ docFileName }}
                </p>
                <span
                  v-if="doc?.id"
                  class="text-[10px] px-2 py-0.5 rounded bg-background border border-primary-border font-semibold text-secondary-text uppercase shrink-0"
                >
                  ID #{{ doc.id }}
                </span>
              </div>
            </div>

            <!-- Attachment Preview Section -->
            <div v-if="fileUrl" class="space-y-2">
              <div class="flex items-center justify-between">
                <span
                  class="font-bold text-secondary-text text-[11px] uppercase tracking-wider"
                >
                  Document Attachment Preview
                </span>
                <a
                  :href="fileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink class="w-3 h-3" />
                  Open Original
                </a>
              </div>

              <div
                class="border border-primary-border rounded-xl p-3.5 bg-background space-y-3"
              >
                <!-- File Meta Header -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <component
                      :is="isImage ? ImageIcon : File"
                      class="w-4 h-4 text-primary shrink-0"
                    />
                    <span class="font-bold text-primary-text truncate text-xs">
                      {{ docFileName }}
                    </span>
                  </div>
                  <span
                    v-if="doc?.path"
                    class="text-[10px] text-secondary-text font-mono truncate max-w-[160px]"
                  >
                    {{ doc.path }}
                  </span>
                </div>

                <!-- Image Preview -->
                <div
                  v-if="isImage"
                  class="relative rounded-xl overflow-hidden border border-primary-border bg-black/30 flex items-center justify-center p-2 group/preview"
                >
                  <img
                    :src="fileUrl"
                    :alt="docFileName"
                    class="object-contain max-h-80 w-full rounded-lg transition-transform group-hover/preview:scale-[1.01]"
                  />
                </div>

                <!-- PDF / Document Preview Card -->
                <div
                  v-else
                  class="p-6 rounded-xl border border-dashed border-primary-border flex flex-col items-center justify-center text-center gap-2 bg-card-background"
                >
                  <div
                    class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center"
                  >
                    <FileText class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="font-bold text-primary-text text-xs">
                      {{ docFileName }}
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      Click below to view or download document
                    </p>
                  </div>
                  <a
                    :href="fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1 px-4 py-1.5 rounded-lg bg-primary text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-primary-hover transition"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                    View Document
                  </a>
                </div>
              </div>
            </div>

            <!-- Description / Remarks Section -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span
                  class="font-bold text-secondary-text text-[11px] uppercase tracking-wider"
                >
                  Description / Remarks
                </span>
                <button
                  v-if="docRemarks"
                  type="button"
                  @click="copyRemarks"
                  class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Copy class="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div
                class="p-3.5 rounded-xl bg-background border border-primary-border text-primary-text font-medium leading-relaxed whitespace-pre-wrap"
              >
                {{ docRemarks || "No description provided for this document." }}
              </div>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div>
              <button
                v-if="canDelete"
                type="button"
                @click="onDeleteClick"
                class="px-3.5 py-2 text-xs font-semibold text-primary-red hover:bg-primary-red/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </button>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                v-if="canEdit"
                type="button"
                @click="onEditClick"
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
import {
  X,
  FileText,
  File,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Trash2,
  Pencil,
} from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  doc: { type: Object, default: null },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "edit", "delete"]);

const snackbar = useSnackbarStore();

const isImageFile = (input) => {
  if (!input) return false;

  if (typeof input === "object") {
    const mime =
      input.mime_type ||
      input.mime ||
      input.raw?.mime_type ||
      input.raw?.type ||
      input.raw?.mime;
    if (typeof mime === "string" && mime.startsWith("image/")) return true;

    const candidates = [
      input.file_url,
      input.path,
      input.formatted_path,
      input.url,
      input.file_name,
      input.name,
      input.title,
      input.raw?.path,
      input.raw?.formatted_path,
      input.raw?.file_name,
      input.raw?.file_url,
      input.raw?.name,
    ].filter(Boolean);

    for (const c of candidates) {
      if (typeof c === "string" && isImageFile(c)) return true;
    }
    return false;
  }

  const str = String(input).split("?")[0].split("#")[0].toLowerCase();
  if (str.startsWith("data:image/") || str.startsWith("blob:")) return true;
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/i.test(str);
};

const isImage = computed(() => {
  return isImageFile(props.doc);
});

const fileUrl = computed(() => {
  return props.doc?.file_url || props.doc?.path || props.doc?.formatted_path || null;
});

const docTitle = computed(() => {
  return props.doc?.title || props.doc?.file_name || "KYC Reference Document";
});

const docFileName = computed(() => {
  return props.doc?.file_name || props.doc?.title || "Document File";
});

const docAuthor = computed(() => {
  return props.doc?.author || props.doc?.uploaded_by_name || "Admin User";
});

const docRemarks = computed(() => {
  return props.doc?.remarks || props.doc?.description || "";
});

const formattedCreatedAt = computed(() => {
  const dateStr = props.doc?.created_at;
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

const copyRemarks = () => {
  if (!docRemarks.value) return;
  navigator.clipboard.writeText(docRemarks.value);
  snackbar.show("Copied description to clipboard!", "success");
};

const closeDrawer = () => {
  emit("close");
};

const onEditClick = () => {
  emit("edit", props.doc);
};

const onDeleteClick = () => {
  emit("delete", props.doc);
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
