<template>
  <Transition name="slide">
    <div v-if="open" class="fixed inset-0 z-40 flex">
      <!-- Backdrop -->
      <div class="flex-1 bg-black/40" />

      <!-- Panel -->
      <div class="w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col h-full overflow-hidden">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-sm font-semibold text-primary-text">{{ isEdit ? 'Edit Template' : 'Create Template' }}</h2>
            <p class="text-[11px] text-secondary-text mt-0.5">{{ isEdit ? `Editing: ${form.name}` : 'Fill in the details below' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
              <X class="w-4 h-4 text-secondary-text" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Name -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Name</p>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. OTP Email"
              :disabled="isLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <!-- Category -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Category</p>
            <BaseSelect
              v-model="form.category"
              :options="store.categoryOptions.map(cat => ({ label: cat, value: cat }))"
              placeholder="Select category"
              :is-loading="isLoading"
              variant="surface"
              @update:modelValue="form.code = null"
            />
          </div>

          <!-- Code -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Code</p>
            <div class="space-y-2">
              <input
                v-model="form.code"
                type="text"
                :placeholder="form.category ? 'Enter custom code or select from dropdown' : 'Select category first'"
                :disabled="isLoading || isEdit || !form.category"
                class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
              <BaseSelect
                v-if="!isEdit"
                :model-value="form.code"
                @update:modelValue="val => form.code = val"
                :options="currentCodes.map(code => ({ label: code, value: code }))"
                :placeholder="!form.category ? 'Select category first' : (currentCodes.length ? 'Or choose from predefined codes' : 'No predefined codes for this category')"
                :is-loading="isLoading"
                :disabled="isLoading || isEdit || !form.category || !currentCodes.length"
                variant="surface"
              />
            </div>
            <p v-if="isEdit" class="text-[11px] text-secondary-text mt-1">Code cannot be changed after creation</p>
            <p v-else-if="form.category && !currentCodes.length" class="text-[11px] text-secondary-text mt-1">No predefined codes for this category. You can type a custom code above.</p>
          </div>

          <!-- Subject -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Subject</p>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Email subject line"
              :disabled="isLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <!-- Description -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Description</p>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Brief description of this template"
              :disabled="isLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
            />
          </div>

          <!-- Body HTML -->
          <div>
            <div class="flex items-center justify-between">
              <p class="text-xs text-secondary-text mb-1.5">Body HTML</p>

              <button
                v-if="form.body_html"
                class="flex mb-2 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
                @click="emit('preview', { ...form, available_variables: parsedVariables })"
              >
                <Eye class="w-3.5 h-3.5" /> Preview
              </button>
            </div>
            <textarea
              v-model="form.body_html"
              rows="10"
              placeholder="<h1>Hello {{name}}</h1><p>Your OTP is {{otp}}</p>"
              :disabled="isLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm font-mono outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-y"
            />

            <!-- Auto-parsed Variables -->
            <div v-if="parsedVariables.length" class="mt-2">
              <p class="text-[11px] text-secondary-text mb-1.5">Detected Variables (auto-parsed)</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="v in parsedVariables"
                  :key="v"
                  class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                >{{ '\u007B\u007B' + v + '\u007D\u007D' }}</span>
              </div>
            </div>
          </div>

          <!-- is_active toggle (edit only) -->
          <div v-if="isEdit" class="flex items-center justify-between px-3 py-2.5 bg-background border border-primary-border rounded-lg">
            <div>
              <p class="text-xs font-medium text-primary-text">Active</p>
              <p class="text-[11px] text-secondary-text">Enable or disable this template</p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="form.is_active ? 'bg-primary' : 'bg-background border border-primary-border'"
              @click="form.is_active = !form.is_active"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
          <button
            :disabled="isLoading"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60"
            @click="emit('close')"
          >Cancel</button>
          <button
            :disabled="isLoading"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submit"
          >
            <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Eye, Loader2 } from 'lucide-vue-next'
import { useEmailTemplatesStore } from '@/stores/emails/emailTemplates'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open:     { type: Boolean, default: false },
  editData: { type: Object,  default: null  },
})
const emit = defineEmits(['close', 'preview'])

const store   = useEmailTemplatesStore()
const snackbar = useSnackbarStore()
const isEdit  = computed(() => !!props.editData)
const isLoading = computed(() => store.createLoading || store.updateLoading)

const defaultForm = () => ({
  name: '', category: '', code: '', subject: '',
  description: '', body_html: '', is_active: true,
})

const form = ref(defaultForm())

const currentCodes = computed(() => store.codeOptions[form.value.category] ?? [])

const parsedVariables = computed(() => store.extractVariables(form.value.body_html))

const isValid = computed(() =>
  form.value.name && form.value.category && form.value.code &&
  form.value.subject && form.value.body_html
)

watch(() => props.open, (val) => {
  if (val) {
    if (props.editData) {
      form.value = {
        name:        props.editData.name        ?? '',
        category:    props.editData.category    ?? '',
        code:        props.editData.code        ?? '',
        subject:     props.editData.subject     ?? '',
        description: props.editData.description ?? '',
        body_html:   props.editData.body_html   ?? '',
        is_active:   props.editData.is_active   ?? true,
      }
    } else {
      form.value = defaultForm()
    }
  }
})

const submit = () => {
  if (!form.value.name?.trim()) {
    snackbar.show('Please fill in the Name field', 'error')
    return
  }
  if (!form.value.category?.trim()) {
    snackbar.show('Please select a Category', 'error')
    return
  }
  if (!form.value.code?.trim()) {
    snackbar.show('Please fill in or select a Code', 'error')
    return
  }
  if (!form.value.subject?.trim()) {
    snackbar.show('Please fill in the Subject field', 'error')
    return
  }
  if (!form.value.body_html?.trim()) {
    snackbar.show('Please fill in the Body HTML field', 'error')
    return
  }

  if (isEdit.value) {
    const payload = form.value
    store.updateTemplate(props.editData.id, payload)
  } else {
    store.createTemplate({ ...form.value, is_active: true })
  }

  // Watch loading to close panel after success
  const stopWatch = watch(isLoading, (val) => {
    if (!val && !store.error) {
      emit('close')
      stopWatch()
    }
  })
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
