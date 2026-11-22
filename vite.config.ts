import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_GAME_BASE || './',
  // Node's recursive removal crashes on the Windows network drive used for this workspace.
  build: { emptyOutDir: false },
})
