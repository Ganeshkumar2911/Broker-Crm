<script setup>
import { ref, reactive, watch } from "vue";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import { useClientLedgerStore } from "@/stores/clientLedger/clientLedger";
import { X, Send, Bell, Edit3, Loader2, Plus, Trash2 } from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";

const typeOptions = [
  { label: "Announcement", value: "ANNOUNCEMENT" },
  { label: "System Alert", value: "SYSTEM" },
  { label: "Promotion", value: "PROMOTION" },
  { label: "Critical Alert", value: "ALERT" },
];

const priorityOptions = [
  { label: "High Priority", value: "HIGH" },
  { label: "Medium Priority", value: "MEDIUM" },
  { label: "Low Priority", value: "LOW" },
];

const props = defineProps({
  open: { type: Boolean, default: false },
  notificationToEdit: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const store = useNotificationsStore();
const clientLedgerStore = useClientLedgerStore();

const clientOptions = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

const selectedUsers = ref([]);
const selectedUserSelect = ref(null);

const form = reactive({
  title: "",
  message: "",
  note: "",
  type: "ANNOUNCEMENT",
  priority: "HIGH",
  action_url: "",
  image_url: "",
  metadataPairs: [{ key: "", value: "" }],
  sendToAll: true,
  roles: {
    client: false,
    fm: false,
    ib: false,
    admin: false,
  },
  userIds: "",
});

function addMetadataPair() {
  form.metadataPairs.push({ key: "", value: "" });
}

function removeMetadataPair(index) {
  if (form.metadataPairs.length > 1) {
    form.metadataPairs.splice(index, 1);
  } else {
    form.metadataPairs[0] = { key: "", value: "" };
  }
}

function onClientSearch(query) {
  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await clientLedgerStore.fetchAllClients(query || "");
      clientOptions.value = results;
    } catch (err) {
      clientOptions.value = [];
    } finally {
      isSearchingClients.value = false;
    }
  }, 250);
}

function handleUserSelect(val) {
  if (!val) return;
  const found = clientOptions.value.find((o) => o.value === val);
  if (found) {
    if (!selectedUsers.value.some((u) => u.id === found.value)) {
      selectedUsers.value.push({
        id: found.value,
        name: found.label,
        email: found.email || "",
      });
    }
  }
  selectedUserSelect.value = null;
}

function removeUser(userId) {
  selectedUsers.value = selectedUsers.value.filter(
    (u) => String(u.id) !== String(userId),
  );
}

function populateForm(notification) {
  if (!notification) {
    resetForm();
    return;
  }

  form.title = notification.title || "";
  form.message = notification.message || "";
  form.note = notification.note || "";
  form.type = notification.type || "ANNOUNCEMENT";
  form.priority = notification.priority || "HIGH";
  form.action_url = notification.action_url || "";
  form.image_url = notification.image_url || "";

  // Metadata JSON
  if (
    notification.metadata_json &&
    typeof notification.metadata_json === "object"
  ) {
    const entries = Object.entries(notification.metadata_json);
    if (entries.length > 0) {
      form.metadataPairs = entries.map(([k, v]) => ({
        key: k,
        value: String(v ?? ""),
      }));
    } else {
      form.metadataPairs = [{ key: "", value: "" }];
    }
  } else {
    form.metadataPairs = [{ key: "", value: "" }];
  }

  // Targets
  form.roles.client = false;
  form.roles.fm = false;
  form.roles.ib = false;
  form.roles.admin = false;
  selectedUsers.value = [];
  form.userIds = "";

  const targets = notification.targets || [];
  const hasAll = targets.some((t) => t.target_type === "ALL");

  if (hasAll || targets.length === 0) {
    form.sendToAll = true;
  } else {
    form.sendToAll = false;

    targets.forEach((t) => {
      if (t.target_type === "ROLE" && t.target_id) {
        const roleKey = String(t.target_id).toLowerCase();
        if (roleKey in form.roles) {
          form.roles[roleKey] = true;
        }
      } else if (t.target_type === "USER" && t.target_id) {
        selectedUsers.value.push({
          id: String(t.target_id),
          name: `User #${t.target_id}`,
          email: "",
        });
      }
    });
  }
}

watch(
  () => [props.open, props.notificationToEdit],
  ([isOpen, editObj]) => {
    if (isOpen) {
      onClientSearch("");
      if (editObj) {
        populateForm(editObj);
      } else {
        resetForm();
      }
    }
  },
  { immediate: true },
);

