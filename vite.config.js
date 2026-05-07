import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleMedicalAssistantRequest } from './server/medicalAssistantRoute.js'
import { handleMedicalKnowledgeRequest } from './server/medicalKnowledgeRoute.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function medicalAssistantPlugin() {
  const attachRoute = (server) => {
    server.middlewares.use('/api/medical-assistant', (req, res) => {
      handleMedicalAssistantRequest(req, res);
    });
    server.middlewares.use('/api/medical-knowledge', (req, res) => {
      handleMedicalKnowledgeRequest(req, res);
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  Object.assign(process.env, env);
  const isDevelopment = mode === 'development';
  const basePath = isDevelopment ? '/' : (env.VITE_PUBLIC_BASE_PATH || './');

  return {
    base: basePath,
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
  };
});
