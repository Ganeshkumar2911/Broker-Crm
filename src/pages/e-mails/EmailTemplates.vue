<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-4 my-8 mx-2">
      <div>
        <h1 class="text-2xl font-bold text-primary-text">Email Templates</h1>
        <p class="text-xs text-secondary-text mt-0.5">Manage transactional and marketing email templates</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('email.template_manual_trigger')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
          @click="openTriggerPanel"
        >
          <Send class="w-3.5 h-3.5" /> Manual Trigger
        </button>
        <button
          v-if="hasPermission('email.template_update')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
          @click="openCreate"
        >
          <Plus class="w-3.5 h-3.5" /> Create Template
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 mb-5 p-3 bg-card-background/60 rounded-xl border border-primary-border">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search templates..."
          class="pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-48"
          @input="onSearch"
        />
      </div>

      <BaseSelect
        v-model="store.filters.category"
        class="w-full sm:w-52 xl:w-52"
        :options="store.categoryOptions.map(cat => ({ label: cat, value: cat }))"
        placeholder="All Categories"
        :allow-all="true"
        @update:modelValue="store.applyFilters()"
      />

      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per Page"
        class="w-full sm:w-28 xl:w-28"
        @update:modelValue="store.updatePerPage"
      />

      <button
        v-if="store.filters.search || store.filters.category"
        class="text-xs text-secondary-text hover:text-primary-text transition-colors px-2 py-2"
        @click="store.resetFilters()"
      >Clear</button>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 w-32 bg-background rounded" />
          <div class="h-5 w-14 bg-background rounded-full" />
        </div>
        <div class="flex gap-1.5">
          <div class="h-5 w-12 bg-background rounded-full" />
          <div class="h-5 w-20 bg-background rounded-full" />
        </div>
        <div class="h-3 w-full bg-background rounded" />
        <div class="h-3 w-3/4 bg-background rounded" />
        <div class="flex gap-1.5 pt-1">
          <div class="h-5 w-10 bg-background rounded-full" />
          <div class="h-5 w-10 bg-background rounded-full" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="store.templates.length === 0" class="flex flex-col items-center gap-4 py-24">
      <div class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
        <Mail class="w-7 h-7 text-secondary-text" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-primary-text">No templates found</p>
        <p class="text-xs text-secondary-text mt-1">Create your first email template to get started</p>
      </div>
      <button
        v-if="hasPermission('email.template_update')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
        @click="openCreate"
      >
        <Plus class="w-3.5 h-3.5" /> Create Template
      </button>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="tpl in store.templates"
        :key="tpl.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200"
      >
        <!-- Top -->
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-primary-text">{{ tpl.name }}</p>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
            :class="tpl.is_active
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
          >{{ tpl.is_active ? 'Active' : 'Inactive' }}</span>
        </div>

        <!-- Badges -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text">{{ tpl.category }}</span>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{{ tpl.code }}</span>
        </div>

        <!-- Subject -->
        <p class="text-xs font-medium text-primary-text">{{ tpl.subject }}</p>

        <!-- Description -->
        <p v-if="tpl.description" class="text-[11px] text-secondary-text line-clamp-2">{{ tpl.description }}</p>

        <!-- Variables -->
        <div v-if="tpl.available_variables?.length" class="flex flex-wrap gap-1">
          <span
            v-for="v in tpl.available_variables"
            :key="v"
            class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text"
          >{{ '\u007B\u007B' + v + '\u007D\u007D' }}</span>
        </div>

        <!-- Actions -->
        <div v-if="hasPermission('email.template_view') || hasPermission('email.template_update')" class="flex gap-2 pt-2.5 mt-auto border-t border-primary-border">
          <button
            v-if="hasPermission('email.template_view')"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="openPreview(tpl)"
          >
            <Eye class="w-3.5 h-3.5" /> Preview
          </button>
          <button
            v-if="hasPermission('email.template_update')"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openEdit(tpl)"
          >
            <Pencil class="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="store.setPage"
      />
    </div>

    <!-- Template Form Side Panel -->
    <EmailTemplateFormPanel
      :open="panel.open"
      :edit-data="panel.editData"
      @close="panel.open = false"
      @preview="(tpl) => { previewTemplate = tpl; previewOpen = true }"
    />

    <!-- Trigger Side Panel -->
    <EmailTriggerPanel
      :open="triggerPanelOpen"
      @close="triggerPanelOpen = false"
    />

    <!-- Preview Dialog -->
    <EmailTemplatePreviewDialog
      :open="previewOpen"
      :template="previewTemplate"
      @close="previewOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Search, Eye, Pencil, Mail, Send } from 'lucide-vue-next'
import { useEmailTemplatesStore } from '@/stores/emails/emailTemplates'
import Pagination from '@/components/common/Pagination.vue'
import EmailTemplateFormPanel from '@/components/emails/EmailTemplateFormPanel.vue'
import EmailTemplatePreviewDialog from '@/components/emails/EmailTemplatePreviewDialog.vue'
import EmailTriggerPanel from '@/components/emails/EmailTriggerPanel.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useEmailTemplatesStore()
const { hasPermission } = usePermissionCheck()

const panel = ref({ open: false, editData: null })
const triggerPanelOpen = ref(false)
const previewOpen     = ref(false)
const previewTemplate = ref(null)

const openCreate = () => { panel.value = { open: true, editData: null } }
const openEdit   = (tpl) => { panel.value = { open: true, editData: tpl } }
const openPreview = (tpl) => { previewTemplate.value = tpl; previewOpen.value = true }
const openTriggerPanel = () => { triggerPanelOpen.value = true }

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

onMounted(() => store.fetchTemplates())
</script>
