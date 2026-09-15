async function listModels() {
  const response = await fetch('https://router.huggingface.co/v1/models', {
    headers: {
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
    },
  });
  const data = await response.json();

  // Filter to only models that list groq as a provider
  const groqModels = data.data.filter((m: any) =>
    JSON.stringify(m).toLowerCase().includes('groq')
  );

  console.log(`Found ${groqModels.length} models available via Groq:\n`);
  groqModels.forEach((m: any) => console.log(m.id));
}

listModels().catch(err => console.error('Error:', err));