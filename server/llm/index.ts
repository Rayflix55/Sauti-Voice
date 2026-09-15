/**
 * LLM layer entry point — the only module the routes and scripts import.
 *
 * Structure:
 *   prompt.ts    → vendor-neutral instructions + JSON response parsing
 *   gemini.ts    → free Google AI Studio (Gemini) provider
 *   heuristic.ts → offline regex fallback used when Gemini can't run
 *   config.ts    → env resolution (key, model, timeouts, strict mode)
 *   types.ts     → provider contract shared by all of the above
 */
import type { StructuredStatement, StructuringMeta } from "../../src/types.js";
import { resolveLlmConfig } from "./config.js";
import { createGeminiProvider } from "./gemini.js";
import { heuristicStructureComplaint } from "./heuristic.js";
import { validateTranscript } from "./prompt.js";
import {
  LlmNotConfiguredError,
  LlmResponseError,
  type LlmProvider,
} from "./types.js";

export const OFFLINE_HEURISTIC_MODEL = "sauti-heuristic-v1";

export interface StructureOptions {
  /**
   * When true, provider failures propagate instead of degrading to the offline
   * parser. Scripts and CI use this; the intake UI does not.
   */
  strict?: boolean;
  model?: string;
  signal?: AbortSignal;
}

export interface LlmStatus {
  provider: "gemini";
  model: string;
  configured: boolean;
  apiKeySource: string | null;
  fallbackToHeuristic: boolean;
  tier: "google-ai-studio-free";
}

/** What the server would do right now — used by /api/health and the UI banner. */
export function describeLlm(): LlmStatus {
  const config = resolveLlmConfig();
  return {
    provider: "gemini",
    model: config.model,
    configured: Boolean(config.apiKey),
    apiKeySource: config.apiKeySource,
    fallbackToHeuristic: config.fallbackToHeuristic,
    tier: "google-ai-studio-free",
  };
}

function resolveProvider(modelOverride?: string): LlmProvider {
  return createGeminiProvider(modelOverride);
}

function offlineMeta(
  latencyMs: number,
  reason: string,
  model = OFFLINE_HEURISTIC_MODEL,
): StructuringMeta {
  return {
    provider: "offline-heuristic",
    model,
    structured_by: "offline-heuristic",
    latency_ms: latencyMs,
    fallback_reason: reason,
  };
}

/**
 * Turns a spoken transcript into a formal statement schema.
 *
 * Default behaviour is "never block an intake": if there is no key, or the free
 * tier refuses the call, the deterministic offline parser still returns a filed
 * statement and `llm.fallback_reason` explains why Gemini was skipped.
 */
export async function structureTranscript(
  transcript: string,
  options: StructureOptions = {},
): Promise<StructuredStatement> {
  const cleanTranscript = validateTranscript(transcript);
  const config = resolveLlmConfig();
  const provider = resolveProvider(options.model);
  const strict = options.strict ?? !config.fallbackToHeuristic;

  if (!provider.isConfigured) {
    if (strict) {
      throw new LlmNotConfiguredError(
        "GEMINI_API_KEY is not set. Create a free key at https://aistudio.google.com/apikey, " +
          "put it in .env.local, and unset LLM_STRICT to allow offline structuring instead.",
      );
    }
    const reason =
      "GEMINI_API_KEY is not set — statement structured offline by the heuristic parser.";
    console.warn(`[Sauti][llm] ${reason}`);
    return {
      ...heuristicStructureComplaint(cleanTranscript),
      llm: { ...offlineMeta(0, reason), requested_model: provider.model },
    };
  }

  const startedAt = Date.now();
  try {
    const result = await provider.structure(cleanTranscript, {
      model: options.model,
      signal: options.signal,
    });

    const meta: StructuringMeta = {
      provider: "gemini",
      model: result.model,
      structured_by: "gemini",
      latency_ms: result.latencyMs,
      fallback_reason: null,
      usage: result.usage,
    };

    return { ...result.statement, llm: meta };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (strict) {
      throw err;
    }

    // Quota/auth/model failures must not stop a citizen from filing. A malformed
    // model reply is the same: the transcript is preserved, fields are flagged.
    const allowedFallback =
      err instanceof LlmResponseError || err instanceof LlmNotConfiguredError;
    if (!allowedFallback) {
      throw err;
    }

    const why =
      err instanceof LlmResponseError && err.status
        ? `HTTP ${err.status}`
        : err instanceof LlmNotConfiguredError
          ? "no usable key"
          : "provider error";
    console.warn(
      `[Sauti][llm] Gemini structuring skipped (${why}) — offline heuristic used instead: ${message}`,
    );

    return {
      ...heuristicStructureComplaint(cleanTranscript),
      llm: {
        ...offlineMeta(Date.now() - startedAt, message),
        requested_model: provider.model,
      },
    };
  }
}

export { heuristicStructureComplaint } from "./heuristic.js";
export { GeminiStructuringProvider, createGeminiProvider } from "./gemini.js";
export {
  LlmInputError,
  LlmNotConfiguredError,
  LlmResponseError,
  type LlmProvider,
  type StatementSchema,
  type StructuredStatement,
  type StructuringMeta,
} from "./types.js";
export {
  STRUCTURING_SYSTEM_INSTRUCTIONS,
  buildStructuringUserPrompt,
  extractJsonObject,
  normalizeStatement,
} from "./prompt.js";
