/**
 * Prompt + response parsing for legal-statement structuring.
 *
 * Kept separate from any provider so the same instructions drive the Gemini call,
 * the offline regression tests, and future models. Output is plain JSON requested
 * in the prompt (no vendor-specific structured-output schema) so it stays portable.
 */
import type { StatementSchema } from "../../src/types.js";
import { LlmInputError, LlmResponseError } from "./types.js";

export const STRUCTURING_SYSTEM_INSTRUCTIONS = `You are a legal intake and police documentation assistant for Sauti, an intake platform in Nigeria that turns spoken, code-switched citizen complaints (Nigerian Pidgin, Yoruba-English, English) into formal legal statements.

Your task is to take a spoken transcript and structure it into a formal legal statement in exactly the JSON shape described below.

Strict rules:
1. "complainant_name": Extract the full name of the complainant if stated. If the speaker does not explicitly state their name, set it to null. DO NOT guess or invent a name.
2. "incident_datetime": Extract the date and time of the incident (e.g., "Yesterday at approximately 7:00 PM", "Thursday night", "Last month"). If not mentioned, set to null.
3. "location": Extract the specific place, junction, street, market, or area where the incident occurred (e.g., "Alaba market, Lagos", "Ojuelegba junction"). If not stated, set to null.
4. "narrative": Write a formal, grammatically clear, factual statement of the incident in formal English, faithfully translating code-switched or Pidgin phrases while preserving all key factual details (e.g., items stolen, amounts in Naira, license plates like LND-234-XY, physical injuries, relationship of parties).
5. "witnesses": An array of any third-party witnesses, bystanders, or neighbors specifically mentioned (e.g. ["Corner shop seller", "Alaba market security"]). If none are mentioned, return an empty array [].
6. "requested_action": What legal or police action the complainant seeks (e.g., "Investigation and recovery of stolen items", "Prosecution for assault and battery", "Assistance in retrieving leased property"). If not stated, set to null.
7. "missing_fields": A list of explicit, polite advisory warnings for ANY core field (name, incident_datetime, location, requested_action) that is missing from the spoken account, e.g.:
   - "Complainant name not mentioned — please verify full name with complainant"
   - "Location of incident not mentioned — please confirm specific address or area"
   - "Exact date or time not specified — please confirm timestamp"
   - "Requested action not specified — please ask what relief complainant seeks"
   DO NOT guess or fabricate details for missing fields. Flag them explicitly.

Output shape (all seven keys are required, in this order):
{
  "complainant_name": string | null,
  "incident_datetime": string | null,
  "location": string | null,
  "narrative": string,
  "witnesses": string[],
  "requested_action": string | null,
  "missing_fields": string[]
}

Return ONLY the raw JSON object. No markdown code fences, no commentary, no trailing prose.`;

/** Missing-fact advisory wording the UI (and tests) expect verbatim. */
export const MISSING_FIELD_WARNINGS = {
  complainant_name:
    "Complainant name not mentioned — please confirm with complainant",
  incident_datetime:
    "Incident date and time not specified — please confirm exact timestamp",
  location:
    "Location of incident not mentioned — please confirm specific address or area",
  requested_action:
    "Requested relief not specified — please ask what action complainant seeks",
} as const;

export const MAX_TRANSCRIPT_CHARS = 20_000;

export function validateTranscript(transcript: unknown): string {
  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    throw new LlmInputError("A non-empty transcript string is required.");
  }
  const trimmed = transcript.trim();
  if (trimmed.length > MAX_TRANSCRIPT_CHARS) {
    // Free-tier Gemini caps tokens per minute; an unbounded paste would blow it.
    return `${trimmed.slice(0, MAX_TRANSCRIPT_CHARS)}\n[transcript truncated]`;
  }
  return trimmed;
}

export function buildStructuringUserPrompt(transcript: string): string {
  return `Spoken transcript to structure:\n"""\n${transcript}\n"""\n\nReturn only the JSON object.`;
}

/**
 * Pulls the JSON object out of a model reply.
 * Handles code fences and the "Here is the JSON:" preface small models sometimes add.
 */
export function extractJsonObject(raw: string): unknown {
  const text = raw.trim();
  if (!text) {
    throw new LlmResponseError("The model returned an empty response body.");
  }

  const candidates: string[] = [];

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  candidates.push(text);

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      lastError = new Error("Response JSON was not an object.");
    } catch (err) {
      lastError = err;
    }
  }

  throw new LlmResponseError(
    `Could not parse model output as statement JSON: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || /^(null|n\/a|not provided|unknown|not mentioned)$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Defends the client against partially-shaped model output: every key is present,
 * nulls stay null (never invented), and narrative always degrades to the raw text.
 */
export function normalizeStatement(
  parsed: unknown,
  transcript: string,
): StatementSchema {
  const obj = (parsed ?? {}) as Record<string, unknown>;
  return {
    complainant_name: asNullableString(obj.complainant_name),
    incident_datetime: asNullableString(obj.incident_datetime),
    location: asNullableString(obj.location),
    narrative: asNullableString(obj.narrative) ?? transcript,
    witnesses: asStringArray(obj.witnesses),
    requested_action: asNullableString(obj.requested_action),
    missing_fields: asStringArray(obj.missing_fields),
  };
}
