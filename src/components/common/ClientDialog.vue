<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex justify-end bg-black/10 backdrop-blur-xs transition-all duration-300"
  >
    <!-- Drawer Container (Side Panel) -->
    <div
      class="bg-card-background border-l border-primary-border w-full max-w-md h-full shadow-2xl flex flex-col transform transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
      >
        <div class="flex items-center gap-2">
          <UserPen v-if="isEditMode" class="w-4 h-4 text-primary" />
          <UserPlus v-else class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">
            {{ isEditMode ? "Edit Client Details" : "Create New Client" }}
          </h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer focus:outline-none"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-card-background">
        <!-- Client Info Header / Help Notice -->
        <div
          v-if="isEditMode"
          class="bg-background border border-primary-border rounded-xl px-4 py-3 shrink-0"
        >
          <p
            class="text-[10px] uppercase tracking-wide text-secondary-text mb-1 font-medium"
          >
            Client Reference
          </p>
          <p class="text-xs font-semibold text-primary-text">
            {{ client.name || "—" }} (ID: {{ client.id }})
          </p>
          <p class="text-[10px] text-secondary-text mt-0.5">
            {{ client.email || "—" }}
          </p>
        </div>
        <div
          v-else
          class="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex gap-2 shrink-0"
        >
          <div class="text-[11px] text-secondary-text leading-relaxed">
            Fill in the details below to register a new client. After
            registration, the client can be activated and structured as needed.
          </div>
        </div>

        <!-- Form fields stack -->
        <div class="space-y-4">
          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Full Name <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Full Name"
            />
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Email <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.email"
              type="email"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Email Address"
            />
          </div>

          <!-- Password (Only in Create Mode) -->
          <div v-if="!isEditMode" class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Password <span class="text-red-500">*</span></label
            >
            <div class="relative flex items-center">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full bg-background border border-primary-border rounded-lg pl-3 pr-10 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                placeholder="Enter password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 text-secondary-text hover:text-primary-text transition-colors focus:outline-none cursor-pointer"
              >
                <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
                <EyeOff v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Tracking ID (Only in Edit Mode) -->
          <div v-if="isEditMode" class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Tracking ID</label
            >
            <input
              v-model="form.tracking_id"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Tracking ID"
            />
          </div>

          <!-- Phone Number -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Phone Number</label
            >
            <input
              v-model="form.phone_number"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Phone Number"
            />
          </div>

          <!-- Select IB (Only in Create Mode) -->
          <div v-if="!isEditMode" class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Select IB</label
            >
            <BaseSelect
              v-model="form.ib_user_id"
              :options="ibOptions"
              :isLoading="searchLoading"
              placeholder="Search IB..."
              searchable
              @search="onIbSearch"
              variant="surface"
            />
          </div>

          <!-- KYC Status -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >KYC Status</label
            >
            <BaseSelect
              v-model="form.kyc_status"
              :options="kycStatuses"
              placeholder="Select KYC Status..."
              variant="surface"
            />
          </div>

          <!-- Country -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Country</label
            >
            <BaseSelect
              v-model="form.country"
              :options="countries"
              placeholder="Select Country..."
              variant="surface"
              show-flags
              searchable
            />
          </div>

          <!-- Date of Birth -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Date of Birth</label
            >
            <input
              v-model="form.date_of_birth"
              type="date"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
            />
          </div>

          <!-- Address -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Address</label
            >
            <input
              v-model="form.address"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Street Address"
            />
          </div>

          <!-- City -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >City</label
            >
            <input
              v-model="form.city"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="City"
            />
          </div>

          <!-- State -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >State / Province</label
            >
            <input
              v-model="form.state"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="State / Province"
            />
          </div>

          <!-- Zip Code -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-medium"
              >Zip / Postal Code</label
            >
            <input
              v-model="form.zip_code"
              type="text"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="Zip Code"
            />
          </div>
        </div>
      </div>

      <!-- Footer (Fixed at bottom) -->
      <div
        class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background shrink-0"
      >
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="!isValid || isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{
            isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Client"
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { X, Loader2, UserPen, UserPlus, Eye, EyeOff } from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { countries } from "@/utils/countries";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);

const snackbar = useSnackbarStore();
const isSubmitting = ref(false);

const isEditMode = computed(() => !!props.client?.id);

const showPassword = ref(false);

const form = ref({
  name: "",
  email: "",
  password: "",
  phone_number: "",
  tracking_id: "",
  ib_user_id: null,
  date_of_birth: "",
  kyc_status: "pending",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
});

const isValid = computed(() => {
  const basicValid =
    form.value.name &&
    form.value.name.trim().length > 0 &&
    form.value.email &&
    form.value.email.trim().length > 0;

  if (isEditMode.value) {
    return basicValid;
  } else {
    return (
      basicValid && form.value.password && form.value.password.trim().length > 0
    );
  }
});

const formatDateForInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

