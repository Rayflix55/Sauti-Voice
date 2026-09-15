/**
 * LLM layer tests — runs offline, no network, no key required.
 *
 *   npm run test:llm
 *
 * Add GEMINI_API_KEY to .env.local and set RUN_LIVE=1 to also exercise a real
 * free-tier Gemini round trip.
 */
import assert from "node:assert/strict";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({
  path: [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ],
});

const {
  extractJsonObject,
  normalizeStatement,
} = await import("../server/llm/prompt.js");
const { heuristicStructureComplaint } = await import(
  "../server/llm/heuristic.js"
);
const { structureTranscript, describeLlm } = await import("../server/llm/index.js");
const { resolveLlmConfig, supportsThinkingConfig } = await import(
  "../server/llm/config.js"
);
const { LlmNotConfiguredError, LlmResponseError } = await import(
  "../server/llm/types.js"
);

const SAMPLE =
  "My neighbor broke into my shop last night around 10pm and took my phone and some money from the drawer.";

const results: { name: string; ok: boolean; note?: string }[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, note: err instanceof Error ? err.message : String(err) });
    console.error(`  ✗ ${name}\n      ${err instanceof Error ? err.message : err}`);
  }
}

console.log("\n=== Sauti LLM layer (Gemini free tier + offline fallback) ===\n");

console.log("prompt parsing:");

await test("accepts bare JSON", () => {
  const parsed = extractJsonObject('{"narrative":"ok"}') as { narrative: string };
  assert.equal(parsed.narrative, "ok");
});

await test("strips markdown code fences", () => {
  const parsed = extractJsonObject(
    '```json\n{"narrative":"fenced","witnesses":[]}\n```',
  ) as { witnesses: unknown[] };
  assert.deepEqual(parsed.witnesses, []);
});

await test("tolerates a prose preface and trailing note", () => {
  const parsed = extractJsonObject(
    'Here is the structured statement:\n{"narrative":"clean"}\nHope that helps!',
  ) as { narrative: string };
  assert.equal(parsed.narrative, "clean");
});

await test("throws LlmResponseError on unparseable output", () => {
  assert.throws(
    () => extractJsonObject("I could not process this audio transcript."),
    (err: unknown) => err instanceof LlmResponseError,
  );
});

await test("never fabricates: unknown and 'N/A' become null", () => {
  const normalized = normalizeStatement(
    {
      complainant_name: "Not mentioned",
      incident_datetime: "N/A",
      location: "unknown",
      narrative: "",
      witnesses: "Corner shop seller",
      requested_action: 42,
      missing_fields: null,
    },
    SAMPLE,
  );
  assert.equal(normalized.complainant_name, null);
  assert.equal(normalized.incident_datetime, null);
  assert.equal(normalized.location, null);
  assert.equal(normalized.narrative, SAMPLE, "empty narrative keeps raw transcript");
  assert.deepEqual(normalized.witnesses, [], "non-array witnesses are dropped");
  assert.equal(normalized.requested_action, null);
  assert.deepEqual(normalized.missing_fields, []);
});

console.log("\noffline fallback:");

await test("heuristic extracts time, witnesses and flags the missing location", () => {
  const statement = heuristicStructureComplaint(SAMPLE);
  assert.match(statement.incident_datetime ?? "", /last night/i);
  assert.deepEqual(statement.witnesses, ["Adjacent neighbor"]);
  assert.equal(statement.location, null);
  assert.ok(
    statement.missing_fields.includes(
      "Location of incident not mentioned — please confirm specific address or area",
    ),
  );
});

await test("missing key degrades to the offline parser and says why", async () => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  try {
    const statement = await structureTranscript(SAMPLE, { strict: false });
    assert.equal(statement.llm.structured_by, "offline-heuristic");
    assert.equal(statement.llm.provider, "offline-heuristic");
    assert.match(statement.llm.fallback_reason ?? "", /GEMINI_API_KEY is not set/);
    assert.ok(statement.narrative.length > 0);
  } finally {
    if (saved) process.env.GEMINI_API_KEY = saved;
  }
});

