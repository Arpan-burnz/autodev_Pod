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
4. DIAGRAM PROMPT: Create a highly detailed prompt for an image generator to create a professional architecture diagram. Focus on nodes, arrows, and technical labeling.

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
    try {
      const { output } = await aiSystemArchitectPrompt(input);
      if (!output) {
        throw new Error('AI System Architect produced no output.');
      }

      let diagramUrl: string | undefined;
      try {
        // Use Imagen 4 model for more reliable technical diagram generation from text
        const response = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `A professional, high-resolution technical system architecture diagram: ${output.diagramPrompt}. Minimalist, professional blue and slate color palette.`,
        });
        
        if (response.media) {
          diagramUrl = response.media.url;
        }
      } catch (imageError) {
        // Log locally but don't crash the entire design flow if only image generation fails
        console.warn('Diagram generation failed, continuing with text components only.', imageError);
      }

      return { ...output, diagramUrl };
    } catch (error: any) {
      console.error('System Architect Flow Error:', error);
      // Re-throw with a clean message to ensure Next.js receives a serializable error or success
      throw new Error(error.message || 'An internal error occurred during architecture generation.');
    }
  });
}
