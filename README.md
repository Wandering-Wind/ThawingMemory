# Thawing Memory

Thawing Memory is a generative AI prototype for first-generation Malayalis in South Africa who carry partial, sensory, or family-specific cooking memories.

Rather than asking AI to declare an authentic recipe, the Kitchen treats the model as a limited interviewer and organiser. The user supplies every piece of recipe evidence, evaluates the model's interpretation, and retains authority over the saved account.

## Core interaction

1. Share a remembered cooking fragment.
2. Receive a provisional reflection, limitation, and focused question from a live model.
3. Answer or skip up to three follow-up questions.
4. Build a Working Family Recipe from user-authored fragments only.
5. Keep, edit, or reject the reconstruction.
6. Save the complete trace to the browser-local Living Archive.

Missing quantities, ingredients, timings, and steps remain visible under **Still unknown**. The model is instructed not to silently complete them.

## Design argument

The prototype investigates whether interface design can make generative AI's limits visible while returning interpretive authority to the user. Its central principle is:

> The safeguard is not the AI itself, but the interaction design around the AI.

AI and user writing remain separately labelled. Earlier AI questions are retained as context but excluded from recipe evidence.

## Current scope

- The Kitchen is the only functional reconstruction domain.
- Garden and Ritual communicate the wider concept but are intentionally marked Coming Soon.
- Saved traces remain in `localStorage` on the current device.
- No accounts, cloud database, community archive, analytics, or participant study are included.
- This is a research proof of concept, not a cultural authority or verified recipe source.

## Technology

- React 19, Vite and React Router
- Node HTTP server
- Gemini primary provider with automatic Groq fallback
- Structured JSON generation with server-side validation
- Versioned browser archive with version 1 compatibility
- Node's built-in test runner

## Local setup

Requirements: a current Node.js installation, a Gemini API key, and optionally a Groq key for fallback reliability.

```powershell
npm install
Copy-Item .env.example .env
```

Add private keys to `.env`:

```env
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3-flash-preview
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-20b
AI_SERVER_PORT=3001
```

Run the server and client in separate terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the URL printed by Vite. The client proxies `/api/reflect` to port 3001. Never commit `.env` or expose keys through a `VITE_` variable.

## Provider fallback

Gemini remains primary. Groq is attempted only after a Gemini rate limit, timeout, network failure, or temporary provider error. Both providers must pass the same local validation. Invalid structured output is surfaced instead of being concealed by switching providers.

Submitted demonstration text is sent to Gemini or, when fallback is required, Groq. The server does not intentionally log memory text.

## Verification

```powershell
npm test
npm run lint
npm run build
```

Tests cover conversation boundaries, source separation, skipped questions, recipe invalidation, request validation, provider failover, and archive-version compatibility.

## Project structure

```text
server/          Provider clients, prompts, validation and API route
src/components/  Layout, memory, reconstruction and archive components
src/pages/       Home, Kitchen, Living Archive and deferred domains
src/services/    API and browser archive boundaries
src/utils/       Pure conversation-state helpers
test/            Automated contract and state tests
docs/            Requirements, decisions, journal and reflection
```

## Accessibility and privacy

- Decorative SVGs are hidden from assistive technology.
- Loading and failure states use semantic status or alert messages.
- Keyboard focus is visible.
- Motion is disabled when reduced motion is requested.
- Failed model requests preserve user fragments.
- Saved records remain local to the browser.

Use fictional or demonstration memories while evaluating the prototype. Browser storage and free model APIs are not appropriate infrastructure for sensitive personal archives.

## Known limitations

- Free-provider quotas and model availability can change.
- Model questions may misunderstand family terms, as preserved in the demonstration archive.
- The project has not undergone formal participant testing.
- The large illustrative SVG exports require optimisation before deployment.
- Browser-local records do not synchronise between devices.

## Process documentation

The PRD, conversational specification, decision log, build journal, and critical reflection draft are available in [`docs`](./docs).
