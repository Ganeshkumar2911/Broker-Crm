<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300"
    @click="closeDialog"
  >
    <div
      class="h-[90vh] flex flex-col no-scrollbar bg-card-background rounded-2xl border border-primary-border w-full lg:max-w-[70vw] shadow-2xl overflow-hidden overflow-y-auto transform scale-100 transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 h-[10%] py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold text-primary-text">
            {{ props.title || "Make Introducing Broker (IB)" }}
          </h2>
        </div>
        <button
          class="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div
        class="flex-1 px-6 py-5 overflow-hidden space-y-4 bg-card-background"
      >
        <!-- Loading State -->
        <div
          v-if="store.isLoadingLogs"
          class="h-full flex items-center justify-center bg-background border border-primary-border rounded-xl px-4 py-3"
        >
          <div class="flex flex-col items-center gap-2">
            <Loader2 class="w-6 h-6 animate-spin text-primary" />
            <span class="text-xs text-secondary-text">Loading Details...</span>
          </div>
        </div>

        <div v-else class="space-y-4 h-full">
          <div
            v-if="store.logDetails"
            class="grid grid-cols-2 gap-4 h-full min-h-0"
          >
            <div
              class="flex flex-col gap-4 h-full border border-primary-border rounded-xl p-4"
            >
              <!-- Example check -->
              <div class="shrink-0 space-y-2">
                <h2 class="font-semibold">Details</h2>
                <div class="space-y-2">
                  <div>
                    <p class="text-xs font-medium text-secondary-text">
                      Sent On
                    </p>
                    <p class="text-primary-text text-sm">
                      {{ formatDate(store.logDetails?.date) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-secondary-text">
                      Sender (from)
                    </p>
                    <p class="text-primary-text text-sm">
                      {{ store.logDetails?.from }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-secondary-text">
                      Recipient (to)
                    </p>
                    <p class="text-primary-text text-sm">
                      {{ store.logDetails?.email }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-secondary-text">
                      Message ID
                    </p>
                    <p class="text-primary-text text-sm">
                      {{ store.logDetails?.messageId }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex-1 min-h-0">
                <RenderHTMLBody :htmlContent="store.logDetails?.body || ''" />
              </div>
            </div>

            <!-- History -->
            <div class="border border-primary-border rounded-xl p-5">
              <h2 class="font-semibold text-primary-text mb-5">History</h2>

              <div class="relative">
                <div
                  v-for="(event, index) in formattedEvents"
                  :key="index"
                  class="relative flex gap-4 pb-8 last:pb-0"
                >
                  <!-- Vertical Line -->
                  <div
                    v-if="index !== formattedEvents.length - 1"
                    class="absolute left-[18px] top-10 w-px h-full bg-primary-border"
                  ></div>

                  <!-- Icon -->
                  <div
                    class="relative z-10 w-9 h-9 rounded-full flex items-center justify-center"
                    :class="event.bg"
                  >
                    <component
                      :is="event.icon"
                      class="w-4 h-4"
                      :class="event.iconColor"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1">
                    <h3
                      class="text-sm font-semibold text-primary-text capitalize"
                    >
                      {{ event.label }}
                    </h3>

                    <p
                      v-if="event.ip"
                      class="text-xs text-secondary-text mt-0.5"
                    >
                      {{ event.ip }}
                    </p>

                    <p class="text-xs text-secondary-text mt-1">
                      {{ formatDate(event.time) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-secondary-text text-center py-4">
            No details found.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { X, Loader2, UserPlus } from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import RenderHTMLBody from "@/pages/e-mails/RenderHTMLBody.vue";
import {
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
  Eye,
} from "lucide-vue-next";

import { formatDate } from "@/utils/timeFormatter";

const eventConfig = {
  sent: {
    label: "Sent",
    icon: Send,
    bg: "bg-gray-100",
    iconColor: "text-gray-700",
  },

  delivered: {
    label: "Delivered",
    icon: PackageCheck,
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },

  open: {
    label: "Opened",
    icon: MailOpen,
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },

  clicks: {
    label: "Clicks",
    icon: MousePointerClick,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },

  spam: {
    label: "Spam",
    icon: ShieldAlert,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },

  requests: {
    label: "Requests",
    icon: CircleAlert,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
  },

  failed: {
    label: "Failed",
    icon: AlertTriangle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  soft_bounced: {
    label: "Soft Bounced",
    icon: MailWarning,
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
  },

  bounced: {
    label: "Bounced",
    icon: MailX,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  hard_bounced: {
    label: "Hard Bounced",
    icon: Ban,
    bg: "bg-red-200",
    iconColor: "text-red-700",
  },

  loaded_by_proxy: {
    label: "Loaded By Proxy",
    icon: Eye,
    bg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },

  error: {
    label: "Error",
    icon: AlertTriangle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },

  unsubscribed: {
    label: "Unsubscribed",
    icon: UserX,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
  },

  blocked: {
    label: "Blocked",
    icon: ShieldX,
    bg: "bg-slate-200",
    iconColor: "text-slate-700",
  },

  deferred: {
    label: "Deferred",
    icon: Clock3,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
  },

  invalid_email: {
    label: "Invalid Email",
    icon: MailX,
    bg: "bg-pink-100",
    iconColor: "text-pink-600",
  },

  complaint: {
    label: "Complaint",
    icon: ShieldAlert,
    bg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
};

const props = defineProps({
  open: { type: Boolean, default: false },
  id: { type: String, default: "" },
  title: { type: String, default: "View Email Log" },
});

const store = useEmailLogsStore();
const emit = defineEmits(["close", "success"]);

const isSubmitting = ref(false);

const closeDialog = () => {
  emit("close");
};

const formattedEvents = computed(() => {
  return (store.logDetails?.events || []).map((item) => {
    const config = eventConfig[item.name] || {
      label: item.name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: CircleAlert,
      bg: "bg-gray-100",
      iconColor: "text-gray-600",
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
      console.log("Fetching details for ID:", newId);
      await store.fetchLogsDetails(newId);
    }
  },
  { immediate: true },
);
</script>
