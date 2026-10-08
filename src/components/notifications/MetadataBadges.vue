<script setup>
import { ref, computed } from "vue";
import { getMetadataEntries } from "@/utils/notificationHelpers";
import { X, Copy, Check, FileJson, Tag } from "lucide-vue-next";

const props = defineProps({
  metadata: {
    type: [Object, String, Array],
    default: null,
  },
  limit: {
    type: Number,
    default: 2,
  },
  align: {
    type: String,
    default: "left", // 'left' | 'right'
  },
  badgeClass: {
    type: String,
    default: "",
  },
  maxValueWidth: {
    type: String,
    default: "max-w-[100px]",
  },
  title: {
    type: String,
    default: "Metadata Payload",
  },
});

const isModalOpen = ref(false);
const copiedIndex = ref(null);

const entries = computed(() => getMetadataEntries(props.metadata));
const visibleEntries = computed(() => entries.value.slice(0, props.limit));

const hasMore = computed(() => entries.value.length > props.limit);
const hiddenCount = computed(() => entries.value.length - props.limit);

const rawJsonString = computed(() => {
  if (!props.metadata) return "";
  if (typeof props.metadata === "string") {
    try {
      return JSON.stringify(JSON.parse(props.metadata), null, 2);
    } catch {
      return props.metadata;
    }
  }
  return JSON.stringify(props.metadata, null, 2);
});

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function copyValue(text, idx) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  copiedIndex.value = idx;
  setTimeout(() => {
    if (copiedIndex.value === idx) copiedIndex.value = null;
  }, 1800);
}
</script>

<template>
  <div v-if="entries.length > 0" class="inline-block">
    <div
      :class="[
        'flex flex-wrap items-center gap-1',
        align === 'right' ? 'justify-end' : 'justify-start',
      ]"
    >
      <!-- First 2 (limit) metadata badges -->
      <span
        v-for="(meta, metaIdx) in visibleEntries"
        :key="metaIdx"
        :class="[
          'inline-flex items-center gap-1 rounded border border-primary-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium transition-colors',
          badgeClass,
        ]"
        :title="`${meta.key}: ${meta.value}`"
      >
        <span class="font-medium text-secondary-text/80">{{ meta.key }}:</span>
        <span :class="['font-semibold text-primary-text truncate', maxValueWidth]">
          {{ meta.value }}
        </span>
      </span>

      <!-- View More Modal Trigger Button -->
      <button
        v-if="hasMore"
        type="button"
        @click.stop="openModal"
        class="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 cursor-pointer shadow-xs active:scale-95"
        title="Click to view all metadata in detail"
      >
        <span>+{{ hiddenCount }} more</span>
      </button>
    </div>

    <!-- Teleported Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          @click="closeModal"
        >
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isModalOpen"
              class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary-border bg-card-background shadow-2xl transition-all"
              @click.stop
            >
              <!-- Modal Header -->
              <div
                class="flex items-center justify-between border-b border-primary-border bg-gradient-to-r from-primary/10 via-background/50 to-transparent px-5 py-4"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary shadow-xs"
                  >
                    <FileJson class="h-4 w-4" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-primary-text">
                        {{ props.title }}
                      </h3>
                      <span
                        class="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                      >
                        {{ entries.length }} {{ entries.length === 1 ? 'Field' : 'Fields' }}
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text">
                      Complete metadata JSON attributes for this notification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="closeModal"
                  class="flex h-7 w-7 items-center justify-center rounded-lg border border-primary-border bg-background text-secondary-text transition-colors hover:bg-card-background hover:text-primary-text"
                  title="Close modal"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              <!-- Modal Body -->
              <div class="max-h-[60vh] overflow-y-auto p-5 space-y-3 no-scrollbar">
                <div
                  v-for="(item, idx) in entries"
                  :key="idx"
                  class="group relative flex flex-col gap-1 rounded-xl border border-primary-border/70 bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-background"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span
                      class="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-primary"
                    >
                      <Tag class="h-3 w-3 opacity-70" />
                      {{ item.key }}
                    </span>

                    <button
                      type="button"
                      @click="copyValue(item.value, idx)"
                      class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-secondary-text transition-colors hover:bg-card-background hover:text-primary-text cursor-pointer"
                      title="Copy value"
                    >
                      <component
                        :is="copiedIndex === idx ? Check : Copy"
                        class="h-3 w-3"
                        :class="copiedIndex === idx ? 'text-emerald-400' : ''"
                      />
                      <span>{{ copiedIndex === idx ? 'Copied' : 'Copy' }}</span>
                    </button>
                  </div>

                  <div
                    class="mt-0.5 rounded-lg border border-primary-border/40 bg-card-background/70 px-3 py-2 font-mono text-[11.5px] text-primary-text break-all whitespace-pre-wrap leading-relaxed select-all"
                  >
                    {{ item.value }}
                  </div>
                </div>

                <!-- Raw JSON Accordion / View -->
                <details class="group mt-4 rounded-xl border border-primary-border/50 bg-background/30 p-3">
                  <summary class="cursor-pointer font-mono text-[11px] font-semibold text-secondary-text hover:text-primary-text">
                    View Raw JSON Payload
                  </summary>
                  <pre class="mt-2.5 overflow-x-auto rounded-lg border border-primary-border/60 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-emerald-400/90">{{ rawJsonString }}</pre>
                </details>
              </div>

              <!-- Modal Footer -->
              <div
                class="flex items-center justify-end border-t border-primary-border bg-background/50 px-5 py-3"
              >
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-xl border border-primary-border bg-card-background px-4 py-2 text-xs font-semibold text-primary-text transition-colors hover:bg-background cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
