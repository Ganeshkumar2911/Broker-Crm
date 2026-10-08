<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      <div class="space-y-1.5 max-w-2xl">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
          >
            <SlidersHorizontal class="w-4 h-4" />
          </div>
          <h3 class="text-base font-bold text-primary-text">
            Global Transaction Controls
          </h3>
        </div>
        <p class="text-xs text-secondary-text leading-relaxed">
          Execute system-wide bulk operations to permit or restrict deposits,
          withdrawals, and internal transfers for all registered client accounts
          simultaneously.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-semibold text-primary-text"
        >
          <Users class="w-3.5 h-3.5 text-primary" />
          <span>Scope: All Platform Clients</span>
        </span>
      </div>
    </div>

    <!-- Master Global Override Bar -->
    <div
      v-if="hasPermission(['system_setting.manager_transection_setting'])"
      class="bg-card-background/70 border border-primary-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex items-start gap-3.5">
        <div
          class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5"
        >
          <ShieldAlert class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-primary-text">
            Master Bulk Actions
          </h4>
          <p class="text-[11px] text-secondary-text mt-0.5">
            Apply universal rules across all three transaction channels
            (Deposits, Withdrawals, Transfers) in a single operation.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          :disabled="isSubmitting"
          @click="
            promptAction({
              title: 'Allow All Transactions for All Clients',
              message:
                'This action will immediately ALLOW deposits, withdrawals, and internal transfers for all registered client accounts.',
              confirmText: 'Allow All Transactions',
              type: 'success',
              payload: {
                restrict_deposit: false,
                restrict_withdrawal: false,
                restrict_internal_transfer: false,
              },
              actionKey: 'all_allow',
            })
          "
          class="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-green bg-primary-green/10 border border-primary-green/20 hover:bg-primary-green/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Allow All Transactions</span>
        </button>

        <button
          type="button"
          :disabled="isSubmitting"
          @click="
            promptAction({
              title: 'Restrict All Transactions for All Clients',
              message:
                'Warning: This action will immediately RESTRICT all deposits, withdrawals, and internal transfers for all clients.',
              confirmText: 'Restrict All Transactions',
              type: 'danger',
              payload: {
                restrict_deposit: true,
                restrict_withdrawal: true,
                restrict_internal_transfer: true,
              },
              actionKey: 'all_restrict',
            })
          "
          class="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-red bg-primary-red/10 border border-primary-red/20 hover:bg-primary-red/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ban class="w-3.5 h-3.5" />
          <span>Restrict All Transactions</span>
        </button>
      </div>
    </div>

    <!-- 3 Individual Transaction Action Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- 1. Deposit Restrictions Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-primary/40 transition-all duration-200"
      >
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center"
            >
              <ArrowDownCircle class="w-5 h-5" />
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background border border-primary-border text-secondary-text uppercase tracking-wider"
            >
              Channel: Deposit
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">Client Deposits</h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Permit or block client deposits into their accounts across all
              payment gateways and channels.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="hasPermission(['system_setting.manager_transection_setting'])"
          class="pt-4 border-t border-primary-border/60 grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Allow Deposits for All Clients',
                message:
                  'Are you sure you want to ALLOW deposits for all registered clients? Clients will be able to freely fund their accounts.',
                confirmText: 'Allow Deposits',
                type: 'success',
                payload: { restrict_deposit: false },
                actionKey: 'deposit_allow',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-green bg-primary-green/10 border border-primary-green/20 hover:bg-primary-green/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Allow</span>
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Restrict Deposits for All Clients',
                message:
                  'Are you sure you want to RESTRICT deposits for all clients? No client will be able to deposit funds until re-enabled.',
                confirmText: 'Restrict Deposits',
                type: 'danger',
                payload: { restrict_deposit: true },
                actionKey: 'deposit_restrict',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-red bg-primary-red/10 border border-primary-red/20 hover:bg-primary-red/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban class="w-3.5 h-3.5" />
            <span>Restrict</span>
          </button>
        </div>
      </div>

      <!-- 2. Withdrawal Restrictions Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-primary/40 transition-all duration-200"
      >
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center"
            >
              <ArrowUpCircle class="w-5 h-5" />
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background border border-primary-border text-secondary-text uppercase tracking-wider"
            >
              Channel: Withdrawal
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">
              Client Withdrawals
            </h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Permit or block client withdrawal and payout requests across all
              withdrawal methods.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="hasPermission(['system_setting.manager_transection_setting'])"
          class="pt-4 border-t border-primary-border/60 grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Allow Withdrawals for All Clients',
                message:
                  'Are you sure you want to ALLOW withdrawals for all clients? Clients will be able to request withdrawals normally.',
                confirmText: 'Allow Withdrawals',
                type: 'success',
                payload: { restrict_withdrawal: false },
                actionKey: 'withdrawal_allow',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-green bg-primary-green/10 border border-primary-green/20 hover:bg-primary-green/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Allow</span>
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Restrict Withdrawals for All Clients',
                message:
                  'Are you sure you want to RESTRICT withdrawals for all clients? Clients will not be permitted to submit withdrawal requests.',
                confirmText: 'Restrict Withdrawals',
                type: 'danger',
                payload: { restrict_withdrawal: true },
                actionKey: 'withdrawal_restrict',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-red bg-primary-red/10 border border-primary-red/20 hover:bg-primary-red/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban class="w-3.5 h-3.5" />
            <span>Restrict</span>
          </button>
        </div>
      </div>

      <!-- 3. Internal Transfer Restrictions Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-xs hover:border-primary/40 transition-all duration-200"
      >
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center"
            >
              <ArrowLeftRight class="w-5 h-5" />
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-background border border-primary-border text-secondary-text uppercase tracking-wider"
            >
              Channel: Transfer
            </span>
          </div>

          <div>
            <h4 class="text-sm font-bold text-primary-text">
              Internal Transfers
            </h4>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Permit or block internal funds movement between client wallets and
              trading accounts.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="hasPermission(['system_setting.manager_transection_setting'])"
          class="pt-4 border-t border-primary-border/60 grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Allow Internal Transfers for All Clients',
                message:
                  'Are you sure you want to ALLOW internal transfers for all clients? Clients will be able to transfer funds between accounts and wallets.',
                confirmText: 'Allow Transfers',
                type: 'success',
                payload: { restrict_internal_transfer: false },
                actionKey: 'transfer_allow',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-green bg-primary-green/10 border border-primary-green/20 hover:bg-primary-green/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Allow</span>
          </button>

          <button
            type="button"
            :disabled="isSubmitting"
            @click="
              promptAction({
                title: 'Restrict Internal Transfers for All Clients',
                message:
                  'Are you sure you want to RESTRICT internal transfers for all clients? Internal transfers will be disabled across all accounts.',
                confirmText: 'Restrict Transfers',
                type: 'danger',
                payload: { restrict_internal_transfer: true },
                actionKey: 'transfer_restrict',
              })
            "
            class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary-red bg-primary-red/10 border border-primary-red/20 hover:bg-primary-red/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban class="w-3.5 h-3.5" />
            <span>Restrict</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Last Action Status Banner (Session memory) -->
    <div
      v-if="lastActionReport"
      class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
        >
          <Clock class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-primary-text">
            Last Operation Executed
          </h4>
          <p class="text-[11px] text-secondary-text mt-0.5">
            {{ lastActionReport.title }} at {{ lastActionReport.time }}
          </p>
        </div>
      </div>

      <div
        v-if="
          lastActionReport.updated_count !== null &&
          lastActionReport.updated_count !== undefined
        "
        class="flex items-center gap-2 text-xs font-mono text-secondary-text shrink-0 bg-background px-3 py-1.5 rounded-lg border border-primary-border"
      >
        <span>Impact:</span>
        <strong class="text-primary-text"
          >{{ lastActionReport.updated_count.toLocaleString() }} clients
          updated</strong
        >
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      cancel-text="Cancel"
      :type="confirmDialog.type"
      :loading="isSubmitting"
      @confirm="executeConfirmedAction"
      @cancel="confirmDialog.open = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  SlidersHorizontal,
  Users,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Check,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-vue-next";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const isSubmitting = ref(false);
