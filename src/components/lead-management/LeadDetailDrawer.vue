<script setup>
import { ref, watch, computed } from "vue";
import { useLeadStore } from "@/stores/lead/lead";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { formatDate } from "@/utils/timeFormatter";
import TagChip from "@/components/common/TagChip.vue";
import {
  X,
  Phone,
  Mail,
  Bell,
  Clock,
  ArrowRight,
  ArrowRightLeft,
  Edit,
  Loader2,
  History,
  UserCheck,
  Tag,
  Plus,
} from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  lead: { type: Object, default: null },
  leadId: { type: [Number, String], default: null },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "move-stage", "edit-lead", "assign-staff", "manage-tags"]);

const leadStore = useLeadStore();

const activeLead = computed(() => leadStore.currentLead || props.lead || {});

const staffOptions = computed(() => {
  return props.staffList.map((s) => ({
    value: s.id,
    label:
      s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

watch(
  () => [props.open, props.leadId || props.lead?.id],
  ([isOpen, id]) => {
    if (isOpen && id) {
      leadStore.fetchLeadById(id);
      leadStore.fetchLeadHistory(id);
    }
  },
  { immediate: true },
);

function getLeadName(l) {
  if (l.first_name || l.last_name) {
    return `${l.first_name || ""} ${l.last_name || ""}`.trim();
  }
  return l.name || "Unnamed Lead";
}

function getStaffName(l) {
  if (l.assigned_staff) {
    return l.assigned_staff.name || l.assigned_staff.email || "Unassigned";
  }
  return "Unassigned";
}

function getStageName(l) {
  if (!l) return "NEW_USER";
  return (
    l.current_stage?.name ||
    l.current_stage?.code ||
    l.stage ||
    props.stages?.[0]?.name ||
    props.stages?.[0]?.code ||
    "NEW_USER"
  );
}

function handleAssignStaff(staffId) {
  if (!staffId || !activeLead.value?.id) return;
  emit("assign-staff", { leadId: activeLead.value.id, staffId });
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

    <!-- Slide-over Drawer Panel -->
    <Transition name="slide-right">
      <div
        v-if="open && activeLead"
        class="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] lg:w-[38vw] bg-card-background border-l border-primary-border shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <!-- Drawer Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-base shrink-0"
            >
              {{ getLeadName(activeLead).charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-primary-text truncate">
                  {{ getLeadName(activeLead) }}
                </h2>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 bg-primary/10 text-primary border-primary/20"
                >
                  {{ getStageName(activeLead) }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                Code: {{ activeLead.lead_code || `L-${activeLead.id}` }} ·
                Created
                {{ formatDate(activeLead.created_at || activeLead.createdAt) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click="emit('move-stage', activeLead)"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Move Stage"
            >
              <ArrowRightLeft class="w-4 h-4" />
            </button>

            <button
              @click="emit('edit-lead', activeLead)"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Edit Lead"
            >
              <Edit class="w-4 h-4" />
            </button>

            <button
              @click="emit('close')"
              class="p-2 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer ml-1"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Drawer Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div
            v-if="leadStore.detailLoading"
            class="py-12 flex flex-col items-center justify-center gap-2 text-secondary-text"
          >
            <Loader2 class="w-6 h-6 animate-spin text-primary" />
            <span class="text-xs">Loading lead details...</span>
          </div>

          <template v-else>
            <!-- Assigned Tags Section -->
            <div class="bg-background/80 border border-primary-border/80 rounded-2xl p-4 space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1.5">
                  <Tag class="w-3.5 h-3.5 text-primary" />
                  Assigned Tags
                </h3>
                <button
                  type="button"
                  @click="emit('manage-tags', activeLead)"
                  class="px-2 py-1 text-[11px] font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3 h-3" />
                  <span>Manage Tags</span>
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <template v-if="activeLead.tags && activeLead.tags.length > 0">
                  <TagChip
                    v-for="tag in activeLead.tags"
                    :key="tag.id"
                    :tag="tag"
                    size="md"
                  />
                </template>
                <span v-else class="text-xs text-secondary-text italic">No tags assigned</span>
              </div>
            </div>

            <!-- Section 1: Basic Information -->
            <div
              class="bg-background/80 border border-primary-border/80 rounded-2xl p-4 space-y-3"
            >
              <h3
                class="text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2"
              >
                Basic Information
              </h3>

              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Full Name</span
                  >
                  <span class="text-primary-text font-medium">{{
                    getLeadName(activeLead)
                  }}</span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Phone Number</span
                  >
                  <span
                    class="text-primary-text font-medium flex items-center gap-1"
                  >
                    <Phone class="w-3 h-3 text-primary" />
                    {{ activeLead.phone || "-" }}
                  </span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Email Address</span
                  >
                  <span
                    class="text-primary-text font-medium truncate block"
                    :title="activeLead.email"
                  >
                    {{ activeLead.email || "-" }}
                  </span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Country</span
                  >
                  <span class="text-primary-text font-medium">
                    {{ activeLead.country || "-" }}
                  </span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Lead Source</span
                  >
                  <span class="text-primary-text font-medium">{{
                    activeLead.source || "Website"
                  }}</span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block mb-1"
                    >Assigned Staff</span
                  >
                  <BaseSelect
                    :model-value="
                      activeLead.assigned_staff?.id ||
                      activeLead.assigned_staff_id ||
                      null
                    "
                    :options="staffOptions"
                    placeholder="Assign Staff..."
                    searchable
                    variant="surface"
                    @update:model-value="handleAssignStaff"
                  />
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Priority</span
                  >
                  <span class="text-primary-text font-medium">{{
                    activeLead.priority || "Medium"
                  }}</span>
                </div>

                <div>
                  <span class="text-secondary-text text-[11px] block"
                    >Current Stage</span
                  >
                  <span class="text-primary font-semibold">{{
                    getStageName(activeLead)
                  }}</span>
                </div>
              </div>

              <!-- Remarks / Note -->
              <div
                v-if="activeLead.remarks"
                class="pt-2 border-t border-primary-border/40 text-xs"
              >
                <span class="text-secondary-text text-[11px] block mb-1"
                  >Remarks</span
                >
                <p
                  class="text-primary-text bg-background p-2.5 rounded-lg border border-primary-border/60"
                >
                  {{ activeLead.remarks }}
                </p>
              </div>
            </div>

            <!-- Section 2: Follow-Up Card -->
            <div
              v-if="
                activeLead.current_followup_date || activeLead.followUp?.date
              "
              class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary"
                >
                  <Bell class="w-4 h-4" />
                </div>
                <div>
                  <p
                    class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text"
                  >
                    Follow-up Schedule
                  </p>
                  <p class="text-xs font-bold text-primary-text mt-0.5">
                    {{ formatDate(activeLead.current_followup_date) }}
                  </p>
                  <p
                    v-if="activeLead.current_followup_note"
                    class="text-[11px] text-secondary-text mt-0.5"
                  >
                    "{{ activeLead.current_followup_note }}"
                  </p>
                </div>
              </div>

              <span
                class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0"
              >
                {{ activeLead.current_followup_status || "Pending" }}
              </span>
            </div>

            <!-- Section 3: Stage Transition History -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3
                  class="text-xs font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1.5"
                >
                  <History class="w-3.5 h-3.5 text-primary" />
                  <span>Stage Transition History</span>
                </h3>
                <span
                  class="text-[10px] text-secondary-text font-mono bg-primary/5 border border-primary-border/60 rounded-full px-2 py-0.5"
                >
                  {{ leadStore.leadHistory.length }} Events
                </span>
              </div>

              <div
                v-if="leadStore.historyLoading"
                class="py-8 flex items-center justify-center text-xs text-secondary-text gap-2"
              >
                <Loader2 class="w-4 h-4 animate-spin text-primary" />
                <span>Loading history...</span>
              </div>

              <div
                v-else-if="leadStore.leadHistory.length === 0"
                class="py-8 flex flex-col items-center justify-center gap-2 text-center border border-dashed border-primary-border rounded-xl"
              >
                <History class="w-5 h-5 text-secondary-text/50" />
                <span class="text-xs text-secondary-text"
                  >No stage transitions recorded yet.</span
                >
              </div>

              <div v-else class="relative">
                <!-- Gradient spine -->
                <div
                  class="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary-border to-transparent"
                />

                <div class="space-y-2">
                  <div
                    v-for="(item, index) in leadStore.leadHistory"
                    :key="item.id"
                    class="relative flex gap-4 group"
                  >
                    <!-- Marker -->
                    <div
                      class="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-card-background border-2 border-primary/70 flex items-center justify-center shadow-sm group-hover:border-primary group-hover:scale-105 transition-all duration-200"
                    >
                      <div
                        class="w-2 h-2 rounded-full"
                        :class="
                          index === 0
                            ? 'bg-primary animate-pulse'
                            : 'bg-primary/60'
                        "
                      />
                    </div>

                    <!-- Card -->
                    <div class="flex-1 min-w-0 pb-2">
                      <div
                        class="bg-background border border-primary-border rounded-xl px-3.5 py-3 transition-all duration-200"
                      >
                        <div
                          class="flex items-start justify-between gap-2 mb-1.5"
                        >
                          <div
                            class="flex items-center gap-1.5 min-w-0 flex-wrap"
                          >
                            <span
                              class="text-xs font-semibold text-secondary-text truncate"
                            >
                              {{ item.from_stage_name || "Start" }}
                            </span>
                            <ArrowRight
                              class="w-3 h-3 text-primary flex-shrink-0"
                            />
                            <span
                              class="text-xs font-bold text-primary-text truncate"
                            >
                              {{ item.to_stage_name }}
                            </span>
                          </div>
                          <span
                            class="text-[10px] text-secondary-text font-mono whitespace-nowrap flex-shrink-0 mt-0.5"
                          >
                            {{ formatDate(item.created_at) }}
                          </span>
                        </div>

                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="text-[11px] text-secondary-text">
                            Changed by
                            <span class="text-primary-text font-medium">{{
                              item.changed_by_name || "Staff"
                            }}</span>
                          </span>
                          <span
                            class="text-[9px] font-medium uppercase tracking-wide text-primary bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5"
                          >
                            {{ item.change_source || "Manual" }}
                          </span>
                        </div>

                        <p
                          v-if="item.remarks"
                          class="text-[11px] text-primary-text/90 leading-relaxed mt-2 pt-2 border-t border-primary-border/40 italic"
                        >
                          "{{ item.remarks }}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Drawer Footer -->
        <div
          class="p-4 border-t border-primary-border bg-background/60 flex items-center justify-between shrink-0"
        >
          <button
            @click="emit('move-stage', activeLead)"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-btn-text-primary text-xs font-semibold transition-colors cursor-pointer shadow-md"
          >
            <ArrowRightLeft class="w-4 h-4" />
            <span>Advance Lead Stage</span>
          </button>
        </div>
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
