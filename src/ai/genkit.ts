import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyDWoWlA9pigu8A7k9DxgLATEq5PhUCZ32k',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
