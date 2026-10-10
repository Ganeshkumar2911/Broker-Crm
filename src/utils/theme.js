export const THEME_KEY = 'app-theme'

export const themes = [
  // Original
  { id: 'classic-light', name: 'Classic Light', mode: 'light', previewColors: ['#f5f7fb', '#ffffff', '#021a6c', '#111827'] },
  { id: 'midnight-dark', name: 'Midnight Dark', mode: 'dark', previewColors: ['#0f172a', '#1e293b', '#3b82f6', '#f8fafc'] },
  { id: 'ocean-breeze', name: 'Ocean Breeze', mode: 'light', previewColors: ['#f0f9ff', '#ffffff', '#0284c7', '#0f172a'] },
  { id: 'deep-ocean', name: 'Deep Ocean', mode: 'dark', previewColors: ['#082f49', '#0c4a6e', '#38bdf8', '#f0f9ff'] },
  { id: 'forest-green', name: 'Forest Green', mode: 'light', previewColors: ['#f0fdf4', '#ffffff', '#166534', '#14532d'] },
  { id: 'emerald-night', name: 'Emerald Night', mode: 'dark', previewColors: ['#022c22', '#064e3b', '#10b981', '#ecfdf5'] },
  { id: 'rose-quartz', name: 'Rose Quartz', mode: 'light', previewColors: ['#fff1f2', '#ffffff', '#e11d48', '#4c0519'] },
  { id: 'lavender-mist', name: 'Lavender Mist', mode: 'light', previewColors: ['#faf5ff', '#ffffff', '#9333ea', '#3b0764'] },
  { id: 'dracula', name: 'Dracula', mode: 'dark', previewColors: ['#282a36', '#44475a', '#bd93f9', '#f8f8f2'] },
  { id: 'solarized-light', name: 'Solarized Light', mode: 'light', previewColors: ['#fdf6e3', '#eee8d5', '#2aa198', '#657b83'] },
  { id: 'solarized-dark', name: 'Solarized Dark', mode: 'dark', previewColors: ['#002b36', '#073642', '#2aa198', '#839496'] },
  { id: 'graphite', name: 'Graphite', mode: 'dark', previewColors: ['#18181b', '#27272a', '#a1a1aa', '#fafafa'] },

  // New Light
  { id: 'peach-puff', name: 'Peach Puff', mode: 'light', previewColors: ['#fff7ed', '#ffffff', '#ea580c', '#431407'] },
  { id: 'mint-cream', name: 'Mint Cream', mode: 'light', previewColors: ['#f0fdf4', '#ffffff', '#0d9488', '#134e4a'] },
  { id: 'lemon-drop', name: 'Lemon Drop', mode: 'light', previewColors: ['#fefce8', '#ffffff', '#ca8a04', '#422006'] },
  { id: 'cotton-candy', name: 'Cotton Candy', mode: 'light', previewColors: ['#fdf2f8', '#ffffff', '#db2777', '#500724'] },
  { id: 'ice-water', name: 'Ice Water', mode: 'light', previewColors: ['#ecfeff', '#ffffff', '#0891b2', '#164e63'] },
  { id: 'sandstone', name: 'Sandstone', mode: 'light', previewColors: ['#f5f5f4', '#ffffff', '#78716c', '#1c1917'] },
  { id: 'pure-white', name: 'Pure White', mode: 'light', previewColors: ['#ffffff', '#ffffff', '#000000', '#000000'] },
  { id: 'cyber-light', name: 'Cyber Light', mode: 'light', previewColors: ['#f8fafc', '#ffffff', '#c026d3', '#020617'] },
  { id: 'autumn-leaf', name: 'Autumn Leaf', mode: 'light', previewColors: ['#fef3c7', '#ffffff', '#b45309', '#451a03'] },

  // New Dark
  { id: 'cyberpunk', name: 'Cyberpunk', mode: 'dark', previewColors: ['#09090b', '#18181b', '#f472b6', '#fdf4ff'] },
  { id: 'synthwave', name: 'Synthwave', mode: 'dark', previewColors: ['#2e0249', '#570a57', '#f806cc', '#ffffff'] },
  { id: 'hacker-green', name: 'Hacker Green', mode: 'dark', previewColors: ['#000000', '#0a0a0a', '#22c55e', '#ffffff'] },
  { id: 'blood-moon', name: 'Blood Moon', mode: 'dark', previewColors: ['#1a0505', '#2a0a0a', '#dc2626', '#fef2f2'] },
  { id: 'neon-purple', name: 'Neon Purple', mode: 'dark', previewColors: ['#0f001a', '#1f0033', '#a855f7', '#faf5ff'] },
  { id: 'volcano', name: 'Volcano', mode: 'dark', previewColors: ['#171717', '#262626', '#ea580c', '#fff7ed'] },
  { id: 'abyss', name: 'Abyss', mode: 'dark', previewColors: ['#000000', '#09090b', '#fafafa', '#ffffff'] },
  { id: 'space-cadet', name: 'Space Cadet', mode: 'dark', previewColors: ['#0b0f19', '#111827', '#93c5fd', '#ffffff'] },
  { id: 'tokyo-night', name: 'Tokyo Night', mode: 'dark', previewColors: ['#1a1b26', '#24283b', '#7aa2f7', '#c0caf5'] },
  { id: 'nord', name: 'Nord', mode: 'dark', previewColors: ['#2e3440', '#3b4252', '#81a1c1', '#eceff4'] },
  { id: 'gruvbox-dark', name: 'Gruvbox', mode: 'dark', previewColors: ['#282828', '#3c3836', '#d3869b', '#ebdbb2'] },
  { id: 'pitch-black', name: 'Pitch Black', mode: 'dark', previewColors: ['#000000', '#000000', '#ffffff', '#ffffff'] }
]

export const setTheme = (themeId) => {
  const html = document.documentElement
  const theme = themes.find((t) => t.id === themeId) || themes[0]

  // Preserve existing dark mode tailwind compatibility
  if (theme.mode === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  // Set the data attribute for CSS variables
  html.setAttribute('data-theme', theme.id)
  localStorage.setItem(THEME_KEY, theme.id)
}

export const getTheme = () => {
  return localStorage.getItem(THEME_KEY)
}

export const initTheme = () => {
  // Check if old theme key exists and migrate
  const oldTheme = localStorage.getItem('theme')
  if (oldTheme && !localStorage.getItem(THEME_KEY)) {
    const migratedTheme = oldTheme === 'dark' ? 'midnight-dark' : 'classic-light'
    localStorage.setItem(THEME_KEY, migratedTheme)
    localStorage.removeItem('theme')
  }

  const savedTheme = getTheme()
  if (savedTheme) {
    setTheme(savedTheme)
    return savedTheme
  }

  // system preference fallback
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const defaultTheme = prefersDark ? 'midnight-dark' : 'classic-light'

  setTheme(defaultTheme)
  return defaultTheme
}