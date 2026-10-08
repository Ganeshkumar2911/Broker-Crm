import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from '@/utils/theme'
import BaseSelect from '@/components/common/BaseSelect.vue'
import DropdownMenu from './components/common/DropdownMenu.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import { HugeiconsIcon } from '@hugeicons/vue'

initTheme()
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('HugeiconsIcon', HugeiconsIcon)
app.component('HugeIcon', HugeiconsIcon)
app.component('BaseSelect', BaseSelect)
app.component('DropdownMenu', DropdownMenu)
app.component('Tooltip', Tooltip)
app.component('BaseDatePicker', BaseDatePicker)
app.component('BaseCalendar', BaseDatePicker)
app.component('DataTable', DataTable)

// Prevent mouse wheel from changing input[type=number] values globally
document.addEventListener(
  'wheel',
  () => {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur()
    }
  },
  { passive: true }
)

// Handle stale chunk errors automatically after new deployments
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const reloadKey = 'vite_preload_error_reload'
  const lastReload = sessionStorage.getItem(reloadKey)
  const now = Date.now()
  if (!lastReload || now - Number(lastReload) > 10000) {
    sessionStorage.setItem(reloadKey, String(now))
    window.location.reload()
  }
})

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass', // Don't warn on unhandled requests (like static assets)
    })
  }
}

enableMocking().then(() => {
  app.mount('#app')
})