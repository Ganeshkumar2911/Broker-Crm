<template>
  <div class="isolate relative z-0 w-full h-full min-h-[300px] lg:min-h-[360px] rounded-xl overflow-hidden border border-primary-border bg-background shadow-inner select-none flex flex-col">
    <!-- Leaflet Map Container -->
    <div ref="mapContainer" class="w-full flex-1 h-full min-h-[280px] z-0"></div>

    <!-- Loading State Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10 transition-opacity"
    >
      <div class="flex items-center gap-2 bg-card-background/90 px-3 py-1.5 rounded-lg border border-primary-border shadow-sm text-[11px] text-primary-text font-semibold">
        <div class="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <span>Pinning Geo Origin...</span>
      </div>
    </div>

    <!-- Recenter / Focus Location Button (Top-Right) -->
    <button
      type="button"
      class="absolute top-2.5 right-2.5 z-10 bg-card-background/95 hover:bg-card-background backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary-border shadow-md text-xs font-semibold text-primary flex items-center gap-1.5 transition-all hover:border-primary active:scale-95 cursor-pointer"
      title="Recenter Map to Location Pointer"
      @click="recenterMap"
    >
      <MapPin class="w-3.5 h-3.5 text-primary animate-bounce" />
      <span class="text-[11px] font-bold">Recenter Location</span>
    </button>

    <!-- Location & Coordinates Overlay Badge (Bottom-Left - Clickable to Recenter) -->
    <div
      class="absolute bottom-2.5 left-2.5 z-10 bg-card-background/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary-border shadow-md flex items-center gap-2 max-w-[90%] cursor-pointer hover:border-primary transition-all group"
      title="Click to center on this location"
      @click="recenterMap"
    >
      <span class="text-sm">🇮🇳</span>
      <div class="min-w-0">
        <p class="text-[11px] font-bold text-primary-text truncate leading-tight group-hover:text-primary transition-colors">
          {{ locationText }}
        </p>
        <p class="text-[9px] font-mono text-secondary-text truncate mt-0.5">
          {{ coordinatesText }}
        </p>
      </div>
      <RotateCcw class="w-3 h-3 text-secondary-text group-hover:text-primary transition-colors ml-0.5 shrink-0" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { MapPin, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  ipAddress: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['geo-resolved'])

const mapContainer = ref(null)
let L = null
let mapInstance = null
let markerInstance = null
const isLoading = ref(false)
const isMapReady = ref(false)

// Global in-memory cache for IP lookups
const ipGeoCache = new Map()

const geoData = ref({
  city: 'Raipur',
  region: 'Chhattisgarh',
  country: 'India',
  lat: 21.2333,
  lon: 81.6333,
  isp: 'AS137666 NIXI',
  asn: 'AS137666'
})

