<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { countries } from "@/utils/countries.js";
import {
  X,
  UserPlus,
  Edit,
  ArrowRightLeft,
  Upload,
  Check,
} from "lucide-vue-next";
import { useLeadStageStore } from "@/stores/leadStage/leadStage";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "add" }, // 'add', 'edit', 'moveStage', 'import'
  lead: { type: Object, default: null },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "save-lead", "import-csv"]);

const leadStageStore = useLeadStageStore();

onMounted(() => {
  if (!props.stages?.length && !leadStageStore.isFetched) {
    leadStageStore.fetchStages();
  }
});

const activeStages = computed(() => {
  if (Array.isArray(props.stages) && props.stages.length > 0) {
    return props.stages;
  }
  return leadStageStore.stages || [];
});

// Staff options for BaseSelect
const staffOptions = computed(() => {
  return props.staffList.map((s) => ({
    value: s.id,
    label: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

// Country options derived from @/utils/countries.js
const countryOptions = computed(() => {
  return countries.map((c) => ({
    value: c.label,
    label: c.label,
    flagCode: c.flagCode,
  }));
});

// Source options (Enum: website, support, csv_import, google_ads, facebook, referral)
const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "support", label: "Support" },
  { value: "csv_import", label: "CSV Import" },
  { value: "google_ads", label: "Google Ads" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Referral" },
];

// Priority options (Enum: low, medium, high)
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Stage options for BaseSelect (only non-system stages where is_system is false)
const stageSelectOptions = computed(() => {
  return activeStages.value
    .filter((s) => s.is_system === false || !s.is_system)
    .map((s) => ({
      value: s.code || String(s.id),
      label: s.name || s.code,
    }));
});

const moveStageSelectOptions = stageSelectOptions;

const currentStageDisplay = computed(() => {
  if (!props.lead) return "—";
  return (
    props.lead.current_stage?.name ||
    props.lead.current_stage?.code ||
    props.lead.stage ||
    "—"
  );
});

const formData = ref({
  lead_code: "",
  name: "",
  email: "",
  phone: "",
  country: "AE (United Arab Emirates)",
  source: "website",
  priority: "medium",
  stage: "",
  assigned_staff_id: null,
  remarks: "",
});

watch(
  () => [props.lead, props.open, activeStages.value],
  ([newLead, isOpen]) => {
    if (!isOpen) return;

    if (newLead) {
      const nonSystemStages = moveStageSelectOptions.value;
      const currentCode = newLead.current_stage?.code || newLead.stage;
      const matchedStage = nonSystemStages.find((s) => s.value === currentCode);
      const defaultStage = matchedStage
        ? matchedStage.value
        : nonSystemStages[0]?.value || currentCode || activeStages.value[0]?.code || "";

      formData.value = {
        lead_code: newLead.lead_code || "",
        name: newLead.name || `${newLead.first_name || ""} ${newLead.last_name || ""}`.trim(),
        email: newLead.email || "",
        phone: newLead.phone || "",
        country: newLead.country || "AE (United Arab Emirates)",
        source: newLead.source || "website",
        priority: newLead.priority || "medium",
        stage: defaultStage,
        assigned_staff_id: newLead.assigned_staff_id || newLead.assigned_staff?.id || null,
        remarks: newLead.remarks || "",
      };
    } else {
      const defaultStageCode =
        props.mode === "moveStage"
          ? moveStageSelectOptions.value[0]?.value || ""
          : activeStages.value[0]?.code || "";

      formData.value = {
        lead_code: `L-${Math.floor(100 + Math.random() * 900)}`,
        name: "",
        email: "",
        phone: "",
        country: "AE (United Arab Emirates)",
        source: "website",
        priority: "medium",
        stage: defaultStageCode,
        assigned_staff_id: null,
        remarks: "",
      };
    }
  },
  { immediate: true, deep: true },
);

function handleSubmit() {
  if (props.mode === "import") {
    emit("import-csv");
    return;
  }

  const payload = {
    lead_code: formData.value.lead_code,
    name: formData.value.name,
    email: formData.value.email,
    phone: formData.value.phone,
    country: formData.value.country,
    source: formData.value.source,
    priority: formData.value.priority,
    stage: formData.value.stage,
    assigned_staff_id: formData.value.assigned_staff_id,
    remarks: formData.value.remarks,
  };

  emit("save-lead", { mode: props.mode, leadId: props.lead?.id, payload });
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay (For Add, Edit, Import Drawer) -->
    <Transition name="fade">
      <div
        v-if="open && mode !== 'moveStage'"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Centered Dialog Modal for Move Stage -->
    <Transition name="fade">
      <div
        v-if="open && mode === 'moveStage'"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary"
              >
                <ArrowRightLeft class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-primary-text">
                  Move Lead Stage
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Advance lead status to a new pipeline stage.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="emit('close')"
              class="w-8 h-8 rounded-lg hover:bg-background/80 flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 text-xs">
            <!-- Lead Name & Existing Stage Display -->
            <div
              class="p-3.5 rounded-xl bg-background border border-primary-border/60 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-secondary-text font-medium">Lead:</span>
                <span class="font-bold text-primary-text">{{
                  lead?.name ||
                  (lead?.first_name
                    ? `${lead.first_name} ${lead.last_name || ""}`.trim()
                    : "Lead")
                }}</span>
              </div>
              <div
                class="flex items-center justify-between border-t border-primary-border/40 pt-2"
              >
                <span class="text-secondary-text font-medium">Current Stage:</span>
                <span
                  class="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-semibold uppercase tracking-wider text-[11px]"
                >
                  {{ currentStageDisplay }}
                </span>
              </div>
            </div>

            <!-- Target Stage Dropdown (Only shows stages where is_system is false) -->
            <div>
              <label class="block text-secondary-text font-medium mb-1">
                Select New Target Stage <span class="text-red-400">*</span>
              </label>
              <BaseSelect
                v-model="formData.stage"
                :options="moveStageSelectOptions"
                placeholder="Select stage..."
                variant="surface"
              />
              <p
                v-if="moveStageSelectOptions.length === 0"
                class="text-[11px] text-amber-400 mt-1"
              >
                No custom (non-system) stages available.
              </p>
            </div>

            <!-- Stage Change Remark / Notes -->
            <div>
              <label class="block text-secondary-text font-medium mb-1">
                Stage Change Remark / Notes
              </label>
              <textarea
                v-model="formData.remarks"
                rows="3"
                placeholder="Enter reason or remarks for changing stage..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs resize-none transition-all"
              ></textarea>
            </div>

            <!-- Footer Buttons -->
            <div
              class="pt-3 border-t border-primary-border flex items-center justify-end gap-2"
            >
              <button
                type="button"
                @click="emit('close')"
                class="px-4 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Update Stage
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Slide-over Drawer Panel (For Add, Edit, Import) -->
    <Transition name="slide-right">
      <div
        v-if="open && mode !== 'moveStage'"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] md:w-[560px] max-w-full bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary"
            >
              <UserPlus v-if="mode === 'add'" class="w-5 h-5" />
              <Edit v-else-if="mode === 'edit'" class="w-5 h-5" />
              <Upload v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-primary-text">
                <span v-if="mode === 'add'">Create New Lead</span>
                <span v-else-if="mode === 'edit'">Edit Lead Details</span>
                <span v-else>Import Leads from CSV</span>
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                <span v-if="mode === 'add'"
                  >Add a new lead to the CRM onboarding pipeline.</span
                >
                <span v-else-if="mode === 'edit'"
                  >Update lead contact or details according to API schema.</span
                >
                <span v-else>Upload CSV batch file to import leads.</span>
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="w-8 h-8 rounded-lg hover:bg-background/80 flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Form -->
        <form
          @submit.prevent="handleSubmit"
          class="flex-1 overflow-y-auto p-6 space-y-4 text-xs flex flex-col justify-between"
        >
          <div class="space-y-4">

            <!-- Mode: Import CSV -->
            <div
              v-if="mode === 'import'"
              class="space-y-4 text-center py-8"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto"
              >
                <Upload class="w-8 h-8" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-primary-text">
                  Upload CSV File
                </h4>
                <p class="text-xs text-secondary-text mt-1 max-w-xs mx-auto">
                  Drag and drop your lead export CSV or click browse to select
                  file (.csv, .xlsx).
                </p>
              </div>
              <div
                class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 transition-colors bg-background/50 cursor-pointer"
              >
                <span class="text-xs text-primary font-medium"
                  >Browse File from Computer</span
                >
              </div>
            </div>

            <!-- Mode: Add or Edit -->
            <div v-else class="space-y-4">
              <!-- Lead Code & Email -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1">
                    Lead Code <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.lead_code"
                    required
                    type="text"
                    placeholder="e.g. L-101"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary uppercase font-mono transition-all"
                  />
                </div>
                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Email Address</label
                  >
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="john@example.com"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <!-- Name -->
              <div>
                <label class="block text-secondary-text font-medium mb-1">
                  Name <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="formData.name"
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <!-- Phone & Country -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Phone Number</label
                  >
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+1 234 567 890"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Country</label
                  >
                  <BaseSelect
                    v-model="formData.country"
                    :options="countryOptions"
                    placeholder="Search country..."
                    searchable
                    variant="surface"
                    show-flags
                  />
                </div>
              </div>

              <!-- Source & Priority -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Lead Source</label
                  >
                  <BaseSelect
                    v-model="formData.source"
                    :options="sourceOptions"
                    placeholder="Select source..."
                    variant="surface"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Priority</label
                  >
                  <BaseSelect
                    v-model="formData.priority"
                    :options="priorityOptions"
                    placeholder="Select priority..."
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Pipeline Stage & Staff Assignment -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Pipeline Stage</label
                  >
                  <BaseSelect
                    v-model="formData.stage"
                    :options="stageSelectOptions"
                    placeholder="Select pipeline stage..."
                    variant="surface"
                  />
                </div>

                <div>
                  <label class="block text-secondary-text font-medium mb-1"
                    >Assigned Staff</label
                  >
                  <BaseSelect
                    v-model="formData.assigned_staff_id"
                    :options="staffOptions"
                    placeholder="Select staff member..."
                    searchable
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Remarks / Notes -->
              <div>
                <label class="block text-secondary-text font-medium mb-1"
                  >Remarks / Notes</label
                >
                <textarea
                  v-model="formData.remarks"
                  rows="3"
                  placeholder="Enter initial lead notes or remarks..."
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs resize-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div
            class="pt-4 mt-6 border-t border-primary-border flex items-center justify-end gap-2 shrink-0"
          >
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span v-if="mode === 'add'">Create Lead</span>
              <span v-else-if="mode === 'edit'">Save Changes</span>
              <span v-else-if="mode === 'moveStage'">Update Stage</span>
              <span v-else>Import File</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
