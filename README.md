<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Sauti — Voice-First Legal Statement Intake

Sauti turns spoken, code-switched citizen complaints (Nigerian Pidgin, Yoruba-English, English)
into formal, signable police statements.

Pipeline: **Sahara (Intron) ASR** for transcription → **Gemini on the free Google AI Studio tier**
for legal statement structuring → officer review + PDF export.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy the env template and add a key:
   ```bash
   cp .env.example .env.local
   ```
   `GEMINI_API_KEY` is optional — without it Sauti still runs and structures
   statements with the offline parser (see [Fallback behaviour](#fallback-behaviour)).
3. Run the app: `npm run dev` → http://localhost:3000

### Getting a free Gemini key

1. Open https://aistudio.google.com/apikey
2. **Create API key** (no billing account or credit card required).
3. Put it in `.env.local` as `GEMINI_API_KEY=...`. Restart `npm run dev`.

The free tier covers the Flash models only — roughly **10–15 requests/minute** and
**~1,500 requests/day** for `gemini-2.5-flash`. That is ample for a single intake
terminal; for a station with many concurrent kiosks, either switch `GEMINI_MODEL` to
`gemini-2.5-flash-lite` (higher caps) or move the key to a paid tier.

## LLM structure

All model code lives in `server/llm/` — routes, scripts and the React client never
import a vendor SDK directly.

```
server/
├── llm/
│   ├── index.ts      → structureTranscript() + describeLlm() (fallback policy lives here)
│   ├── config.ts     → env resolution: key, GEMINI_MODEL, timeouts, LLM_STRICT
│   ├── prompt.ts     → intake instructions + JSON extraction/normalisation (provider-neutral)
│   ├── gemini.ts     → Google AI Studio (free tier) provider via @google/genai
│   ├── heuristic.ts  → deterministic offline parser, used when Gemini cannot run
│   └── types.ts      → LlmProvider contract + typed LLM errors
├── structuring.ts    → back-compat facade (re-exports the above)
└── sahara.ts         → ASR only; no LLM calls
```

Design notes:

- **JSON in, JSON out.** The prompt asks for the exact `StatementSchema` object and
  `prompt.ts` tolerates code fences or a prose preface. No vendor-specific
  structured-output feature is used, so `GEMINI_MODEL` can be swapped freely
  (`gemini-2.5-flash`, `gemini-2.5-flash-lite`, or any chat model) without a code change.
- **Never fabricates.** `null` for an unstated name/date/location is preserved; the
  missing field is instead surfaced in `missing_fields` for the officer to verify.
- **Thinking disabled by default** (`GEMINI_THINKING_BUDGET=0`) — extraction is
  mechanical, and the free tier bills requests and tokens you don't need.
- **One client per key**, request timeout via `httpOptions` (`LLM_TIMEOUT_MS`, default 45s).

### Environment

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | _unset_ | Free Google AI Studio key (alias `GOOGLE_API_KEY` also honoured) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Structuring model |
| `GEMINI_MAX_OUTPUT_TOKENS` | `1600` | Output cap |
| `GEMINI_THINKING_BUDGET` | `0` | `0` = off, `auto` = model default |
| `LLM_TIMEOUT_MS` | `45000` | Hard timeout for the model call |
| `LLM_STRICT` | _off_ | `1` = return an error instead of the offline fallback |

### Fallback behaviour

`POST /api/structure` always answers with the statement fields **plus** an `llm`
provenance block:

```json
{
  "complainant_name": "Amaka Okafor",
  "narrative": "…",
  "missing_fields": ["Location of incident not mentioned — please confirm specific address or area"],
  "llm": {
    "provider": "offline-heuristic",
    "model": "sauti-heuristic-v1",
    "requested_model": "gemini-2.5-flash",
    "structured_by": "offline-heuristic",
    "latency_ms": 4,
    "fallback_reason": "Gemini free tier rate limit reached (…)"
  }
}
```

If the key is missing, the free-tier quota is exhausted, the model is unreachable, or
the reply isn't parseable JSON, Sauti degrades to `server/llm/heuristic.ts` and files
the statement anyway. The Review screen then shows **"Structured by: Offline parser"**,
adds a "verify every field" note to the officer remarks, and the intake screen shows a
warning banner — a connectivity problem never blocks a citizen from filing.

## Scripts

| Command | What it does |
| :--- | :--- |
| `npm run test:llm` | Offline unit tests for the LLM layer (parsing, fallback, config). No key needed. |
| `npm run test:structuring` | Pipeline smoke test for one transcript; hits Gemini when a key is present. |
| `RUN_LIVE=1 npm run test:llm` | Also performs a real free-tier Gemini call. |
| `npm run typecheck` | `tsc --noEmit` across client + server. |
| `npm run build` / `npm start` | Production bundle (`dist/server.cjs`). |

## Notes for reviewers

- The paid `@anthropic-ai/sdk` path was removed; the app depends only on the free
  Gemini key tier. Nothing else in the pipeline changed — Sahara ASR is untouched.
- `.env*` is gitignored (only `.env.example` is committed); never commit a real key.
- Free-tier keys allow Google to use submitted content for product improvement, so do
  not send real complainant PII while benchmarking — use the sample narratives.
