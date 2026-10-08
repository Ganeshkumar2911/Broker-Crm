<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer" @click="emit('close')" />

        <!-- Panel -->
        <div
          class="relative z-10 w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden shadow-2xl"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background"
          >
            <div>
              <h2 class="text-sm font-semibold text-primary-text">
                Send Email to Client
              </h2>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Send a template or custom email directly to this client.
              </p>
            </div>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-secondary-text hover:text-primary-text cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 no-scrollbar space-y-4">
            <!-- Tabs (Template vs Custom) -->
            <div
              class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 w-fit"
            >
              <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
                :class="
                  activeTab === tab.value
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/50'
                "
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Client Recipient Card (Locked to Active Client) -->
            <div
              class="p-3.5 rounded-xl bg-background border border-primary-border flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold text-xs flex items-center justify-center shrink-0"
                >
                  {{ clientInitials }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-bold text-primary-text">
                      {{ client?.name || "Client" }}
                    </p>
                    <span
                      v-if="client?.id"
                      class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20"
                    >
                      #{{ client.id }}
                    </span>
                  </div>
                  <p class="text-[11px] text-secondary-text font-mono mt-0.5">
                    {{ client?.email || "No email available" }}
                  </p>
                </div>
              </div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-green/10 text-primary-green border border-primary-green/20"
              >
                Target Recipient
              </span>
            </div>

            <!-- ── Tab 1: Use Existing Template ── -->
            <div v-if="activeTab === 'template'" class="space-y-4 pt-1">
              <!-- Template Search / Select -->
              <div>
                <p class="text-xs font-medium text-secondary-text mb-1.5">
                  Select Email Template <span class="text-primary-red">*</span>
                </p>
                <BaseSelect
                  v-model="selectedTemplateId"
                  :options="store.templateOptions"
                  placeholder="Search and select a template..."
                  searchable
                  :isLoading="store.searchTemplatesLoading"
                  @search="onTemplateSearch"
                />
              </div>

              <!-- Selected Template Preview Box -->
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
                    >
                      {{ store.selectedTemplate.code }}
                    </span>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full bg-card-background border border-primary-border text-secondary-text"
                    >
                      {{ store.selectedTemplate.category }}
                    </span>
                  </div>
                </div>

                <div>
                  <p class="text-[10px] text-secondary-text mb-0.5">Subject</p>
                  <p class="text-xs text-primary-text font-medium">
                    {{ store.selectedTemplate.subject }}
                  </p>
                </div>

                <div v-if="store.selectedTemplate.available_variables?.length">
                  <p class="text-[10px] text-secondary-text mb-1.5">Template Variables</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="v in store.selectedTemplate.available_variables"
                      :key="v"
                      class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                    >
                      {{ "\u007B\u007B" + v + "\u007D\u007D" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  v-if="store.selectedTemplate"
                  type="button"
                  class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
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
                  type="button"
                  :disabled="store.sendLoading || !client?.email || !store.selectedTemplate"
                  class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  @click="sendTemplateEmailToClient"
                >
                  <Loader2
                    v-if="store.sendLoading"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <Send v-else class="w-3.5 h-3.5" />
                  <span>{{ store.sendLoading ? "Sending..." : "Send Email" }}</span>
                </button>
              </div>
            </div>

            <!-- ── Tab 2: Custom Email ── -->
            <div v-if="activeTab === 'custom'" class="space-y-4 pt-1">
              <!-- Subject -->
              <div>
                <p class="text-xs font-medium text-secondary-text mb-1.5">
                  Subject <span class="text-primary-red">*</span>
                </p>
                <input
                  v-model="store.customEmail.subject"
                  type="text"
                  placeholder="Email subject line"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition"
                />
              </div>

              <!-- Tag -->
              <div>
                <p class="text-xs font-medium text-secondary-text mb-1.5">
                  Tag <span class="text-primary-red">*</span>
                </p>
                <input
                  v-model="store.customEmail.tag"
                  type="text"
                  placeholder="e.g. CLIENT_NOTIFICATION, KYC_REQUEST"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition font-mono uppercase"
                />
              </div>

              <!-- Body HTML -->
              <div>
                <p class="text-xs font-medium text-secondary-text mb-1.5">
                  Body HTML <span class="text-primary-red">*</span>
                </p>
                <textarea
                  v-model="store.customEmail.body_html"
                  rows="8"
                  placeholder="<h1>Hello {{name}}</h1><p>Your client ID is #{{id}}</p>"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-primary-text text-xs font-mono outline-none focus:border-primary transition resize-y"
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
                    >
                      {{ "\u007B\u007B" + v + "\u007D\u007D" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-2">
                <button
                  v-if="store.customEmail.body_html"
                  type="button"
                  class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
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
                  type="button"
                  :disabled="
                    store.sendLoading ||
                    !client?.email ||
                    !store.customEmail.subject ||
                    !store.customEmail.body_html ||
                    !store.customEmail.tag
                  "
                  class="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  @click="sendCustomEmailToClient"
                >
                  <Loader2
                    v-if="store.sendLoading"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <Send v-else class="w-3.5 h-3.5" />
                  <span>{{ store.sendLoading ? "Sending..." : "Send Email" }}</span>
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
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, Eye, Send, Loader2 } from "lucide-vue-next";
import { useEmailTriggerStore } from "@/stores/emails/emailTrigger";
import EmailTemplatePreviewDialog from "@/components/emails/EmailTemplatePreviewDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close"]);

const store = useEmailTriggerStore();

const activeTab = ref("template");
const tabs = [
  { label: "Use Existing Template", value: "template" },
  { label: "Custom Email", value: "custom" },
];

const previewOpen = ref(false);
const previewData = ref(null);

const clientInitials = computed(() => {
  const n = props.client?.name || "";
  return n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CL";
});

const ensureClientInRecipients = () => {
  if (props.client?.email) {
    store.selectedRecipients = [
      {
        name: props.client.name || "Client",
        email: props.client.email,
        id: props.client.id,
      },
    ];
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      ensureClientInRecipients();
      if (!store.templateOptions?.length) {
        store.searchTemplates("");
      }
    } else {
      store.reset();
    }
  },
  { immediate: true },
);

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

let templateTimer = null;
const onTemplateSearch = (query) => {
  clearTimeout(templateTimer);
  templateTimer = setTimeout(() => {
    if (query !== undefined) store.searchTemplates(query);
  }, 350);
};

const sendTemplateEmailToClient = () => {
  ensureClientInRecipients();
  store.sendTemplateEmail(null);
};

const sendCustomEmailToClient = () => {
  ensureClientInRecipients();
  store.sendCustomEmail(null);
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
