<script setup>
import { computed } from "vue";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-vue-next";

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["page-change"]);

const go = (page) => {
  if (page === props.pagination.page) return;

  if (page < props.pagination.page && !props.pagination.hasPrev) return;

  if (page > props.pagination.page && !props.pagination.hasNext) return;

  emit("page-change", page);
};

const isFirst = computed(() => !props.pagination.hasPrev);
const isLast = computed(() => !props.pagination.hasNext);

const btnClass = `
w-8 h-8
flex items-center justify-center
rounded-lg
border border-primary-border
transition-all duration-150
select-none
`;

const disabledClass =
  "opacity-30 cursor-not-allowed bg-background text-secondary-text";

const activeClass =
  "cursor-pointer bg-background text-secondary-text hover:text-primary-text hover:border-primary";
</script>

<template>
  <div v-if="pagination" class="flex items-center justify-end gap-2 mr-4 mb-2">
    <!-- First -->
    <button
      @click="go(1)"
      :disabled="isFirst"
      :class="[btnClass, isFirst ? disabledClass : activeClass]"
    >
      <ChevronsLeft class="w-4 h-4" />
    </button>

    <!-- Previous -->
    <button
      @click="go(pagination.page - 1)"
      :disabled="isFirst"
      :class="[btnClass, isFirst ? disabledClass : activeClass]"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Current Page -->
    <div
      class="min-w-[90px] h-8 px-4 flex items-center justify-center rounded-lg border border-primary-border text-primary-text text-xs font-semibold"
    >
      Page {{ pagination.page }}
    </div>

    <!-- Next -->
    <button
      @click="go(pagination.page + 1)"
      :disabled="isLast"
      :class="[btnClass, isLast ? disabledClass : activeClass]"
    >
      <ChevronRight class="w-4 h-4" />
    </button>

    <!-- Last -->
    <button
      @click="go(pagination.page + 1)"
      :disabled="isLast"
      :class="[btnClass, isLast ? disabledClass : activeClass]"
    >
      <ChevronsRight class="w-4 h-4" />
    </button>
  </div>
</template>