function resetForm() {
  form.title = "";
  form.message = "";
  form.note = "";
  form.type = "ANNOUNCEMENT";
  form.priority = "HIGH";
  form.action_url = "";
  form.image_url = "";
  form.metadataPairs = [{ key: "", value: "" }];
  form.sendToAll = true;
  form.roles.client = false;
  form.roles.fm = false;
  form.roles.ib = false;
  form.roles.admin = false;
  form.userIds = "";
  selectedUsers.value = [];
  selectedUserSelect.value = null;
}

function handleSubmit() {
  if (!form.title.trim() || !form.message.trim()) return;

  // Build target list according to API spec
  const targets = [];

  if (form.sendToAll) {
    targets.push({ target_type: "ALL" });
  } else {
    // Add selected roles
    Object.entries(form.roles).forEach(([roleName, isSelected]) => {
      if (isSelected) {
        targets.push({
          target_type: "ROLE",
          target_id: roleName === "admin" ? "staff" : roleName,
        });
      }
    });

    // Add selected users from multi-select search
    selectedUsers.value.forEach((u) => {
      targets.push({ target_type: "USER", target_id: String(u.id) });
    });

    // Add specific user IDs from text input if provided
    if (form.userIds.trim()) {
      const ids = form.userIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      ids.forEach((id) => {
        if (
          !targets.some(
            (t) =>
              t.target_type === "USER" && String(t.target_id) === String(id),
          )
        ) {
          targets.push({ target_type: "USER", target_id: String(id) });
        }
      });
    }
  }

  // Fallback to ALL if no targets selected
  if (targets.length === 0) {
    targets.push({ target_type: "ALL" });
  }

  // Build metadata_json object from all valid key-value pairs
  let metadata_json = null;
  const validPairs = form.metadataPairs.filter(
    (p) => p.key.trim() && p.value.trim(),
  );
  if (validPairs.length > 0) {
    metadata_json = {};
    validPairs.forEach((p) => {
      metadata_json[p.key.trim()] = p.value.trim();
    });
  }

  const payload = {
    title: form.title.trim(),
    message: form.message.trim(),
    note: form.note.trim() || null,
    type: form.type,
    priority: form.priority,
    action_url: form.action_url.trim() || null,
    image_url: form.image_url.trim() || null,
    metadata_json,
    targets,
  };

  if (props.notificationToEdit && props.notificationToEdit.id) {
    store.updateNotification(props.notificationToEdit.id, payload, () => {
      resetForm();
      emit("close");
    });
  } else {
    store.createNotification(payload, () => {
      resetForm();
      emit("close");
    });
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="emit('close')"
      />
    </Transition>

    <!-- Side Panel Drawer -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[480px] bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary"
            >
              <Edit3 v-if="notificationToEdit" class="w-4 h-4" />
              <Bell v-else class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{
                  notificationToEdit
                    ? `Edit Notification #${notificationToEdit.id}`
                    : "Create & Dispatch Notification"
                }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{
                  notificationToEdit
                    ? "Update details for this notification draft."
                    : "Broadcast alerts or targeted memos to users."
                }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form
          @submit.prevent="handleSubmit"
          class="p-5 overflow-y-auto space-y-4 text-xs no-scrollbar flex-1 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <!-- Title & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-secondary-text font-medium mb-1"
                  >Title *</label
                >
                <input
                  v-model="form.title"
                  required
                  type="text"
                  placeholder="e.g. Scheduled System Maintenance"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-secondary-text font-medium mb-1"
                  >Type</label
                >
                <BaseSelect
                  v-model="form.type"
                  :options="typeOptions"
                  placeholder="Select Type"
                />
              </div>
            </div>

            <!-- Priority, Action URL & Image URL -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-secondary-text font-medium mb-1"
                  >Priority</label
                >
                <BaseSelect
                  v-model="form.priority"
                  :options="priorityOptions"
                  placeholder="Select Priority"
                />
              </div>

              <div>
                <label class="block text-secondary-text font-medium mb-1"
                  >Action URL (Optional)</label
                >
                <input
                  v-model="form.action_url"
                  type="url"
                  placeholder="https://example.com/status"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-secondary-text font-medium mb-1"
                >Image URL (Optional Attachment)</label
              >
              <input
                v-model="form.image_url"
                type="url"
                placeholder="https://example.com/banner.png"
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
              />
            </div>

            <!-- Message Body -->
            <div>
              <label class="block text-secondary-text font-medium mb-1"
                >Message Content *</label
              >
              <textarea
                v-model="form.message"
                required
                rows="3"
                placeholder="The system will undergo scheduled maintenance tonight at 12:00 AM UTC..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <!-- Internal Admin Note -->
            <div>
              <label class="block text-secondary-text font-medium mb-1"
                >Internal Admin Note (Hidden from Users)</label
              >
              <input
                v-model="form.note"
                type="text"
                placeholder="Internal memo for admin tracking..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary"
              />
            </div>

            <!-- Target Selection Box -->
            <div
              class="bg-background border border-primary-border rounded-lg p-3.5 space-y-3"
            >
              <span
                class="block text-xs font-semibold text-primary-text uppercase tracking-wider"
              >
                Target Recipients
              </span>

              <!-- All Radio -->
              <label
                class="flex items-center gap-2 cursor-pointer text-xs text-primary-text font-medium"
              >
                <input
                  type="checkbox"
                  v-model="form.sendToAll"
                  class="rounded bg-card-background border-primary-border text-primary focus:ring-0"
                />
                <span>Broadcast to ALL Users (Everyone)</span>
              </label>

              <!-- Targeted Options (if not All) -->
              <div
                v-if="!form.sendToAll"
                class="space-y-3.5 pt-2.5 border-t border-primary-border/60"
              >
                <div>
                  <span
                    class="block text-[11px] text-secondary-text mb-1.5 font-medium"
                    >Target Specific Roles:</span
                  >
                  <div class="flex flex-wrap items-center gap-3">
                    <label
                      class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="form.roles.client"
                        class="rounded text-primary focus:ring-0"
                      />
                      <span>Clients (`client`)</span>
                    </label>
                    <label
                      class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="form.roles.fm"
                        class="rounded text-primary focus:ring-0"
                      />
                      <span>Fund Managers (`fm`)</span>
                    </label>
                    <label
                      class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="form.roles.ib"
                        class="rounded text-primary focus:ring-0"
                      />
                      <span>IB Partners (`ib`)</span>
                    </label>
                    <label
                      class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="form.roles.admin"
                        class="rounded text-primary focus:ring-0"
                      />
                      <span>Admins (`admin`)</span>
                    </label>
                  </div>
                </div>

                <!-- Live User Search Multi-Select -->
                <div>
                  <label
                    class="block text-[11px] text-secondary-text mb-1 font-medium"
                  >
                    Search & Select Target Users (Multiple):
                  </label>
                  <BaseSelect
                    v-model="selectedUserSelect"
                    :options="clientOptions"
                    :isLoading="isSearchingClients"
                    placeholder="Search user by name or email..."
                    searchable
                    class="w-full"
                    :isShowMail="true"
                    @update:modelValue="handleUserSelect"
                    @search="onClientSearch"
                  />

                  <!-- Selected User Tags / Chips -->
                  <div
                    v-if="selectedUsers.length > 0"
                    class="flex flex-wrap gap-1.5 mt-2.5"
                  >
                    <span
                      v-for="u in selectedUsers"
                      :key="u.id"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      <span
                        >{{ u.name }}
                        <span class="text-[10px] opacity-75"
                          >(#{{ u.id }})</span
                        ></span
                      >
                      <button
                        type="button"
                        @click="removeUser(u.id)"
                        class="hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
                        title="Remove user"
                      >
                        <X class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Metadata Section (Dynamic Key-Value Pairs) -->
            <div
              class="bg-background border border-primary-border rounded-lg p-3.5 space-y-3"
            >
              <div
                class="flex items-center justify-between border-b border-primary-border/60 pb-2"
              >
                <span
                  class="block text-xs font-semibold text-primary-text uppercase tracking-wider"
                >
                  Custom Metadata (JSON Payload)
                </span>
                <button
                  type="button"
                  @click="addMetadataPair"
                  class="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Key-Value</span>
                </button>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(pair, index) in form.metadataPairs"
                  :key="index"
                  class="grid grid-cols-12 gap-2 items-center"
                >
                  <div class="col-span-5">
                    <input
                      v-model="pair.key"
                      type="text"
                      placeholder="Key (e.g. event_id)"
                      class="w-full px-2.5 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div class="col-span-6">
                    <input
                      v-model="pair.value"
                      type="text"
                      placeholder="Value (e.g. 1042)"
                      class="w-full px-2.5 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div class="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      @click="removeMetadataPair(index)"
                      class="p-1 rounded-lg text-secondary-text hover:text-rose-400 hover:bg-card-background transition-colors cursor-pointer"
                      title="Remove pair"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div
            class="pt-4 mt-4 border-t border-primary-border flex items-center justify-end gap-2 shrink-0"
          >
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="store.createLoading || store.updateLoadingId !== null"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Loader2
                v-if="store.createLoading || store.updateLoadingId !== null"
                class="w-3.5 h-3.5 animate-spin"
              />
              <Send v-else class="w-3.5 h-3.5" />
              <span>
                {{
                  notificationToEdit
                    ? store.updateLoadingId === notificationToEdit.id
                      ? "Updating..."
                      : "Update Notification"
                    : store.createLoading
                      ? "Creating..."
                      : "Create Notification"
                }}
              </span>
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
