<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" />

      <!-- Panel -->
      <div
        class="w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              Send Email Manually
            </h2>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Send emails to clients using templates or custom content
            </p>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="space-y-5">
            <!-- toggle to shoot email to every one  -->

            <!-- Subject -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Subject</p>
              <input
                v-model="store.customEmail.subject"
                type="text"
                placeholder="Email subject line"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>

            <div>
              <p class="text-xs text-secondary-text mb-1.5">Tag</p>
              <input
                v-model="store.customEmail.tag"
                type="text"
                placeholder="Email tag line"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>

            <div>
              <p class="text-xs text-secondary-text mb-1.5">Target</p>
              <BaseSelect
                v-model="store.customEmail.type"
                :options="targetOptions"
                class="bg-background"
                placeholder="Select a group..."
              />
            </div>

            <!-- Body HTML -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Body HTML</p>
              <textarea
                v-model="store.customEmail.body"
                rows="10"
                placeholder="<h1>Hello {{name}}</h1><p>Your email is {{email}}</p>"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm font-mono outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-y"
              />
              <div v-if="customVariables.length" class="mt-2">
                <p class="text-[11px] text-secondary-text mb-1.5">
                  Detected Variables
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="v in customVariables"
                    :key="v"
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                    >{{ "\u007B\u007B" + v + "\u007D\u007D" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                v-if="store.customEmail.body"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
                @click="
                  previewOpen = true;
                  previewData = {
                    subject: store.customEmail.subject,
                    bodyHtml: store.customEmail.body,
                  };
                "
              >
                <Eye class="w-3.5 h-3.5" /> Preview
              </button>
              <button
                :disabled="
                  store.isSending ||
                  !store.customEmail.subject ||
                  !store.customEmail.body ||
                  !store.customEmail.tag ||
                  !store.customEmail.type
                "
                @click="store.sendMailAgain(props.campegin_id)"
                class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Loader2
                  v-if="store.isSending"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <Send v-else class="w-3.5 h-3.5" />
                {{ store.isSending ? "Sending..." : "Send Email" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Preview Dialog -->
  <ResendEmailPreview
    :open="previewOpen"
    :template="
      previewData
        ? { subject: previewData.subject, body: previewData.bodyHtml }
        : null
    "
    @close="previewOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Search, Eye, Send, Loader2 } from "lucide-vue-next";
import EmailTemplatePreviewDialog from "./EmailTemplatePreviewDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useEmailLogsStore } from "@/stores/emails/emailLogs.js";
import ResendEmailPreview from "@/components/emails/ResendEmailPreview.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  campegin_id: { type: Number, default: null },
});
const emit = defineEmits(["close"]);

const store = useEmailLogsStore();

const tabs = [
  { label: "Use Existing Template", value: "template" },
  { label: "Custom Email", value: "custom" },
];

const previewOpen = ref(false);
const previewData = ref(null);

const targetOptions = [
  { label: "Send To All", value: "all" },
  { label: "Send To Seen", value: "seen" },
  { label: "Send To Unseen", value: "unseen" },
];

const customVariables = computed(() =>
  store.parseVariables(store.customEmail?.body ?? ""),
);

const handleSendSuccess = () => {
  store.reset();
  emit("close");
  store.fetchLogsDetails(props.campegin_id);
};
store.setOnSuccessCallback(handleSendSuccess);
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
