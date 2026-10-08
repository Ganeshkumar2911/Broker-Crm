<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg overflow-hidden shadow-xl"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-primary-border flex items-center justify-between"
      >
        <div>
          <h2 class="text-sm font-semibold text-primary-text">
            Create Ticket for User
          </h2>
          <p class="text-[11px] text-secondary-text mt-0.5">
            Raise a new support ticket on behalf of a client
          </p>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- User Selection -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">
            User / Client <span class="text-primary-red">*</span>
          </p>
          <BaseSelect
            v-model="form.user_id"
            :options="clientOptions"
            :isLoading="isSearchingClients"
            placeholder="Search user by name or email..."
            searchable
            :isShowMail="true"
            class="w-full"
            @search="onClientSearch"
          />
        </div>

        <!-- Subject -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">
            Subject <span class="text-primary-red">*</span>
          </p>
          <BaseSelect
            v-model="form.subjectCategory"
            :options="subjectOptions"
            placeholder="Select subject"
          />
        </div>

        <div v-if="form.subjectCategory === 'others'">
          <p class="text-xs text-secondary-text mb-1.5">
            Please specify other issue <span class="text-primary-red">*</span>
          </p>
          <input
            ref="firstInput"
            v-model="form.subject"
            type="text"
            placeholder="Describe the issue"
            :disabled="platformTicketsStore.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <!-- Description -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">
            Description <span class="text-primary-red">*</span>
          </p>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe the issue or request details..."
            :disabled="platformTicketsStore.actionLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
          />
        </div>

        <!-- Priority -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Priority</p>
          <BaseSelect
            v-model="form.priority"
            :options="priorityOptions"
            placeholder="Select priority"
          />
        </div>

        <!-- Due Date/Time (Only for Urgent) -->
        <div v-if="form.priority === 'urgent'">
          <p class="text-xs text-secondary-text mb-1.5">
            Due Time (SLA) <span class="text-primary-red">*</span>
          </p>
          <BaseSelect
            v-model="form.due_at"
            :options="dueAtOptions"
            placeholder="Select due SLA time"
            placement="top"
            class="w-full"
          />
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background"
      >
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="platformTicketsStore.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="submit"
        >
          <Loader2
            v-if="platformTicketsStore.actionLoading"
            class="w-3.5 h-3.5 animate-spin"
          />
          <span>{{
            platformTicketsStore.actionLoading ? "Creating..." : "Create Ticket"
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { usePlatfromTicketsStore } from "@/stores/platformTickets/platformTickets";
import { useClientLedgerStore } from "@/stores/clientLedger/clientLedger";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const platformTicketsStore = usePlatfromTicketsStore();
const clientLedgerStore = useClientLedgerStore();
const firstInput = ref(null);

const form = ref({
  user_id: null,
  subjectCategory: null,
  subject: "",
  description: "",
  priority: "medium",
  due_at: null,
});

const clientOptions = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

const subjectOptions = [
  { label: "Deposit & Withdrawal", value: "Deposit & Withdrawal" },
  { label: "Trading (MT5)", value: "Trading (MT5)" },
  { label: "Copy Trading", value: "Copy Trading" },
  { label: "Promotion", value: "Promotion" },
  { label: "Introducing broker", value: "Introducing broker" },
  { label: "Others issue", value: "others" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const dueAtOptions = [
  { label: "10 Minutes", value: "10" },
  { label: "20 Minutes", value: "20" },
  { label: "30 Minutes", value: "30" },
  { label: "45 Minutes", value: "45" },
  { label: "60 Minutes (1 Hour)", value: "60" },
  { label: "90 Minutes (1.5 Hours)", value: "90" },
];

const isValid = computed(() => {
  const hasUser = Boolean(form.value.user_id);
  const hasCategory = Boolean(form.value.subjectCategory);
  const hasDescription = Boolean(form.value.description?.trim());
  const hasSubject =
    form.value.subjectCategory === "others"
      ? Boolean(form.value.subject?.trim())
      : Boolean(form.value.subjectCategory);

  const hasRequiredFields =
    hasUser && hasCategory && hasSubject && hasDescription;

  if (form.value.priority === "urgent") {
    return hasRequiredFields && Boolean(form.value.due_at);
  }
  return hasRequiredFields;
});

const onClientSearch = (query = "") => {
  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await clientLedgerStore.fetchAllClients(query || "");
      clientOptions.value = results || [];
    } catch (err) {
      clientOptions.value = [];
    } finally {
      isSearchingClients.value = false;
    }
  }, 250);
};

onMounted(() => {
  onClientSearch("");
});

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        user_id: null,
        subjectCategory: null,
        subject: "",
        description: "",
        priority: "medium",
        due_at: null,
      };
      onClientSearch("");
      nextTick(() => firstInput.value?.focus());
    }
  },
);

watch(
  () => form.value.subjectCategory,
  (newCategory) => {
    if (newCategory !== "others") {
      form.value.subject = newCategory || "";
    } else {
      form.value.subject = "";
      nextTick(() => firstInput.value?.focus());
    }
  },
);

watch(
  () => form.value.priority,
  (newPriority) => {
    if (newPriority === "urgent" && !form.value.due_at) {
      form.value.due_at = "30";
    }
  },
);

const submit = () => {
  if (!isValid.value) return;
  const payload = {
    ...form.value,
    subjectCategory: form.value.subjectCategory,
    subject:
      form.value.subjectCategory === "others"
        ? form.value.subject
        : form.value.subjectCategory,
  };
  platformTicketsStore.createTicketForUser(payload, () => emit("close"));
};
</script>
