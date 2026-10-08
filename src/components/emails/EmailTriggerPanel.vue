<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" />

      <!-- Panel -->
      <div
        class="w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              Send Email Manually
            </h2>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Send emails to clients using templates or custom content
            </p>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <!-- Tabs -->
          <div
            class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 w-fit mb-5"
          >
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="
                activeTab === tab.value
                  ? 'bg-primary text-btn-text-primary'
                  : 'text-secondary-text hover:text-primary-text'
              "
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- ── Tab 1: Use Existing Template ── -->
          <div v-if="activeTab === 'template'" class="space-y-5">
            <!-- toggle to shoot email to every one  -->

            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-primary-text">
                  Send to Targeted Group
                </p>
                <p class="text-[11px] text-secondary-text">
                  Send this email to targeted group.
                </p>
              </div>

              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="sendToAll"
                  type="checkbox"
                  class="sr-only peer"
                />

                <div
                  class="relative w-11 h-6 rounded-full bg-primary-border shadow-inner transition-colors duration-200 peer peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-md after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
                ></div>
              </label>
            </div>

            <div v-if="sendToAll" class="mb-4">
              <p class="text-xs text-secondary-text mb-1.5">Target Group</p>
              <BaseSelect
                v-model="sendToAllTarget"
                :options="targetOptions"
                placeholder="Select a group..."
              />
            </div>

            <!-- Recipients -->
            <div v-if="!sendToAll">
              <p class="text-xs text-secondary-text mb-1.5">Recipients</p>
              <div
                class="border border-primary-border rounded-xl bg-background min-h-[44px] px-3 py-2 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="r in store.selectedRecipients"
                  :key="r.email"
                  class="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-card-background border border-primary-border text-primary-text"
                >
                  {{ r.name }}
                  <span class="text-secondary-text">&lt;{{ r.email }}&gt;</span>
                  <button
                    class="ml-1 hover:text-primary-red transition-colors"
                    @click="removeRecipient(r)"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </span>
                <input
                  v-model="clientSearch"
                  type="text"
                  placeholder="Search clients..."
                  class="text-xs bg-transparent outline-none text-primary-text placeholder:text-secondary-text min-w-32 flex-1"
                  @input="onClientSearch"
                  @focus="showClientDrop = true"
                  @blur="closeClientDropdown"
                />
              </div>
              <div
                v-if="showClientDrop && store.clientOptions.length"
                class="relative"
              >
                <div
                  class="absolute z-30 w-full mt-1 bg-card-background border border-primary-border rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  <div
                    v-if="store.searchClientsLoading"
                    class="flex items-center gap-2 px-3 py-2.5"
                  >
                    <Loader2
                      class="w-3.5 h-3.5 animate-spin text-secondary-text"
                    />
                    <span class="text-xs text-secondary-text"
                      >Searching...</span
                    >
                  </div>
                  <div
                    v-for="c in store.clientOptions"
                    :key="c.id"
                    :class="[
                      'px-3 py-2.5 transition-colors',
                      isClientSelected(c)
                        ? 'opacity-50 cursor-not-allowed bg-background/50'
                        : 'hover:bg-background cursor-pointer',
                    ]"
                    @mousedown.prevent="!isClientSelected(c) && addRecipient(c)"
                  >
                    <p class="text-xs font-medium text-primary-text">
                      {{ c.name }}
                    </p>
                    <p class="text-[11px] text-secondary-text">{{ c.email }}</p>
                    <p
                      v-if="isClientSelected(c)"
                      class="text-[10px] text-secondary-text mt-0.5"
                    >
                      Already selected
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Search -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Template</p>
              <BaseSelect
                v-model="selectedTemplateId"
                :options="store.templateOptions"
                placeholder="Search and select a template..."
                searchable
                :isLoading="store.searchTemplatesLoading"
                @search="onTemplateSearch"
              />
            </div>

            <!-- Selected Template Preview -->
            <div
              v-if="store.selectedTemplate"
              class="bg-background border border-primary-border rounded-xl p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-primary-text">
                  {{ store.selectedTemplate.name }}
                </p>
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >{{ store.selectedTemplate.code }}</span
                  >
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text"
                    >{{ store.selectedTemplate.category }}</span
                  >
                </div>
              </div>
              <div>
                <p class="text-[10px] text-secondary-text mb-0.5">Subject</p>
                <p class="text-xs text-primary-text">
                  {{ store.selectedTemplate.subject }}
                </p>
              </div>
              <div v-if="store.selectedTemplate.available_variables?.length">
                <p class="text-[10px] text-secondary-text mb-1.5">Variables</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="v in store.selectedTemplate.available_variables"
                    :key="v"
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                    >{{ "\u007B\u007B" + v + "\u007D\u007D" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                v-if="store.selectedTemplate"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
                @click="
                  previewOpen = true;
                  previewData = {
                    subject: store.selectedTemplate.subject,
                    bodyHtml: store.selectedTemplate.body_html,
                  };
                "
              >
                <Eye class="w-3.5 h-3.5" /> Preview
              </button>
              <button
                :disabled="
                  store.sendLoading ||
                  (!sendToAll && !store.selectedRecipients.length) ||
                  (sendToAll && !sendToAllTarget) ||
                  !store.selectedTemplate
                "
                class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                @click="store.sendTemplateEmail(sendToAllTarget)"
              >
                <Loader2
                  v-if="store.sendLoading"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <Send v-else class="w-3.5 h-3.5" />
                {{ store.sendLoading ? "Sending..." : "Send Email" }}
              </button>
            </div>
          </div>

          <!-- ── Tab 2: Custom Email ── -->
          <div v-if="activeTab === 'custom'" class="space-y-5">
            <!-- toggle to shoot email to every one  -->

            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-primary-text">
                  Send to Targeted Group
                </p>
                <p class="text-[11px] text-secondary-text">
                  Send this email to targeted group.
                </p>
              </div>

              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="sendToAll"
                  type="checkbox"
                  class="sr-only peer"
                />

                <div
                  class="relative w-11 h-6 rounded-full bg-primary-border shadow-inner transition-colors duration-200 peer peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-md after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
                ></div>
              </label>
            </div>

            <div v-if="sendToAll" class="mb-4">
              <p class="text-xs text-secondary-text mb-1.5">Target Group</p>
              <BaseSelect
                v-model="sendToAllTarget"
                :options="targetOptions"
                placeholder="Select a group..."
              />
            </div>

            <!-- Recipients -->
            <div v-if="!sendToAll">
              <p class="text-xs text-secondary-text mb-1.5">Recipients</p>
              <div
                class="border border-primary-border rounded-xl bg-background min-h-[44px] px-3 py-2 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="r in store.selectedRecipients"
                  :key="r.email"
                  class="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-card-background border border-primary-border text-primary-text"
                >
                  {{ r.name }}
                  <span class="text-secondary-text">&lt;{{ r.email }}&gt;</span>
                  <button
                    class="ml-1 hover:text-primary-red transition-colors"
                    @click="removeRecipient(r)"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </span>
                <input
                  v-model="clientSearch"
                  type="text"
                  placeholder="Search clients..."
                  class="text-xs bg-transparent outline-none text-primary-text placeholder:text-secondary-text min-w-32 flex-1"
                  @input="onClientSearch"
                  @focus="showClientDrop = true"
                  @blur="closeClientDropdown"
                />
              </div>
              <div
                v-if="showClientDrop && store.clientOptions.length"
                class="relative"
              >
                <div
                  class="absolute z-30 w-full mt-1 bg-card-background border border-primary-border rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="c in store.clientOptions"
                    :key="c.id"
                    :class="[
                      'px-3 py-2.5 transition-colors',
                      isClientSelected(c)
                        ? 'opacity-50 cursor-not-allowed bg-background/50'
                        : 'hover:bg-background cursor-pointer',
                    ]"
                    @mousedown.prevent="!isClientSelected(c) && addRecipient(c)"
                  >
                    <p class="text-xs font-medium text-primary-text">
                      {{ c.name }}
                    </p>
                    <p class="text-[11px] text-secondary-text">{{ c.email }}</p>
                    <p
                      v-if="isClientSelected(c)"
                      class="text-[10px] text-secondary-text mt-0.5"
                    >
                      Already selected
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subject -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Subject</p>
              <input
                v-model="store.customEmail.subject"
                type="text"
                placeholder="Email subject line"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>

            <!-- Tag -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Tag</p>
              <input
                v-model="store.customEmail.tag"
                type="text"
                placeholder="Exp. YOUR_TAG"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>

            <!-- Body HTML -->
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Body HTML</p>
              <textarea
                v-model="store.customEmail.body_html"
                rows="10"
                placeholder="<h1>Hello {{name}}</h1><p>Your email is {{email}}</p>"
                class="w-full px-3 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-sm font-mono outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-y"
              />
              <div v-if="customVariables.length" class="mt-2">
                <p class="text-[11px] text-secondary-text mb-1.5">
                  Detected Variables
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="v in customVariables"
                    :key="v"
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                    >{{ "\u007B\u007B" + v + "\u007D\u007D" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                v-if="store.customEmail.body_html"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
                @click="
                  previewOpen = true;
                  previewData = {
                    subject: store.customEmail.subject,
                    bodyHtml: store.customEmail.body_html,
                  };
                "
              >
                <Eye class="w-3.5 h-3.5" /> Preview
              </button>
              <button
                :disabled="
                  store.sendLoading ||
                  (!sendToAll && !store.selectedRecipients.length) ||
                  (sendToAll && !sendToAllTarget) ||
                  !store.customEmail.subject ||
                  !store.customEmail.body_html ||
                  !store.customEmail.tag
                "
                class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                @click="store.sendCustomEmail(sendToAllTarget)"
              >
                <Loader2
                  v-if="store.sendLoading"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <Send v-else class="w-3.5 h-3.5" />
                {{ store.sendLoading ? "Sending..." : "Send Email" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Preview Dialog -->
  <EmailTemplatePreviewDialog
    :open="previewOpen"
    :template="
      previewData
        ? { subject: previewData.subject, body_html: previewData.bodyHtml }
        : null
    "
    @close="previewOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Search, Eye, Send, Loader2 } from "lucide-vue-next";
import { useEmailTriggerStore } from "@/stores/emails/emailTrigger";
import EmailTemplatePreviewDialog from "./EmailTemplatePreviewDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const store = useEmailTriggerStore();

const activeTab = ref("template");
const tabs = [
  { label: "Use Existing Template", value: "template" },
  { label: "Custom Email", value: "custom" },
];

const clientSearch = ref("");
const previewOpen = ref(false);
const previewData = ref(null);
const showClientDrop = ref(false);
const sendToAll = ref(false);
const sendToAllTarget = ref(null);

const targetOptions = [
  { label: "All Clients", value: "ALL" },
  { label: "Active Clients", value: "ACTIVE_CLIENTS" },
  { label: "Inactive Clients", value: "INACTIVE_CLIENTS" },
  { label: "All FM", value: "FM" },
  { label: "All IB", value: "IB" },
];

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      sendToAll.value = false;
      sendToAllTarget.value = null;
    }
  },
);

watch(sendToAll, (enabled) => {
  if (enabled) {
    store.selectedRecipients = [];
    clientSearch.value = "";
    showClientDrop.value = false;
    sendToAllTarget.value = null;
  } else {
    sendToAllTarget.value = null;
  }
});
const isClientSelected = (client) => {
  return store.selectedRecipients.some((r) => r.email === client.email);
};

const customVariables = computed(() =>
  store.parseVariables(store.customEmail?.body_html ?? ""),
);

const selectedTemplateId = computed({
  get: () => store.selectedTemplate?.id ?? null,
  set: (id) => {
    const template = store.templateOptions.find((t) => t.id === id);
    if (template) {
      store.selectedTemplate = template;
    }
  },
});

let clientTimer = null;
const onClientSearch = () => {
  showClientDrop.value = true;
  clearTimeout(clientTimer);
  clientTimer = setTimeout(() => {
    if (clientSearch.value.trim()) store.searchClients(clientSearch.value);
  }, 350);
};

let templateTimer = null;
const onTemplateSearch = (query) => {
  clearTimeout(templateTimer);
  templateTimer = setTimeout(() => {
    if (query?.trim()) store.searchTemplates(query);
  }, 350);
};

const addRecipient = (c) => {
  if (!store.selectedRecipients.find((r) => r.email === c.email)) {
    store.selectedRecipients.push({ name: c.name, email: c.email });
  }
  clientSearch.value = "";
  showClientDrop.value = false;
};

const removeRecipient = (r) => {
  const idx = store.selectedRecipients.findIndex((x) => x.email === r.email);
  if (idx !== -1) store.selectedRecipients.splice(idx, 1);
};

const closeClientDropdown = () => {
  setTimeout(() => (showClientDrop.value = false), 150);
};

const handleSendSuccess = () => {
  store.reset();
  emit("close");
};

store.setOnSuccessCallback(handleSendSuccess);
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
