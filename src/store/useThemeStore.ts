import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// import type { ThemeName } from '../types'

export type ThemeName = 'light-business' | 'dark-tech' | 'light-fresh'

export interface ThemeVars {
  '--color-bg-page': string
  '--color-bg-card': string
  '--color-primary': string
  '--color-text-primary': string
  '--color-text-secondary': string
  '--color-text-tertiary': string
  '--color-border': string
  '--color-divider': string
  '--color-bg-hover': string
}

export const THEMES: Record<ThemeName, ThemeVars> = {
  'light-business': {
    '--color-bg-page': '#F0F2F5',
    '--color-bg-card': '#FFFFFF',
    '--color-primary': '#1890FF',
    '--color-text-primary': '#262626',
    '--color-text-secondary': '#595959',
    '--color-text-tertiary': '#8C8C8C',
    '--color-border': '#E8E8E8',
    '--color-divider': '#F0F0F0',
    '--color-bg-hover': 'rgba(24, 144, 255, 0.05)',
  },
  'dark-tech': {
    '--color-bg-page': '#141414',
    '--color-bg-card': '#1F1F1F',
    '--color-primary': '#177DDC',
    '--color-text-primary': '#E8E8E8',
    '--color-text-secondary': '#A0A0A0',
    '--color-text-tertiary': '#666666',
    '--color-border': '#303030',
    '--color-divider': '#262626',
    '--color-bg-hover': 'rgba(23, 125, 220, 0.1)',
  },
  'light-fresh': {
    '--color-bg-page': '#F6FFED',
    '--color-bg-card': '#FFFFFF',
    '--color-primary': '#52C41A',
    '--color-text-primary': '#262626',
    '--color-text-secondary': '#595959',
    '--color-text-tertiary': '#8C8C8C',
    '--color-border': '#D9D9D9',
    '--color-divider': '#F0F0F0',
    '--color-bg-hover': 'rgba(82, 196, 26, 0.06)',
  },
}

export function applyTheme(name: ThemeName) {
  const vars = THEMES[name]
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

interface ThemeStore {
  theme: ThemeName
  setTheme: (name: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light-business',
      setTheme: (name) => {
        applyTheme(name)
        set({ theme: name })
      },
    }),
    { name: 'dashboard-builder-theme' }
  )
)

// 初始化主题
export function initTheme(name: ThemeName = 'light-business') {
  applyTheme(name)
}
