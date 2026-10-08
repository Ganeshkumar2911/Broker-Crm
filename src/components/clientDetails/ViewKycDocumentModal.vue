<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
        @click="closeModal"
      >
        <!-- Modal Card -->
        <div
          class="bg-card-background border border-primary-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden my-6 cursor-default"
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
                <FileCheck2 class="w-4.5 h-4.5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-primary-text text-sm sm:text-base">
                    {{ formatDocType(doc?.doc_type || doc?.title) }}
                  </h3>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    :class="getStatusBadgeClass(doc?.verification_status || status)"
                  >
                    {{ doc?.verification_status || status || "Pending" }}
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5">
                  Client KYC Identity Verification Document
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="effectiveCanEdit"
                type="button"
                @click="onEditClick"
                class="border border-primary-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pencil class="w-3.5 h-3.5" />
                Edit / Replace
              </button>
              <button
                type="button"
                @click="closeModal"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              >
                <X class="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
            <!-- Tabs for Front / Back -->
            <div class="flex items-center justify-between gap-4 border-b border-primary-border/60 pb-3">
              <div class="flex items-center gap-1 bg-background p-1 rounded-xl border border-primary-border">
                <button
                  type="button"
                  @click="activeSide = 'front'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="
                    activeSide === 'front'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                >
                  Front Side
                </button>
                <button
                  type="button"
                  @click="activeSide = 'back'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  :class="
                    activeSide === 'back'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                >
                  Back Side
                  <span
                    v-if="!doc?.back"
                    class="text-[9px] px-1 py-0.2 rounded bg-primary-border/60 font-normal"
                    >Optional</span
                  >
                </button>
              </div>

              <!-- Open Full Image link -->
              <a
                v-if="currentImageSrc"
                :href="currentImageSrc"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                Open Full View
              </a>
            </div>

            <!-- Image Display Area -->
            <div class="bg-black/30 border border-primary-border rounded-2xl p-4 flex items-center justify-center min-h-[260px] max-h-[460px] overflow-hidden">
              <img
                v-if="currentImageSrc"
                :src="currentImageSrc"
                :alt="`${activeSide} side`"
                class="max-w-full max-h-[420px] object-contain rounded-xl shadow-lg transition-transform duration-300"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center text-center text-secondary-text p-8"
              >
                <FileImage class="w-12 h-12 stroke-[1.5] mb-2 opacity-60" />
                <p class="text-xs font-semibold text-primary-text">
                  No {{ activeSide }} image uploaded
                </p>
                <p class="text-[11px] text-secondary-text mt-0.5">
                  This document side is optional or has not been uploaded yet.
                </p>
              </div>
            </div>

            <!-- Document Meta Details -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-background/60 border border-primary-border rounded-xl p-3.5">
              <div>
                <p class="text-[10px] uppercase font-semibold text-secondary-text">Document Type</p>
                <p class="font-bold text-primary-text mt-0.5 capitalize">
                  {{ formatDocType(doc?.doc_type || doc?.title) }}
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-semibold text-secondary-text">Uploaded Date</p>
                <p class="font-semibold text-primary-text mt-0.5">
                  {{ doc?.created_at ? formatDate(doc.created_at) : "Recently Uploaded" }}
                </p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-semibold text-secondary-text">Verification Status</p>
                <p class="font-bold mt-0.5 capitalize" :class="getStatusTextColor(doc?.verification_status || status)">
                  {{ doc?.verification_status || status || "Pending" }}
                </p>
              </div>
            </div>

            <!-- Remarks / Verification Feedback Card -->
            <div
              class="p-4 rounded-xl border space-y-1.5 transition-colors"
              :class="remarksCardClasses.container"
            >
              <div class="flex items-center justify-between">
                <span
                  class="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  :class="remarksCardClasses.title"
                >
                  <component :is="remarksCardClasses.icon" class="w-3.5 h-3.5" />
                  {{ remarksCardClasses.label }}
                </span>
                <button
                  v-if="rawRemarksText"
                  type="button"
                  @click="copyRemarks"
                  class="text-[11px] hover:underline flex items-center gap-1 cursor-pointer font-medium opacity-80 hover:opacity-100"
                  :class="remarksCardClasses.title"
                >
                  <Copy class="w-3 h-3" />
                  Copy
                </button>
              </div>
              <p
                class="text-xs font-medium leading-relaxed whitespace-pre-wrap"
                :class="remarksCardClasses.text"
              >
                {{ displayRemarks }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-3.5 border-t border-primary-border flex items-center justify-between gap-2.5 bg-card-background shrink-0"
          >
            <!-- Left: Document Approve / Reject Action Buttons -->
            <div v-if="effectiveCanApprove || effectiveCanReject" class="flex items-center gap-2">
              <button
                v-if="effectiveCanReject"
                type="button"
                @click="onRejectClick"
                class="px-3.5 py-2 rounded-xl text-xs font-bold text-primary-red bg-primary-red/10 border border-primary-red/30 hover:bg-primary-red/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <XCircle class="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                v-if="effectiveCanApprove"
                type="button"
                @click="onApproveClick"
                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-green hover:bg-primary-green/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shadow-primary-green/20"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
            <div v-else></div>

            <!-- Right: Close Button -->
            <button
              type="button"
              class="px-5 py-2 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-all cursor-pointer"
              @click="closeModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  X,
  Pencil,
  ExternalLink,
  FileCheck2,
  FileImage,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Copy,
} from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  open: { type: Boolean, default: false },
  doc: { type: Object, default: () => null },
  status: { type: String, default: "Pending" },
  canApprove: { type: Boolean, default: null },
  canReject: { type: Boolean, default: null },
  canEdit: { type: Boolean, default: null },
});

