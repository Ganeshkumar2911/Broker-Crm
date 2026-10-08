<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="handleBackdropClick"
        />
      </Transition>

      <!-- Side Drawer Panel -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-101 w-full bg-card-background border-l border-primary-border flex flex-col shadow-2xl transform transition-all duration-300"
          :class="maxWidth || 'max-w-md sm:max-w-lg'"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="icon || defaultIcon"
                class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
              >
                <component
                  :is="icon || defaultIcon"
                  class="w-4.5 h-4.5 text-primary"
                />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-primary-text">
                  {{ title }}
                </h2>
                <p
                  v-if="description"
                  class="text-xs text-secondary-text mt-0.5"
                >
                  {{ description }}
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer focus:outline-none"
              title="Close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form Body -->
          <div
            class="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-card-background"
          >
            <div
              v-for="field in fields"
              :key="field.model"
              class="flex flex-col gap-1.5"
            >
              <!-- Label (for non-switch / non-checkbox) -->
              <label
                v-if="!['checkbox', 'radio', 'switch'].includes(field.type)"
                class="text-secondary-text text-[11px] font-semibold"
              >
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Text / Email / Number input -->
              <input
                v-if="
                  ['text', 'email', 'number'].includes(field.type || 'text')
                "
                v-model="form[field.model]"
                :type="field.type || 'text'"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-60"
              />

              <!-- Password input with Eye Toggle -->
              <div
                v-else-if="field.type === 'password'"
                class="relative flex items-center"
              >
                <input
                  v-model="form[field.model]"
                  :type="showPassword[field.model] ? 'text' : 'password'"
                  :placeholder="field.placeholder"
                  :disabled="field.disabled"
                  class="w-full bg-background border border-primary-border rounded-lg pl-3 pr-10 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono disabled:opacity-60"
                />
                <button
                  type="button"
                  @click="togglePassword(field.model)"
                  class="absolute right-3 text-secondary-text hover:text-primary-text transition-colors focus:outline-none cursor-pointer"
                >
                  <Eye v-if="!showPassword[field.model]" class="w-3.5 h-3.5" />
                  <EyeOff v-else class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Radio -->
              <div
                v-else-if="field.type === 'radio'"
                class="flex flex-wrap gap-4 pt-1"
              >
                <label
                  v-for="opt in field.options"
                  :key="opt.value"
                  class="flex items-center gap-2 text-xs text-primary-text cursor-pointer"
                >
                  <input
                    type="radio"
                    :name="field.model"
                    :value="opt.value"
                    v-model="form[field.model]"
                    class="accent-primary w-3.5 h-3.5"
                  />
                  {{ opt.label }}
                </label>
              </div>

              <!-- Checkbox Group -->
              <div
                v-else-if="field.type === 'checkbox-group'"
                class="flex flex-wrap gap-4 pt-1"
              >
                <label
                  v-for="option in field.options"
                  :key="option.value"
                  class="flex items-center gap-2 cursor-pointer text-xs text-primary-text"
                >
                  <input
                    type="checkbox"
                    :value="option.value"
                    v-model="form[field.model]"
                    class="accent-primary w-3.5 h-3.5 rounded"
                  />
                  {{ option.label }}
                </label>
              </div>

              <!-- Switch / Toggle -->
              <div
                v-else-if="field.type === 'switch'"
                class="flex items-center justify-between p-3.5 bg-background border border-primary-border rounded-xl"
              >
                <div>
                  <span class="text-xs font-semibold text-primary-text">{{
                    field.label
                  }}</span>
                  <p
                    v-if="field.hint"
                    class="text-[10px] text-secondary-text mt-0.5"
                  >
                    {{ field.hint }}
                  </p>
                </div>
                <label
                  class="relative inline-flex items-center cursor-pointer select-none"
                >
                  <input
                    v-model="form[field.model]"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-9 h-5 bg-background border border-primary-border rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-secondary-text after:border-primary-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"
                  />
                </label>
              </div>

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="form[field.model]"
                :placeholder="field.placeholder"
                :rows="field.rows || 3"
                :disabled="field.disabled"
                class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-y disabled:opacity-60"
              />

              <!-- Select -->
              <BaseSelect
                v-else-if="field.type === 'select'"
                v-model="form[field.model]"
                :options="field.options"
                :placeholder="field.placeholder || 'Select an option'"
                :searchable="field.searchable || false"
                :allow-all="field.allowAll || false"
                :all-label="field.allLabel || 'All'"
                :is-loading="field.isLoading || false"
                :variant="field.variant || 'default'"
                :disabled="field.disabled"
              />

              <p
                v-if="field.hint && field.type !== 'switch'"
                class="text-[10px] text-secondary-text leading-relaxed"
              >
                {{ field.hint }}
              </p>
              <p
                v-if="errors[field.model]"
                class="text-[11px] text-red-500 font-medium"
              >
                {{ errors[field.model] }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 bg-card-background shrink-0"
          >
            <button
              type="button"
              @click="$emit('close')"
              :disabled="loading"
              class="px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="submit"
              :disabled="loading"
              class="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              <span>{{ loading ? "Saving..." : submitText }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { X, Save, Loader2, Eye, EyeOff, Sliders } from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  icon: { type: [Object, Function, String], default: null },
  maxWidth: { type: String, default: "max-w-md sm:max-w-lg" },
  fields: { type: Array, required: true },
  modelValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: "Save" },
  cancelText: { type: String, default: "Cancel" },
  closeOnBackdrop: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "submit", "update:modelValue"]);

const defaultIcon = computed(() => Sliders);

function buildDefaultForm() {
  const base = {};
  props.fields.forEach((f) => {
    if (f.type === "checkbox-group") {
      base[f.model] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
    } else if (f.type === "switch") {
      base[f.model] = f.defaultValue ?? false;
    } else {
      base[f.model] = f.defaultValue ?? "";
    }
  });
  return base;
}

const form = ref({ ...buildDefaultForm(), ...props.modelValue });
const errors = ref({});
const showPassword = ref({});

function togglePassword(key) {
  showPassword.value[key] = !showPassword.value[key];
}

function handleBackdropClick() {
  if (props.closeOnBackdrop && !props.loading) {
    emit("close");
  }
}

watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...buildDefaultForm(), ...(val || {}) };
    errors.value = {};
  },
  { deep: true },
);

function validate() {
  const newErrors = {};
  props.fields.forEach((f) => {
    if (f.required) {
      const val = form.value[f.model];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        newErrors[f.model] = `${f.label || f.model} is required`;
      }
    }
  });
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function submit() {
  if (!validate()) return;
  emit("update:modelValue", { ...form.value });
  emit("submit", { ...form.value });
}
</script>

<style scoped>
/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Side Drawer Panel slide-out-from-right transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
