<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
        @click="closeModal"
      >
        <!-- Modal Card (Center Popup) -->
        <div
          class="bg-card-background border border-primary-border w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden my-6 cursor-default transform transition-all duration-300"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
              >
                <component :is="isEditing ? Pencil : ShieldCheck" class="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm sm:text-base">
                  {{ isEditing ? "Edit / Replace KYC Document" : "Upload KYC Verification Document" }}
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{
                    isEditing
                      ? "Update client identity proof or upload new replacement document."
                      : "Upload client proof of identity for KYC verification & compliance."
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="flex flex-col flex-1 min-h-0">
            <!-- Scrollable Body -->
            <div class="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)] text-xs no-scrollbar">
              <!-- Client Banner -->
              <div
                class="flex items-center justify-between p-3 rounded-xl bg-background border border-primary-border"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-[11px] font-medium text-secondary-text">Client:</span>
                  <span class="font-bold text-primary-text text-xs truncate">
                    {{ clientDisplayName }}
                  </span>
                  <span
                    v-if="resolvedClientId && !clientDisplayName.includes(`#${resolvedClientId}`)"
                    class="text-primary font-mono font-semibold"
                  >
                    #{{ resolvedClientId }}
                  </span>
                </div>
                <div v-if="existingStatus" class="shrink-0">
                  <span
                    class="text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                    :class="getStatusBadgeClass(existingStatus)"
                  >
                    {{ existingStatus }}
                  </span>
                </div>
              </div>

              <!-- 1. Document Type Selection (Using BaseSelect) -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block text-xs">
                    Document Type <span class="text-primary-red">*</span>
                  </label>
                  <span class="text-[10px] text-secondary-text">Select official government ID</span>
                </div>

                <BaseSelect
                  v-model="selectedDocType"
                  :options="docTypeOptions"
                  placeholder="Select Document Type"
                  class="w-full"
                />
              </div>

              <!-- 2. Front & Back Document Upload Area (Stacked Vertically) -->
              <div class="space-y-4">
                <label class="font-bold text-primary-text block text-xs">
                  Document Images / Scans <span class="text-primary-red">*</span>
                </label>

                <!-- ── 1. FRONT SIDE (Required) ── -->
                <div class="space-y-1.5 p-3.5 rounded-xl bg-background border border-primary-border">
                  <div class="flex items-center justify-between pb-1">
                    <span class="text-[11px] font-bold text-primary-text flex items-center gap-1.5">
                      <span
                        class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold"
                      >
                        1
                      </span>
                      Front Side Image <span class="text-primary-red">*</span>
                    </span>
                    <span
                      v-if="frontFile"
                      class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5"
                    >
                      <CheckCircle2 class="w-3 h-3" /> Ready to upload
                    </span>
                    <span v-else class="text-[10px] text-secondary-text">
                      Required
                    </span>
                  </div>

                  <!-- Newly selected front file preview -->
                  <div
                    v-if="frontFile"
                    class="border border-primary/40 rounded-xl p-3 bg-primary/5 space-y-2.5"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Upload class="w-3.5 h-3.5" />
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">
                            {{ frontFile.name }}
                          </p>
                          <p class="text-[10px] text-secondary-text font-mono">
                            {{ (frontFile.size / 1024).toFixed(1) }} KB
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="triggerFrontFileInput"
                          class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          @click="removeFrontFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove front"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      v-if="frontPreviewUrl"
                      class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-40 flex items-center justify-center p-1"
                    >
                      <img
                        :src="frontPreviewUrl"
                        alt="Front preview"
                        class="object-contain max-h-36 w-full rounded"
                      />
                    </div>
                  </div>

                  <!-- Existing front preview (in Edit mode) -->
                  <div
                    v-else-if="isEditing && existingFrontUrl"
                    class="border border-primary-border rounded-xl p-3 bg-card-background/60 space-y-2.5"
                  >
                    <!-- <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-secondary-text uppercase">
                        Current Front Side
                      </span>
                      <a
                        :href="existingFrontUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink class="w-3 h-3" />
                        View Full Size
                      </a>
                    </div> -->
                    <div
                      class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-36 flex items-center justify-center p-1"
                    >
                      <img
                        :src="existingFrontUrl"
                        alt="Current Front"
                        class="object-contain max-h-32 w-full rounded"
                      />
                    </div>
                    <button
                      type="button"
                      @click="triggerFrontFileInput"
                      class="w-full py-2 px-3 rounded-lg border border-dashed border-primary-border hover:border-primary text-secondary-text hover:text-primary text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      Replace Front Side Image
                    </button>
                  </div>

                  <!-- Empty front dropzone -->
                  <div
                    v-else
                    @click="triggerFrontFileInput"
                    @dragover.prevent
                    @drop.prevent="handleDropFrontFile"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-card-background/40 hover:bg-card-background transition-all group min-h-[120px]"
                  >
                    <div
                      class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform"
                    >
                      <Upload class="w-4 h-4" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop front side image
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      JPG, PNG, WebP or PDF (Max 10MB)
                    </p>
                  </div>

                  <input
                    ref="frontFileInputRef"
                    type="file"
                    accept="image/*,application/pdf"
                    class="hidden"
                    @change="handleFrontFileSelected"
                  />
                </div>

                <!-- ── 2. BACK SIDE (Optional) ── -->
                <div class="space-y-1.5 p-3.5 rounded-xl bg-background border border-primary-border">
                  <div class="flex items-center justify-between pb-1">
                    <span class="text-[11px] font-bold text-primary-text flex items-center gap-1.5">
                      <span
                        class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold"
                      >
                        2
                      </span>
                      Back Side Image
                    </span>
                    <span
                      v-if="backFile"
                      class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5"
                    >
                      <CheckCircle2 class="w-3 h-3" /> Ready to upload
                    </span>
                    <span
                      v-else
                      class="text-[9px] px-2 py-0.5 rounded-full bg-primary-border/60 text-secondary-text font-semibold uppercase tracking-wider"
                    >
                      Optional
                    </span>
                  </div>

                  <!-- Newly selected back file preview -->
                  <div
                    v-if="backFile"
                    class="border border-primary/40 rounded-xl p-3 bg-primary/5 space-y-2.5"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Upload class="w-3.5 h-3.5" />
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">
                            {{ backFile.name }}
                          </p>
                          <p class="text-[10px] text-secondary-text font-mono">
                            {{ (backFile.size / 1024).toFixed(1) }} KB
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="triggerBackFileInput"
                          class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          @click="removeBackFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove back"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      v-if="backPreviewUrl"
                      class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-40 flex items-center justify-center p-1"
                    >
                      <img
                        :src="backPreviewUrl"
                        alt="Back preview"
                        class="object-contain max-h-36 w-full rounded"
                      />
                    </div>
                  </div>

                  <!-- Existing back preview (in Edit mode) -->
                  <div
                    v-else-if="isEditing && existingBackUrl"
                    class="border border-primary-border rounded-xl p-3 bg-card-background/60 space-y-2.5"
                  >
                    <!-- <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-secondary-text uppercase">
                        Current Back Side
                      </span>
                      <a
                        :href="existingBackUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink class="w-3 h-3" />
                        View Full Size
                      </a>
                    </div> -->
                    <div
                      class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-36 flex items-center justify-center p-1"
                    >
                      <img
                        :src="existingBackUrl"
                        alt="Current Back"
                        class="object-contain max-h-32 w-full rounded"
                      />
                    </div>
                    <button
                      type="button"
                      @click="triggerBackFileInput"
                      class="w-full py-2 px-3 rounded-lg border border-dashed border-primary-border hover:border-primary text-secondary-text hover:text-primary text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      Replace Back Side Image
                    </button>
                  </div>

                  <!-- Empty back dropzone -->
                  <div
                    v-else
                    @click="triggerBackFileInput"
                    @dragover.prevent
                    @drop.prevent="handleDropBackFile"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-card-background/40 hover:bg-card-background transition-all group min-h-[120px]"
                  >
                    <div
                      class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform"
                    >
                      <Upload class="w-4 h-4" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop back side image
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      JPG, PNG, WebP or PDF (Optional)
                    </p>
                  </div>

                  <input
                    ref="backFileInputRef"
                    type="file"
                    accept="image/*,application/pdf"
                    class="hidden"
                    @change="handleBackFileSelected"
                  />
                </div>
              </div>

              <!-- 3. Prominent Compliance Guidelines Box -->
              <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div class="flex items-center gap-2 text-primary font-bold text-xs">
                  <ShieldCheck class="w-4 h-4" />
                  <span>KYC Verification Guidelines:</span>
                </div>
                <ul class="text-[11px] text-secondary-text space-y-1.5 pl-5 list-disc leading-relaxed">
                  <li>
                    <strong class="text-primary-text">Clear Framing:</strong> Ensure all 4 corners of the document are fully visible and not cropped.
                  </li>
                  <li>
                    <strong class="text-primary-text">High Legibility:</strong> Full name, date of birth, document ID number, and photo must be clear &amp; readable without glare.
                  </li>
                  <li>
                    <strong class="text-primary-text">Validity:</strong> Government issued document must be currently valid and not expired or physically damaged.
                  </li>
                </ul>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 bg-card-background shrink-0"
            >
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2.5 text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background rounded-xl border border-primary-border transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitDisabled"
                class="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2
                  v-if="clientDepthStore.isUploadingDoc"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>{{ submitButtonLabel }}</span>
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
import {
  X,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Pencil,
} from "lucide-vue-next";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
  userId: { type: [String, Number], default: null },
  existingDoc: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);

