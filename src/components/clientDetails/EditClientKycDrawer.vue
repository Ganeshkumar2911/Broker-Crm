<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
        @click="closeDrawer"
      >
        <!-- Side Drawer Panel -->
        <div
          class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-lg h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              >
                <ShieldCheck class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">
                  Manage KYC Verification
                </h2>
                <p class="text-[11px] text-secondary-text">
                  Update verification status and document review details
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer text-secondary-text hover:text-primary-text"
              @click="closeDrawer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-card-background">
            <!-- Client Reference Info Box -->
            <div
              class="bg-background border border-primary-border rounded-xl px-4 py-3 shrink-0 flex items-center justify-between"
            >
              <div>
                <p
                  class="text-[10px] uppercase tracking-wide text-secondary-text mb-0.5 font-medium"
                >
                  Client Reference
                </p>
                <p class="text-xs font-bold text-primary-text">
                  {{ client?.name || "—" }}
                  <span class="text-primary font-mono ml-1 font-semibold"
                    >#{{ client?.id }}</span
                  >
                </p>
                <p class="text-[11px] text-secondary-text mt-0.5 font-mono">
                  {{ client?.email || "—" }}
                </p>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                :class="getKycBadgeClass(form.kyc_status)"
              >
                {{ form.kyc_status || "Pending" }}
              </span>
            </div>

            <!-- KYC Form Fields -->
            <div class="space-y-4 text-xs">
              <!-- KYC Status -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  KYC Status <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.kyc_status"
                  :options="kycStatusOptions"
                  placeholder="Select KYC status"
                  variant="surface"
                  @update:modelValue="form.kyc_status = $event"
                />
              </div>

              <!-- Rejection Reason (Conditional when rejected) -->
              <div
                v-if="form.kyc_status === 'rejected'"
                class="flex flex-col gap-1 p-3 bg-primary-red/5 border border-primary-red/20 rounded-xl"
              >
                <label class="text-primary-red text-[11px] font-semibold flex items-center gap-1">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  Rejection Reason <span class="text-primary-red">*</span>
                </label>
                <textarea
                  v-model="form.kyc_reject_reason"
                  rows="3"
                  class="w-full bg-background border border-primary-red/40 rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary-red transition-colors resize-none"
                  placeholder="Explain why the KYC was rejected so client can re-upload..."
                ></textarea>
              </div>

              <!-- Verification Channel -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Verification Channel
                </label>
                <BaseSelect
                  :modelValue="form.verification_channel"
                  :options="channelOptions"
                  placeholder="Select channel"
                  variant="surface"
                  @update:modelValue="form.verification_channel = $event"
                />
              </div>

              <!-- Docs Uploaded & Doc Approved in 2 Cols -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Docs Uploaded
                  </label>
                  <BaseSelect
                    :modelValue="form.docs_uploaded"
                    :options="yesNoOptions"
                    placeholder="Select..."
                    variant="surface"
                    @update:modelValue="form.docs_uploaded = $event"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Doc Approved
                  </label>
                  <BaseSelect
                    :modelValue="form.doc_approved"
                    :options="yesNoOptions"
                    placeholder="Select..."
                    variant="surface"
                    @update:modelValue="form.doc_approved = $event"
                  />
                </div>
              </div>

              <!-- Internal KYC Notes -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Internal Verification Notes
                </label>
                <textarea
                  v-model="form.notes"
                  rows="4"
                  class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Add internal notes about document verification, checks done, etc."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer (Sticky Actions) -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0"
          >
            <button
              type="button"
              :disabled="clientDepthStore.isSubmittingKyc"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-all disabled:opacity-50 cursor-pointer"
              @click="closeDrawer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!isValid || clientDepthStore.isSubmittingKyc"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              @click="handleSubmit"
            >
              <Loader2
                v-if="clientDepthStore.isSubmittingKyc"
                class="w-4 h-4 animate-spin"
              />
              <span v-else>Update KYC Status</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { X, Loader2, ShieldCheck, AlertTriangle } from "lucide-vue-next";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
  kycData: { type: Object, default: () => null },
});

const emit = defineEmits(["close", "success"]);

const clientDepthStore = useClientDepthStore();

const kycStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const channelOptions = [
  { label: "Manual", value: "Manual" },
  { label: "Sumsub", value: "Sumsub" },
  { label: "ShuftiPro", value: "ShuftiPro" },
  { label: "Other", value: "Other" },
];

const form = ref({
  kyc_status: "pending",
  kyc_reject_reason: "",
  verification_channel: "Manual",
  docs_uploaded: "Yes",
  doc_approved: "No",
  notes: "",
});

const getKycBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "verified")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (s === "pending" || s === "in_progress")
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (s === "rejected")
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  return "bg-background text-secondary-text border border-primary-border";
};

const populateForm = () => {
  const c = props.client || {};
  const k = props.kycData || {};
  form.value = {
    kyc_status: (k.status || k.kyc_status || c.kyc_status || "pending").toLowerCase(),
    kyc_reject_reason: k.reject_reason || c.kyc_reject_reason || "",
    verification_channel: c.verification_channel || "Manual",
    docs_uploaded: c.docs_uploaded || "Yes",
    doc_approved: c.doc_approved || (c.kyc_status === "approved" ? "Yes" : "No"),
    notes: "",
  };
};

watch(
  () => [props.open, props.client, props.kycData],
  ([isOpen]) => {
    if (isOpen) {
      populateForm();
    }
  },
  { immediate: true, deep: true },
);

const isValid = computed(() => {
  if (form.value.kyc_status === "rejected") {
    return !!form.value.kyc_reject_reason?.trim();
  }
  return !!form.value.kyc_status;
});

const handleSubmit = () => {
  if (!isValid.value) return;
  const clientId = props.client?.id;
  if (!clientId) return;

  const payload = {
    kyc_status: form.value.kyc_status,
    kyc_reject_reason:
      form.value.kyc_status === "rejected"
        ? form.value.kyc_reject_reason?.trim()
        : null,
    verification_channel: form.value.verification_channel || "Manual",
    docs_uploaded: form.value.docs_uploaded || "Yes",
    doc_approved: form.value.doc_approved || "No",
  };

  if (form.value.notes?.trim()) {
    payload.notes = form.value.notes.trim();
  }

  clientDepthStore.updateClientKyc(clientId, payload, (err, res) => {
    if (!err) {
      const updatedClient = {
        ...props.client,
        kyc_status: payload.kyc_status,
        kyc_reject_reason: payload.kyc_reject_reason,
        ...(res?.data || {}),
      };
      clientDepthStore.setActiveClient(updatedClient);
      try {
        localStorage.setItem("active_client", JSON.stringify(updatedClient));
      } catch {}
      window.dispatchEvent(
        new CustomEvent("client-profile-updated", { detail: updatedClient })
      );
      emit("success", updatedClient);
      closeDrawer();
    }
  });
};

const closeDrawer = () => {
  emit("close");
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
</style>
