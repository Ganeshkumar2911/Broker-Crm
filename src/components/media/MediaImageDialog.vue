<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <div class="flex-1 bg-black/40" @click="emit('close')" />
      <div
        class="w-full max-w-md bg-card-background border-l border-primary-border flex flex-col h-full"
      >
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{ isEdit ? "Edit Media" : "Upload Media" }}
            </h2>
            <p class="text-[11px] text-secondary-text mt-0.5">
              {{
                isEdit
                  ? "Update media details"
                  : "Add a new media file to this group"
              }}
            </p>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <!-- Media Upload -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">
              Media File{{ !isEdit ? " *" : "" }}
            </p>
            <label class="block cursor-pointer">
              <div
                class="border-2 border-dashed rounded-xl overflow-hidden transition-colors hover:border-primary/50"
                :class="[
                  previewUrl ? 'p-0' : 'p-6',
                  fileSizeError ? 'border-primary-red/80' : 'border-primary-border'
                ]"
              >
                <!-- Image Preview -->
                <img
                  v-if="previewUrl && selectedFileType === 'image'"
                  :src="previewUrl"
                  class="w-full h-48 object-cover"
                />
                <!-- Video Preview -->
                <video
                  v-else-if="previewUrl && selectedFileType === 'video'"
                  :src="previewUrl"
                  controls
                  class="w-full h-48 object-cover bg-black"
                />
                <!-- PDF Preview -->
                <div
                  v-else-if="previewUrl && selectedFileType === 'pdf'"
                  class="w-full h-48 flex flex-col items-center justify-center bg-background p-4 gap-2 text-center"
                >
                  <FileText class="w-12 h-12 text-primary" />
                  <p class="text-xs font-semibold text-primary-text truncate max-w-full px-2">
                    {{ selectedFileName || 'PDF Document' }}
                  </p>
                  <span class="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
                    PDF File
                  </span>
                </div>
                <!-- Default Upload Placeholder -->
                <div
                  v-else
                  class="flex flex-col items-center gap-2 text-center"
                >
                  <UploadCloud class="w-8 h-8 text-secondary-text opacity-50" />
                  <p class="text-xs text-secondary-text">
                    Click to select image, video, or PDF
                  </p>
                  <p class="text-[10px] text-secondary-text opacity-60">
                    PNG, JPG, WEBP, MP4, WEBM, PDF (Max 10MB)
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                class="hidden"
                @change="onFileChange"
              />
            </label>
            <p v-if="fileSizeError" class="mt-1.5 text-xs text-primary-red">
              {{ fileSizeError }}
            </p>
            <button
              v-if="previewUrl"
              class="mt-2 text-[11px] text-secondary-text hover:text-primary-red transition-colors"
              @click="clearMedia"
            >
              Remove media
            </button>
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">
              Title <span class="text-primary-red">*</span>
            </p>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. Summer Promo Banner"
              :disabled="store.actionLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">Description</p>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Optional description..."
              :disabled="store.actionLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
            />
          </div>

          <div
            v-if="isEdit"
            class="flex items-center justify-between px-3 py-2.5 bg-background border border-primary-border rounded-lg"
          >
            <div>
              <p class="text-xs font-medium text-primary-text">Active</p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="
                form.is_active
                  ? 'bg-primary'
                  : 'border border-primary-border bg-background'
              "
              @click="form.is_active = !form.is_active"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background"
        >
          <button
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="store.actionLoading || !isValid"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            @click="submit"
          >
            <Loader2
              v-if="store.actionLoading"
              class="w-3.5 h-3.5 animate-spin"
            />
            <span>{{
              store.actionLoading ? "Saving..." : isEdit ? "Update" : "Upload"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Loader2, Image as ImageIcon, FileText, UploadCloud } from "lucide-vue-next";
import { useMediaImagesStore } from "@/stores/media/mediaImages";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  groupId: { type: [String, Number], required: true },
});
const emit = defineEmits(["close"]);
const store = useMediaImagesStore();
const snackbar = useSnackbarStore();

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const isEdit = computed(() => !!props.editData);
const form = ref({ title: "", description: "", is_active: true, image: null });
const previewUrl = ref(null);
const selectedFileType = ref("image");
const selectedFileName = ref("");
const fileSizeError = ref("");

const isValid = computed(
  () => form.value.title.trim() && (isEdit.value || form.value.image),
);

const detectFileTypeFromFile = (file) => {
  if (!file) return "image";
  const type = file.type || "";
  const name = file.name || "";
  if (type.startsWith("video/") || /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(name)) {
    return "video";
  }
  if (type === "application/pdf" || /\.pdf$/i.test(name)) {
    return "pdf";
  }
  return "image";
};

const detectFileTypeFromUrl = (url) => {
  if (!url) return "image";
  if (/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(url)) {
    return "video";
  }
  if (/\.pdf(\?.*)?$/i.test(url)) {
    return "pdf";
  }
  return "image";
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        title: props.editData?.title ?? "",
        description: props.editData?.description ?? "",
        is_active: props.editData?.is_active ?? true,
        image: null,
      };
      previewUrl.value = props.editData?.image_url ?? null;
      selectedFileName.value = "";
      selectedFileType.value = detectFileTypeFromUrl(props.editData?.image_url);
      fileSizeError.value = "";
    }
  },
);

const onFileChange = (e) => {
  fileSizeError.value = "";
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const errorMsg = "File size exceeds the 10MB limit. Please choose a smaller file.";
    fileSizeError.value = errorMsg;
    snackbar.show(errorMsg, "error");
    e.target.value = "";
    return;
  }

  form.value.image = file;
  selectedFileName.value = file.name;
  selectedFileType.value = detectFileTypeFromFile(file);
  previewUrl.value = URL.createObjectURL(file);
};

const clearMedia = () => {
  form.value.image = null;
  selectedFileName.value = "";
  fileSizeError.value = "";
  previewUrl.value = props.editData?.image_url ?? null;
  selectedFileType.value = detectFileTypeFromUrl(props.editData?.image_url);
};
const clearImage = clearMedia;

const submit = () => {
  if (isEdit.value)
    store.updateImage(props.groupId, props.editData.id, form.value, () =>
      emit("close"),
    );
  else store.uploadImage(props.groupId, form.value, () => emit("close"));
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
