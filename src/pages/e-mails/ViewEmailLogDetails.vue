<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-all duration-300"
      @click="closeDialog"
    >
      <div
        class="bg-card-background border-l border-primary-border w-full max-w-2xl h-full shadow-2xl flex flex-col transform transition-all duration-300 overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background/90 shrink-0 gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
            >
              <Mail class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-bold text-primary-text truncate">
                {{ store.viewLogsDetaisl?.subject || props.title || "Email Dispatch Details" }}
              </h2>
              <p class="text-xs text-secondary-text truncate mt-0.5 flex items-center gap-1.5">
                <span>To: <strong class="text-primary-text font-mono">{{ store.viewLogsDetaisl?.email || '—' }}</strong></span>
              </p>
            </div>
          </div>

          <button
            class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-xl border border-primary-border hover:bg-background transition-colors text-secondary-text hover:text-primary-text shrink-0"
            @click="closeDialog"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Toolbar View Switcher -->
        <div
          class="px-6 py-2.5 border-b border-primary-border flex items-center justify-between gap-3 bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1">
            <button
              @click="activeTab = 'timeline'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="
                activeTab === 'timeline'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <Clock class="w-3.5 h-3.5" />
              <span>Event Timeline & Info</span>
            </button>

            <button
              @click="activeTab = 'preview'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="
                activeTab === 'preview'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Email Content</span>
            </button>
          </div>

        
          <div class="flex items-center gap-2">
            <button
              v-if="store.viewLogsDetaisl?.messageId"
              @click="copyText(store.viewLogsDetaisl.messageId, 'Message ID')"
              class="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background border border-primary-border rounded-lg transition-colors cursor-pointer"
            >
              <Copy class="w-3 h-3" />
              <span>Copy Message ID</span>
            </button>
          </div>
        </div>

       
        <div class="flex-1 overflow-y-auto p-6 bg-card-background">
          <!-- Loading State -->
          <div
            v-if="store.isLoadingEmailViewLogsDetails"
            class="space-y-4 py-8"
          >
            <div
              v-for="n in 3"
              :key="n"
              class="bg-background border border-primary-border rounded-xl p-5 animate-pulse space-y-3"
            >
              <div class="h-4 w-1/3 bg-card-background rounded" />
              <div class="h-3 w-2/3 bg-card-background rounded" />
              <div class="h-3 w-1/2 bg-card-background rounded" />
            </div>
          </div>

          <!-- Content Ready State -->
          <div v-else-if="store.viewLogsDetaisl" class="space-y-6">
            <!-- TAB 1: EVENT TIMELINE & METADATA -->
            <template v-if="activeTab === 'timeline'">
              <!-- Metadata Overview Grid Card -->
              <div class="border border-primary-border rounded-2xl p-5 bg-background/50 space-y-4 shadow-xs">
                <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-2">
                  <FileText class="w-4 h-4 text-primary" />
                  Dispatch Metadata
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-secondary-text block mb-1">Subject</span>
                    <span class="font-semibold text-primary-text block truncate" :title="store.viewLogsDetaisl.subject">
                      {{ store.viewLogsDetaisl.subject || '—' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-secondary-text block mb-1">Sent Date</span>
                    <span class="font-medium text-primary-text block">
                      {{ formatDate(store.viewLogsDetaisl.date) }}
                    </span>
                  </div>

                  <div>
                    <span class="text-secondary-text block mb-1">Recipient (To)</span>
                    <span class="font-mono text-primary-text block truncate" :title="store.viewLogsDetaisl.email">
                      {{ store.viewLogsDetaisl.email || '—' }}
                    </span>
                  </div>

                  <div>
                    <span class="text-secondary-text block mb-1">Sender (From)</span>
                    <span class="font-mono text-primary-text block truncate" :title="store.viewLogsDetaisl.from">
                      {{ store.viewLogsDetaisl.from || '—' }}
                    </span>
                  </div>

                  <div class="sm:col-span-2">
                    <span class="text-secondary-text block mb-1">Message ID</span>
                    <div class="flex items-center gap-2">
                      <code class="px-2 py-1 rounded bg-card-background border border-primary-border text-[11px] font-mono text-primary-text break-all">
                        {{ store.viewLogsDetaisl.messageId }}
                      </code>
                      <button
                        @click="copyText(store.viewLogsDetaisl.messageId, 'Message ID')"
                        class="p-1 text-secondary-text hover:text-primary-text cursor-pointer shrink-0"
                      >
                        <Copy class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- History Timeline Card -->
              <div class="border border-primary-border rounded-2xl p-5 bg-card-background shadow-xs space-y-4">
                <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-2">
                  <Clock class="w-4 h-4 text-primary" />
                  Delivery Tracking History
                </h3>

                <div v-if="formattedEvents.length" class="relative pl-2 pt-2">
                  <div
                    v-for="(event, index) in formattedEvents"
                    :key="index"
                    class="relative flex gap-4 pb-7 last:pb-0"
                  >
                    <!-- Vertical Connector Line -->
                    <div
                      v-if="index !== formattedEvents.length - 1"
                      class="absolute left-4.25 top-9 w-0.5 h-full bg-primary-border"
                    />

                    <!-- Event Icon Circle -->
                    <div
                      class="relative z-10 w-9 h-9 rounded-full flex items-center justify-center border border-primary-border shrink-0 shadow-xs"
                      :class="event.bg"
                    >
                      <component
                        :is="event.icon"
                        class="w-4 h-4"
                        :class="event.iconColor"
                      />
                    </div>

                    <!-- Event Details -->
                    <div class="flex-1 min-w-0 pt-0.5">
                      <div class="flex items-center justify-between gap-2">
                        <h4 class="text-xs font-bold text-primary-text capitalize">
                          {{ event.label }}
                        </h4>
                        <span class="text-[11px] text-secondary-text font-mono">
                          {{ formatDate(event.time) }}
                        </span>
                      </div>

                      <p v-if="event.ip" class="text-[11px] text-secondary-text mt-0.5 flex items-center gap-1">
                        <Globe class="w-3 h-3" /> IP: {{ event.ip }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-else class="py-8 text-center text-xs text-secondary-text">
                  No tracking events recorded for this message.
                </div>
              </div>
            </template>

            <!-- TAB 2: EMAIL HTML BODY PREVIEW -->
            <template v-else-if="activeTab === 'preview'">
              <div class="border border-primary-border rounded-2xl overflow-hidden bg-white shadow-lg h-187.5 flex flex-col">
                <div class="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800 flex items-center justify-between font-mono shrink-0">
                  <span class="truncate">To: {{ store.viewLogsDetaisl.email }}</span>
                  <span class="text-[10px] text-slate-400">Sandboxed Email Viewer</span>
                </div>
                <div class="flex-1 w-full h-full overflow-hidden">
                  <RenderHTMLBody :htmlContent="store.viewLogsDetaisl?.body || ''" />
                </div>
              </div>
            </template>
          </div>

          <!-- Empty State -->
          <div v-else class="py-16 text-center text-xs text-secondary-text space-y-2">
            <Mail class="w-10 h-10 mx-auto text-secondary-text/50" />
            <p class="font-semibold text-primary-text">No message details found</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  X,
  Mail,
  Eye,
  Clock,
  FileText,
  Copy,
  Globe,
  Send,
  PackageCheck,
  MailOpen,
  MousePointerClick,
  ShieldAlert,
  CircleAlert,
  AlertTriangle,
  Ban,
  MailWarning,
  MailX,
  Clock3,
  UserX,
  ShieldX,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import RenderHTMLBody from "@/components/emails/RenderHTMLBody.vue";
import { formatDate } from "@/utils/timeFormatter";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  id: { type: String, default: "" },
  title: { type: String, default: "Email Dispatch Details" },
});

const emit = defineEmits(["close", "success"]);
const store = useEmailLogsStore();
const snackbar = useSnackbarStore();

const activeTab = ref("timeline"); // 'timeline' | 'preview'

const closeDialog = () => {
  emit("close");
};

const copyText = (text, label = "Text") => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show(`${label} copied to clipboard!`, "success");
};

