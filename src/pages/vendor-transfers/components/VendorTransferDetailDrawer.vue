<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer transition-opacity"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/50">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Transfer #{{ transfer?.id }}
              </span>
              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1.5"
                :class="statusClass(transfer?.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                <span>{{ transfer?.status || 'Unknown' }}</span>
              </span>
            </div>
            <p class="text-[11px] text-secondary-text">
              Created on {{ formatDate(transfer?.created_at) }}
            </p>
          </div>

          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Card: Financials & Direction -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                Transfer Type & Financials
              </span>
              <span
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1"
                :class="
                  transfer?.payment_request?.type?.toLowerCase() === 'deposit'
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                "
              >
                <ArrowDownLeft v-if="transfer?.payment_request?.type?.toLowerCase() === 'deposit'" class="w-3 h-3" />
                <ArrowUpRight v-else class="w-3 h-3" />
                <span>{{ transfer?.payment_request?.type || 'Transfer' }}</span>
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="p-3 rounded-lg border border-primary-border/60 bg-card-background">
                <span class="text-[10px] text-secondary-text block mb-1 font-medium">Request Amount</span>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-base font-bold text-primary-text tabular-nums">
                    ${{ fmt(transfer?.payment_request?.amount) }}
                  </span>
                  <span class="text-[11px] text-secondary-text uppercase font-semibold">
                    {{ transfer?.payment_request?.currency || 'USD' }}
                  </span>
                </div>
              </div>

              <div class="p-3 rounded-lg border border-primary-border/60 bg-card-background">
                <span class="text-[10px] text-secondary-text block mb-1 font-medium">Paid / Settled Amount</span>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-base font-bold text-primary-green tabular-nums">
                    {{ fmt(transfer?.payment_request?.paid_amount) }}
                  </span>
                  <span class="text-[11px] text-secondary-text uppercase font-semibold">
                    {{ transfer?.payment_request?.paid_currency || 'INR' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="transfer?.payment_request?.vendor_amount_adjusted" class="text-[11px] text-primary-yellow flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>Vendor amount was adjusted during settlement</span>
            </div>
          </div>

          <!-- Card: Client / User Info -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-2.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Client Details
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">User Name</span>
                <span class="font-semibold text-primary-text">
                  {{ transfer?.payment_request?.user_name || '—' }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">User ID</span>
                <span class="font-mono font-medium text-primary-text">
                  #{{ transfer?.payment_request?.user_id || '—' }}
                </span>
              </div>

              <div class="sm:col-span-2">
                <span class="text-secondary-text block text-[11px] mb-0.5">Email Address</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-primary-text font-medium break-all">
                    {{ transfer?.payment_request?.user_email || '—' }}
                  </span>
                  <button
                    v-if="transfer?.payment_request?.user_email"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    title="Copy Email"
                    @click="copyText(transfer?.payment_request?.user_email, 'Email')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Account & Payment Request Reference -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-2.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Account & Payment Request
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Account / Wallet</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-semibold text-primary-text">
                    {{ getAccountDisplay(transfer?.payment_request) }}
                  </span>
                </div>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Payment Method / Gateway</span>
                <span class="font-medium text-primary-text capitalize">
                  {{ transfer?.payment_request?.method || transfer?.payment_request?.gateway || '—' }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Payment Request ID</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-primary-text">
                    #{{ transfer?.payment_request_id || transfer?.payment_request?.id || '—' }}
                  </span>
                  <button
                    v-if="transfer?.payment_request_id || transfer?.payment_request?.id"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    title="Copy PR ID"
                    @click="copyText(transfer?.payment_request_id || transfer?.payment_request?.id, 'Payment Request ID')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Approval / Payment Status</span>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded border capitalize" :class="approvalStatusClass(transfer?.payment_request?.approval_status)">
                    {{ transfer?.payment_request?.approval_status || '—' }}
                  </span>
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded border capitalize" :class="statusClass(transfer?.payment_request?.payment_status)">
                    {{ transfer?.payment_request?.payment_status || '—' }}
                  </span>
                </div>
              </div>

              <div class="sm:col-span-2">
                <span class="text-secondary-text block text-[11px] mb-0.5">Reference ID</span>
                <div class="flex items-center gap-1.5 font-mono text-[11px] bg-card-background border border-primary-border/60 rounded px-2.5 py-1.5">
                  <span class="text-primary-text break-all flex-1 select-all">
                    {{ transfer?.payment_request?.reference_id || '—' }}
                  </span>
                  <button
                    v-if="transfer?.payment_request?.reference_id"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition shrink-0 cursor-pointer"
                    title="Copy Reference ID"
                    @click="copyText(transfer?.payment_request?.reference_id, 'Reference ID')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Bank Details (User Bank or Company Bank) -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                {{ isDeposit ? 'Company Bank (Receiving)' : 'User Bank Account (Beneficiary)' }}
              </span>
              <Building2 class="w-3.5 h-3.5 text-secondary-text" />
            </div>

            <!-- Deposit: Company Bank -->
            <div v-if="isDeposit && transfer?.payment_request?.bank?.company_bank" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Bank Name</span>
                <span class="font-semibold text-primary-text">
                  {{ transfer.payment_request.bank.company_bank.bank_name || '—' }}
                </span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Account Name</span>
                <span class="font-medium text-primary-text">
                  {{ transfer.payment_request.bank.company_bank.account_name || '—' }}
                </span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Account Number</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-primary-text">
                    {{ transfer.payment_request.bank.company_bank.account_number || '—' }}
                  </span>
                  <button
                    v-if="transfer.payment_request.bank.company_bank.account_number"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer.payment_request.bank.company_bank.account_number, 'Account Number')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">IFSC / Branch</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-medium text-primary-text">
                    {{ transfer.payment_request.bank.company_bank.ifsc_code || transfer.payment_request.bank.company_bank.branch_name || '—' }}
                  </span>
                  <button
                    v-if="transfer.payment_request.bank.company_bank.ifsc_code"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer.payment_request.bank.company_bank.ifsc_code, 'IFSC Code')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div v-if="transfer.payment_request.bank.company_bank.swift_code">
                <span class="text-secondary-text block text-[11px] mb-0.5">SWIFT Code</span>
                <span class="font-mono text-primary-text">
                  {{ transfer.payment_request.bank.company_bank.swift_code }}
                </span>
              </div>
            </div>

            <!-- Withdrawal: User Bank Account -->
            <div v-else-if="transfer?.payment_request?.bank" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Bank Name</span>
                <span class="font-semibold text-primary-text">
                  {{ transfer.payment_request.bank.bank || '—' }}
                </span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Account Holder Name</span>
                <span class="font-medium text-primary-text">
                  {{ transfer.payment_request.bank.account_name || '—' }}
                </span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Account Number</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-primary-text">
                    {{ transfer.payment_request.bank.account_number || '—' }}
                  </span>
                  <button
                    v-if="transfer.payment_request.bank.account_number"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer.payment_request.bank.account_number, 'Account Number')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Branch / IFSC Code</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-medium text-primary-text">
                    {{ transfer.payment_request.bank.bank_branch_code || '—' }}
                  </span>
                  <button
                    v-if="transfer.payment_request.bank.bank_branch_code"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer.payment_request.bank.bank_branch_code, 'Branch / IFSC Code')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div v-if="transfer.payment_request.bank.account_type">
                <span class="text-secondary-text block text-[11px] mb-0.5">Account Type</span>
                <span class="font-medium text-primary-text uppercase">
                  {{ transfer.payment_request.bank.account_type }}
                </span>
              </div>
            </div>
            <div v-else class="text-xs text-secondary-text py-1">
              No bank account details attached.
            </div>
          </div>

          <!-- Card: Transaction Identifiers & References (UTR / TxID / Proof URL) -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-2.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Transaction Identifiers & UTR
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">UTR / Tx Ref</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-primary-text">
                    {{ transfer?.payment_request?.bank?.utr || transfer?.payment_request?.txid || '—' }}
                  </span>
                  <button
                    v-if="transfer?.payment_request?.bank?.utr || transfer?.payment_request?.txid"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer?.payment_request?.bank?.utr || transfer?.payment_request?.txid, 'UTR / TxID')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Proof URL / Ref Note</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-primary-text truncate max-w-[200px]" :title="transfer?.proof_url">
                    {{ transfer?.proof_url || '—' }}
                  </span>
                  <button
                    v-if="transfer?.proof_url"
                    type="button"
                    class="p-1 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                    @click="copyText(transfer?.proof_url, 'Proof URL')"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Vendor Note -->
          <div v-if="transfer?.vendor_note" class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Vendor Note
            </span>
            <p class="text-xs text-primary-text whitespace-pre-wrap bg-card-background border border-primary-border/60 rounded-lg p-3">
              {{ transfer.vendor_note }}
            </p>
          </div>

          <!-- Card: Proof Attachments (Images) -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Proof Attachments
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Vendor Transfer Proof -->
              <div class="border border-primary-border rounded-xl p-3 bg-card-background flex flex-col justify-between gap-2.5">
                <div>
                  <span class="text-[11px] font-semibold text-primary-text block">Vendor Transfer Proof</span>
                  <span class="text-[10px] text-secondary-text block">Proof submitted by vendor admin</span>
                </div>

                <div v-if="transfer?.proof_attachment_url" class="space-y-2">
                  <div
                    class="h-28 rounded-lg overflow-hidden border border-primary-border/60 bg-background/60 flex items-center justify-center cursor-pointer group relative"
                    @click="emit('preview', transfer.proof_attachment_url, 'Vendor Transfer Proof')"
                  >
                    <img
                      :src="transfer.proof_attachment_url"
                      alt="Vendor Proof"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <ExternalLink class="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      class="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      @click="emit('preview', transfer.proof_attachment_url, 'Vendor Transfer Proof')"
                    >
                      <ImageIcon class="w-3 h-3" />
                      <span>View Full Image</span>
                    </button>
                    <a
                      :href="transfer.proof_attachment_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-secondary-text hover:text-primary inline-flex items-center gap-1"
                    >
                      <span>New Tab</span>
                      <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div v-else class="text-xs text-secondary-text py-4 text-center border border-dashed border-primary-border rounded-lg">
                  No attachment uploaded
                </div>
              </div>

              <!-- User Deposit Proof -->
              <div class="border border-primary-border rounded-xl p-3 bg-card-background flex flex-col justify-between gap-2.5">
                <div>
                  <span class="text-[11px] font-semibold text-primary-text block">Deposit Proof Slip</span>
                  <span class="text-[10px] text-secondary-text block">Payment slip from user request</span>
                </div>

                <div v-if="transfer?.payment_request?.bank?.deposit_proof_url" class="space-y-2">
                  <div
                    class="h-28 rounded-lg overflow-hidden border border-primary-border/60 bg-background/60 flex items-center justify-center cursor-pointer group relative"
                    @click="emit('preview', transfer.payment_request.bank.deposit_proof_url, 'User Deposit Proof')"
                  >
                    <img
                      :src="transfer.payment_request.bank.deposit_proof_url"
                      alt="Deposit Proof"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <ExternalLink class="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      class="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      @click="emit('preview', transfer.payment_request.bank.deposit_proof_url, 'User Deposit Proof')"
                    >
                      <ImageIcon class="w-3 h-3" />
                      <span>View Full Image</span>
                    </button>
                    <a
                      :href="transfer.payment_request.bank.deposit_proof_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-secondary-text hover:text-primary inline-flex items-center gap-1"
                    >
                      <span>New Tab</span>
                      <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div v-else class="text-xs text-secondary-text py-4 text-center border border-dashed border-primary-border rounded-lg">
                  No deposit slip
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Audit & Admin Assignment -->
          <div class="rounded-xl border border-primary-border bg-background/30 p-4 space-y-2.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
              Assignment & Audit Info
            </span>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Assigned To Admin</span>
                <span class="font-medium text-primary-text block truncate" :title="transfer?.assigned_to_email">
                  {{ transfer?.assigned_to_name || (transfer?.assigned_to ? 'Admin' : 'Unassigned') }}
                  <span v-if="transfer?.assigned_to" class="font-mono text-primary-text/80 ml-1">#{{ transfer.assigned_to }}</span>
                </span>
                <span v-if="transfer?.assigned_to_email" class="text-[10px] text-secondary-text truncate block mt-0.5" :title="transfer.assigned_to_email">
                  {{ transfer.assigned_to_email }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Submitted By Admin</span>
                <span class="font-medium text-primary-text block truncate" :title="transfer?.submitted_by_email">
                  {{ transfer?.submitted_by_name || (transfer?.submitted_by ? 'Admin' : '—') }}
                  <span v-if="transfer?.submitted_by" class="font-mono text-primary-text/80 ml-1">#{{ transfer.submitted_by }}</span>
                </span>
                <span v-if="transfer?.submitted_by_email" class="text-[10px] text-secondary-text truncate block mt-0.5" :title="transfer.submitted_by_email">
                  {{ transfer.submitted_by_email }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Submitted At</span>
                <span class="text-primary-text">
                  {{ formatDate(transfer?.submitted_at) }}
                </span>
              </div>

              <div>
                <span class="text-secondary-text block text-[11px] mb-0.5">Last Updated</span>
                <span class="text-primary-text">
                  {{ formatDate(transfer?.updated_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-primary-border flex items-center justify-end bg-background/40">
          <button
            type="button"
            class="px-4 py-2 text-xs font-semibold rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  X,
  Copy,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-vue-next";
import { formatDate } from "@/utils/timeFormatter";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  transfer: { type: Object, default: null },
});

const emit = defineEmits(["close", "preview"]);
const snackbar = useSnackbarStore();

const isDeposit = computed(() => {
  return props.transfer?.payment_request?.type?.toLowerCase() === "deposit";
});

const fmt = (num, dec = 2) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0.00";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
};

const copyText = (text, label = "Item") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard!`, "success");
};

const getAccountDisplay = (pr) => {
  if (!pr) return "—";
  if (pr.trading_account_number) return `#${pr.trading_account_number} (Trading)`;
  if (pr.ib_wallet_id) return `IB Wallet #${pr.ib_wallet_id}`;
  if (pr.fm_wallet_id) return `FM Wallet #${pr.fm_wallet_id}`;
  return "—";
};

const statusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "cancelled") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (s === "assigned") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-background border border-primary-border text-secondary-text";
};

const approvalStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "rejected") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (s === "pending") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-background border border-primary-border text-secondary-text";
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
