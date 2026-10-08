<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    @click="handleClose"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <HugeIcon :icon="FileAttachmentIcon" :size="20" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-primary-text">
              Bank Document Proof
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              {{ account?.account_name || 'Bank Account' }} • {{ account?.bank }} ({{ account?.account_number }})
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a
            v-if="documentUrl"
            :href="documentUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary px-3 py-1.5"
            title="Open in new tab"
          >
            <HugeIcon :icon="LinkSquare01Icon" :size="14" />
            <span class="hidden sm:inline">Open in New Tab</span>
          </a>

          <a
            v-if="documentUrl"
            :href="documentUrl"
            download
            class="btn-primary py-1.5"
            title="Download file"
          >
            <HugeIcon :icon="Download01Icon" :size="14" />
            <span class="hidden sm:inline">Download</span>
          </a>

          <button
            type="button"
            @click="handleClose"
            class="btn-icon p-1.5"
          >
            <HugeIcon :icon="Cancel01Icon" :size="18" />
          </button>
        </div>
      </div>

      <!-- Document Content Body -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-background/50 min-h-[350px]">
        <!-- 1. If Image File -->
        <div v-if="isImage" class="max-w-full max-h-[60vh] flex items-center justify-center">
          <img
            :src="documentUrl"
            :alt="account?.account_name || 'Document Proof'"
            class="max-w-full max-h-[60vh] object-contain rounded-xl border border-primary-border shadow-md"
            @error="imageError = true"
          />
        </div>

        <!-- 2. If PDF File -->
        <div v-else-if="isPdf" class="w-full h-[60vh] rounded-xl overflow-hidden border border-primary-border bg-card-background">
          <iframe
            :src="documentUrl"
            class="w-full h-full"
            title="Document Proof PDF"
          />
        </div>

        <!-- 3. If Other Document / Fallback -->
        <div v-else class="text-center p-8 space-y-4 max-w-md bg-card-background border border-primary-border rounded-2xl shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <HugeIcon :icon="FileAttachmentIcon" :size="28" />
          </div>
          <div>
            <h4 class="font-bold text-primary-text text-sm sm:text-base">Document Proof Attached</h4>
            <p class="text-xs text-secondary-text mt-1">
              {{ fileName || 'Bank document proof file' }}
            </p>
          </div>
          <div class="pt-2 flex justify-center gap-3">
            <a
              :href="documentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary inline-flex"
            >
              <HugeIcon :icon="Download01Icon" :size="15" />
              <span>Download & View Document</span>
            </a>
          </div>
        </div>

        <!-- Image Load Error Fallback -->
        <div v-if="imageError" class="text-center p-6 text-xs text-primary-red bg-primary-red/10 border border-primary-red/20 rounded-xl mt-4">
          Failed to load image preview. Please use the "Open in New Tab" or "Download" button.
        </div>
      </div>

      <!-- Account Metadata Footer -->
      <div v-if="account" class="px-6 py-3 border-t border-primary-border bg-card-background flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <span class="text-secondary-text">User ID:</span>
            <span class="font-semibold text-primary-text ml-1">#{{ account.user_id }}</span>
          </div>
          <div>
            <span class="text-secondary-text">IFSC:</span>
            <span class="font-semibold text-primary-text ml-1">{{ account.bank_branch_code }}</span>
          </div>
          <div>
            <span class="text-secondary-text">Type:</span>
            <span class="font-semibold text-primary-text ml-1 uppercase">{{ account.account_type || 'Savings' }}</span>
          </div>
          <div v-if="account.bank_branch">
            <span class="text-secondary-text">Branch:</span>
            <span class="font-semibold text-primary-text ml-1">{{ account.bank_branch }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="btn-secondary"
        >
          Close Preview
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  FileAttachmentIcon,
  Cancel01Icon,
  Download01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  account: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);
const imageError = ref(false);

const documentUrl = computed(() => {
  if (!props.account) return "";
  if (props.account.document_proof_url) return props.account.document_proof_url;
  if (props.account.document_proof) {
    if (props.account.document_proof.startsWith("http")) {
      return props.account.document_proof;
    }
    let baseUrl = localStorage.getItem("custom_base_url") || "https://admin.panthercapitals.com";
    baseUrl = baseUrl.trim().replace(/\/admin\/?$/, "").replace(/\/+$/, "");
    const cleanPath = props.account.document_proof.startsWith("/")
      ? props.account.document_proof
      : `/${props.account.document_proof}`;
    return `${baseUrl}${cleanPath}`;
  }
  return "";
});

const fileName = computed(() => {
  const url = documentUrl.value;
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1] || "document_proof";
});

const isImage = computed(() => {
  const url = documentUrl.value.toLowerCase();
  return (
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp") ||
    url.endsWith(".gif") ||
    url.endsWith(".svg")
  );
});

const isPdf = computed(() => {
  const url = documentUrl.value.toLowerCase();
  return url.endsWith(".pdf");
});

const handleClose = () => {
  emit("close");
};
</script>
