/**
 * Back-compat facade for the LLM structuring layer.
 *
 * The implementation now lives in `server/llm/` (Gemini free tier + offline
 * fallback). This module keeps the historical import paths used by server.ts and
 * the scripts, so nothing outside `server/llm/` needs to know the vendor changed.
 */
export {
  describeLlm,
  structureTranscript,
  type StructureOptions,
  type LlmStatus,
} from "./llm/index.js";

export { structureTranscript as structureComplaintTranscript } from "./llm/index.js";

export { heuristicStructureComplaint } from "./llm/heuristic.js";
