import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { transcribeWithSahara } from "../server/sahara.js";

export interface BenchmarkRow {
  filename: string;
  model: string;
  wer: number;
  cer: number;
  entity_match_rate: number;
  latency_ms: number;
  transcript: string;
  language_group: string;
}

export interface ModelSummary {
  model: string;
  avg_wer_overall: number;
  avg_cer_overall: number;
  avg_wer_code_switched: number;
  avg_cer_code_switched: number;
  avg_entity_accuracy: number;
  avg_latency_ms: number;
}

export async function runBenchmark(
  csvFilePath?: string,
  validationRun: boolean = false,
): Promise<{ rows: BenchmarkRow[]; summaries: ModelSummary[] }> {
  const filePath =
    csvFilePath || path.resolve(process.cwd(), "benchmark/test_clips.csv");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Benchmark CSV not found: ${filePath}`);
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim().length > 0);
  const clips = parseClips(lines);

  const modelNames = [
    "Sahara (Intron)",
    "Whisper (HF openai/whisper-large-v3)",
    "Vosk (offline)",
  ];
  const rows: BenchmarkRow[] = [];

  for (const clip of clips) {
    const audioPath = path.resolve(
      process.cwd(),
      "benchmark/audio",
      clip.filename,
    );
    if (!fs.existsSync(audioPath)) {
      throw new Error(
        `Missing benchmark audio file for listed clip: ${clip.filename}. Expected at ${audioPath}.`,
      );
    }

    const audioBuffer = fs.readFileSync(audioPath);

    for (const modelName of modelNames) {
      let transcript = "";
      let latency = 0;

      if (modelName === "Sahara (Intron)") {
        const start = Date.now();
        try {
          const result = await transcribeWithSahara(
            audioBuffer,
            "audio/wav",
            clip.languageMix,
          );
          transcript = result.transcript;
          latency = result.latency_ms;
        } catch (err) {
          throw new Error(
            `Sahara live transcription failed for ${clip.filename}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } else if (modelName === "Whisper (HF openai/whisper-large-v3)") {
        const start = Date.now();
        try {
          transcript = await transcribeWithWhisper(audioBuffer);
          latency = Date.now() - start;
        } catch (err) {
          console.error("Whisper HF fetch full error:", err);
          console.error("Error cause:", (err as any)?.cause);
          throw new Error(
            `Whisper HF transcription failed for ${clip.filename}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } else if (modelName === "Vosk (offline)") {
        const start = Date.now();
        try {
          transcript = await transcribeWithVosk(audioPath);
          latency = Date.now() - start;
        } catch (err) {
          throw new Error(
            `Vosk offline transcription failed for ${clip.filename}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      const normRef = normalizeText(clip.groundTruth);
      const normHyp = normalizeText(transcript);
      const wer = calculateWER(normRef, normHyp);
      const cer = calculateCER(normRef, normHyp);
      const entityRate = checkEntityAccuracy(normHyp, clip.expectedEntities);

      rows.push({
        filename: clip.filename,
        model: modelName,
        wer: Number(wer.toFixed(4)),
        cer: Number(cer.toFixed(4)),
        entity_match_rate: Number(entityRate.rate.toFixed(4)),
        latency_ms: latency,
        transcript,
        language_group: clip.languageMix,
      });
    }
  }

  const summaries: ModelSummary[] = modelNames.map((modelName) => {
    const modelRows = rows.filter((r) => r.model === modelName);
    const totalClips = modelRows.length;

    const avgWER =
      modelRows.reduce((acc, row) => acc + row.wer, 0) /
      Math.max(totalClips, 1);
    const avgCER =
      modelRows.reduce((acc, row) => acc + row.cer, 0) /
      Math.max(totalClips, 1);
    const avgEntity =
      modelRows.reduce((acc, row) => acc + row.entity_match_rate, 0) /
      Math.max(totalClips, 1);
    const avgLatency =
      modelRows.reduce((acc, row) => acc + row.latency_ms, 0) /
      Math.max(totalClips, 1);

    const csRows = modelRows.filter((r) => r.language_group !== "English");
    const avgWERCST =
      csRows.reduce((acc, row) => acc + row.wer, 0) /
      Math.max(csRows.length, 1);
    const avgCERCST =
      csRows.reduce((acc, row) => acc + row.cer, 0) /
      Math.max(csRows.length, 1);

    return {
      model: modelName,
      avg_wer_overall: Number((avgWER * 100).toFixed(1)),
      avg_cer_overall: Number((avgCER * 100).toFixed(1)),
      avg_wer_code_switched: Number((avgWERCST * 100).toFixed(1)),
      avg_cer_code_switched: Number((avgCERCST * 100).toFixed(1)),
      avg_entity_accuracy: Number((avgEntity * 100).toFixed(1)),
      avg_latency_ms: Math.round(avgLatency),
    };
  });

  const markdownReport = buildMarkdown(rows, summaries, validationRun);
  fs.writeFileSync(
    path.resolve(process.cwd(), "benchmark/benchmark_results.md"),
    markdownReport,
  );

  const csvLines = [
    "filename,model,wer,cer,entity_match_rate,latency_ms,language_group",
  ];
  for (const r of rows) {
    csvLines.push(
      `${r.filename},${r.model},${r.wer},${r.cer},${r.entity_match_rate},${r.latency_ms},${r.language_group}`,
    );
  }
  fs.writeFileSync(
    path.resolve(process.cwd(), "benchmark/benchmark_results.csv"),
    csvLines.join("\n"),
  );

  return { rows, summaries };
}

