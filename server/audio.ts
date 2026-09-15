import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import ffmpegPath from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export async function convertToSaharaWav(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<Buffer> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static did not provide an ffmpeg binary.");
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sauti-audio-"));
  const inputPath = path.join(tempDir, `input${extensionForMime(mimeType)}`);
  const outputPath = path.join(tempDir, "output.wav");

  try {
    await fs.writeFile(inputPath, audioBuffer);
    await execFileAsync(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      inputPath,
      "-ar",
      "16000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      outputPath,
    ]);
    return await fs.readFile(outputPath);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Audio conversion to 16 kHz mono WAV failed: ${detail}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function extensionForMime(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(";", 1)[0];
  if (normalized === "audio/webm") return ".webm";
  if (normalized === "audio/ogg") return ".ogg";
  if (normalized === "audio/mp4" || normalized === "audio/m4a") return ".m4a";
  if (normalized === "audio/mpeg") return ".mp3";
  return ".wav";
}
