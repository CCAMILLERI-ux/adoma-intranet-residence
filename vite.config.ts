import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Le site est publié sur GitHub Pages à l'adresse /adoma-intranet-residence/.
export default defineConfig({
  base: '/adoma-intranet-residence/',
  plugins: [react()],
})
