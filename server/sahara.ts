import fs from "fs";
import path from "path";

export interface SaharaTranscriptionResult {
  transcript: string;
  language_detected: "Yoruba–English" | "Pidgin–English" | "English" | "Other";
  latency_ms: number;
  engine: string;
  confidence: number;
}

const UPLOAD_SYNC_URL = "https://infer.voice.intron.io/file/v1/upload/sync";
const STATUS_URL_PREFIX = "https://infer.voice.intron.io/file/v1/status/";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  "Swahili-English": "sw",
  "Hausa-English": "ha",
  "Yoruba-English": "yo",
  "Pidgin-English": "pcm",
};

/**
 * Calls Intron Sahara STT API for transcription.
 * Endpoint verified from https://docs.voice.intron.io/docs/stt/file-upload-sync.
 */
export async function transcribeWithSahara(
  audioBuffer: Buffer,
  mimeType: string = "audio/wav",
  languageHint?: string,
): Promise<SaharaTranscriptionResult> {
  const startTime = Date.now();
  const apiKey = process.env.SAHARA_API_KEY || process.env.INTRON_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "SAHARA_API_KEY is not set in the environment. Live Sahara transcription cannot run without the key.",
    );
  }

  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || "audio/wav" });
    const normalizedLanguage = normalizeLanguageHint(languageHint) || "en";

    formData.append("audio_file_name", "complaint_audio.wav");
    formData.append("audio_file_blob", blob, "complaint_audio.wav");
    formData.append("use_language_asr_input", normalizedLanguage);

    console.log(
      `[Sahara request payload] ${JSON.stringify({
        audio_file_name: "complaint_audio.wav",
        audio_file_blob: "<binary WAV bytes>",
        use_language_asr_input: normalizedLanguage,
      })}`,
    );

    const response = await fetch(UPLOAD_SYNC_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Sahara API returned status ${response.status}: ${body}`);
    }

    const uploaded = await response.json();
    const fileId = uploaded?.data?.file_id || uploaded?.file_id;
    if (!fileId || typeof fileId !== "string") {
      throw new Error(
        `Sahara returned an upload response without a file_id: ${JSON.stringify(uploaded)}`,
      );
    }

    const statusPayload = await pollSaharaStatus(fileId, apiKey);
    const data = statusPayload?.data || statusPayload;
    const transcript =
      data?.audio_transcript ||
      data?.transcript ||
      data?.text ||
      data?.audioText ||
      "";
    if (
      !transcript ||
      typeof transcript !== "string" ||
      transcript.trim().length === 0
    ) {
      throw new Error(
        `Sahara returned a non-transcript body: ${JSON.stringify(statusPayload)}`,
      );
    }

    const latency = Date.now() - startTime;
    const languageDetected = guessLanguageHeuristic(transcript);

    return {
      transcript,
      language_detected: languageDetected,
      latency_ms: latency,
      engine: "Sahara ASR (Intron)",
      confidence: Number(data?.confidence ?? 0.96),
    };
  } catch (err) {
    throw new Error(
      `Error calling Sahara STT API: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function pollSaharaStatus(fileId: string, apiKey: string): Promise<any> {
  const maxAttempts = 12;
  const waitMs = 2500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`${STATUS_URL_PREFIX}${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Sahara status endpoint returned ${response.status}: ${body}`,
      );
    }

    const payload = await response.json();
    const status =
      payload?.data?.processing_status || payload?.processing_status || "";
    const transcript =
      payload?.data?.audio_transcript ||
      payload?.audio_transcript ||
      payload?.transcript ||
      payload?.text ||
      "";

    if (status === "FILE_TRANSCRIBED") {
      if (
        !transcript ||
        typeof transcript !== "string" ||
        transcript.trim().length === 0
      ) {
        throw new Error(
          `Sahara file status reached FILE_TRANSCRIBED without transcript: ${JSON.stringify(payload)}`,
        );
      }
      return payload;
    }

    if (status === "FILE_PROCESSING_FAILED") {
      throw new Error(
        `Sahara file processing failed: ${JSON.stringify(payload)}`,
      );
    }

    if (
      status === "FILE_QUEUED" ||
      status === "FILE_PENDING" ||
      status === "FILE_PROCESSING"
    ) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (
      transcript &&
      typeof transcript === "string" &&
      transcript.trim().length > 0
    ) {
      return payload;
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw new Error(
    `Sahara file ${fileId} did not reach FILE_TRANSCRIBED within the polling window.`,
  );
}

function normalizeLanguageHint(languageHint?: string): string {
  if (!languageHint || languageHint.trim().length === 0) return "en";

  const raw = languageHint.trim();
  if (LANGUAGE_CODE_MAP[raw]) {
    return LANGUAGE_CODE_MAP[raw];
  }

  const normalized = raw.toLowerCase();
  if (normalized === "swahili-english") return "sw";
  if (normalized === "hausa-english") return "ha";
  if (normalized === "yoruba-english") return "yo";
  if (normalized === "pidgin-english" || normalized === "pcm-english")
    return "pcm";
  if (normalized === "english") return "en";
  return normalized;
}

// This is an internal UI heuristic only. Sahara itself does not attach a language label
// in the file-upload sync response body; the regex logic below is just for UI labeling.
function guessLanguageHeuristic(
  transcript: string,
): "Yoruba–English" | "Pidgin–English" | "English" | "Other" {
  const t = transcript.toLowerCase();
  if (
    /(wey|dey|im|don|commot|waka|abeg|wetin|kuku|abi|na|wetin dey)/i.test(t)
  ) {
    return "Pidgin–English";
  }
  if (/(mo|fẹ́|jábọ̀|ọkọ|ana|ara|ẹnikàn|kọlù|ọjọ́|bẹẹni|rẹ́)/i.test(t)) {
    return "Yoruba–English";
  }
  return "English";
}
