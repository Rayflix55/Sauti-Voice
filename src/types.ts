export interface StatementSchema {
  complainant_name: string | null;
  incident_datetime: string | null;
  location: string | null;
  narrative: string;
  witnesses: string[];
  requested_action: string | null;
  missing_fields: string[];
}

/** Which engine produced a structured statement: free-tier Gemini or the offline parser. */
export type StructuringEngine = 'gemini' | 'offline-heuristic';

/** Provenance for a structured statement, returned by POST /api/structure. */
export interface StructuringMeta {
  provider: StructuringEngine;
  /** Model actually used — 'sauti-heuristic-v1' when structured offline. */
  model: string;
  /** Model the environment asked for, so the UI can explain a fallback. */
  requested_model?: string;
  structured_by: StructuringEngine;
  latency_ms: number;
  /** Why Gemini was skipped (no key / rate limited / bad output). Null when used. */
  fallback_reason: string | null;
  usage?: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

/** StatementSchema plus the LLM provenance block. */
export interface StructuredStatement extends StatementSchema {
  llm: StructuringMeta;
}

export interface StatementItem extends StatementSchema {
  id: string;
  case_number: string;
  created_at: string;
  updated_at: string;
  language_detected: 'Yoruba–English' | 'Pidgin–English' | 'English' | 'Hausa–English' | 'Other';
  raw_transcript: string;
  status: 'draft' | 'in_review' | 'finalized';
  officer_notes?: string;
  officer_sign_off?: boolean;
  officer_name?: string;
  audio_duration?: number;
  confidence_score?: number;
  asr_engine?: string;
  llm_engine?: StructuringEngine;
  llm_model?: string;
  llm_fallback_reason?: string | null;
  consent_to_store?: boolean;
}

export interface TranscriptionResponse {
  transcript: string;
  language_detected: 'Yoruba–English' | 'Pidgin–English' | 'English' | 'Other';
  latency_ms: number;
  engine: string;
  confidence: number;
}

export interface BenchmarkItem {
  filename: string;
  model: 'Sahara (Intron)' | 'OpenAI Whisper' | 'Google STT';
  wer: number;
  entity_match_rate: number;
  latency_ms: number;
  transcript: string;
  ground_truth: string;
  expected_entities: string[];
  matched_entities: string[];
  language_mix: string;
  notes?: string;
}

export interface BenchmarkSummary {
  model: string;
  avg_wer_overall: number;
  avg_wer_code_switched: number;
  avg_entity_accuracy: number;
  avg_latency_ms: number;
  total_clips: number;
}
