import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleMedicalAssistantRequest } from './server/medicalAssistantRoute.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function medicalAssistantPlugin() {
  const attachRoute = (server) => {
    server.middlewares.use('/api/medical-assistant', (req, res) => {
      handleMedicalAssistantRequest(req, res);
    });
  };

  return {
    name: 'medical-assistant-route',
    configureServer(server) {
      attachRoute(server);
    },
    configurePreviewServer(server) {
      attachRoute(server);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react(),
    medicalAssistantPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