const eventConfig = {
  sent: {
    label: "Sent",
    icon: Send,
    bg: "bg-blue-500/10 text-blue-500",
    iconColor: "text-blue-500",
  },
  delivered: {
    label: "Delivered to Inbox",
    icon: PackageCheck,
    bg: "bg-indigo-500/10 text-indigo-500",
    iconColor: "text-indigo-500",
  },
  open: {
    label: "Opened by Recipient",
    icon: MailOpen,
    bg: "bg-green-500/10 text-green-500",
    iconColor: "text-green-500",
  },
  opened: {
    label: "Opened by Recipient",
    icon: MailOpen,
    bg: "bg-green-500/10 text-green-500",
    iconColor: "text-green-500",
  },
  clicks: {
    label: "Link Clicked",
    icon: MousePointerClick,
    bg: "bg-sky-500/10 text-sky-500",
    iconColor: "text-sky-500",
  },
  spam: {
    label: "Marked as Spam",
    icon: ShieldAlert,
    bg: "bg-yellow-500/10 text-yellow-500",
    iconColor: "text-yellow-500",
  },
  failed: {
    label: "Delivery Failed",
    icon: AlertTriangle,
    bg: "bg-red-500/10 text-red-500",
    iconColor: "text-red-500",
  },
  soft_bounced: {
    label: "Soft Bounced",
    icon: MailWarning,
    bg: "bg-orange-500/10 text-orange-500",
    iconColor: "text-orange-500",
  },
  bounced: {
    label: "Hard Bounced",
    icon: MailX,
    bg: "bg-red-500/10 text-red-500",
    iconColor: "text-red-500",
  },
};

const formattedEvents = computed(() => {
  return (store.viewLogsDetaisl?.events || [])?.map((item) => {
    const key = item.name?.toLowerCase();
    const config = eventConfig[key] || {
      label: item.name
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: CircleAlert,
      bg: "bg-gray-500/10 text-gray-500",
      iconColor: "text-gray-500",
    };

    return {
      ...item,
      ...config,
      ip: item.ip || null,
    };
  });
});

watch(
  () => [props.open, props.id],
  async ([newOpen, newId]) => {
    if (newOpen && newId) {
      activeTab.value = "timeline";
      await store.fetchViewLogsDetails(newId);
    }
  },
  { immediate: true }
);
</script>
