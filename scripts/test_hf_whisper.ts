import { readFileSync } from "fs";

async function test() {
  const audioBuffer = readFileSync("scripts/fixtures/LDC93S1.wav");
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
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "audio/wav",
      },
      body: audioBuffer,
    },
  );

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Body:", text);
}

test().catch((err) => {
  console.error("Full error:", err);
  console.error("Cause:", (err as any)?.cause);
});
