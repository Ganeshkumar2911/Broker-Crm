<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs"
      @click="emit('close')"
    >
      <div
        class="relative max-w-4xl w-full bg-card-background/95 border border-primary-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-xl animate-in zoom-in-95 duration-200"
        @click.stop
      >
        <!-- Modal Top Bar -->
        <div class="px-5 py-3.5 border-b border-primary-border/70 flex items-center justify-between bg-background/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Video v-if="mediaType === 'video'" class="w-4 h-4" />
              <FileText v-else-if="mediaType === 'pdf'" class="w-4 h-4" />
              <ImageIcon v-else class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-primary-text truncate">
                {{ image?.title || (mediaType === 'video' ? 'Video Preview' : mediaType === 'pdf' ? 'PDF Document' : 'Media Preview') }}
              </h3>
              <p v-if="image?.created_at" class="text-[10.5px] text-secondary-text">
                Uploaded {{ formatDate(image.created_at) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a
              v-if="image?.image_url"
              :href="image.image_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <span>{{ mediaType === 'pdf' ? 'Open PDF' : 'Full View' }}</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </a>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-xl bg-background border border-primary-border hover:bg-primary/10 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              @click="emit('close')"
              title="Close (Esc)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Media Container -->
        <div class="flex-1 overflow-auto bg-black/50 p-4 sm:p-6 flex items-center justify-center min-h-[300px]">
          <!-- Video Preview -->
          <video
            v-if="image?.image_url && mediaType === 'video'"
            :src="image.image_url"
            controls
            autoplay
            class="max-w-full max-h-[65vh] rounded-xl shadow-2xl bg-black"
          />

          <!-- PDF Preview -->
          <div
            v-else-if="image?.image_url && mediaType === 'pdf'"
            class="w-full h-[65vh] flex flex-col items-center justify-center"
          >
            <iframe
              :src="image.image_url"
              class="w-full h-full rounded-xl border border-primary-border bg-white"
              title="PDF Preview"
            />
          </div>

          <!-- Image Preview -->
          <img
            v-else-if="image?.image_url"
            :src="image.image_url"
            :alt="image?.title || 'Preview image'"
            class="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl transition-all hover:scale-[1.01]"
          />

          <div v-else class="flex flex-col items-center gap-2 py-12 text-secondary-text">
            <ImageIcon class="w-10 h-10 opacity-40" />
            <p class="text-xs">No media preview available</p>
          </div>
        </div>

        <!-- Image Metadata Footer -->
        <div class="px-5 py-3.5 border-t border-primary-border/70 bg-background/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div class="min-w-0 flex-1">
            <p v-if="image?.description" class="text-xs text-primary-text/90 leading-relaxed line-clamp-2">
              {{ image.description }}
            </p>
            <p v-else class="text-xs italic text-secondary-text/70">
              No description provided
            </p>
          </div>

          <div v-if="image?.image_url" class="shrink-0 w-full sm:w-auto">
            <URLCopyButton :url="image.image_url" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { X, ExternalLink, Image as ImageIcon, Video, FileText } from "lucide-vue-next";
import URLCopyButton from "@/components/media/URLCopyButton.vue";
import { formatDate } from "@/utils/timeFormatter";

const props = defineProps({
  open: { type: Boolean, default: false },
  image: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const mediaType = computed(() => {
  const url = props.image?.image_url;
  if (!url || typeof url !== "string") return "image";
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(cleanUrl)) {
    return "video";
  }
  if (/\.pdf$/i.test(cleanUrl)) {
    return "pdf";
  }
  return "image";
});

function handleKeydown(e) {
  if (e.key === "Escape" && props.open) {
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

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
