<template>
  <div class="min-h-screen bg-background">
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div v-if="hasPermission('telegram.create')">
          <button
            type="button"
            @click="store.openAdd()"
            class="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Add Telegram Bot</span>
          </button>
        </div>
      </div>

      <!-- Action Toolbar -->
      <div
        v-if="!store.isLoading && store.data && store.data.length > 0"
        class="bg-card-background/60 border border-primary-border rounded-lg p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <!-- Search Bar -->
        <div class="relative w-full sm:w-72 md:w-80">
          <Search
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search By Username..."
            class="w-full bg-background border border-primary-border rounded-lg pl-9 pr-8 py-2 text-xs text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
            title="Clear search"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2.5">
          <span
            class="text-[11px] font-medium text-secondary-text px-2.5 py-1 rounded-lg bg-background border border-primary-border/60"
          >
            {{ filteredBots.length }} of {{ store.data.length }} Bots
          </span>
          <button
            type="button"
            @click="refreshData"
            :disabled="store.isLoading"
            class="w-8 h-8 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Refresh Settings"
          >
            <RotateCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.isLoading }"
            />
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div
        v-if="store.isLoading"
        class="w-full border border-primary-border bg-card-background/40 rounded-2xl overflow-hidden p-6 space-y-4"
      >
        <div
          v-for="n in 5"
          :key="n"
          class="h-12 bg-background/60 animate-pulse rounded-lg"
        />
      </div>

      <!-- Full-Page Professional Empty State -->
      <div
        v-else-if="isEmpty"
        class="relative min-h-[500px] w-full rounded-2xl border border-primary-border bg-card-background/40 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <!-- Background Glow -->
        <div
          class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />
        <div
          class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        />

        <!-- Hero Icon Stack -->
        <div class="relative flex items-center justify-center mb-6">
          <div
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center relative group transition-all duration-300 hover:scale-105"
          >
            <Send
              class="w-10 h-10 sm:w-12 sm:h-12 text-primary transition-transform duration-300 group-hover:-rotate-6"
            />
            <div
              class="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white border-2 border-card-background"
            >
              <Sparkles class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <!-- Headline & Narrative -->
        <h2
          class="text-xl sm:text-2xl font-bold text-primary-text mb-2 tracking-tight"
        >
          {{
            searchQuery ? "No Matching Telegram Bots" : "No Telegram Bots Found"
          }}
        </h2>
        <p
          class="text-xs sm:text-sm text-secondary-text max-w-md mx-auto leading-relaxed mb-8"
        >
          {{
            searchQuery
              ? `No bots matched "${searchQuery}". Try a different token or client ID search term.`
              : "Add your Telegram Bot Token and Client ID to start receiving automated notifications and system alerts."
          }}
        </p>

        <!-- CTA Button -->
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="px-5 py-2.5 rounded-lg bg-card-background border border-primary-border hover:bg-background text-xs font-semibold text-primary-text transition-colors cursor-pointer"
        >
          Clear Search Filter
        </button>
        <button
          v-else-if="hasPermission('telegram.create')"
          @click="store.openAdd()"
          class="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold hover:shadow-primary/40 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
        >
          <Plus class="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Add Telegram Bot</span>
        </button>
      </div>

      <!-- Data Table -->
      <div
        v-else
        class="hidden md:block w-full border border-primary-border rounded-lg overflow-x-auto bg-card-background/40"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/60">
              <th
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3"
              >
                Username
              </th>
              <th
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3"
              >
                Bot Token / ID
              </th>
              <th
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3"
              >
                Chat ID
              </th>
              <th
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3 w-32"
              >
                Status
              </th>
              <th
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3 min-w-[140px] max-w-md"
              >
                Description
              </th>
              <th
                v-if="
                  hasPermission('telegram.update') ||
                  hasPermission('telegram.delete')
                "
                class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-widest px-4 py-3 w-28"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border">
            <tr
              v-for="item in filteredBots"
              :key="item.id"
              class="hover:bg-background/40 transition-colors"
            >
              <td
                class="px-4 py-3 text-xs font-mono font-medium text-primary-text"
              >
                {{ item?.username ?? "-" }}
              </td>

              <td
                class="px-4 py-3 text-xs font-mono font-medium text-primary-text"
              >
                <div class="flex items-center gap-2">
                  <Bot class="w-4 h-4 text-primary shrink-0" />
                  <span>{{ item?.bot_token ?? "-" }}</span>
                </div>
              </td>

              <td class="px-4 py-3 text-xs text-primary-text font-mono">
                {{ item?.client_id ?? "-" }}
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    :disabled="
                      store.toggleLoading || !hasPermission('telegram.update')
                    "
                    @click="
                      hasPermission('telegram.update') &&
                      store.toggleStatus(item)
                    "
                    class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none"
                    :class="[
                      item.is_active ? 'bg-primary-green' : 'bg-primary-border',
                      hasPermission('telegram.update')
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed opacity-60',
                    ]"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                      :class="
                        item.is_active ? 'translate-x-5' : 'translate-x-0'
                      "
                    />
                  </button>
                  <span
                    class="text-[11px] font-medium"
                    :class="
                      item.is_active
                        ? 'text-primary-green'
                        : 'text-secondary-text'
                    "
                  >
                    {{ item.is_active ? "Active" : "Inactive" }}
                  </span>
                </div>
              </td>
              <td
                class="px-4 py-3 text-xs font-mono font-medium text-primary-text min-w-[140px] max-w-md break-words"
              >
                {{ item?.description ?? "-" }}
              </td>
              <td
                v-if="
                  hasPermission('telegram.update') ||
                  hasPermission('telegram.delete')
                "
                class="px-4 py-3"
              >
                <div class="flex items-center gap-3">
                  <button
                    v-if="hasPermission('telegram.update')"
                    type="button"
                    @click="store.openEdit(item)"
                    class="text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    title="Edit Bot Settings"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    v-if="hasPermission('telegram.delete')"
                    type="button"
                    :disabled="store.deleteLoading"
                    @click="promptDelete(item)"
                    class="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete Bot"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>

  <!-- Edit / Add Modal -->
  <DynamicFormModal
    v-if="store.showModal"
    :title="store.isEdit ? 'Edit Telegram Bot' : 'Add Telegram Bot'"
    description="Configure your Telegram Bot token and Client ID"
    :fields="formFields"
    :model-value="store.editingData"
    :loading="store.actionLoading"
    :submit-text="store.isEdit ? 'Update Bot' : 'Save Bot'"
    @submit="handleSubmit"
    @close="store.closeModal()"
  />

  <!-- Delete Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300"
        @click="deleteTarget = null"
      >
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 overflow-hidden relative"
          @click.stop
        >
          <button
            type="button"
            class="absolute right-4 top-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            @click="deleteTarget = null"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>

          <div class="flex items-start gap-4">
            <div
              class="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0"
            >
              <AlertTriangle class="w-5 h-5 text-red-500" />
            </div>

            <div class="space-y-1">
              <h3 class="text-sm font-bold text-primary-text">
                Delete Telegram Bot
              </h3>
              <p class="text-xs text-secondary-text leading-relaxed">
                Are you sure you want to delete bot token
                <strong class="text-primary-text font-mono">{{
                  deleteTarget?.bot_token
                }}</strong
                >?
              </p>
            </div>
          </div>

          <div
            class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 flex items-start gap-2"
          >
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <span
              >Warning: This will permanently remove the bot setting and stop
              notifications linked to Client ID
              <strong>{{ deleteTarget?.client_id }}</strong
              >.</span
            >
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              @click="deleteTarget = null"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="store.deleteLoading"
              class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs"
              @click="confirmDelete"
            >
              <Loader2
                v-if="store.deleteLoading"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>{{
                store.deleteLoading ? "Deleting..." : "Delete Bot"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Pencil,
  Trash2,
  Bot,
  Send,
  Sparkles,
  Plus,
  Search,
  X,
  RotateCw,
  AlertTriangle,
  Loader2,
} from "lucide-vue-next";
import DynamicFormModal from "@/components/common/DynamicFormModal.vue";
import { useTelegramSettingsStore } from "@/stores/telegram/telegram";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const store = useTelegramSettingsStore();
const searchQuery = ref("");
const deleteTarget = ref(null);

const filteredBots = computed(() => {
  if (!store.data) return [];
  if (!searchQuery.value.trim()) return store.data;
  const q = searchQuery.value.toLowerCase().trim();
  return store.data.filter(
    (b) =>
      (b.bot_token && b.bot_token.toLowerCase().includes(q)) ||
      (b.client_id && String(b.client_id).toLowerCase().includes(q)),
  );
});

const isEmpty = computed(() => {
  return !store.isLoading && filteredBots.value.length === 0;
});

function promptDelete(item) {
  deleteTarget.value = item;
}

function confirmDelete() {
  if (!deleteTarget.value?.id) return;
  store.deleteSetting(deleteTarget.value.id, () => {
    deleteTarget.value = null;
  });
}

function handleSubmit(payload) {
  store.submit(payload);
}

function refreshData() {
  store.fetchSettings(true);
}

onMounted(() => {
  store.fetchSettings();
});

const formFields = [
  {
    type: "text",
    label: "Username",
    model: "username",
    placeholder: "Enter Username",
    required: true,
  },
  {
    type: "text",
    label: "Bot ID / Token",
    model: "bot_token",
    placeholder: "Enter Bot ID or API Token",
    required: true,
  },
  {
    type: "text",
    label: "Client ID",
    model: "client_id",
    placeholder: "Enter Client ID",
    required: true,
  },
  {
    type: "text",
    label: "Description",
    model: "description",
    placeholder: "Enter Description",
    required: false,
  },
];
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
