<script setup>
import { ref, watch, computed } from "vue";
import { X, Tag, Loader2, Check } from "lucide-vue-next";
import { useTagsStore } from "@/stores/tags/tags";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: "create", // 'create' or 'edit'
  },
});

const emit = defineEmits(["close", "saved"]);

const tagsStore = useTagsStore();

const form = ref({
  name: "",
  color: "#3B82F6",
  description: "",
  status: "active",
});

const errors = ref({});
const submitting = ref(false);

const presetColors = [
  "#FF5733",
  "#E11D48",
  "#F59E0B",
  "#10B981",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
  "#111827",
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      errors.value = {};
      if (props.mode === "edit" && props.tag) {
        form.value = {
          name: props.tag.name || "",
          color: props.tag.color || "#3B82F6",
          description: props.tag.description || "",
          status: props.tag.status || "active",
        };
      } else {
        form.value = {
          name: "",
          color: "#3B82F6",
          description: "",
          status: "active",
        };
      }
    }
  },
);

const validate = () => {
  const errs = {};
  if (!form.value.name.trim()) {
    errs.name = "Tag name is required";
  } else if (form.value.name.length > 50) {
    errs.name = "Tag name must be 50 characters or less";
  }

  const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
  if (!form.value.color || !hexRegex.test(form.value.color)) {
    errs.color = "Valid hex color required (e.g. #FF5733)";
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  submitting.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      color: form.value.color,
      description: form.value.description.trim() || null,
      status: form.value.status,
    };

    if (props.mode === "edit" && props.tag?.id) {
      await tagsStore.updateTag(props.tag.id, payload);
    } else {
      await tagsStore.createTag(payload);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    // Errors handled in store
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-card-background border border-primary-border shadow-2xl overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-background/50"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-primary/10 text-primary">
              <Tag class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-primary-text">
                {{ mode === "edit" ? "Edit Tag" : "Create New Tag" }}
              </h3>
              <p class="text-xs text-secondary-text">
                {{
                  mode === "edit"
                    ? "Update tag details & status"
                    : "Define tag properties and hex color"
                }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Tag Name -->
          <div class="space-y-1">
            <label
              class="text-xs font-medium text-primary-text flex justify-between"
            >
              <span>Tag Name <span class="text-primary-red">*</span></span>
              <span class="text-[10px] text-secondary-text"
                >{{ form.name.length }}/50</span
              >
            </label>
            <input
              v-model="form.name"
              type="text"
              maxlength="50"
              placeholder="e.g. VIP, High Priority, Hot Lead"
              class="w-full px-3 py-2 text-xs rounded-lg border border-primary-border bg-background text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors"
              :class="{ 'border-primary-red': errors.name }"
            />
            <p v-if="errors.name" class="text-[11px] text-primary-red">
              {{ errors.name }}
            </p>
          </div>

          <!-- Color Selector -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-primary-text">
              Badge Color <span class="text-primary-red">*</span>
            </label>

            <!-- Color Palette & Custom Hex -->
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                class="h-8 rounded-lg border transition-all flex items-center justify-center relative cursor-pointer"
                :style="{
                  backgroundColor: color,
                  borderColor:
                    form.color.toUpperCase() === color.toUpperCase()
                      ? '#ffffff'
                      : 'transparent',
                }"
                @click="form.color = color"
              >
                <Check
                  v-if="form.color.toUpperCase() === color.toUpperCase()"
                  class="w-4 h-4 text-white drop-shadow"
                />
              </button>
            </div>

            <!-- Hex Input & Native Picker -->
            <div class="flex items-center gap-2 pt-1">
              <input
                v-model="form.color"
                type="color"
                class="w-9 h-9 p-0.5 rounded-lg border border-primary-border bg-background cursor-pointer"
              />
              <input
                v-model="form.color"
                type="text"
                placeholder="#3B82F6"
                class="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-primary-border bg-background text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary"
                :class="{ 'border-primary-red': errors.color }"
              />
            </div>
            <p v-if="errors.color" class="text-[11px] text-primary-red">
              {{ errors.color }}
            </p>
          </div>

          <!-- Description -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-primary-text"
              >Description (Optional)</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Brief summary or criteria for this tag..."
              class="w-full px-3 py-2 text-xs rounded-lg border border-primary-border bg-background text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <!-- Status -->
          <div class="space-y-1">
            <label class="text-xs font-medium text-primary-text">Status</label>
            <BaseSelect
              v-model="form.status"
              :options="statusOptions"
              placeholder="Select Status"
              variant="surface"
            />
            <p class="text-[10px] text-secondary-text">
              Inactive tags cannot be newly assigned to entities.
            </p>
          </div>

          <!-- Footer Buttons -->
          <div
            class="flex items-center justify-end gap-3 pt-3 border-t border-primary-border"
          >
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium rounded-lg border border-primary-border text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
              :disabled="submitting"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary transition-colors flex items-center gap-2 cursor-pointer"
              :disabled="submitting"
            >
              <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ mode === "edit" ? "Update Tag" : "Create Tag" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
