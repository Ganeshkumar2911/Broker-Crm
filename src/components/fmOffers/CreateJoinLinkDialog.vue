<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/20" @click.stop>
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <Link2 class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-bold text-primary-text">
            {{ isEditing ? 'Edit Join Link' : 'Generate Join Link' }}
          </h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <p v-if="!isEditing" class="text-[11px] text-secondary-text leading-relaxed">
          A unique invitation key automatically generated for this offer. Followers who join using this URL will be subscribed to the offer.
        </p>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Title</p>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Campaign Link"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <p class="text-[11px] text-secondary-text/90 mt-1.5">Label for identification in join links list.</p>
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Description</p>
          <input
            v-model="form.description"
            type="text"
            placeholder="e.g. VIP Followers"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <p class="text-[11px] text-secondary-text/90 mt-1.5">Optional context for this invitation URL.</p>
        </div>

        <!-- Active Toggle (Edit Mode) -->
        <div v-if="isEditing" class="flex items-center justify-between px-3.5 py-2.5 bg-background border border-primary-border rounded-xl">
          <div>
            <p class="text-xs font-semibold text-primary-text">Link Status</p>
            <p class="text-[11px] text-secondary-text">Enable or disable this join link.</p>
          </div>
          <button
            type="button"
            class="relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer"
            :class="form.is_active ? 'bg-primary' : 'bg-background border border-primary-border'"
            @click="form.is_active = !form.is_active"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- One Time Toggle -->
        <div class="flex items-center justify-between px-3.5 py-2.5 bg-background border border-primary-border rounded-xl">
          <div>
            <p class="text-xs font-semibold text-primary-text">One Time Use</p>
            <p class="text-[11px] text-secondary-text">Restrict link to single usage.</p>
          </div>
          <button
            type="button"
            class="relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer"
            :class="form.one_time ? 'bg-primary' : 'bg-background border border-primary-border'"
            @click="toggleOneTime"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="form.one_time ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Max Uses</p>
          <input
            v-model.number="form.max_uses"
            type="number"
            min="1"
            placeholder="e.g. 100"
            :disabled="form.one_time"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Expiration Date</p>
          <BaseDatePicker
            v-model="form.expires_at"
            mode="single"
            placeholder="Select expiration date"
            valueFormat="YYYY-MM-DD"
            :minDate="minDate"
            :disableFuture="false"
            placement="top"
            dropUp
            clearable
          />
          <p class="text-[11px] text-secondary-text mt-1.5">Leave empty for unlimited duration.</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-black bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="submit"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isEditing ? (loading ? 'Updating...' : 'Update Link') : (loading ? 'Generating...' : 'Generate Link') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Link2, Loader2 } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  offerId: { type: [String, Number], required: true },
  editLink: { type: Object, default: null },
})
const emit = defineEmits(['close', 'created'])
const store = useFmOffersStore()

const form = ref({ title: '', description: '', one_time: false, max_uses: null, expires_at: null, is_active: true })
const minDate = new Date().toLocaleDateString('en-CA')

const isEditing = computed(() => !!props.editLink)
const loading = computed(() => isEditing.value ? store.updateLinkLoading : store.createLinkLoading)
const isValid = computed(() => Boolean(form.value.title))

watch(() => props.open, (val) => {
  if (!val) return
  if (props.editLink) {
    form.value = {
      title: props.editLink.title || '',
      description: props.editLink.description || '',
      one_time: !!props.editLink.one_time,
      max_uses: props.editLink.max_uses ?? null,
      expires_at: props.editLink.expires_at ? new Date(props.editLink.expires_at).toISOString().split('T')[0] : null,
      is_active: props.editLink.is_active !== false,
    }
  } else {
    form.value = { title: '', description: '', one_time: false, max_uses: null, expires_at: null, is_active: true }
  }
})

const toggleOneTime = () => {
  form.value.one_time = !form.value.one_time
  if (form.value.one_time) form.value.max_uses = 1
  else form.value.max_uses = null
}

const submit = () => {
  const payload = { ...form.value }
  if (payload.expires_at) {
    const d = new Date(payload.expires_at)
    if (!isNaN(d.getTime())) payload.expires_at = d.toISOString().replace('Z', '+00:00')
  } else {
    payload.expires_at = null
  }

  if (isEditing.value) {
    store.updateJoinLink(props.offerId, props.editLink.id, payload, () => emit('close'))
  } else {
    store.createJoinLink(props.offerId, payload, () => {
      emit('created')
      emit('close')
    })
  }
}
</script>
