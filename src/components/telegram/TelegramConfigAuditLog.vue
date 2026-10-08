<template>
  <div class="space-y-6">
    <!-- Top Header & Action Toolbar Bar -->
    <div class="space-y-4">
      <!-- Action Toolbar Box -->
      <div
        class="bg-card-background/60 border border-primary-border rounded-xl p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
      >
        <!-- Search Input Bar -->
        <div class="relative w-full sm:w-72 md:w-80">
          <Search
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search module, entity, or action..."
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

        <!-- Action Controls Group -->
        <div
          class="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto"
        >
          <!-- Counter Badge -->
          <span
            v-if="!store.loading && totalModulesCount > 0"
            class="text-[11px] font-medium text-secondary-text px-2.5 py-1 rounded-lg bg-background border border-primary-border/60"
          >
            {{ Object.keys(filteredConfigurations).length }} of
            {{ totalModulesCount }} Modules
          </span>

          <!-- Expand All -->
          <button
            type="button"
            @click="expandAll"
            class="px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Expand All Modules"
          >
            <ChevronsDown class="w-3.5 h-3.5 text-primary" />
            <span class="hidden sm:inline">Expand All</span>
          </button>

          <!-- Collapse All -->
          <button
            type="button"
            @click="collapseAll"
            class="px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Collapse All Modules"
          >
            <ChevronsUp class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Collapse All</span>
          </button>

          <!-- Refresh -->
          <button
            type="button"
            @click="refreshData"
            :disabled="store.loading"
            class="w-8 h-8 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Refresh Configurations"
          >
            <RotateCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="store.loading" class="space-y-4">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-card-background border border-primary-border rounded-xl p-5 animate-pulse space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-background" />
            <div class="h-4 w-32 bg-background rounded" />
          </div>
          <div class="w-6 h-6 bg-background rounded" />
        </div>
      </div>
    </div>

    <!-- Full Page Empty State (No audit configurations at all) -->
    <div
      v-else-if="isEmpty"
      class="min-h-[400px] w-full rounded-2xl border border-primary-border bg-card-background/40 backdrop-blur-md p-8 sm:p-12 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl relative"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary"
      >
        <Shield class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-primary-text mb-1">
        {{
          searchQuery
            ? "No Matching Configurations"
            : "No Audit Configurations Found"
        }}
      </h3>
      <p class="text-xs text-secondary-text max-w-sm mx-auto mb-6">
        {{
          searchQuery
            ? `No modules or entities matched "${searchQuery}". Try a different search keyword.`
            : "Authentication and system audit event triggers will appear here once created."
        }}
      </p>
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="px-4 py-2 rounded-xl bg-card-background border border-primary-border hover:bg-background text-xs font-semibold text-primary-text transition-colors cursor-pointer"
      >
        Clear Search
      </button>
      <button
        v-else
        @click="refreshData"
        class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
      >
        <RotateCw class="w-3.5 h-3.5" />
        <span>Reload Configurations</span>
      </button>
    </div>

    <!-- Modules List -->
    <div v-else class="space-y-4">
      <div
        v-for="(module, moduleKey) in filteredConfigurations"
        :key="moduleKey"
        class="bg-card-background border border-primary-border rounded-xl overflow-hidden transition-all duration-200"
      >
        <!-- Module Header (Clicking anywhere toggles module cleanly) -->
        <div
          @click="toggleModule(moduleKey)"
          class="px-6 py-4 flex items-center justify-between bg-card-background/80 hover:bg-background/50 cursor-pointer transition-colors select-none"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
            >
              <Shield class="w-4 h-4 text-primary" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3
                  class="text-sm font-bold text-primary-text uppercase tracking-wide"
                >
                  {{ moduleKey }}
                </h3>
                <span
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {{ getEntityCount(module) }}
                  {{ getEntityCount(module) === 1 ? "Entity" : "Entities" }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Module Category
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-3 text-xs">
              <span
                class="text-green-500 font-medium flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20"
              >
                <Check class="w-3.5 h-3.5" /> On Success:
                {{ getModuleSuccessCount(module) }}
              </span>
              <span
                class="text-red-500 font-medium flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20"
              >
                <X class="w-3.5 h-3.5" /> On Failure:
                {{ getModuleFailedCount(module) }}
              </span>
            </div>
            <div
              class="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-secondary-text transition-colors"
            >
              <ChevronDown
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isModuleExpanded(moduleKey) }"
              />
            </div>
          </div>
        </div>

        <!-- Module Content (Entities List) -->
        <div
          v-if="isModuleExpanded(moduleKey)"
          class="border-t border-primary-border bg-background/30 p-4 space-y-3"
        >
          <!-- Inline Empty State for Module with No Entities -->
          <div
            v-if="!module || Object.keys(module).length === 0"
            class="p-6 text-center text-secondary-text text-xs bg-card-background/40 rounded-xl border border-dashed border-primary-border flex flex-col items-center gap-2"
          >
            <AlertCircle class="w-5 h-5 text-secondary-text/60" />
            <p class="font-semibold text-primary-text">No Entities Found</p>
            <p class="text-[11px]">
              There are no entities configured under module "{{ moduleKey }}"
            </p>
          </div>

          <!-- Entity Cards -->
          <div
            v-for="(entity, entityKey) in module"
            :key="entityKey"
            class="bg-card-background border border-primary-border/80 rounded-xl overflow-hidden shadow-xs transition-all"
          >
            <!-- Entity Header (Single click handler, no bubbling conflict) -->
            <div
              @click="toggleEntity(moduleKey, entityKey)"
              class="px-5 py-3.5 flex items-center justify-between bg-card-background/60 hover:bg-background/40 cursor-pointer transition-colors select-none"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-lg bg-background border border-primary-border flex items-center justify-center shrink-0"
                >
                  <Users class="w-3.5 h-3.5 text-secondary-text" />
                </div>
                <div>
                  <h4
                    class="text-xs font-semibold text-primary-text uppercase tracking-wider"
                  >
                    {{ entityKey }}
                  </h4>
                  <span class="text-[10px] text-secondary-text"
                    >Entity Scope</span
                  >
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 text-xs">
                  <span
                    class="text-green-500 font-medium text-[11px] flex items-center gap-1"
                    title="Notifications On Success"
                  >
                    <Check class="w-3 h-3" /> On Success:
                    {{ countSuccess(entity) }}
                  </span>
                  <span
                    class="text-red-500 font-medium text-[11px] flex items-center gap-1"
                    title="Notifications On Failure"
                  >
                    <X class="w-3 h-3" /> On Failure: {{ countFailed(entity) }}
                  </span>
                </div>
                <div
                  class="w-6 h-6 rounded-md hover:bg-background flex items-center justify-center text-secondary-text transition-colors"
                >
                  <ChevronDown
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{
                      'rotate-180': isEntityExpanded(moduleKey, entityKey),
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Actions Table Container -->
            <div
              v-if="isEntityExpanded(moduleKey, entityKey)"
              class="border-t border-primary-border/60 bg-background/50 p-4"
            >
              <!-- Inline Empty State for Entity with No Actions -->
              <div
                v-if="!entity || Object.keys(entity).length === 0"
                class="p-4 text-center text-secondary-text text-xs bg-card-background/40 rounded-lg border border-dashed border-primary-border flex items-center justify-center gap-2"
              >
                <AlertCircle class="w-4 h-4 text-secondary-text/60" />
                <span>No actions configured for entity "{{ entityKey }}"</span>
              </div>

              <!-- Actions Table -->
              <div
                v-else
                class="w-full border border-primary-border rounded-lg overflow-hidden bg-card-background"
              >
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="border-b border-primary-border bg-background/60">
                      <th
                        class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5"
                      >
                        Action Event
                      </th>
                      <th
                        class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5 w-44"
                      >
                        On Success
                      </th>
                      <th
                        class="text-left text-[11px] font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5 w-44"
                      >
                        On Failure
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-primary-border">
                    <tr
                      v-for="(actionValue, actionKey) in entity"
                      :key="actionKey"
                      class="hover:bg-background/40 transition-colors"
                    >
                      <td
                        class="px-4 py-3 text-xs font-semibold text-primary-text"
                      >
                        <div class="flex items-center gap-2">
                          <span class="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{{ actionKey }}</span>
                        </div>
                      </td>

                      <!-- Success Toggle -->
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2.5">
                          <button
                            type="button"
                            @click.stop="
                              handleEditConfiguration({
                                moduleKey,
                                entityKey,
                                actionKey,
                                status: 'SUCCESS',
                                value: !actionValue.SUCCESS,
                              })
                            "
                            :disabled="
                              !hasPermission('telegram.configure_update') ||
                              isTogglePending(
                                moduleKey,
                                entityKey,
                                actionKey,
                                'SUCCESS',
                              ) || actionValue.SUCCESS === null
                            "
                            class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer focus:outline-none"
                            :class="
                              actionValue.SUCCESS
                                ? 'bg-primary-green'
                                : 'bg-primary-border'
                            "
                          >
                            <span
                              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 flex items-center justify-center"
                              :class="
                                actionValue.SUCCESS
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              "
                            >
                              <Loader2
                                v-if="
                                  isTogglePending(
                                    moduleKey,
                                    entityKey,
                                    actionKey,
                                    'SUCCESS',
                                  )
                                "
                                class="w-2.5 h-2.5 text-black animate-spin"
                              />
                            </span>
                          </button>
                          <span
                            class="text-[11px] font-medium"
                            :class="
                              actionValue.SUCCESS
                                ? 'text-primary-green'
                                : 'text-secondary-text'
                            "
                          >
                            {{ actionValue.SUCCESS ? "Enabled" : "Disabled" }}
                          </span>
                        </div>
                      </td>

                      <!-- Failed Toggle -->
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2.5">
                          <button
                            type="button"
                            @click.stop="
                              handleEditConfiguration({
                                moduleKey,
                                entityKey,
                                actionKey,
                                status: 'FAILED',
                                value: !actionValue.FAILED,
                              })
                            "
                            :disabled="
                              !hasPermission('telegram.configure_update') ||
                              isTogglePending(
                                moduleKey,
                                entityKey,
                                actionKey,
                                'FAILED',
                              ) || actionValue.FAILED === null
                            "
                            class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer focus:outline-none"
                            :class="
                              actionValue.FAILED
                                ? 'bg-primary-green'
                                : 'bg-primary-border'
                            "
                          >
                            <span
                              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 flex items-center justify-center"
                              :class="
                                actionValue.FAILED
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              "
                            >
                              <Loader2
                                v-if="
                                  isTogglePending(
                                    moduleKey,
                                    entityKey,
                                    actionKey,
                                    'FAILED',
                                  )
                                "
                                class="w-2.5 h-2.5 text-black animate-spin"
                              />
                            </span>
                          </button>
                          <span
                            class="text-[11px] font-medium"
                            :class="
                              actionValue.FAILED
                                ? 'text-primary-green'
                                : 'text-secondary-text'
                            "
                          >
                            {{ actionValue.FAILED ? "Enabled" : "Disabled" }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  Lock,
  Shield,
  ChevronDown,
  Users,
  Check,
  X,
  Search,
  RotateCw,
  Loader2,
  Layers,
  AlertCircle,
  ChevronsDown,
  ChevronsUp,
} from "lucide-vue-next";
import { useTelegramConfigurationStore } from "@/stores/telegram/telegram-config";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const store = useTelegramConfigurationStore();

const searchQuery = ref("");
const expandedModules = ref({});
const expandedEntities = ref({});

const configurations = computed(() => store.auditLogData || {});

// Search Filter Logic
const filteredConfigurations = computed(() => {
  const raw = configurations.value;
  if (!raw || Object.keys(raw).length === 0) return {};
  if (!searchQuery.value.trim()) return raw;

  const query = searchQuery.value.toLowerCase().trim();
  const result = {};

  for (const moduleKey in raw) {
    const moduleMatch = moduleKey.toLowerCase().includes(query);
    const filteredModule = {};

    for (const entityKey in raw[moduleKey]) {
      const entityMatch = entityKey.toLowerCase().includes(query);
      const filteredEntity = {};

      for (const actionKey in raw[moduleKey][entityKey]) {
        const actionMatch = actionKey.toLowerCase().includes(query);
        if (moduleMatch || entityMatch || actionMatch) {
          filteredEntity[actionKey] = raw[moduleKey][entityKey][actionKey];
        }
      }

      if (
        Object.keys(filteredEntity).length > 0 ||
        moduleMatch ||
        entityMatch
      ) {
        filteredModule[entityKey] = filteredEntity;
      }
    }

    if (Object.keys(filteredModule).length > 0 || moduleMatch) {
      result[moduleKey] = filteredModule;
    }
  }

  return result;
});

const isEmpty = computed(() => {
  const data = filteredConfigurations.value;
  return !data || Object.keys(data).length === 0;
});

// Metric Calculations
const totalModulesCount = computed(
  () => Object.keys(configurations.value).length,
);

const totalEntitiesCount = computed(() => {
  let count = 0;
  for (const mod in configurations.value) {
    count += Object.keys(configurations.value[mod] || {}).length;
  }
  return count;
});

const totalSuccessCount = computed(() => {
  let count = 0;
  for (const mod in configurations.value) {
    for (const ent in configurations.value[mod]) {
      for (const act in configurations.value[mod][ent]) {
        if (configurations.value[mod][ent][act]?.SUCCESS) count++;
      }
    }
  }
  return count;
});

const totalFailedCount = computed(() => {
  let count = 0;
  for (const mod in configurations.value) {
    for (const ent in configurations.value[mod]) {
      for (const act in configurations.value[mod][ent]) {
        if (configurations.value[mod][ent][act]?.FAILED) count++;
      }
    }
  }
  return count;
});

const countSuccess = (entity) => {
  if (!entity) return 0;
  return Object.values(entity).filter((action) => action?.SUCCESS).length;
};

const countFailed = (entity) => {
  if (!entity) return 0;
  return Object.values(entity).filter((action) => action?.FAILED).length;
};

const getEntityCount = (module) => {
  return module ? Object.keys(module).length : 0;
};

const getModuleSuccessCount = (module) => {
  let count = 0;
  if (!module) return 0;
  for (const ent in module) {
    count += countSuccess(module[ent]);
  }
  return count;
};

const getModuleFailedCount = (module) => {
  let count = 0;
  if (!module) return 0;
  for (const ent in module) {
    count += countFailed(module[ent]);
  }
  return count;
};

// Toggle Handlers
const isModuleExpanded = (moduleKey) => {
  return expandedModules.value[moduleKey] !== false; // Default expanded
};

const toggleModule = (moduleKey) => {
  const current = isModuleExpanded(moduleKey);
  expandedModules.value[moduleKey] = !current;
};

const isEntityExpanded = (moduleKey, entityKey) => {
  const key = `${moduleKey}-${entityKey}`;
  return expandedEntities.value[key] !== false; // Default expanded
};

const toggleEntity = (moduleKey, entityKey) => {
  const key = `${moduleKey}-${entityKey}`;
  const current = isEntityExpanded(moduleKey, entityKey);
  expandedEntities.value[key] = !current;
};

const expandAll = () => {
  for (const mod in configurations.value) {
    expandedModules.value[mod] = true;
    for (const ent in configurations.value[mod]) {
      expandedEntities.value[`${mod}-${ent}`] = true;
    }
  }
};

const collapseAll = () => {
  for (const mod in configurations.value) {
    expandedModules.value[mod] = false;
    for (const ent in configurations.value[mod]) {
      expandedEntities.value[`${mod}-${ent}`] = false;
    }
  }
};

const isTogglePending = (moduleKey, entityKey, actionKey, status) => {
  const targetField = `${moduleKey}-${entityKey}-${actionKey}-${status}`;
  return (
    store.toggleAction?.togglePending &&
    store.toggleAction?.toggleField === targetField
  );
};

const handleEditConfiguration = (updatedConfig) => {
  if (!hasPermission("telegram.configure_update")) return;
  store.toggleAuditLogAction(updatedConfig);
};

const refreshData = () => {
  store.fetchConfigurations();
};

// Auto-expand modules on initial load
watch(
  configurations,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      expandAll();
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  store.fetchConfigurations();
});
</script>

<style scoped></style>
