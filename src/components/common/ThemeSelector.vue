<template>
  <div class="relative inline-block" ref="containerRef">
    <!-- Trigger -->
    <button
      @click="toggle"
      class="w-8 h-8 flex items-center justify-center rounded-lg text-secondary-text hover:bg-primary-border hover:cursor-pointer transition-colors"
      :class="{ 'bg-primary-border': isOpen }"
      title="Customize Theme"
    >
      <Palette class="w-4 h-4" />
    </button>

    <!-- Dropdown -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-64 max-h-[450px] overflow-y-auto no-scrollbar rounded-xl border border-primary-border bg-card-background shadow-lg z-50 p-2"
      >
        <div class="px-3 py-2 mb-2 border-b border-primary-border flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-primary-text">Appearance</h3>
            <p class="text-xs text-secondary-text">Choose your preferred look.</p>
          </div>
        </div>

        <div v-for="(group, mode) in groupedThemes" :key="mode" class="mb-3 last:mb-0">
          <div class="px-3 py-1.5 text-xs font-bold text-secondary-text uppercase tracking-wider">
            {{ mode }} Themes
          </div>
          <div class="space-y-0.5 mt-1">
            <button
              v-for="theme in group"
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
              :class="[
                activeTheme === theme.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-primary-text hover:bg-background'
              ]"
            >
              <div class="flex items-center gap-2">
                <Check v-if="activeTheme === theme.id" class="w-4 h-4 shrink-0" />
                <div v-else class="w-4 h-4 shrink-0"></div>
                <span>{{ theme.name }}</span>
              </div>
              
              <!-- Swatches -->
              <div class="flex items-center gap-0.5">
                <div 
                  v-for="(color, i) in theme.previewColors" 
                  :key="i"
                  class="w-3.5 h-3.5 rounded-full border border-primary-border/50 shadow-sm"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Palette, Check } from 'lucide-vue-next'
import { themes, setTheme, getTheme } from '@/utils/theme'

const isOpen = ref(false)
const activeTheme = ref('classic-light')
const containerRef = ref(null)

const groupedThemes = computed(() => {
  return themes.reduce((acc, theme) => {
    const key = theme.mode === 'dark' ? 'Dark' : 'Light'
    if (!acc[key]) acc[key] = []
    acc[key].push(theme)
    return acc
  }, {})
})

onMounted(() => {
  activeTheme.value = getTheme()
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

function toggle() {
  isOpen.value = !isOpen.value
}

function selectTheme(themeId) {
  setTheme(themeId)
  activeTheme.value = themeId
}

function handleClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
