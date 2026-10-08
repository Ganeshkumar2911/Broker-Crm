<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  Sun,
  Moon,
  ChevronLeft,
} from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile/profile'
import ProfileDialog from '@/components/common/profileDialog.vue'
import TopBarNotifications from '@/components/notifications/TopBarNotifications.vue'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

const isDark = ref(false)
const profileDialogOpen = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

function toggleDark() {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function openProfileDialog() {
  profileDialogOpen.value = true
}

function closeProfileDialog() {
  profileDialogOpen.value = false
}
</script>

<template>
  <header
    class="h-[60px] flex items-center justify-between
           px-4 lg:px-6
           bg-background border-b border-primary-border relative"
  >
    <!-- Left -->
    <div class="flex items-center gap-3">
      <!-- Hamburger -->
      <button
        @click="$emit('toggle-sidebar')"
        class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border"
      >
        <Menu class="w-4 h-4" />
      </button>

      <!-- Back -->
      <button
        v-if="route.meta.showBackButton"
        @click="router.back()"
        class="w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <div>
        <h1 class="text-primary-text text-sm font-semibold">
          {{ route.meta.title || 'Dashboard' }}
        </h1>
        <p class="text-secondary-text text-xs hidden sm:block">
          {{ route.meta.description || 'Welcome' }}
        </p>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-2">
      <!-- Notification Bell Popover & Drawer -->
      <TopBarNotifications />

      <!-- Theme Toggle -->
      <button
        @click="toggleDark"
        class="w-8 h-8 flex items-center justify-center rounded-lg
               text-secondary-text hover:bg-primary-border hover:cursor-pointer"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>

      <!-- Avatar -->
      <div
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary-border cursor-pointer"
        @click="openProfileDialog"
      >
        <div class="w-7 h-7 rounded-full bg-card-background border border-primary-border text-primary flex items-center justify-center">
          <span class="text-xs font-bold">
            {{ profileStore.user?.name?.charAt(0).toUpperCase() || 'S' }}
          </span>
        </div>
        <span class="hidden text-primary-text sm:block text-xs font-medium">
          {{ profileStore.user?.name || 'Super Admin' }}
        </span>
      </div>
    </div>
  </header>

  <ProfileDialog
    :open="profileDialogOpen"
    @close="closeProfileDialog"
  />
</template>