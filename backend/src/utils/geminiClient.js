const { GoogleGenAI } = require('@google/genai');

let client = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

async function askGemini(systemPrompt, question) {
  const ai = getGeminiClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser question: ${question}` }],
      },
    ],
  });

  return response.text || null;
}

module.exports = { askGemini };
