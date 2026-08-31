const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

let cachedModel = 'gemini-2.0-flash';

export function setGeminiModel(model) {
  cachedModel = model;
}

export function getGeminiModel() {
  return cachedModel;
}

export async function generateText({
  prompt,
  model = cachedModel,
  systemInstruction,
  json = false,
  temperature,
  maxOutputTokens,
} = {}) {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set');
  }

  const url = `${BASE_URL}/${model}:generateContent?key=${API_KEY}`;

  const contents = [{ role: 'user', parts: [{ text: prompt }] }];
  const generationConfig = {};
  if (json) generationConfig.responseMimeType = 'application/json';
  if (temperature !== undefined) generationConfig.temperature = temperature;
  if (maxOutputTokens !== undefined)
    generationConfig.maxOutputTokens = maxOutputTokens;

  const body = {
    contents,
    generationConfig,
  };
  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join('');

  if (json) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Gemini returned invalid JSON');
    }
  }

  return text;
}
