<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">
          Member Enrollments
        </h2>
        <p class="text-xs text-secondary-text">
          Accounts participating in the loyalty program, tier progress, and
          points ledger.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition cursor-pointer shadow-2xs"
          @click="openCreditModal(null)"
        >
          <HugeIcon :icon="Coins01Icon" :size="14" class="text-primary" />
          <span>Credit Points</span>
        </button>

        <button
          v-if="hasPermission('loyalty.enroll')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="isEnrollDrawerOpen = true"
        >
          <HugeIcon :icon="UserAdd01Icon" :size="14" />
          <span>Enroll Account</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="fetchData(true)"
        >
          <HugeIcon
            :icon="RefreshCwIcon"
            :size="14"
            class="text-primary"
            :class="store.loading ? 'animate-spin' : ''"
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div
      class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs"
    >
      <div class="relative w-full sm:w-48">
        <HugeIcon
          :icon="Search01Icon"
          :size="14"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />
        <input
          v-model="filters.email"
          type="text"
          placeholder="Search by Email..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="relative w-full sm:w-40">
        <HugeIcon
          :icon="Search01Icon"
          :size="14"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
        />
        <input
          v-model="filters.account_number"
          type="text"
          placeholder="Account No..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition font-mono text-xs"
          @keyup.enter="fetchData"
        />
      </div>

      <div class="w-full sm:w-40">
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Filter Status"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer text-xs"
        @click="fetchData"
      >
        <HugeIcon :icon="Search01Icon" :size="12" />
        <span>Search</span>
      </button>

      <button
        v-if="
          filters.email || filters.account_number || filters.status !== 'active'
        "
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="space-y-3">
      <div
        v-for="n in 6"
        :key="n"
        class="h-12 bg-card-background border border-primary-border rounded-xl animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="enrollments.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-xl text-center gap-3"
    >
      <div
        class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
      >
        <HugeIcon :icon="UserGroupIcon" :size="24" class="text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">
          No Enrollments Found
        </h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          {{
            filters.email ||
            filters.account_number ||
            filters.status !== "active"
              ? "No enrollments match your filter criteria."
              : "Enroll client trading accounts to begin tracking points and tier upgrades."
          }}
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.enroll')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="isEnrollDrawerOpen = true"
      >
        <HugeIcon :icon="UserAdd01Icon" :size="14" />
        <span>Enroll First Account</span>
      </button>
    </div>

    <!-- Enrollments Table -->
    <div
      v-else
      class="bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xs"
    >
      <div
        class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50"
      >
        <h3
          class="text-xs font-semibold text-primary-text uppercase tracking-wider"
        >
          Enrolled Members ({{ enrollments.length }})
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="bg-background/60 text-secondary-text border-b border-primary-border"
          >
            <tr>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Enroll ID
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                User / Email
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Trading Account
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Current Tier
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Available Points
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Lifetime Points
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Abuse Status
              </th>
              <th
                class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider"
              >
                Opted-In
              </th>
              <th
                class="py-2.5 px-4 text-right text-[11px] font-medium uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="item in enrollments"
              :key="item.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td class="py-2.5 px-4 text-secondary-text font-mono">
                #{{ item.id }}
              </td>
              <td class="py-2.5 px-4">
                <div class="space-y-0.5">
                  <p v-if="item.email" class="font-medium text-primary-text">
                    {{ item.email }}
                  </p>
                  <p class="font-mono text-secondary-text text-[11px]">
                    User #{{ item.user_id }}
                  </p>
                </div>
              </td>
              <td class="py-2.5 px-4 font-mono font-medium text-primary">
                #{{ item.trading_account_id }}
              </td>
              <td class="py-2.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold border"
                  :style="
                    item.current_tier?.color
                      ? {
                          backgroundColor: `${item.current_tier.color}1A`,
                          color: item.current_tier.color,
                          borderColor: `${item.current_tier.color}40`,
                        }
                      : {}
                  "
                  :class="
                    !item.current_tier?.color
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : ''
                  "
                >
                  <span
                    v-if="item.current_tier?.color"
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :style="{ backgroundColor: item.current_tier.color }"
                  />
                  <span>{{
                    item.current_tier?.name || item.current_tier?.code || "—"
                  }}</span>
                </span>
              </td>
              <td class="py-2.5 px-4 font-mono font-medium text-primary-green">
                {{ item.available_points ?? "0.00" }}
              </td>
              <td class="py-2.5 px-4 font-mono text-primary-text">
                {{ item.lifetime_earned_points ?? "0.00" }}
              </td>
              <td class="py-2.5 px-4">
                <StatusBadge :status="item.status" />
              </td>
              <td class="py-2.5 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                  :class="
                    item.abuse_status === 'flagged'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  "
                >
                  {{ item.abuse_status || "clear" }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-secondary-text">
                {{ formatDate(item.opted_in_at) }}
              </td>
              <td class="py-2.5 px-4 text-right">
                <DropdownMenu
                  :items="getRowActions(item)"
                  position="bottom-end"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enroll Slide-Over Drawer -->
    <EnrollDrawer
      :open="isEnrollDrawerOpen"
      :programId="store.program?.id"
      @close="isEnrollDrawerOpen = false"
      @enrolled="fetchData(true)"
    />

    <!-- Detail Slide-Over Drawer -->
    <EnrollmentDetailDrawer
      :open="isDetailDrawerOpen"
      @close="isDetailDrawerOpen = false"
      @creditRequested="openCreditModal"
    />

    <!-- Manual Credit Wallet Modal -->
    <CreditWalletModal
      :open="isCreditModalOpen"
      :enrollment="selectedEnrollmentForCredit"
      :programId="store.program?.id"
      @close="isCreditModalOpen = false"
      @success="fetchData(true)"
    />

    <!-- Quick De-enroll Confirmation Modal -->
    <div
      v-if="isDeenrollModalOpen"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0"
          >
            <HugeIcon :icon="UserRemove01Icon" :size="20" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-primary-text">
              De-enroll Member
            </h3>
            <p class="text-xs text-secondary-text">
              Remove user from loyalty program
            </p>
          </div>
        </div>

        <p class="text-xs text-secondary-text leading-relaxed">
          Are you sure you want to de-enroll
          <strong class="text-primary-text"
            >User #{{ selectedEnrollmentForDeenroll?.user_id }}</strong
          >
          (Account #{{ selectedEnrollmentForDeenroll?.trading_account_id }})?
          This soft leaves the program; trade history and central wallet balance
          remain preserved.
        </p>

        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-primary-text"
            >Reason (Optional)</label
          >
          <input
            v-model="deenrollReason"
            type="text"
            placeholder="e.g. Removed by admin / User requested leave"
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-xl text-primary-text outline-none focus:border-primary text-xs"
          />
        </div>

        <div class="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-primary-border text-secondary-text hover:bg-background text-xs cursor-pointer font-medium"
            @click="isDeenrollModalOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="store.actionLoading"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            @click="handleDeenrollConfirm"
          >
            <HugeIcon
              v-if="store.actionLoading"
              :icon="Loading03Icon"
              :size="13"
              class="animate-spin"
            />
            <span>Confirm De-enroll</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  UserAdd01Icon,
  RefreshCwIcon,
  UserGroupIcon,
  Search01Icon,
  Coins01Icon,
  UserRemove01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Eye, Coins, UserMinus } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";
import StatusBadge from "@/components/common/StatusBadge.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import EnrollDrawer from "../components/EnrollDrawer.vue";
import EnrollmentDetailDrawer from "../components/EnrollmentDetailDrawer.vue";
import CreditWalletModal from "../components/CreditWalletModal.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isEnrollDrawerOpen = ref(false);
const isDetailDrawerOpen = ref(false);
const isCreditModalOpen = ref(false);
const isDeenrollModalOpen = ref(false);
const selectedEnrollmentForCredit = ref(null);
const selectedEnrollmentForDeenroll = ref(null);
const deenrollReason = ref("");

const filters = reactive({
  email: "",
  account_number: "",
  status: "active",
});

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "All Statuses", value: "all" },
  { label: "De-enrolled", value: "deenrolled" },
  { label: "Dormant", value: "dormant" },
];