const locationText = computed(() => {
  const parts = [geoData.value.city, geoData.value.region, geoData.value.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Raipur, Chhattisgarh, India'
})

const coordinatesText = computed(() => {
  const lat = geoData.value.lat !== undefined ? Number(geoData.value.lat).toFixed(4) : '21.2333'
  const lon = geoData.value.lon !== undefined ? Number(geoData.value.lon).toFixed(4) : '81.6333'
  const latNum = Number(geoData.value.lat) || 21.2333
  const lonNum = Number(geoData.value.lon) || 81.6333
  const latDir = latNum >= 0 ? 'N' : 'S'
  const lonDir = lonNum >= 0 ? 'E' : 'W'
  return `${Math.abs(lat)}° ${latDir}, ${Math.abs(lon)}° ${lonDir}`
})

// Safe Leaflet Loader with CDN fallback
const ensureLeafletLoaded = async () => {
  if (L) return L
  if (typeof window !== 'undefined' && window.L) {
    L = window.L
    return L
  }

  // 1. Try local npm module
  try {
    const mod = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    L = mod.default || mod
    window.L = L
    return L
  } catch (err) {
    console.warn('Local leaflet bundle load fallback to dynamic CDN loader:', err)
  }

  // 2. Dynamic CDN loader fallback
  return new Promise((resolve) => {
    if (document.getElementById('leaflet-css') === null) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (window.L) {
      L = window.L
      return resolve(L)
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      L = window.L
      resolve(L)
    }
    script.onerror = (e) => {
      console.error('Failed to load Leaflet from CDN:', e)
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// Custom Leaflet Pin Marker Icon with City Label
const createPinIcon = (city = 'Raipur') => {
  if (!L) return null
  return L.divIcon({
    className: 'custom-pin-container',
    html: `
      <div class="flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-full">
        <div class="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-lg border-2 border-white ring-2 ring-[var(--color-primary)]/20 animate-pulse">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <span class="mt-1 px-2.5 py-0.5 rounded-md bg-card-background text-primary-text font-bold text-[11px] shadow-md border border-primary-border tracking-tight">${city}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  })
}

// Recenter Map on the pin location
const recenterMap = () => {
  if (!mapInstance) return
  const lat = geoData.value.lat || 21.2333
  const lon = geoData.value.lon || 81.6333

  if (mapInstance.flyTo) {
    mapInstance.flyTo([lat, lon], 12, { duration: 1.0 })
  } else {
    mapInstance.setView([lat, lon], 12, { animate: true })
  }

  if (markerInstance && L) {
    markerInstance.setLatLng([lat, lon])
    markerInstance.setIcon(createPinIcon(geoData.value.city || 'Raipur'))
  }
}

// Initialize Leaflet Map
const initMap = async () => {
  if (!mapContainer.value || mapInstance) return

  const leaflet = await ensureLeafletLoaded()
  if (!leaflet || !mapContainer.value) return

  const initialLat = geoData.value.lat || 21.2333
  const initialLon = geoData.value.lon || 81.6333

  try {
    mapInstance = leaflet.map(mapContainer.value, {
      center: [initialLat, initialLon],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true
    })

    // OpenStreetMap Tile Layer
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(mapInstance)

    // Zoom control top-left
    leaflet.control.zoom({ position: 'topleft' }).addTo(mapInstance)

    // Add marker with label
    const icon = createPinIcon(geoData.value.city || 'Raipur')
    markerInstance = leaflet.marker([initialLat, initialLon], {
      icon: icon
    }).addTo(mapInstance)

    isMapReady.value = true
    updateMapPosition()

    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    }, 250)
  } catch (err) {
    console.error('Error initializing Leaflet map:', err)
  }
}

// Update Map Position smoothly
const updateMapPosition = () => {
  if (!mapInstance || !markerInstance) return
  const lat = geoData.value.lat || 21.2333
  const lon = geoData.value.lon || 81.6333

  mapInstance.setView([lat, lon], 11, { animate: true })
  markerInstance.setLatLng([lat, lon])
  if (L) {
    markerInstance.setIcon(createPinIcon(geoData.value.city || 'Raipur'))
  }

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize()
  }, 100)
}

// Fallback for private / unreachable IPs
const getFallbackGeo = (ip) => {
  if (!ip) return { city: 'Raipur', region: 'Chhattisgarh', country: 'India', lat: 21.2333, lon: 81.6333, isp: 'AS137666 NIXI', asn: 'AS137666' }

  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === 'localhost') {
    return { city: 'Localhost', region: 'Private Network', country: '', lat: 21.2333, lon: 81.6333, isp: 'Local Loopback', asn: '' }
  }

  return { city: 'Raipur', region: 'Chhattisgarh', country: 'India', lat: 21.2333, lon: 81.6333, isp: 'AS137666 NIXI', asn: 'AS137666' }
}

// Live IP Geolocation lookup
const resolveIp = async (ip) => {
  if (!ip) return
  const cleanIp = String(ip).trim().split(',')[0].trim()

  if (ipGeoCache.has(cleanIp)) {
    const cached = ipGeoCache.get(cleanIp)
    geoData.value = { ...cached }
    updateMapPosition()
    emit('geo-resolved', cached)
    return
  }

  const fallback = getFallbackGeo(cleanIp)
  geoData.value = { ...fallback }

  if (cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
    updateMapPosition()
    emit('geo-resolved', fallback)
    return
  }

  isLoading.value = true

  try {
    // 1. Primary: ipwho.is
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)
    const res = await fetch(`https://ipwho.is/${cleanIp}`, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && data.success !== false && data.latitude && data.longitude) {
        const resolved = {
          city: data.city || fallback.city,
          region: data.region || fallback.region,
          country: data.country || fallback.country,
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          isp: data.connection?.isp || data.connection?.org || fallback.isp,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : fallback.asn
        }
        geoData.value = resolved
        ipGeoCache.set(cleanIp, resolved)
        updateMapPosition()
        emit('geo-resolved', resolved)
        isLoading.value = false
        return
      }
    }
  } catch {
    // Secondary fallback
  }

  try {
    // 2. Secondary: freeipapi.com
    const controller2 = new AbortController()
    const timeoutId2 = setTimeout(() => controller2.abort(), 3000)
    const res2 = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, { signal: controller2.signal })
    clearTimeout(timeoutId2)

    if (res2.ok) {
      const data2 = await res2.json()
      if (data2 && data2.latitude && data2.longitude) {
        const resolved = {
          city: data2.cityName || fallback.city,
          region: data2.regionName || fallback.region,
          country: data2.countryName || fallback.country,
          lat: Number(data2.latitude),
          lon: Number(data2.longitude),
          isp: fallback.isp,
          asn: fallback.asn
        }
        geoData.value = resolved
        ipGeoCache.set(cleanIp, resolved)
        updateMapPosition()
        emit('geo-resolved', resolved)
        isLoading.value = false
        return
      }
    }
  } catch {
    // Graceful fallback
  }

  updateMapPosition()
  emit('geo-resolved', fallback)
  isLoading.value = false
}

watch(() => props.ipAddress, (newIp) => {
  if (newIp) {
    resolveIp(newIp)
  }
})

let resizeObserver = null

onMounted(() => {
  initMap()
  if (props.ipAddress) {
    resolveIp(props.ipAddress)
  }

  if (window.ResizeObserver && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    })
    resizeObserver.observe(mapContainer.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
})
</script>

<style>
/* Leaflet map base styling */
.leaflet-container {
  font-family: inherit;
  background: var(--color-background) !important;
  width: 100%;
  height: 100%;
  isolation: isolate !important;
  z-index: 1 !important;
}

.dark .leaflet-tile {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.75);
}

.custom-pin-container {
  background: transparent !important;
  border: none !important;
}
</style>
