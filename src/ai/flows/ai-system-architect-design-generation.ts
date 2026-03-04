'use server';
/**
 * @fileOverview This file implements the AI System Architect flow.
 * It takes detailed project requirements as input and generates a comprehensive system
 * architecture design, including high-level descriptions, database schemas, and API designs.
 *
 * - aiSystemArchitectDesignGeneration - A function that orchestrates the system architecture generation process.
 * - AISystemArchitectInput - The input type for the aiSystemArchitectDesignGeneration function.
 * - AISystemArchitectOutput - The return type for the aiSystemArchitectDesignGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISystemArchitectInputSchema = z.object({
  projectRequirements: z
    .string()
    .describe(
      'Detailed project requirements, user stories, and feature specifications from the product manager. This should be comprehensive enough to design an architecture.'
    ),
});
export type AISystemArchitectInput = z.infer<
  typeof AISystemArchitectInputSchema
>;

const AISystemArchitectOutputSchema = z.object({
  systemArchitectureDescription: z
    .string()
    .describe(
      'A high-level description of the proposed system architecture. This includes major components (e.g., frontend, backend, database, external services), their interactions, scaling considerations, and technology stack recommendations. Provide a rationale for key design decisions.'
    ),
  databaseSchema: z
    .string()
    .describe(
      'Proposed database schema definitions. For relational databases, provide SQL DDL (CREATE TABLE statements). For NoSQL databases, describe the document/collection structure with example documents. Justify the choice of database type.'
    ),
  apiDesigns: z
    .string()
    .describe(
      'Detailed API endpoint designs. For each major functionality, specify the HTTP method, path, request body structure (JSON/XML), response body structure (JSON/XML), authentication requirements, and error codes. Use a clear, human-readable text format, similar to a simplified OpenAPI specification.'
    ),
});
export type AISystemArchitectOutput = z.infer<
  typeof AISystemArchitectOutputSchema
>;

export async function aiSystemArchitectDesignGeneration(
  input: AISystemArchitectInput
): Promise<AISystemArchitectOutput> {
  return aiSystemArchitectDesignGenerationFlow(input);
}

const aiSystemArchitectPrompt = ai.definePrompt({
  name: 'aiSystemArchitectPrompt',
  input: {schema: AISystemArchitectInputSchema},
  output: {schema: AISystemArchitectOutputSchema},
  prompt: `You are an experienced AI System Architect. Your task is to design a comprehensive system architecture, including database schemas and API designs, based on the provided project requirements.\n\nCarefully analyze the project requirements and consider aspects like scalability, security, performance, and maintainability.\n\nYour output MUST be a JSON object structured exactly according to the provided output schema descriptions. Ensure all fields are populated with detailed and technically sound information.\n\nProject Requirements:\n{{{projectRequirements}}}`,
});

const aiSystemArchitectDesignGenerationFlow = ai.defineFlow(
  {
    name: 'aiSystemArchitectDesignGenerationFlow',
    inputSchema: AISystemArchitectInputSchema,
    outputSchema: AISystemArchitectOutputSchema,
  },
  async input => {
    const {output} = await aiSystemArchitectPrompt(input);
    if (!output) {
      throw new Error('Failed to generate system architecture design.');
    }
    return output;
  }
);
