/**
 * Structuring smoke test — Step 3 of the intake pipeline.
 *
 *   npm run test:structuring                # offline (no key needed)
 *   GEMINI_API_KEY=... npm run test:structuring   # live, free-tier Gemini
 *   LLM_STRICT=1 npm run test:structuring   # fail loudly instead of degrading
 */
import dotenv from "dotenv";
import path from "node:path";
import {
  heuristicStructureComplaint,
  structureTranscript,
} from "../server/structuring.js";
import { resolveLlmConfig } from "../server/llm/config.js";

// resolveLlmConfig() reads process.env per call, so loading after the imports is fine.
dotenv.config({
  path: [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ],
});

const REQUIRED_KEYS = [
  "complainant_name",
  "incident_datetime",
  "location",
  "narrative",
  "witnesses",
  "requested_action",
  "missing_fields",
] as const;

const sampleTranscript =
  "My neighbor broke into my shop last night around 10pm and took my phone and some money from the drawer.";

function assertStatement(
  label: string,
  result: Awaited<ReturnType<typeof structureTranscript>>,
) {
  console.log(`--- ${label} ---`);
  console.log(JSON.stringify(result, null, 2));

  for (const key of REQUIRED_KEYS) {
    if (!(key in result)) {
      throw new Error(`[${label}] missing required key in output schema: ${key}`);
    }
  }
  if (typeof result.narrative !== "string" || result.narrative.trim() === "") {
    throw new Error(`[${label}] narrative must be a non-empty string`);
  }
  if (!Array.isArray(result.witnesses) || !Array.isArray(result.missing_fields)) {
    throw new Error(`[${label}] witnesses and missing_fields must be arrays`);
  }
  // Nothing in this transcript names a place — the parser must flag it, not invent it.
  if (result.location !== null) {
    throw new Error(
      `[${label}] expected location to be null, got ${JSON.stringify(result.location)}`,
    );
  }
  if (
    !result.missing_fields.includes(
      "Location of incident not mentioned — please confirm specific address or area",
    )
  ) {
    throw new Error(
      `[${label}] expected missing_fields to include the location warning, got ${JSON.stringify(
        result.missing_fields,
      )}`,
    );
  }
  console.log(
    `[OK] ${label}: schema valid · ${result.missing_fields.length} field(s) flagged for verification`,
  );
}

async function main() {
  console.log("=== Sauti LLM Structuring Test (Step 3) ===\n");
  console.log(`Transcript: "${sampleTranscript}"\n`);

  const config = resolveLlmConfig();
  const live = Boolean(config.apiKey);
  console.log(
    `Provider: gemini · model: ${config.model} · key: ${
      live ? `set (${config.apiKeySource})` : "not set → offline heuristic"
    }\n`,
  );

  if (live) {
    const result = await structureTranscript(sampleTranscript, {
      strict: process.env.LLM_STRICT === "1",
    });
    assertStatement(`Live Gemini (${result.llm.model}, ${result.llm.latency_ms}ms)`, result);
    if (result.llm.structured_by === "offline-heuristic") {
      console.warn(
        `\n[WARN] Gemini was configured but unusable — statement came from the offline parser:\n       ${result.llm.fallback_reason}`,
      );
    }
  } else {
    console.log(
      "[SKIP] No GEMINI_API_KEY — running the offline path only. Add a free key from\n" +
        "       https://aistudio.google.com/apikey to .env.local for the live test.\n",
    );
    const offline = await structureTranscript(sampleTranscript);
    assertStatement("Offline fallback (no key)", offline);
  }

  assertStatement(
    "Heuristic parser (direct)",
    { ...heuristicStructureComplaint(sampleTranscript), llm: {
        provider: "offline-heuristic",
        model: "sauti-heuristic-v1",
        structured_by: "offline-heuristic",
        latency_ms: 0,
        fallback_reason: null,
      } },
  );

  console.log("\n[SUCCESS] Structuring output complies with the required schema.");
}

main().catch((err) => {
  console.error("[ERROR] LLM structuring test failed:", err);
  process.exit(1);
});
