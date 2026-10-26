# Thawing Memory

Thawing Memory is a research proof-of-concept exploring how generative AI might prompt reflection on family memory without being treated as a source of verified cultural knowledge. It is designed around first-generation Malayali diaspora experiences in South Africa. The prototype does not claim to preserve a complete or authoritative account of Malayali culture.

## Project spaces

- **Kitchen:** Users add fragments of a remembered cooking practice and can build a provisional Working Family Recipe. The current prototype has one Kitchen memory prompt. Unremembered recipe details can remain under **Still unknown**.
- **Garden:** Users write plant-related fragments and choose how to connect them in a memory map. The AI can reflect and ask questions. The intended interaction does not identify plants or provide care advice.
- **Ritual:** Users add remembered family practices and everyday routines, then arrange moments in sequence or leave their order open. This space is about family practices, not religious instruction.
- **Living Archive:** Demonstration traces are labelled as examples. User-saved traces are stored in browser storage on the current device.

The three spaces use different structures. Users decide what enters their map, sequence, recipe, and saved trace. AI responses remain separate and provisional.

## Research and limitations

The project examines how interface design can make AI contributions visible and open to review. It does not guarantee that a model will avoid unsupported details, misunderstand a family term, or follow every instruction. Evidence excerpts are checked to confirm that the quoted text appears in the cited user fragment. This does not verify that the AI interpretation is supported by that text.

Gemini is the primary provider. Groq can be configured as a fallback when Gemini is rate-limited or unavailable. The providers may produce different responses, and the prototype has not established that they behave equivalently. Submitted memory text is sent to the configured AI provider to generate a response. Saved traces remain in browser storage on the current device and are not uploaded to a public archive.

This is a local proof-of-concept, not a production service. It has no user accounts, cloud archive, community sharing, or participant study. Browser storage is not permanent preservation of cultural memory or embodied practice.

## Technology

- React, Vite, and React Router
- Node.js HTTP server for AI requests
- Gemini API with optional Groq fallback
- Browser `localStorage` for saved traces

## Local setup

Use Node.js 22.9 or later and npm. From the project directory, install dependencies and create a local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and add your provider keys. Gemini is required for the primary provider. Groq is optional and enables fallback.

```dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
AI_SERVER_PORT=3001
```

Keep `.env` private. Do not put provider keys in React code or variables prefixed with `VITE_`. The browser calls the local Node server, which makes the provider requests.

Start the server and client in separate terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the local URL printed by Vite. The development server proxies `/api` requests to the Node server on port 3001 by default.

## Project checks

```powershell
npm test
npm run lint
npm run build
```

The automatic Groq fallback applies to rate-limit and provider-unavailable errors. Invalid or malformed model responses are rejected rather than treated as evidence that the other provider will produce an equivalent answer.