const lastActionReport = ref(null);

const confirmDialog = ref({
  open: false,
  title: "",
  message: "",
  confirmText: "Confirm",
  type: "info",
  payload: {},
  actionKey: "",
});

const promptAction = ({
  title,
  message,
  confirmText,
  type,
  payload,
  actionKey,
}) => {
  confirmDialog.value = {
    open: true,
    title,
    message,
    confirmText,
    type,
    payload,
    actionKey,
  };
};

const executeConfirmedAction = () => {
  const { title, payload } = confirmDialog.value;
  isSubmitting.value = true;

  apiRequest(urls.KEYS.PATCH, urls.paymentSettings.bulkRestrictions, {
    isTokenRequired: true,
    data: payload,
    onSuccess: (res) => {
      isSubmitting.value = false;
      confirmDialog.value.open = false;

      lastActionReport.value = {
        title,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        updated_count: res?.data?.updated_count ?? res?.updated_count ?? null,
      };

      snackbar.show(
        res?.message ||
          res?.data?.message ||
          "Transaction restrictions updated successfully for all clients.",
        "success",
      );
    },
    onFailure: (err) => {
      isSubmitting.value = false;
      snackbar.show(
        err?.response?.data?.message ||
          err?.message ||
          err?.error ||
          "Failed to update transaction restrictions.",
        "error",
      );
    },
  });
};
</script>
