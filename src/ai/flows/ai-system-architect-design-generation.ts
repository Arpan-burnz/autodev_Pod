'use server';
/**
 * @fileOverview This file implements the AI System Architect flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: "You are an experienced AI System Architect. Design a comprehensive system architecture based on requirements.\n\n" +
    "Project Requirements: {{{projectRequirements}}}\n\n" +
    "Provide a detailed architecture description, database schema, and API designs. Also provide a specific prompt for an image generator.",
});

export async function aiSystemArchitectDesignGeneration(input: AISystemArchitectInput): Promise<AISystemArchitectOutput & { diagramUrl?: string }> {
  const { output } = await aiSystemArchitectPrompt(input);
  if (!output) {
    throw new Error('Failed to generate system architecture design.');
  }

  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A professional technical system architecture diagram. Minimalist black and white style. High resolution schematic for: ${output.diagramPrompt}`,
    });
    return { ...output, diagramUrl: media?.url };
  } catch (error) {
    console.warn('Diagram generation failed', error);
    return output;
  }
}
