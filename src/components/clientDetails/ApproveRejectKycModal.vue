<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
        @click="closeModal"
      >
        <!-- Modal Dialog Box -->
        <div
          class="bg-card-background border border-primary-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden my-6 cursor-default transition-all duration-300"
          @click.stop
        >
          <!-- ─── HEADER ──────────────────────────────────────────────── -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="
                  selectedAction === 'approve'
                    ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                "
              >
                <ShieldCheck v-if="selectedAction === 'approve'" class="w-5 h-5" />
                <ShieldAlert v-else class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-base">
                  {{ selectedAction === 'approve' ? 'Approve KYC Documents' : 'Reject KYC Documents' }}
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Document Verification Review
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeModal"
              :disabled="clientDepthStore.isApprovingDoc"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- ─── BODY CONTENT ────────────────────────────────────────── -->
          <div class="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
            <!-- Client Reference Info Card -->
            <div
              class="bg-background border border-primary-border rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
            >
              <div class="min-w-0">
                <p class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider">
                  Client Details
                </p>
                <p class="font-bold text-primary-text text-sm mt-0.5 truncate">
                  {{ client?.name || 'Client' }}
                  <span class="text-primary font-mono ml-1 font-semibold">#{{ clientUserId }}</span>
                </p>
                <p class="text-xs text-secondary-text font-mono truncate mt-0.5">
                  {{ client?.email || '—' }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider">
                  Current Status
                </p>
                <span
                  class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="getStatusBadgeClass(currentKycStatus)"
                >
                  {{ currentKycStatus || 'Pending' }}
                </span>
              </div>
            </div>

            <!-- Action Switcher Buttons (Approve vs Reject) -->
            <div v-if="canApprove && canReject" class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Decision Action <span class="text-primary-red">*</span>
              </label>
              <div class="grid grid-cols-2 gap-2.5">
                <!-- Approve Button Option -->
                <button
                  type="button"
                  @click="selectedAction = 'approve'"
                  class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  :class="
                    selectedAction === 'approve'
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/40 shadow-xs'
                      : 'bg-card-background border-primary-border text-secondary-text hover:text-primary-text hover:bg-background'
                  "
                >
                  <CheckCircle2 class="w-4 h-4" />
                  Approve Documents
                </button>

                <!-- Reject Button Option -->
                <button
                  type="button"
                  @click="selectedAction = 'reject'"
                  class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  :class="
                    selectedAction === 'reject'
                      ? 'bg-primary-red/10 text-primary-red border-primary-red/40 shadow-xs'
                      : 'bg-card-background border-primary-border text-secondary-text hover:text-primary-text hover:bg-background'
                  "
                >
                  <XCircle class="w-4 h-4" />
                  Reject Documents
                </button>
              </div>
            </div>

            <!-- IF APPROVE: Summary Details -->
            <div
              v-if="selectedAction === 'approve'"
              class="p-4 bg-primary-green/5 border border-primary-green/20 rounded-xl space-y-2 text-xs"
            >
              <div class="flex items-start gap-2.5 text-primary-green">
                <CheckCircle2 class="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <p class="font-bold text-primary-text text-xs">
                    Confirmation of KYC Approval
                  </p>
                  <p class="text-[11px] text-secondary-text mt-0.5 leading-relaxed">
                    By approving, the client's KYC status will be set to <strong class="text-primary-green">Approved</strong> and document approval flag will be marked as <strong class="text-primary-green">Yes</strong>.
                  </p>
                </div>
              </div>
            </div>

            <!-- IF REJECT: Rejection Reason Required -->
            <div
              v-else
              class="space-y-3 p-4 bg-primary-red/5 border border-primary-red/20 rounded-xl"
            >
              <div class="flex items-start gap-2 text-primary-red">
                <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p class="font-bold text-primary-text text-xs">
                    Provide Rejection Reason
                  </p>
                  <p class="text-[11px] text-secondary-text mt-0.5">
                    This reason will be visible to the client and staff so they can re-upload proper documents.
                  </p>
                </div>
              </div>


              <!-- Custom Reason Textarea -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-primary-text flex items-center justify-between">
                  <span>Rejection Note <span class="text-primary-red">*</span></span>
                  <span class="text-[10px] text-secondary-text">{{ rejectReason.length }}/255</span>
                </label>
                <textarea
                  v-model="rejectReason"
                  rows="3"
                  maxlength="255"
                  placeholder="Explain why the document was rejected (e.g., Document photo is blurry and text is not legible)..."
                  class="w-full bg-background border border-primary-border rounded-xl p-2.5 text-xs text-primary-text placeholder:text-secondary-text/60 focus:outline-none focus:border-primary-red transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <!-- ─── FOOTER ──────────────────────────────────────────────── -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 bg-card-background shrink-0"
          >
            <button
              type="button"
              @click="closeModal"
              :disabled="clientDepthStore.isApprovingDoc"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <!-- Submit Button (Approve vs Reject) -->
            <button
              type="button"
              @click="handleSubmit"
              :disabled="clientDepthStore.isApprovingDoc || (selectedAction === 'reject' && !rejectReason.trim())"
              class="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                selectedAction === 'approve'
                  ? 'bg-primary-green hover:bg-primary-green/90 shadow-primary-green/20'
                  : 'bg-primary-red hover:bg-primary-red/90 shadow-primary-red/20'
              "
            >
              <Loader2 v-if="clientDepthStore.isApprovingDoc" class="w-3.5 h-3.5 animate-spin" />
              <component
                :is="selectedAction === 'approve' ? CheckCircle2 : XCircle"
                v-else
                class="w-3.5 h-3.5"
              />
              <span>
                {{
                  clientDepthStore.isApprovingDoc
                    ? 'Processing...'
                    : selectedAction === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'
                }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useClientDepthStore } from '@/stores/clientDepth/clientDepth';
import { usePermissionCheck } from '@/composables/usePermissionCheck';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next';

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => null },
  kycData: { type: Object, default: () => null },
  initialAction: { type: String, default: 'approve' },
});

