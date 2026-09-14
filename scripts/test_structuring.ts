import { structureComplaintTranscript } from "../server/structuring.js";

async function main() {
  console.log("=== Sauti LLM Structuring Isolation Test (Step 3) ===");

  const sampleTranscript =
    "My neighbor broke into my shop last night around 10pm and took my phone and some money from the drawer.";
  console.log(`Testing transcript: "${sampleTranscript}"\n`);

  const result = await structureComplaintTranscript(sampleTranscript);

  console.log("--- Structured Statement JSON Result ---");
  console.log(JSON.stringify(result, null, 2));

  // Assert schema compliance
  const requiredKeys = [
    "complainant_name",
    "incident_datetime",
    "location",
    "narrative",
    "witnesses",
    "requested_action",
    "missing_fields",
  ];

  for (const key of requiredKeys) {
    if (!(key in result)) {
      throw new Error(`Missing required key in output schema: ${key}`);
    }
  }

  if (result.location !== null) {
    throw new Error(
      `Expected location to be null, got ${JSON.stringify(result.location)}`,
    );
  }

  if (
    !Array.isArray(result.missing_fields) ||
    !result.missing_fields.includes(
      "Location of incident not mentioned — please confirm specific address or area",
    )
  ) {
    throw new Error(
      `Expected missing_fields to include location warning, got ${JSON.stringify(result.missing_fields)}`,
    );
  }

  console.log(
    "\n[SUCCESS] Statement JSON complies with exact required schema!",
  );
  console.log(
    `Flagged missing fields (${result.missing_fields.length}):`,
    result.missing_fields,
  );
}

main().catch((err) => {
  console.error("[ERROR] LLM structuring test failed:", err);
  process.exit(1);
});
