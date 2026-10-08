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
                <UserPen class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-primary-text">
                  Edit Client Profile
                </h2>
                <p class="text-[11px] text-secondary-text">
                  Update personal information and contact details
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
                v-if="client?.is_active !== undefined"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="
                  client?.is_active
                    ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                "
              >
                {{ client?.is_active ? "Active" : "Inactive" }}
              </span>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4 text-xs">
              <!-- Full Name -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Full Name <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Email Address <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                  placeholder="e.g. client@example.com"
                />
              </div>

              <!-- Phone Number & Tracking ID in 2 Cols -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Phone Number
                  </label>
                  <input
                    v-model="form.phone_number"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                    placeholder="e.g. +1234567890"
                  />
                </div>

                <!-- <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Tracking ID
                  </label>
                  <input
                    v-model="form.tracking_id"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                    placeholder="e.g. TRK-1002"
                  />
                </div> -->

                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Date of Birth
                  </label>
                  <input
                    v-model="form.date_of_birth"
                    type="date"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Gender
                  </label>
                  <BaseSelect
                    :modelValue="form.gender"
                    :options="genderOptions"
                    placeholder="Select gender"
                    variant="surface"
                    @update:modelValue="form.gender = $event"
                  />
                </div>

              </div>

              <!-- Nationality & Preferred Language in 2 Cols -->
              <!-- <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Nationality
                  </label>
                  <input
                    v-model="form.nationality"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                    placeholder="e.g. American"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    Preferred Language
                  </label>
                  <input
                    v-model="form.preferred_language"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                    placeholder="e.g. English"
                  />
                </div>
              </div> -->

              <!-- Country -->
              <!-- <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Country
                </label>
                <BaseSelect
                  :modelValue="form.country"
                  :options="countries"
                  placeholder="Select Country..."
                  variant="surface"
                  show-flags
                  searchable
                  @update:modelValue="form.country = $event"
                />
              </div> -->

              <!-- State & City in 2 Cols -->
              <!-- <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    State / Province
                  </label>
                  <input
                    v-model="form.state"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                    placeholder="e.g. California"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-secondary-text text-[11px] font-semibold">
                    City
                  </label>
                  <input
                    v-model="form.city"
                    type="text"
                    class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Los Angeles"
                  />
                </div>
              </div> -->

              <!-- Street Address -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Full Address
                </label>
                <input
                  v-model="form.address"
                  type="text"
                  class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors"
                  placeholder="e.g. 123 Market St, Suite 500"
                />
              </div>

              <!-- Zip Code -->
              <div class="flex flex-col gap-1">
                <label class="text-secondary-text text-[11px] font-semibold">
                  Zip / Postal Code
                </label>
                <input
                  v-model="form.zip_code"
                  type="text"
                  class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2.5 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                  placeholder="e.g. 90001"
                />
              </div>
            </div>
          </div>

          <!-- Footer (Sticky Actions) -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0"
          >
            <button
              type="button"
              :disabled="clientDepthStore.isSubmittingProfile"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-all disabled:opacity-50 cursor-pointer"
              @click="closeDrawer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!canEdit || !isValid || clientDepthStore.isSubmittingProfile"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              @click="handleSubmit"
            >
              <Loader2
                v-if="clientDepthStore.isSubmittingProfile"
                class="w-4 h-4 animate-spin"
              />
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { X, Loader2, UserPen, Lock } from "lucide-vue-next";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { countries } from "@/utils/countries";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "success"]);

const clientDepthStore = useClientDepthStore();
const { hasPermission } = usePermissionCheck();

const canEdit = computed(() => {
  return hasPermission("client.update");
});

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const form = ref({
  name: "",
  email: "",
  phone_number: "",
  tracking_id: "",
  date_of_birth: "",
  gender: "Male",
  nationality: "",
  preferred_language: "English",
  country: "",
  state: "",
  city: "",
  address: "",
  zip_code: "",
});

const formatDateForInput = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch {}
  return String(val).slice(0, 10);
};

const populateForm = () => {
  if (!props.client) return;
  const c = props.client;
  form.value = {
    name: c.name ?? "",
    email: c.email ?? "",
    phone_number: c.phone_number ?? "",
    tracking_id: c.tracking_id ?? "",
    date_of_birth: formatDateForInput(c.date_of_birth || c.dob),
    gender: c.gender ?? "Male",
    nationality: c.nationality ?? "",
    preferred_language: c.preferred_language ?? "English",
    country: c.country ?? "",
    state: c.state ?? "",
    city: c.city ?? "",
    address: c.address ?? "",
    zip_code: c.zip_code ?? c.postal_code ?? "",
  };
};

watch(
  () => [props.open, props.client],
  ([isOpen]) => {
    if (isOpen) {
      populateForm();
    }
  },
  { immediate: true, deep: true },
);

const isValid = computed(() => {
  return (
    form.value.name &&
    form.value.name.trim().length > 0 &&
    form.value.email &&
    form.value.email.trim().length > 0
  );
});

const handleSubmit = () => {
  if (!canEdit.value || !isValid.value) return;
  const clientId = props.client?.id;
  if (!clientId) return;

  const payload = {
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    phone_number: form.value.phone_number?.trim() || null,
    tracking_id: form.value.tracking_id?.trim() || null,
    date_of_birth: form.value.date_of_birth || null,
    gender: form.value.gender || null,
    nationality: form.value.nationality?.trim() || null,
    preferred_language: form.value.preferred_language?.trim() || null,
    country: form.value.country || null,
    state: form.value.state?.trim() || null,
    city: form.value.city?.trim() || null,
    address: form.value.address?.trim() || null,
    zip_code: form.value.zip_code?.trim() || null,
  };

  clientDepthStore.updateClientProfile(clientId, payload, (err, res) => {
    if (!err) {
      const updatedClient = {
        ...props.client,
        ...payload,
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
