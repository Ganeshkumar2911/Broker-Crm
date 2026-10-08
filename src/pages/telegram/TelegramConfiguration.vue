<template>
  <div class="min-h-screen bg-background">
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-primary-text">
            Telegram Configuration
          </h1>
          <p class="text-xs text-secondary-text mt-1">
            Manage your automated Telegram bot settings and event triggers
          </p>
        </div>
        <div>
          <button
            v-if="hasPermission(['telegram.configure_create', 'telegram.configure_update'])"
            @click="store.openAdd()"
            class="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Add Telegram Configuration</span>
          </button>
        </div>
      </div>

      <!-- Revamped Configuration UI (Audit Log View) -->
      <TelegramConfigAuditLog />
    </main>

    <!-- Modal for Adding/Editing Configurations -->
    <DynamicFormModal
      v-if="store.showModal"
      :title="store.isEdit ? 'Edit Configuration' : 'Add Configuration'"
      description="Configure automated Telegram notification settings"
      :fields="formFields"
      :model-value="store.editingData"
      :loading="store.actionLoading"
      :submit-text="store.isEdit ? 'Update' : 'Save Configuration'"
      @submit="handleSubmit"
      @close="store.closeModal()"
    />
  </div>
</template>

<script setup>
import { Plus } from "lucide-vue-next";
import DynamicFormModal from "@/components/common/DynamicFormModal.vue";
import TelegramConfigAuditLog from "@/components/telegram/TelegramConfigAuditLog.vue";
import { useTelegramConfigurationStore } from "@/stores/telegram/telegram-config";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const store = useTelegramConfigurationStore();

function handleSubmit(payload) {
  store.submit(payload);
}

const formFields = [
  {
    type: "text",
    label: "Module",
    model: "module",
    placeholder: "e.g., trading",
    required: true,
  },
  {
    type: "text",
    label: "Entity",
    model: "entity",
    placeholder: "e.g., account",
    required: true,
  },
  {
    type: "text",
    label: "Action",
    model: "action",
    placeholder: "e.g., deposit",
    required: true,
  },
  {
    type: "switch",
    label: "Notify on Success",
    model: "notify_on_success",
    hint: "Send Telegram notification when action succeeds",
  },
  {
    type: "switch",
    label: "Notify on Failed",
    model: "notify_on_failed",
    hint: "Send Telegram notification when action fails",
  },
];
</script>

<style scoped></style>
