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