const emit = defineEmits(["close", "edit", "approve", "reject"]);

const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();
const activeSide = ref("front");

const effectiveCanApprove = computed(() => {
  if (props.canApprove !== null && props.canApprove !== undefined) {
    return props.canApprove;
  }
  return hasPermission(["client.document_approve", "kyc.approve"]);
});

const effectiveCanReject = computed(() => {
  if (props.canReject !== null && props.canReject !== undefined) {
    return props.canReject;
  }
  return hasPermission(["client.document_reject", "kyc.reject"]);
});

const effectiveCanEdit = computed(() => {
  if (props.canEdit !== null && props.canEdit !== undefined) {
    return props.canEdit;
  }
  return hasPermission(["client.document_update", "client.document_add"]);
});

const currentImageSrc = computed(() => {
  if (activeSide.value === "front") {
    return (
      props.doc?.front ||
      props.doc?.doc_path?.front ||
      props.doc?.front_url ||
      props.doc?.front_image ||
      props.doc?.file_url ||
      ""
    );
  }
  return (
    props.doc?.back ||
    props.doc?.doc_path?.back ||
    props.doc?.back_url ||
    props.doc?.back_image ||
    ""
  );
});

const rawRemarksText = computed(() => {
  return (
    props.doc?.reject_reason ||
    props.doc?.kyc_reject_reason ||
    props.doc?.remarks ||
    props.doc?.description ||
    ""
  );
});

const isApproved = computed(() => {
  const s = String(props.doc?.verification_status || props.status || "").toLowerCase();
  return s === "approved" || s === "verified";
});

const isRejected = computed(() => {
  const s = String(props.doc?.verification_status || props.status || "").toLowerCase();
  return s === "rejected";
});

const displayRemarks = computed(() => {
  if (rawRemarksText.value) return rawRemarksText.value;
  if (isRejected.value)
    return "Document has been marked as rejected. Please re-upload a clear and valid document.";
  if (isApproved.value)
    return "Document identity verification has been completed and approved.";
  return "Document is currently under review or waiting for verification.";
});

const remarksCardClasses = computed(() => {
  if (isRejected.value) {
    return {
      container: "bg-primary-red/10 border-primary-red/25",
      title: "text-primary-red",
      text: "text-primary-red/90",
      icon: AlertCircle,
      label: "Rejection Remarks / Reason",
    };
  }
  if (isApproved.value) {
    return {
      container: "bg-primary-green/10 border-primary-green/25",
      title: "text-primary-green",
      text: "text-primary-green/90",
      icon: CheckCircle2,
      label: "Verification Status & Remarks",
    };
  }
  return {
    container: "bg-background/80 border-primary-border",
    title: "text-secondary-text",
    text: "text-primary-text",
    icon: Info,
    label: "Verification Notes",
  };
});

const copyRemarks = () => {
  if (!rawRemarksText.value) return;
  navigator.clipboard.writeText(rawRemarksText.value);
  snackbar.show("Copied remarks to clipboard!", "success");
};

const formatDocType = (type) => {
  if (!type) return "National ID Card";
  const key = String(type).toLowerCase();
  const map = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    passport: "Passport",
    driving_license: "Driver's License",
    drivers: "Driver's License",
    driver_license: "Driver's License",
    voter_id: "Voter ID Card",
    national_id: "National Identity Card",
    address_proof: "Address Proof",
    selfie: "Selfie Photo",
    direct_verification: "Direct Verification",
    other: "Official Identity Document",
  };
  return map[key] || String(type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
};

const getStatusBadgeClass = (s) => {
  const status = String(s || "").toLowerCase();
  if (status === "approved" || status === "verified")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (
    status === "pending" ||
    status === "in_progress" ||
    status === "under review" ||
    status === "waiting for verification"
  )
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (status === "rejected")
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  return "bg-secondary-text/10 text-secondary-text";
};

const getStatusTextColor = (s) => {
  const status = String(s || "").toLowerCase();
  if (status === "approved" || status === "verified") return "text-primary-green";
  if (status === "pending" || status === "in_progress" || status === "under review")
    return "text-primary-yellow";
  if (status === "rejected") return "text-primary-red";
  return "text-secondary-text";
};

const onEditClick = () => {
  emit("edit");
  closeModal();
};

const onApproveClick = () => {
  emit("approve");
  closeModal();
};

const onRejectClick = () => {
  emit("reject");
  closeModal();
};

const closeModal = () => {
  activeSide.value = "front";
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
</style>
