<template>
  <div
    class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-background/80 border border-primary-border/60 transition-all hover:border-primary/40 group/copy"
  >
    <span
      class="text-[11px] font-mono text-secondary-text truncate select-all max-w-[180px] sm:max-w-[220px]"
      :title="url"
    >
      {{ url }}
    </span>
    <button
      type="button"
      class="shrink-0 flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer"
      :class="
        copied
          ? 'bg-primary-green/20 text-primary-green border border-primary-green/30'
          : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
      "
      @click.stop="copy"
      :title="copied ? 'Copied to clipboard' : 'Copy direct URL'"
    >
      <Check v-if="copied" class="w-3 h-3" />
      <Copy v-else class="w-3 h-3 transition-transform group-hover/copy:scale-110" />
      <span>{{ copied ? "Copied" : "Copy" }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  url: { type: String, required: true },
});

const snackbar = useSnackbarStore();
const copied = ref(false);

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.url);
    snackbar.show("URL copied to clipboard", "success");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    snackbar.show("Failed to copy URL", "error");
  }
};
</script>
