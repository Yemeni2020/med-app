# MedBlog

## Local setup

1. Copy `.env.example` to `.env`
2. Install Ollama from `https://docs.ollama.com/quickstart`
3. Pull a local model, for example: `ollama pull gemma3`
4. Optionally change `OLLAMA_MODEL` in `.env`
5. Run `npm install`
6. Run `npm run dev`

## Medical AI assistant

This app includes a serious medical information assistant for visitors.

- The browser calls `/api/medical-assistant`
- The assistant runs against a local Ollama model
- In local development and `vite preview`, the route is mounted by Vite middleware

The assistant is deliberately constrained:

- health topics only
- no jokes or roleplay
- no fake certainty
- no diagnosis claims
- emergency escalation for red-flag symptoms

The knowledge base and citations still work locally. For production, you need a server-side route that can reach your local or self-hosted model runtime.

## GitHub Pages deploy

This repo can be deployed to GitHub Pages as a static frontend.

Two deployment options are now possible:

1. GitHub Actions Pages workflow
2. Classic `gh-pages` branch deployment with the `gh-pages` package

What the Pages build does:

- builds the app with a hash-based router for SPA navigation on Pages
- uses relative asset paths
- disables the medical assistant widget in the Pages build

Why the assistant is disabled on GitHub Pages:

- GitHub Pages is static hosting only
- it cannot run the `/api/medical-assistant` server route
- it cannot run or reach your local Ollama runtime on the visitor machine

Files involved:

- `.github/workflows/deploy.yml`
- `vite.config.js`
- `src/App.jsx`
- `src/components/layout/AppLayout.jsx`

### Deploy with `gh-pages`

1. Run `npm install`
2. Commit and push your code
3. Run:
   - `npm run deploy`
4. In GitHub, open `Settings -> Pages`
5. Set the source to the `gh-pages` branch

This publish flow uses:

- `npm run build:gh-pages`
- `npm run deploy`

The `build:gh-pages` script forces:

- `VITE_ROUTER_MODE=hash`
- `VITE_PUBLIC_BASE_PATH=./`
- `VITE_DISABLE_MEDICAL_ASSISTANT=true`

### Deploy with GitHub Actions

How to enable deployment:

1. Push the repo to GitHub
2. Make sure your default branch is `main`
3. In GitHub, open `Settings -> Pages`
4. Set `Source` to `GitHub Actions`
5. Push to `main` or run the workflow manually

If you want the medical assistant in production, use a host that can run a backend or proxy to a model runtime, such as a VPS, Docker host, or a service like Render/Fly.io. GitHub Pages is suitable only for the static frontend.