const enrollments = computed(() => store.enrollments || []);
const programId = computed(() => store.program?.id || null);

const fetchData = (force = false) => {
  const params = {};
  if (filters.email?.trim()) params.email = filters.email.trim();
  if (filters.account_number?.trim())
    params.account_number = filters.account_number.trim();
  if (filters.status) params.status = filters.status;
  if (programId.value) params.program_id = programId.value;
  store.fetchEnrollments(params, force);
};

const resetFilters = () => {
  filters.email = "";
  filters.account_number = "";
  filters.status = "active";
  fetchData(true);
};

const handleViewDetail = async (enrollmentId) => {
  isDetailDrawerOpen.value = true;
  await store.fetchEnrollmentDetail(enrollmentId);
};

const openCreditModal = (enrollment = null) => {
  selectedEnrollmentForCredit.value =
    enrollment || store.enrollmentDetail || null;
  isCreditModalOpen.value = true;
};

const openDeenrollModal = (enrollment) => {
  selectedEnrollmentForDeenroll.value = enrollment;
  deenrollReason.value = "";
  isDeenrollModalOpen.value = true;
};

const handleDeenrollConfirm = async () => {
  if (!selectedEnrollmentForDeenroll.value?.id) return;
  await store.deenrollMember({
    enrollmentId: selectedEnrollmentForDeenroll.value.id,
    reason: deenrollReason.value.trim(),
  });
  isDeenrollModalOpen.value = false;
  selectedEnrollmentForDeenroll.value = null;
  deenrollReason.value = "";
};

const getRowActions = (item) => {
  const actions = [
    {
      label: "Details",
      icon: Eye,
      handler: () => handleViewDetail(item.id),
    },
  ];

  if (hasPermission("loyalty.update") && item.status !== "deenrolled") {
    actions.push({
      label: "Credit",
      icon: Coins,
      handler: () => openCreditModal(item),
    });
  }

  if (
    (hasPermission("loyalty.enroll") || hasPermission("loyalty.update")) &&
    item.status !== "deenrolled"
  ) {
    actions.push({
      label: "De-enroll",
      icon: UserMinus,
      danger: true,
      handler: () => openDeenrollModal(item),
    });
  }

  return actions;
};

watch(
  programId,
  (newId) => {
    if (newId) {
      fetchData(true);
    }
  },
  { immediate: true },
);
</script>