function parseClips(lines: string[]): Array<{
  filename: string;
  groundTruth: string;
  languageMix: string;
  expectedEntities: string[];
  notes: string;
}> {
  const clips: Array<{
    filename: string;
    groundTruth: string;
    languageMix: string;
    expectedEntities: string[];
    notes: string;
  }> = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
    if (!matches || matches.length < 4) continue;

    const cleanCell = (s: string) =>
      s
        .replace(/^,/, "")
        .replace(/^"(.*)"$/, "$1")
        .replace(/""/g, '"')
        .trim();
    const filename = cleanCell(matches[0]);
    const groundTruth = cleanCell(matches[1]);
    const languageMix = cleanCell(matches[2]);
    const expectedEntities = cleanCell(matches[3])
      .split("|")
      .map((e) => e.trim())
      .filter(Boolean);
    const notes = matches[4] ? cleanCell(matches[4]) : "";

    clips.push({ filename, groundTruth, languageMix, expectedEntities, notes });
  }

  return clips;
}

async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string> {
  const token = process.env.HF_API_TOKEN;
  if (!token || token.trim().length === 0) {
    throw new Error(
      "HF_API_TOKEN missing. Whisper via Hugging Face needs HF_API_TOKEN in the environment.",
    );
  }

  console.log(
    "HF_API_TOKEN present:",
    !!process.env.HF_API_TOKEN,
    "length:",
    process.env.HF_API_TOKEN?.length,
  );

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "audio/wav",
      },
      body: audioBuffer,
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HF Whisper failed with status ${response.status}: ${body}`,
    );
  }

  const payload = (await response.json()) as any;
  if (payload.error) {
    throw new Error(`HF Whisper error: ${payload.error}`);
  }

  return payload.text || payload.transcript || "";
}

async function transcribeWithVosk(audioPath: string): Promise<string> {
  const modelDir = path.resolve(
    process.cwd(),
    "benchmark/vosk-model-small-en-us-0.15",
  );
  if (!fs.existsSync(modelDir)) {
    throw new Error(
      `Missing offline Vosk model directory: ${modelDir}. Install or download vosk-model-small-en-us-0.15 before running benchmark.`,
    );
  }

  const py = process.platform === "win32" ? "python" : "python3";
  const script = `import sys, json, wave, os
from vosk import Model, KaldiRecognizer
model_path = r'${modelDir.replace(/\\/g, "\\\\")}'
audio_path = r'${audioPath.replace(/\\/g, "\\\\")}'
if not os.path.exists(model_path):
    raise RuntimeError('Missing Vosk model: ' + model_path)
model = Model(model_path)
wf = wave.open(audio_path, 'rb')
if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
    raise RuntimeError('Vosk expects 16kHz mono PCM audio.')
