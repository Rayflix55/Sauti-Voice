/**
 * Shared contracts for Sauti's LLM layer.
 *
 * The structuring step is intentionally behind a small provider interface so the
 * rest of the app (Express routes, benchmark scripts, React client) never talks to
 * a vendor SDK directly. Today there is exactly one provider — Gemini on the free
 * AI Studio tier — plus the deterministic offline parser used when it can't run.
 */
import type { StatementSchema } from "../../src/types.js";

export type {
  StatementSchema,
  StructuredStatement,
  StructuringEngine,
  StructuringMeta,
} from "../../src/types.js";

/** Per-request options handed to a provider. */
export interface LlmCallOptions {
  /** Abort the in-flight request (used by route timeouts). */
  signal?: AbortSignal;
  /** Override the configured model for a single call (scripts / A-B checks). */
  model?: string;
}

/** Raw provider result — metadata only, no fallback policy. */
export interface LlmProviderResult {
  statement: StatementSchema;
  model: string;
  latencyMs: number;
  /** Token counts when the provider reports them (free-tier budget tracking). */
  usage?: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

/** A statement-structuring provider. */
export interface LlmProvider {
  readonly name: "gemini";
  readonly model: string;
  /** True when a usable API key is present in the environment. */
  readonly isConfigured: boolean;
  structure(
    transcript: string,
    options?: LlmCallOptions,
  ): Promise<LlmProviderResult>;
}

/** No API key (or the key is a placeholder) — caller may fall back offline. */
export class LlmNotConfiguredError extends Error {
  readonly code = "llm_not_configured";
  constructor(message: string) {
    super(message);
    this.name = "LlmNotConfiguredError";
  }
}

/** The provider was reachable but could not produce a usable statement. */
export class LlmResponseError extends Error {
  readonly code = "llm_response_error";
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "LlmResponseError";
    this.status = status;
  }
}

/** Transcript was empty / non-string. */
export class LlmInputError extends Error {
  readonly code = "llm_input_error";
  constructor(message: string) {
    super(message);
    this.name = "LlmInputError";
  }
}
