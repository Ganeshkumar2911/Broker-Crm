<script setup>
import { ref, computed } from "vue";
import {
  ShieldCheck,
  Users,
  Briefcase,
  Network,
  ArrowUpRight,
} from "lucide-vue-next";
import LiveUsersDrawer from "@/components/dashboard/LiveUsersDrawer.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const isDrawerOpen = ref(false);
const selectedRole = ref("client");

const cards = computed(() => {
  const d = props.data?.data || props.data;
  const admins = d?.admins;
  const clients = d?.clients;

  return [
    {
      role: "admin",
      title: "Admins",
      description: "Administrative users",
      value: typeof admins === "number" ? admins : (admins?.count ?? 0),
      icon: ShieldCheck,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      role: "client",
      title: "Clients",
      description: "Active trader clients",
      value: clients?.client ?? d?.client ?? 0,
      icon: Users,
      iconClass: "bg-primary-green/10 text-primary-green",
    },
    {
      role: "fm",
      title: "Fund Managers",
      description: "Fund manager accounts",
      value: clients?.fm ?? d?.fm ?? 0,
      icon: Briefcase,
      iconClass: "bg-primary-blue/10 text-primary-blue",
    },
    {
      role: "ib",
      title: "Introducing Broker (IB)",
      description: "Partner & IB network",
      value: clients?.ib ?? d?.ib ?? 0,
      icon: Network,
      iconClass: "bg-primary-yellow/10 text-primary-yellow",
    },
  ];
});

const handleCardClick = (role) => {
  selectedRole.value = role;
  isDrawerOpen.value = true;
};
</script>

<template>
  <section>
    <!-- Section Header -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />

        <p
          class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text"
        >
          Live User Count
        </p>
      </div>

      <span class="flex-1 h-px bg-primary-border" />

      <button
        type="button"
        class="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
        @click="handleCardClick('')"
      >
        <span>View All Live</span>
        <ArrowUpRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card.title"
        class="group relative overflow-hidden rounded-2xl border border-primary-border bg-card-background p-4 sm:p-5 transition-all duration-200 hover:border-primary/40 cursor-pointer select-none"
        @click="handleCardClick(card.role)"
      >
        <!-- Hover line -->
        <span
          class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <!-- Loading -->
        <template v-if="loading">
          <div class="flex items-center gap-4 animate-pulse">
            <div class="w-11 h-11 rounded-xl bg-primary-border" />

            <div class="flex-1 space-y-2">
              <div class="h-3 w-28 bg-primary-border rounded" />
              <div class="h-2.5 w-20 bg-primary-border rounded" />
            </div>

            <div class="h-8 w-10 bg-primary-border rounded" />
          </div>
        </template>

        <!-- Data -->
        <template v-else>
          <div class="flex items-center justify-between gap-4">
            <!-- Left -->
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200"
                :class="card.iconClass"
              >
                <component :is="card.icon" class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-1">
                  <p class="text-sm font-semibold text-primary-text truncate group-hover:text-primary transition-colors">
                    {{ card.title }}
                  </p>
                  <ArrowUpRight class="w-3 h-3 text-secondary-text opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                <p class="mt-0.5 text-[10px] text-secondary-text truncate">
                  {{ card.description }}
                </p>
              </div>
            </div>

            <!-- Count -->
            <div class="text-right shrink-0">
              <p
                class="text-2xl sm:text-3xl font-bold tracking-tight text-primary-text leading-none group-hover:text-primary transition-colors"
              >
                {{ card.value }}
              </p>

              <p
                class="mt-1 text-[9px] uppercase tracking-wider text-secondary-text"
              >
                Users
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Live Users Side Panel Drawer -->
    <LiveUsersDrawer
      :open="isDrawerOpen"
      :initial-role="selectedRole"
      @close="isDrawerOpen = false"
    />
  </section>
</template>