const clientDepthStore = useClientDepthStore();

const isEditing = computed(() => {
  return !!(
    props.existingDoc?.uploaded ||
    props.existingDoc?.front ||
    props.existingDoc?.doc_path?.front ||
    clientDepthStore.kycData?.docs_uploaded
  );
});

const resolvedClientId = computed(() => {
  return props.client?.id || props.userId || clientDepthStore.activeClient?.id || null;
});

const clientDisplayName = computed(() => {
  return (
    props.client?.name ||
    clientDepthStore.activeClient?.name ||
    (resolvedClientId.value ? `Client #${resolvedClientId.value}` : "Client")
  );
});

const existingStatus = computed(() => {
  return (
    props.existingDoc?.verification_status ||
    clientDepthStore.kycData?.kyc_status ||
    clientDepthStore.kycData?.status ||
    null
  );
});

const getStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "verified")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (s === "pending" || s === "unverified" || s === "waiting for verification")
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (s === "rejected")
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  return "bg-secondary-text/10 text-secondary-text";
};

const docTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID Card" },
  { value: "national_id", label: "National Identity Card" },
  { value: "address_proof", label: "Address Proof / Utility Bill" },
  { value: "other", label: "Other Official Identity Document" },
];

const selectedDocType = ref("passport");

// Front & Back Selected Files
const frontFile = ref(null);
const frontPreviewUrl = ref(null);
const frontFileInputRef = ref(null);

