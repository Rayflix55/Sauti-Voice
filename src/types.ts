export interface StatementSchema {
  complainant_name: string | null;
  incident_datetime: string | null;
  location: string | null;
  narrative: string;
  witnesses: string[];
  requested_action: string | null;
  missing_fields: string[];
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
