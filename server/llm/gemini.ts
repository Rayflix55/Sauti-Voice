/**
 * Gemini provider — the free Google AI Studio API key tier.
 *
 * Uses `@google/genai` (already the SDK this scaffold ships with) and the same
 * "ask for JSON in the prompt" contract as before, so the structuring behaviour
 * is portable across models while staying on the free tier.
 */
import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import {
  buildStructuringUserPrompt,
  extractJsonObject,
  normalizeStatement,
  STRUCTURING_SYSTEM_INSTRUCTIONS,
  validateTranscript,
} from "./prompt.js";
import {
  LlmNotConfiguredError,
  LlmResponseError,
  type LlmCallOptions,
  type LlmProvider,
  type LlmProviderResult,
} from "./types.js";
import { resolveLlmConfig, supportsThinkingConfig } from "./config.js";

let client: GoogleGenAI | null = null;
let clientApiKey: string | null = null;

/** Reuses one client per key so a long-running server doesn't rebuild it per request. */
function getClient(apiKey: string, timeoutMs: number): GoogleGenAI {
  if (!client || clientApiKey !== apiKey) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: timeoutMs },
    });
    clientApiKey = apiKey;
  }
  return client;
}

function describeApiError(err: unknown): LlmResponseError {
  const status = (err as { status?: number })?.status;
  const message = err instanceof Error ? err.message : String(err);

  if (status === 429) {
    return new LlmResponseError(
      "Gemini free tier rate limit reached (Flash is capped at roughly 10-15 requests/minute on the key tier). " +
        "Sauti did not charge anything — space out intakes or raise the tier when going live.",
      status,
    );
  }
  if (status === 400 && /api key not valid|API_KEY_INVALID/i.test(message)) {
    return new LlmResponseError(
      "GEMINI_API_KEY was rejected. Copy a fresh key from https://aistudio.google.com/apikey into .env.local.",
      status,
    );
  }
  if (
    status === 404 ||
    /not found for API version|MODEL_NOT_FOUND|unknown model|was not found/i.test(message)
  ) {
    return new LlmResponseError(
      "Gemini model could not be resolved — set GEMINI_MODEL to a model your key can use " +
        "(the free tier covers Flash / Flash-Lite only; Pro models are paid).",
      status,
    );
  }
  if (status === 403) {
    return new LlmResponseError(
      "Gemini refused this request (403) — the key may not have the Generative Language API enabled.",
      status,
    );
  }
  if (status && status >= 500) {
    return new LlmResponseError(
      `Gemini is unavailable right now (${status}) — transient upstream error.`,
      status,
    );
  }
  if (
    err instanceof Error &&
    (/fetch failed|network|ENOTFOUND|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message) ||
      err.name === "AbortError" ||
      (err as { cause?: { code?: string } }).cause?.code === "UND_ERR_CONNECT_TIMEOUT")
  ) {
    return new LlmResponseError(
      "Could not reach generativelanguage.googleapis.com — the field network may block it. " +
        `(${message})`,
    );
  }
  return new LlmResponseError(`Gemini structuring failed: ${message}`, status);
}

export class GeminiStructuringProvider implements LlmProvider {
  readonly name = "gemini" as const;
  readonly model: string;
  readonly isConfigured: boolean;

  constructor(modelOverride?: string) {
    const config = resolveLlmConfig();
    this.model = modelOverride ?? config.model;
    this.isConfigured = Boolean(config.apiKey);
  }

  async structure(
    transcript: string,
    options: LlmCallOptions = {},
  ): Promise<LlmProviderResult> {
    const config = resolveLlmConfig();
    const cleanTranscript = validateTranscript(transcript);

    if (!config.apiKey) {
      throw new LlmNotConfiguredError(
        "No Gemini API key found. Set GEMINI_API_KEY in .env.local (free key from https://aistudio.google.com/apikey).",
      );
    }

    const ai = getClient(config.apiKey, config.requestTimeoutMs);
    const model = options.model ?? this.model;

    const genConfig: GenerateContentConfig = {
      systemInstruction: STRUCTURING_SYSTEM_INSTRUCTIONS,
      temperature: 0.1,
      maxOutputTokens: config.maxOutputTokens,
      // Gemini 2.5+ "thinks" by default, which burns free-tier tokens on a
      // mechanical extraction task. Only send it where the field is supported.
      ...(supportsThinkingConfig(model) && config.thinkingBudget !== null
        ? { thinkingConfig: { thinkingBudget: config.thinkingBudget } }
        : {}),
      ...(options.signal ? { abortSignal: options.signal } : {}),
    };

    const startedAt = Date.now();
    let text: string | undefined;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildStructuringUserPrompt(cleanTranscript),
        config: genConfig,
      });
      text = response.text;
      if (!text && response.candidates?.[0]?.finishReason === "MAX_TOKENS") {
        throw new LlmResponseError(
          `Gemini hit the ${config.maxOutputTokens}-token output cap before finishing the JSON — raise GEMINI_MAX_OUTPUT_TOKENS.`,
        );
      }
      if (!text) {
        const blockedReason =
          response.promptFeedback?.blockReason ??
          response.candidates?.[0]?.finishReason;
        throw new LlmResponseError(
          `Gemini returned no text (blocked/finished with: ${blockedReason ?? "unknown"}).`,
        );
      }
      const usage = response.usageMetadata;
      const statement = normalizeStatement(
        extractJsonObject(text),
        cleanTranscript,
      );
      return {
        statement,
        model,
        latencyMs: Date.now() - startedAt,
        usage: usage
          ? {
              promptTokens: usage.promptTokenCount ?? undefined,
              outputTokens: usage.candidatesTokenCount ?? undefined,
              totalTokens: usage.totalTokenCount ?? undefined,
            }
          : undefined,
      };
    } catch (err) {
      if (err instanceof LlmResponseError) throw err;
      throw describeApiError(err);
    }
  }
}

export function createGeminiProvider(modelOverride?: string): GeminiStructuringProvider {
  return new GeminiStructuringProvider(modelOverride);
}
