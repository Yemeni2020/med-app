# MedBlog

## Local setup

1. Copy `.env.example` to `.env`
2. Set `OPENAI_API_KEY`
3. Optionally set `OPENAI_MODEL` if you do not want the default `gpt-5.5`
4. Run `npm install`
5. Run `npm run dev`

## Medical AI assistant

This app includes a serious medical information assistant for visitors.

- The browser calls `/api/medical-assistant`
- The API key stays on the server side
- In local development and `vite preview`, the route is mounted by Vite middleware

The assistant is deliberately constrained:

- health topics only
- no jokes or roleplay
- no fake certainty
- no diagnosis claims
- emergency escalation for red-flag symptoms

For production, you need to deploy an equivalent server-side route that keeps `OPENAI_API_KEY` private.
