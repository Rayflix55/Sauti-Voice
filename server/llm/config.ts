/**
 * Environment resolution for the LLM layer.
 *
 * Everything is read lazily (per call) instead of at module load, because the
 * Express server loads dotenv *after* its route modules are imported.
 */

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Placeholder values people leave in .env files — treat as "no key". */
const PLACEHOLDER_KEYS = new Set([
  "",
  "your_api_key",
  "your_api_key_here",
  "your-gemini-api-key",
  "gemini_api_key",
  "none",
  "test",
  "changeme",
]);

export interface LlmRuntimeConfig {
  provider: "gemini";
  model: string;
  apiKey: string | null;
  /** Which env var the key came from, for the health endpoint / error text. */
  apiKeySource: "GEMINI_API_KEY" | "GOOGLE_API_KEY" | null;
  requestTimeoutMs: number;
  maxOutputTokens: number;
  /** null = let the model decide; 0 = disable thinking (fast + cheap on free tier). */
  thinkingBudget: number | null;
  /** Degrade to the offline heuristic parser instead of failing the request. */
  fallbackToHeuristic: boolean;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (trimmed.length === 0) return undefined;
  if (PLACEHOLDER_KEYS.has(trimmed.toLowerCase())) return undefined;
  // Google AI Studio keys are ~39 chars; shorter strings are almost certainly
  // leftovers from a template and would only produce a confusing 400/403.
  if (trimmed.length < 20) return undefined;
  return trimmed;
}

export function resolveLlmConfig(): LlmRuntimeConfig {
  const geminiKey = cleanKey(readEnv("GEMINI_API_KEY"));
  const googleKey = cleanKey(readEnv("GOOGLE_API_KEY"));
  const apiKey = geminiKey ?? googleKey ?? null;

  const strictMode = /^(1|true|yes)$/i.test(readEnv("LLM_STRICT") ?? "");

  return {
    provider: "gemini",
    model: readEnv("GEMINI_MODEL") ?? DEFAULT_GEMINI_MODEL,
    apiKey,
    apiKeySource: apiKey ? (geminiKey ? "GEMINI_API_KEY" : "GOOGLE_API_KEY") : null,
    requestTimeoutMs: parsePositiveInt(readEnv("LLM_TIMEOUT_MS"), 45_000),
    maxOutputTokens: parsePositiveInt(readEnv("GEMINI_MAX_OUTPUT_TOKENS"), 1600),
    // Thinking is off by default: this is a JSON extraction task and the free
    // tier caps requests per minute, so latency and token spend matter.
    thinkingBudget: readEnv("GEMINI_THINKING_BUDGET") === "auto"
      ? null
      : parsePositiveInt(readEnv("GEMINI_THINKING_BUDGET"), 0),
    fallbackToHeuristic: strictMode ? false : true,
  };
}

/** Model family gate — thinkingConfig is rejected by non-thinking models. */
export function supportsThinkingConfig(model: string): boolean {
  return /gemini-(2\.[5-9]|3|4)[\w.\-]*|^gemini-(flash|pro)-latest/i.test(model);
}
