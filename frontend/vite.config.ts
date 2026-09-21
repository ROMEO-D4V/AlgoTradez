import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // No build-time compression plugin. The .br/.gz variants it used to emit
    // were force-committed with frontend/dist/ by CI, and because compressed
    // output can be neither deflated nor delta-compressed by git, they grew
    // into two thirds of the repository history and tripled clone times.
    // utils/precompress_assets.py regenerates the gzip variants at app
    // startup instead, from the tracked raw assets, in about 30ms once warm.
  ],
  // plotly.js-dist-min's UMD wrapper has an unguarded `global.matchMedia`
  // reference. Vite 8 no longer shims Node's `global` in the browser, so the
  // /tools pages that load Plotly (StrategyBuilder, MaxPain, OI Tracker, etc.)
  // threw "global is not defined". Map `global` to the browser `globalThis`.
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/agent': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/setup': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/download': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/faq': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/search': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/sandbox': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/playground': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/pnltracker': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/historify': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/python': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/flow': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/broker': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/custom-indicators': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/strategy': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/traffic': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/latency': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/security': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/analyzer': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/chartink': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/logging': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/settings': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/scalping': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/strategybuilder/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/gocharting': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/leverage': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/postback': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/tradingview': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Plotly core can legitimately produce a large shared chart chunk.
    // Keep the limit high enough for that known vendor cost while still
    // flagging any new app-code chunk that drifts above 1MB.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Split the stable framework libs into their own long-cached chunk
        // so an app-code change doesn't bust react/router/query for returning
        // users, and the browser can fetch vendor + page chunks in parallel.
        // Vite already splits the heavy charting libs (plotly, lightweight-
        // charts) automatically, so we only carve out the framework core here.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor'
          }
          if (id.includes('tanstack/react-query')) return 'tanstack'
        },
      },
    },
  },
})