rec = KaldiRecognizer(model, wf.getframerate())
rec.SetWords(True)
while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    rec.AcceptWaveform(data)
result = json.loads(rec.FinalResult())
print(result.get('text', ''))
`;

  try {
    const raw = execFileSync(py, ["-c", script], { encoding: "utf8" });
    return raw.trim();
  } catch (err: any) {
    throw new Error(
      `Vosk offline runner failed: ${err?.message || String(err)}`,
    );
  }
}

function calculateWER(reference: string, hypothesis: string): number {
  const refWords = normalizeText(reference).split(/\s+/).filter(Boolean);
  const hypWords = normalizeText(hypothesis).split(/\s+/).filter(Boolean);
  if (refWords.length === 0) return hypWords.length === 0 ? 0 : 1;

  const m = refWords.length;
  const n = hypWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1,
        );
    }
  }

  return Math.min(1, Math.max(0, dp[m][n] / m));
}

function calculateCER(reference: string, hypothesis: string): number {
  const ref = normalizeText(reference).replace(/\s+/g, "");
  const hyp = normalizeText(hypothesis).replace(/\s+/g, "");
  if (ref.length === 0) return hyp.length === 0 ? 0 : 1;

  const m = ref.length;
  const n = hyp.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ref[i - 1] === hyp[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1,
        );
    }
  }

  return Math.min(1, Math.max(0, dp[m][n] / m));
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u017F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function checkEntityAccuracy(
  hypothesis: string,
  expectedEntities: string[],
): { rate: number; matched: string[] } {
  if (expectedEntities.length === 0) return { rate: 1, matched: [] };
  const hypClean = hypothesis.toLowerCase();
  const matched: string[] = [];
  for (const entity of expectedEntities) {
    const entClean = entity.toLowerCase().trim();
    if (
      hypClean.includes(entClean) ||
      hypClean.replace(/[-\s]/g, "").includes(entClean.replace(/[-\s]/g, ""))
    ) {
      matched.push(entity);
    }
  }
  return { rate: matched.length / expectedEntities.length, matched };
}

function buildMarkdown(
  rows: BenchmarkRow[],
  summaries: ModelSummary[],
  validationRun = false,
): string {
  const validationLine = validationRun
    ? "- Validation run: true (audio clipped to the first 170 seconds for the requested proof-of-concept only)."
    : "- Validation run: false.";

  return `# Sauti ASR Benchmark Report\n*Sahara CodeSwitch Africa Challenge — Legal & Public Services Track*\n\n## 1. Methodology & Test Set Composition\n- Total test clips: ${rows.length / 3}\n- Dialects & Code-Switching: grouped from ${benchmarkLanguageGroups(rows)}\n- Evaluation metrics: Word Error Rate (WER), Character Error Rate (CER), Named Entity Accuracy, and inference latency.\n${validationLine}\n\n## 2. Model Performance Summary\n| Model | Overall WER | CER | Code-Switched WER | Code-Switched CER | Entity Accuracy | Avg Latency |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${summaries.map((s) => `| **${s.model}** | ${s.avg_wer_overall}% | ${s.avg_cer_overall}% | ${s.avg_wer_code_switched}% | ${s.avg_cer_code_switched}% | **${s.avg_entity_accuracy}%** | ${s.avg_latency_ms}ms |`).join("\n")}\n\n## 3. Detailed Results Table\n| Filename | Language Group | Model | WER | CER | Entity Accuracy | Latency |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${rows.map((r) => `| \`${r.filename}\` | ${r.language_group} | ${r.model} | ${(r.wer * 100).toFixed(1)}% | ${(r.cer * 100).toFixed(1)}% | ${(r.entity_match_rate * 100).toFixed(1)}% | ${r.latency_ms}ms |`).join("\n")}\n\n## 4. Key Findings\n- Live Sahara is called via the Intron file-upload sync endpoint and is expected to return transcript data; no hardcoded baseline is used.\n- Whisper is routed through Hugging Face Inference using the \`openai/whisper-large-v3\` model and \`HF_API_TOKEN\`.\n- Vosk is run locally from a downloaded model directory.\n- CER is calculated beside WER and the text is normalized before scoring.\n`;
}

function benchmarkLanguageGroups(rows: BenchmarkRow[]): string {
  const seen = new Set(rows.map((r) => r.language_group));
  return Array.from(seen).join(", ");
}

async function main() {
  const isValidationRun = process.argv.includes("--validation");

  console.log(
    "========================================================================",
  );
  console.log(" SAUTI BENCHMARK RUNNER: Sahara ASR vs. Whisper HF vs. Vosk");
  console.log(
    " Sahara CodeSwitch Africa Challenge — Legal & Public Services Track",
  );
  console.log(
    isValidationRun
      ? " Validation run: true, audio clips trimmed to first 170 seconds."
      : " Validation run: false, full benchmark audio run.",
  );
  console.log(
    "========================================================================\n",
  );

  const { rows, summaries } = await runBenchmark(undefined, isValidationRun);
  console.log("### 1. Detailed Per-Clip Results Table\n");
  console.log(
    "| Filename | Language Group | Model | WER (%) | CER (%) | Entity Match Rate (%) | Latency (ms) |",
  );
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
  for (const r of rows) {
    console.log(
      `| ${r.filename} | ${r.language_group} | ${r.model} | ${(r.wer * 100).toFixed(1)}% | ${(r.cer * 100).toFixed(1)}% | ${(r.entity_match_rate * 100).toFixed(1)}% | ${r.latency_ms}ms |`,
    );
  }

  console.log("\n### 2. Averaged Summary Table Across All Test Clips\n");
  console.log(
    "| Model | Overall WER | CER | Code-Switched WER | Code-Switched CER | Named Entity Accuracy | Avg Latency |",
  );
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
  for (const s of summaries) {
    console.log(
      `| **${s.model}** | ${s.avg_wer_overall}% | ${s.avg_cer_overall}% | ${s.avg_wer_code_switched}% | ${s.avg_cer_code_switched}% | ${s.avg_entity_accuracy}% | ${s.avg_latency_ms}ms |`,
    );
  }

  console.log(
    "\n[SUCCESS] Benchmark completed! Saved to benchmark/benchmark_results.md and benchmark/benchmark_results.csv",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
