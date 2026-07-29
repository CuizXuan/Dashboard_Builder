import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { dashboardStatePlugin } from './server/dashboardStatePlugin'

export default defineConfig({
  plugins: [react(), dashboardStatePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