const backFile = ref(null);
const backPreviewUrl = ref(null);
const backFileInputRef = ref(null);

// Existing URLs
const existingFrontUrl = ref(null);
const existingBackUrl = ref(null);

const cleanupBlobUrls = () => {
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
};

const resetFormState = () => {
  cleanupBlobUrls();

  frontFile.value = null;
  backFile.value = null;

  const kyc = clientDepthStore.kycData || {};
  const doc = props.existingDoc || {};

  const currentType = doc.doc_type || kyc.doc_type || "passport";
  selectedDocType.value = currentType;

  existingFrontUrl.value =
    doc.front || doc.doc_path?.front || kyc.front || kyc.front_url || kyc.doc_path?.front || null;
  existingBackUrl.value =
    doc.back || doc.doc_path?.back || kyc.back || kyc.back_url || kyc.doc_path?.back || null;
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetFormState();
    } else {
      cleanupBlobUrls();
    }
  },
  { immediate: true },
);

const triggerFrontFileInput = () => {
  frontFileInputRef.value?.click();
};

const triggerBackFileInput = () => {
  backFileInputRef.value?.click();
};

const handleFrontFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) applyFrontFile(file);
};

const handleDropFrontFile = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) applyFrontFile(file);
};

const applyFrontFile = (file) => {
  frontFile.value = file;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
  }
  if (file.type.startsWith("image/")) {
    frontPreviewUrl.value = URL.createObjectURL(file);
  } else {
    frontPreviewUrl.value = null;
  }
};

const removeFrontFile = () => {
  frontFile.value = null;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (frontFileInputRef.value) frontFileInputRef.value.value = "";
};

const handleBackFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) applyBackFile(file);
};

const handleDropBackFile = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) applyBackFile(file);
};

const applyBackFile = (file) => {
  backFile.value = file;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
  }
  if (file.type.startsWith("image/")) {
    backPreviewUrl.value = URL.createObjectURL(file);
  } else {
    backPreviewUrl.value = null;
  }
};

const removeBackFile = () => {
  backFile.value = null;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
  if (backFileInputRef.value) backFileInputRef.value.value = "";
};

const isSubmitDisabled = computed(() => {
  if (clientDepthStore.isUploadingDoc) return true;
  if (!selectedDocType.value) return true;

  if (isEditing.value) {
    // In edit mode, user can submit if they have chosen a new front/back file OR if existing front exists
    return !frontFile.value && !backFile.value && selectedDocType.value === (props.existingDoc?.doc_type || clientDepthStore.kycData?.doc_type);
  }

  // In new add mode, front is required
  return !frontFile.value;
});

const submitButtonLabel = computed(() => {
  if (clientDepthStore.isUploadingDoc) return "Uploading...";
  return isEditing.value ? "Save & Replace Document" : "Upload KYC Document";
});

const submitForm = () => {
  const clientId = resolvedClientId.value;
  if (!clientId) return;

  const payload = {
    doc_type: selectedDocType.value,
  };

  if (frontFile.value) {
    payload.front = frontFile.value;
  }
  if (backFile.value) {
    payload.back = backFile.value;
  }

  clientDepthStore.uploadClientDocument(clientId, payload, (err, res) => {
    if (!err) {
      emit("success", res);
      closeModal();
    }
  });
};

const closeModal = () => {
  resetFormState();
  emit("close");
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
