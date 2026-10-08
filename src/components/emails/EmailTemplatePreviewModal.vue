<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-hidden"
      @click="emit('close')"
    >
      <div
        class="bg-card-background rounded-2xl border border-primary-border w-full max-w-5xl h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        @click.stop
      >
        <!-- Modal Header -->
        <div
          class="px-5 py-3.5 border-b border-primary-border flex flex-wrap items-center justify-between gap-3 bg-card-background/80 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0"
            >
              <Mail class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-primary-text tracking-tight">
                  {{ log?.tag || "Email Template Preview" }}
                </h2>
                <span
                  class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  Campaign #{{ log?.campaign_id }}
                </span>
              </div>
              <p class="text-xs text-secondary-text mt-0.5 flex items-center gap-3 flex-wrap">
                <span v-if="log?.last_sent_at" class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" /> Last sent: {{ formatDate(log.last_sent_at) }}
                </span>
                <span v-if="log?.total_emails !== undefined" class="flex items-center gap-1">
                  <Send class="w-3.5 h-3.5" /> Total Emails: {{ log.total_emails }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="log?.campaign_id"
              @click="handleViewLogs"
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Sent Logs</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-xl border border-primary-border hover:bg-background transition-colors text-secondary-text hover:text-primary-text cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Toolbar / View Controls -->
        <div
          class="px-5 py-2.5 border-b border-primary-border flex flex-wrap items-center justify-between gap-3 bg-background/50 shrink-0"
        >
          <!-- Left: Tab Switcher (Visual Preview, Raw HTML, Variables) -->
          <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1">
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
              <span>Visual Preview</span>
            </button>
            <button
              @click="activeTab = 'code'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="
                activeTab === 'code'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <Code class="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
            <button
              @click="activeTab = 'variables'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="
                activeTab === 'variables'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <Braces class="w-3.5 h-3.5" />
              <span>Variables ({{ extractedVariables.length }})</span>
            </button>
          </div>

          <!-- Right: Device Mode Switcher (only in preview mode) & Copy HTML -->
          <div class="flex items-center gap-2">
            <div
              v-if="activeTab === 'preview'"
              class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1"
            >
              <Tooltip text="Desktop View" placement="top">
                <button
                  @click="deviceMode = 'desktop'"
                  class="p-1.5 rounded-md text-xs transition-colors cursor-pointer"
                  :class="
                    deviceMode === 'desktop'
                      ? 'bg-primary/20 text-primary'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                >
                  <Monitor class="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Tablet View" placement="top">
                <button
                  @click="deviceMode = 'tablet'"
                  class="p-1.5 rounded-md text-xs transition-colors cursor-pointer"
                  :class="
                    deviceMode === 'tablet'
                      ? 'bg-primary/20 text-primary'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                >
                  <Tablet class="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Mobile View" placement="top">
                <button
                  @click="deviceMode = 'mobile'"
                  class="p-1.5 rounded-md text-xs transition-colors cursor-pointer"
                  :class="
                    deviceMode === 'mobile'
                      ? 'bg-primary/20 text-primary'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                >
                  <Smartphone class="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            <!-- Copy Code Button -->
            <button
              @click="copyHtml"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-green-500" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copied ? "Copied HTML!" : "Copy HTML" }}</span>
            </button>
          </div>
        </div>

        <!-- Main Body Content -->
        <div class="flex-1 overflow-hidden bg-background/60 relative p-4 flex flex-col items-center justify-center">
          <!-- 1. Visual Preview Tab -->
          <div
            v-if="activeTab === 'preview'"
            class="w-full h-full flex items-center justify-center transition-all duration-300 overflow-hidden"
          >
            <div
              class="h-full transition-all duration-300 flex flex-col bg-white rounded-xl border border-primary-border shadow-lg overflow-hidden"
              :class="{
                'w-full max-w-full': deviceMode === 'desktop',
                'w-[768px] max-w-full': deviceMode === 'tablet',
                'w-[375px] max-w-full': deviceMode === 'mobile',
              }"
            >
              <!-- Mobile Phone Frame Header if Mobile Mode -->
              <div
                v-if="deviceMode === 'mobile'"
                class="bg-slate-900 text-white text-[10px] px-4 py-1.5 flex items-center justify-between shrink-0 font-sans"
              >
                <span>9:41</span>
                <div class="w-16 h-3 bg-black rounded-full mx-auto" />
                <div class="flex items-center gap-1">
                  <span>5G</span>
                  <div class="w-3 h-2 bg-white rounded-xs" />
                </div>
              </div>

              <!-- Real-time HTML Body iframe -->
              <div class="flex-1 w-full h-full overflow-hidden">
                <RenderHTMLBody :htmlContent="log?.body_html || ''" />
              </div>
            </div>
          </div>

          <!-- 2. Raw HTML Source Code Tab -->
          <div
            v-else-if="activeTab === 'code'"
            class="w-full h-full overflow-auto bg-slate-950 text-slate-200 p-4 rounded-xl border border-primary-border font-mono text-xs leading-relaxed"
          >
            <pre class="whitespace-pre-wrap break-all">{{ log?.body_html }}</pre>
          </div>

          <!-- 3. Variables Extractor Tab -->
          <div
            v-else-if="activeTab === 'variables'"
            class="w-full h-full overflow-y-auto p-4 bg-card-background border border-primary-border rounded-xl space-y-4"
          >
            <div>
              <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
                <Braces class="w-4 h-4 text-primary" />
                Dynamic Variables Detected
              </h3>
              <p class="text-xs text-secondary-text mt-1">
                These variables are dynamically replaced by backend data before sending the email.
              </p>
            </div>

            <div v-if="extractedVariables.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="varName in extractedVariables"
                :key="varName"
                class="flex items-center gap-2 p-3 rounded-xl bg-background border border-primary-border"
              >
                <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0">
                  {}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-mono font-semibold text-primary-text truncate">
                    &#123;&#123;{{ varName }}&#125;&#125;
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    Variable Token
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center text-xs text-secondary-text">
              No template variables (e.g. &#123;&#123;variable&#125;&#125;) were found in this template.
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-5 py-3 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
          <p class="text-xs text-secondary-text">
            Tag: <span class="font-semibold text-primary-text">{{ log?.tag }}</span>
          </p>

          <div class="flex items-center gap-2">
            <button
              v-if="log?.campaign_id"
              @click="handleViewLogs"
              class="sm:hidden flex items-center gap-1 px-3 py-2 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Logs</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
            <button
              class="px-4 py-2 text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text rounded-lg transition-colors cursor-pointer"
              @click="emit('close')"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  X,
  Mail,
  Eye,
  Code,
  Braces,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Clock,
  Send,
  ChevronRight,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import RenderHTMLBody from "@/components/emails/RenderHTMLBody.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { formatDate } from "@/utils/timeFormatter";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: null },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const snackbar = useSnackbarStore();

const activeTab = ref("preview"); // 'preview' | 'code' | 'variables'
const deviceMode = ref("desktop"); // 'desktop' | 'tablet' | 'mobile'
const copied = ref(false);

const extractedVariables = computed(() => {
  if (!props.log?.body_html) return [];
  const matches =
    props.log.body_html.match(/{{(.*?)}}/g)?.map((item) =>
      item.replace("{{", "").replace("}}", "").trim()
    ) || [];
  return [...new Set(matches)];
});

const copyHtml = () => {
  if (!props.log?.body_html) return;
  navigator.clipboard.writeText(props.log.body_html);
  copied.value = true;
  snackbar.show("HTML code copied to clipboard!", "success");
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const handleViewLogs = () => {
  if (props.log?.campaign_id) {
    emit("close");
    router.push({
      name: "email-logs-details",
      params: { tagId: props.log.campaign_id },
    });
  }
};
</script>
