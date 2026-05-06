import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteBin = path.resolve(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js');

const env = {
  ...process.env,
  VITE_ROUTER_MODE: 'hash',
  VITE_PUBLIC_BASE_PATH: './',
  VITE_DISABLE_MEDICAL_ASSISTANT: 'true',
};

const child = spawn(process.execPath, [viteBin, 'build'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
