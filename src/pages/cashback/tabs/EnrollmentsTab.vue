<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <!-- Status Tabs -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
          :class="selectedStatus === filter.value
            ? 'bg-primary text-white shadow-xs'
            : 'bg-card-background text-secondary-text hover:text-primary-text border border-primary-border'"
          @click="selectStatus(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <button
        class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        @click="isEnrollModalOpen = true"
      >
        Enroll Account
      </button>
    </div>

    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.enrollments"
        :loading="store.loading"
        :pagination="store.enrollmentsPagination"
        @page-change="handlePageChange"
      >
        <template #cell-user="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-primary-text">{{ row.user_name || '-' }}</span>
            <span class="text-xs text-secondary-text">{{ row.user_email || '-' }}</span>
          </div>
        </template>
        <template #cell-account="{ row }">
          <span class="font-medium text-primary-text">{{ row.account_number || '-' }}</span>
        </template>
        <template #cell-plan="{ row }">
          <span class="font-medium text-primary-text">{{ row.plan?.name || '-' }}</span>
        </template>
        <template #cell-status="{ row }">
          <div class="flex flex-col items-start gap-0.5">
            <StatusBadge :status="row.status" />
            <span v-if="row.status === 'ended' && row.ended_by" class="text-[10px] text-secondary-text font-medium">
              Ended by {{ row.ended_by === 'admin' ? 'Admin' : 'Client' }}
            </span>
          </div>
        </template>
        <template #cell-pending_plan="{ row }">
          <div v-if="row.pending_plan_id" class="text-xs">
            <span class="text-primary-text font-medium">{{ row.pending_plan?.name }}</span>
            <div class="text-secondary-text">{{ formatDate(row.pending_effective_at) }}</div>
          </div>
          <span v-else class="text-secondary-text">-</span>
        </template>
        <template #cell-enrolled_at="{ row }">
          <span class="text-secondary-text">{{ formatDate(row.enrolled_at) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            v-if="row.status === 'active'"
            class="px-2.5 py-1 text-xs font-semibold bg-primary-red/10 hover:bg-primary-red/20 text-primary-red rounded-lg transition-colors cursor-pointer"
            @click="openUnenrollConfirm(row)"
          >
            Unenroll
          </button>
          <span v-else class="text-secondary-text text-xs">-</span>
        </template>
      </DataTable>
    </div>

    <CreateEnrollmentModal
      v-if="isEnrollModalOpen"
      @close="isEnrollModalOpen = false"
    />

    <ConfirmationDialog
      :open="isUnenrollConfirmOpen"
      title="Unenroll Account"
      :message="`Are you sure you want to unenroll account ${selectedAccountForUnenroll?.trading_account_id}?`"
      confirm-text="Unenroll"
      type="danger"
      :loading="isUnenrolling"
      @confirm="confirmUnenroll"
      @cancel="closeUnenrollConfirm"
    >
      <div class="flex items-center justify-between p-3 bg-background rounded-lg border border-primary-border">
        <label for="clear-plan-lock" class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            id="clear-plan-lock"
            v-model="clearPlanLock"
            class="w-4 h-4 text-primary bg-card-background border-primary-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
          >
          <span class="text-sm text-primary-text font-medium">Clear plan lock</span>
        </label>
        <span class="text-xs text-secondary-text">
          {{ clearPlanLock ? 'Can enroll immediately' : 'Keep existing lock' }}
        </span>
      </div>
    </ConfirmationDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import CreateEnrollmentModal from "../components/CreateEnrollmentModal.vue";

const store = useCashbackStore();
const snackbar = useSnackbarStore();
const isEnrollModalOpen = ref(false);

const isUnenrollConfirmOpen = ref(false);
const selectedAccountForUnenroll = ref(null);
const isUnenrolling = ref(false);
const clearPlanLock = ref(true);

const columns = [
  { key: "id", label: "ID", sortable: false },
  { key: "user", label: "User", sortable: false },
  { key: "account", label: "Account", sortable: false },
  { key: "plan", label: "Active Plan", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "pending_plan", label: "Pending Switch", sortable: false },
  { key: "enrolled_at", label: "Enrolled At", sortable: false },
  { key: "actions", label: "Actions", sortable: false, align: "right" },
];

const statusFilters = [
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
  { label: "All Enrollments", value: "all" },
];
const selectedStatus = ref("active");

const selectStatus = (status) => {
  selectedStatus.value = status;
  store.fetchEnrollments({
    status,
    limit: store.enrollmentsPagination.limit || 50,
    offset: 0,
  }, true);
};

const handlePageChange = (page) => {
  store.fetchEnrollments({
    status: selectedStatus.value,
    offset: (page - 1) * store.enrollmentsPagination.limit,
    limit: store.enrollmentsPagination.limit,
  }, true);
};

const openUnenrollConfirm = (row) => {
  selectedAccountForUnenroll.value = row;
  isUnenrollConfirmOpen.value = true;
};

const closeUnenrollConfirm = () => {
  isUnenrollConfirmOpen.value = false;
  selectedAccountForUnenroll.value = null;
  clearPlanLock.value = true;
};

const confirmUnenroll = async () => {
  if (!selectedAccountForUnenroll.value) return;
  
  try {
    isUnenrolling.value = true;
    await store.unenrollAccount({
      user_id: selectedAccountForUnenroll.value.user_id,
      trading_account_id: selectedAccountForUnenroll.value.trading_account_id,
      clear_plan_lock: clearPlanLock.value,
    });
    closeUnenrollConfirm();
  } catch (error) {
    console.error("Failed to unenroll:", error);
  } finally {
    isUnenrolling.value = false;
  }
};

const formatDate = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleDateString();
};

onMounted(() => {
  if (!store.isFetched.enrollments) {
    store.fetchEnrollments();
  }
  if (!store.isFetched.plans && store.activeProgram) {
    store.fetchPlans(store.activeProgram.id);
  }
});
</script>
