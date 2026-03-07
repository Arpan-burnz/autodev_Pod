'use server';
/**
 * @fileOverview This file implements the AI System Architect flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const AISystemArchitectInputSchema = z.object({
  projectRequirements: z.string().describe('Detailed project requirements, user stories, and feature specifications.'),
});
export type AISystemArchitectInput = z.infer<typeof AISystemArchitectInputSchema>;

const AISystemArchitectOutputSchema = z.object({
  systemArchitectureDescription: z.string().describe('A high-level description of the proposed system architecture.'),
  databaseSchema: z.string().describe('Proposed database schema definitions.'),
  apiDesigns: z.string().describe('Detailed API endpoint designs.'),
  diagramPrompt: z.string().describe('A short prompt to generate a visual architecture diagram.'),
});
export type AISystemArchitectOutput = z.infer<typeof AISystemArchitectOutputSchema>;

const aiSystemArchitectPrompt = ai.definePrompt({
  name: 'aiSystemArchitectPrompt',
  input: { schema: AISystemArchitectInputSchema },
  output: { schema: AISystemArchitectOutputSchema },
  prompt: `You are an expert Enterprise System Architect. Your goal is to design a scalable, secure, and robust system based on project requirements.

PROJECT CONTEXT:
{{{projectRequirements}}}

TECHNICAL DESIGN REQUIREMENTS:
1. ARCHITECTURE DESCRIPTION: Define the system pattern (Microservices, Monolithic, Serverless, etc.). Describe the flow of data, security layers (AuthN/AuthZ), and integration points.
2. DATABASE SCHEMA: Provide a detailed schema. Use SQL DDL or NoSQL modeling as appropriate. Define entities, relationships (1:1, 1:N, N:M), indexes, and constraints.
3. API DESIGNS: Specify RESTful or GraphQL endpoints. For each, include the path, method, purpose, expected request payload, and response structure.
4. DIAGRAM PROMPT: Create a highly detailed prompt for an image generator (Gemini) to create a professional architecture diagram. Focus on nodes, arrows, and technical labeling.

Ensure the architecture is forward-thinking and optimizes for the requirements provided.`,
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error.message || '';
    const isRetryable = 
      errorMessage.includes('429') || 
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('503') ||
      errorMessage.includes('UNAVAILABLE');
    
    if (retries > 0 && isRetryable) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw new Error(errorMessage || 'AI System Architect encountered a system error.');
  }
}

export async function aiSystemArchitectDesignGeneration(input: AISystemArchitectInput): Promise<AISystemArchitectOutput & { diagramUrl?: string }> {
  return withRetry(async () => {
    const { output } = await aiSystemArchitectPrompt(input);
    if (!output) {
      throw new Error('Failed to generate system architecture design.');
    }

    try {
      // Use Gemini 2.5 Flash Image (Gemini Banana) for high-quality technical drafting
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image',
        prompt: [
          { text: `Create a professional technical system architecture blueprint based on the following instructions: ${output.diagramPrompt}. The style should be clean, high-resolution, and minimalist using a professional slate and blue color palette.` }
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return { ...output, diagramUrl: media?.url };
    } catch (error) {
      // Fail gracefully if image generation fails, returning just the text artifacts
      return output;
    }
  });
}
