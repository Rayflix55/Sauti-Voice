/**
 * Hugging Face provider — free hosted inference, used when Gemini's network
 * path is blocked (some networks cannot reach generativelanguage.googleapis.com).
 * Reuses the same vendor-neutral prompt/parsing contract as the Gemini provider.
 */
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

const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b:groq";

function describeApiError(status: number | undefined, body: string): LlmResponseError {
  if (status === 401 || status === 403) {
    return new LlmResponseError(
      "HF_API_TOKEN was rejected, or lacks 'Make calls to Inference Providers' permission. " +
        "Check huggingface.co/settings/tokens.",
      status,
    );
  }
  if (status === 503) {
    return new LlmResponseError(
      "Hugging Face model is warming up (cold start) — retry in a few seconds.",
      status,
    );
  }
  return new LlmResponseError(`Hugging Face structuring failed (${status}): ${body}`, status);
}

export class HuggingFaceStructuringProvider implements LlmProvider {
  readonly name = "huggingface" as const;
  readonly model: string;
  readonly isConfigured: boolean;

  constructor(modelOverride?: string) {
    this.model = modelOverride ?? DEFAULT_MODEL;
    this.isConfigured = Boolean(process.env.HF_API_TOKEN);
  }

  async structure(
    transcript: string,
    options: LlmCallOptions = {},
  ): Promise<LlmProviderResult> {
    const cleanTranscript = validateTranscript(transcript);
    const token = process.env.HF_API_TOKEN;

    if (!token) {
      throw new LlmNotConfiguredError(
        "No HF_API_TOKEN found. Create a free token at https://huggingface.co/settings/tokens " +
          "with 'Make calls to Inference Providers' permission enabled, and put it in .env.local.",
      );
    }

    const model = options.model ?? this.model;
    const startedAt = Date.now();

    let response: Response;
    try {
      response = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: STRUCTURING_SYSTEM_INSTRUCTIONS },
            { role: "user", content: buildStructuringUserPrompt(cleanTranscript) },
          ],
          max_tokens: 1024,
          temperature: 0.1,
        }),
        signal: options.signal,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new LlmResponseError(`Could not reach Hugging Face: ${message}`);
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw describeApiError(response.status, bodyText);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new LlmResponseError("Hugging Face returned no text in the response.");
    }

    const statement = normalizeStatement(extractJsonObject(text), cleanTranscript);
    const usage = data?.usage;

    return {
      statement,
      model,
      latencyMs: Date.now() - startedAt,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens ?? undefined,
            outputTokens: usage.completion_tokens ?? undefined,
            totalTokens: usage.total_tokens ?? undefined,
          }
        : undefined,
    };
  }
}

export function createHuggingFaceProvider(modelOverride?: string): HuggingFaceStructuringProvider {
  return new HuggingFaceStructuringProvider(modelOverride);
}