await test("LLM_STRICT=1 surfaces the error instead of degrading", async () => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  try {
    await assert.rejects(
      () => structureTranscript(SAMPLE, { strict: true }),
      (err: unknown) => err instanceof LlmNotConfiguredError,
    );
  } finally {
    if (saved) process.env.GEMINI_API_KEY = saved;
  }
});

console.log("\nconfig:");

await test("placeholder and short keys are rejected", () => {
  const saved = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "your_api_key_here";
  assert.equal(resolveLlmConfig().apiKey, null);
  process.env.GEMINI_API_KEY = "abc123";
  assert.equal(resolveLlmConfig().apiKey, null);
  if (saved) process.env.GEMINI_API_KEY = saved;
  else delete process.env.GEMINI_API_KEY;
});

await test("GOOGLE_API_KEY is honoured as an alias and reported", () => {
  const savedGemini = process.env.GEMINI_API_KEY;
  const savedGoogle = process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  process.env.GOOGLE_API_KEY = "AIzaSyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const config = resolveLlmConfig();
  assert.equal(config.apiKeySource, "GOOGLE_API_KEY");
  assert.ok(config.apiKey);
  if (savedGemini) process.env.GEMINI_API_KEY = savedGemini;
  if (savedGoogle) process.env.GOOGLE_API_KEY = savedGoogle;
});

await test("free-tier defaults: gemini-2.5-flash, thinking off, fallback on", () => {
  const saved = {
    model: process.env.GEMINI_MODEL,
    strict: process.env.LLM_STRICT,
    budget: process.env.GEMINI_THINKING_BUDGET,
  };
  delete process.env.GEMINI_MODEL;
  delete process.env.LLM_STRICT;
  delete process.env.GEMINI_THINKING_BUDGET;
  const config = resolveLlmConfig();
  assert.equal(config.model, "gemini-2.5-flash");
  assert.equal(config.thinkingBudget, 0);
  assert.equal(config.fallbackToHeuristic, true);
  assert.equal(supportsThinkingConfig(config.model), true);
  assert.equal(supportsThinkingConfig("gemini-2.0-flash"), false);
  if (saved.model) process.env.GEMINI_MODEL = saved.model;
  if (saved.strict) process.env.LLM_STRICT = saved.strict;
  if (saved.budget) process.env.GEMINI_THINKING_BUDGET = saved.budget;
});

await test("describeLlm reports status without exposing the key", () => {
  const status = describeLlm();
  assert.equal(status.provider, "gemini");
  assert.equal(typeof status.configured, "boolean");
  assert.ok(!JSON.stringify(status).includes("AIza"));
});

if (process.env.RUN_LIVE === "1" && process.env.GEMINI_API_KEY) {
  console.log("\nlive Gemini free-tier call:");
  await test("structures a Pidgin transcript into the exact schema", async () => {
    const statement = await structureTranscript(
      "Abeg, yesterday around 7pm one boy with motorcycle hit my leg for Ojuelegba junction. Dem carry my phone. I want make police help me find am.",
      { strict: true },
    );
    assert.deepEqual(
      Object.keys(statement).filter((key) => key !== "llm").sort(),
      [
        "complainant_name",
        "incident_datetime",
        "location",
        "missing_fields",
        "narrative",
        "requested_action",
        "witnesses",
      ].sort(),
    );
    assert.equal(statement.llm.structured_by, "gemini");
    assert.ok(statement.narrative.length > 40);
    console.log(
      `      model=${statement.llm.model} latency=${statement.llm.latency_ms}ms tokens=${
        statement.llm.usage?.totalTokens ?? "?"
      }`,
    );
  });
} else {
  console.log(
    "\nlive call: skipped (set RUN_LIVE=1 with a GEMINI_API_KEY to exercise it)",
  );
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} passed${
    failed.length ? ` — ${failed.map((f) => f.name).join(", ")}` : ""
  }\n`,
);
process.exit(failed.length > 0 ? 1 : 0);