// Watch props to populate form
watch(
  () => [props.open, props.client?.id],
  ([isOpen]) => {
    if (isOpen) {
      if (props.client && props.client.id) {
        // Edit mode
        form.value.name = props.client.name ?? "";
        form.value.email = props.client.email ?? "";
        form.value.password = "";
        form.value.phone_number = props.client.phone_number ?? "";
        form.value.tracking_id = props.client.tracking_id ?? "";
        form.value.ib_user_id =
          props.client.ib_user_id ?? props.client.ib_id ?? null;
        form.value.date_of_birth = formatDateForInput(
          props.client.date_of_birth,
        );
        form.value.kyc_status = props.client.kyc_status ?? "pending";
        form.value.address = props.client.address ?? "";
        form.value.city = props.client.city ?? "";
        form.value.state = props.client.state ?? "";
        form.value.zip_code = props.client.zip_code ?? "";
        form.value.country = props.client.country ?? "";
      } else {
        // Create mode
        form.value.name = "";
        form.value.email = "";
        form.value.password = "";
        form.value.phone_number = "";
        form.value.tracking_id = "";
        form.value.ib_user_id = null;
        form.value.date_of_birth = "";
        form.value.kyc_status = "pending";
        form.value.address = "";
        form.value.city = "";
        form.value.state = "";
        form.value.zip_code = "";
        form.value.country = "";
      }
      newIbOptions.value = [];
      searchLoading.value = false;
      showPassword.value = false;
      isSubmitting.value = false;
    }
  },
  { immediate: true },
);

const newIbOptions = ref([]);
const searchLoading = ref(false);
let ibSearchTimer = null;

const ibOptions = computed(() => {
  return [{ label: "None", value: null }, ...newIbOptions.value];
});

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer);
  ibSearchTimer = setTimeout(() => searchIbs(query), 350);
};

const searchIbs = (query = "") => {
  if (!query.trim()) {
    newIbOptions.value = [];
    return;
  }
  searchLoading.value = true;

  apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
    params: { search: query.trim() },
    isTokenRequired: true,
    onSuccess: (res) => {
      newIbOptions.value = (res?.data || []).map((ib) => ({
        label:
          ib.label_name ??
          ib.name ??
          ib.ib_name ??
          ib.email ??
          `IB ${ib.ib_id ?? ib.id}`,
        value: ib.ib_id ?? ib.id ?? ib.user_id,
      }));
      searchLoading.value = false;
    },
    onFailure: (err) => {
      newIbOptions.value = [];
      searchLoading.value = false;
      snackbar.show(err?.message || "Failed to fetch IBs.", "error");
    },
  });
};

const handleSubmit = () => {
  if (!isValid.value) return;
  isSubmitting.value = true;

  if (isEditMode.value) {
    const editPayload = {};
    const cleanStr = (val) =>
      val === null || val === undefined ? "" : String(val).trim();

    if (form.value.name.trim() !== cleanStr(props.client.name)) {
      editPayload.name = form.value.name.trim();
    }
    if (form.value.email.trim() !== cleanStr(props.client.email)) {
      editPayload.email = form.value.email.trim();
    }
    if (cleanStr(form.value.phone_number) !== cleanStr(props.client.phone_number)) {
      editPayload.phone_number = form.value.phone_number?.trim() || null;
    }
    if (cleanStr(form.value.tracking_id) !== cleanStr(props.client.tracking_id)) {
      editPayload.tracking_id = form.value.tracking_id?.trim() || null;
    }
    if (form.value.kyc_status !== (props.client.kyc_status ?? "pending")) {
      editPayload.kyc_status = form.value.kyc_status;
    }
    if (cleanStr(form.value.country) !== cleanStr(props.client.country)) {
      editPayload.country = form.value.country || null;
    }
    if (
      form.value.date_of_birth !== formatDateForInput(props.client.date_of_birth)
    ) {
      editPayload.date_of_birth = form.value.date_of_birth || null;
    }
    if (cleanStr(form.value.address) !== cleanStr(props.client.address)) {
      editPayload.address = form.value.address?.trim() || null;
    }
    if (cleanStr(form.value.city) !== cleanStr(props.client.city)) {
      editPayload.city = form.value.city?.trim() || null;
    }
    if (cleanStr(form.value.state) !== cleanStr(props.client.state)) {
      editPayload.state = form.value.state?.trim() || null;
    }
    if (cleanStr(form.value.zip_code) !== cleanStr(props.client.zip_code)) {
      editPayload.zip_code = form.value.zip_code?.trim() || null;
    }

    if (Object.keys(editPayload).length === 0) {
      snackbar.show("No changes detected.", "info");
      isSubmitting.value = false;
      closeDialog();
      return;
    }

    apiRequest(urls.KEYS.PATCH, urls.clientList.update, {
      look_up_key: props.client.id,
      data: editPayload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Client details updated successfully.", "success");
        isSubmitting.value = false;
        emit("success");
        closeDialog();
      },
      onFailure: (err) => {
        snackbar.show(
          err?.message || "Failed to update client details.",
          "error",
        );
        isSubmitting.value = false;
      },
    });
  } else {
    const createPayload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone_number: form.value.phone_number?.trim() || null,
      date_of_birth: form.value.date_of_birth || null,
      kyc_status: form.value.kyc_status,
      address: form.value.address?.trim() || null,
      city: form.value.city?.trim() || null,
      state: form.value.state?.trim() || null,
      zip_code: form.value.zip_code?.trim() || null,
      country: form.value.country || null,
      ib_user_id: form.value.ib_user_id,
      password: form.value.password.trim(),
    };
    apiRequest(urls.KEYS.POST, urls.clientList.create, {
      data: createPayload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Client created successfully.", "success");
        isSubmitting.value = false;
        emit("success");
        closeDialog();
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to create client.", "error");
        isSubmitting.value = false;
      },
    });
  }
};

const closeDialog = () => {
  emit("close");
};

// KYC Status options
const kycStatuses = [
  // { value: 'not started', label: 'Not Started' },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
</script>