const emit = defineEmits(['close', 'success']);

const clientDepthStore = useClientDepthStore();
const { hasPermission } = usePermissionCheck();

const canApprove = computed(() => hasPermission(["client.document_approve", "kyc.approve"]));
const canReject = computed(() => hasPermission(["client.document_reject", "kyc.reject"]));

const selectedAction = ref(props.initialAction || 'approve');
const rejectReason = ref('');

const clientUserId = computed(() => {
  return (
    props.client?.id ||
    props.client?.user_id ||
    props.kycData?.user_id ||
    props.kycData?.id ||
    null
  );
});

const currentKycStatus = computed(() => {
  return (
    props.kycData?.kyc_status ||
    props.client?.kyc_status ||
    'pending'
  );
});

watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      if (props.initialAction === 'reject' && canReject.value) {
        selectedAction.value = 'reject';
      } else if (canApprove.value) {
        selectedAction.value = 'approve';
      } else {
        selectedAction.value = 'reject';
      }
      rejectReason.value =
        props.kycData?.kyc_reject_reason ||
        props.client?.kyc_reject_reason ||
        '';
    }
  }
);

watch(
  () => props.initialAction,
  (newAct) => {
    if (newAct) selectedAction.value = newAct;
  }
);

const getStatusBadgeClass = (s) => {
  const status = String(s || '').toLowerCase();
  if (status === 'approved' || status === 'verified')
    return 'bg-primary-green/10 text-primary-green border-primary-green/30';
  if (status === 'pending' || status === 'in_progress' || status === 'unverified')
    return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/30';
  if (status === 'rejected')
    return 'bg-primary-red/10 text-primary-red border-primary-red/30';
  return 'bg-secondary-text/10 text-secondary-text border-primary-border';
};

const closeModal = () => {
  if (clientDepthStore.isApprovingDoc) return;
  emit('close');
};

const handleSubmit = () => {
  const userId = clientUserId.value;
  if (!userId) return;

  let payload = {};

  if (selectedAction.value === 'approve') {
    payload = {
      user_id: Number(userId),
      kyc_status: 'approved',
      doc_approved: 'Yes',
    };
  } else {
    payload = {
      user_id: Number(userId),
      kyc_status: 'rejected',
      doc_approved: 'No',
      kyc_reject_reason:
        rejectReason.value.trim() ||
        'Document photo is blurry and text is not legible.',
    };
  }

  clientDepthStore.approveOrRejectClientDoc(payload, (err, res) => {
    if (!err) {
      emit('success', res);
      closeModal();
    }
  });
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
