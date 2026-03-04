'use server';
/**
 * @fileOverview An AI Developer agent flow that generates code for specific functionalities
 * based on provided requirements and architectural design.
 *
 * - developerCodeGeneration - A function that handles the code generation process.
 * - DeveloperCodeGenerationInput - The input type for the developerCodeGeneration function.
 * - DeveloperCodeGenerationOutput - The return type for the developerCodeGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DeveloperCodeGenerationInputSchema = z.object({
  requirements: z.string().describe('Detailed functional requirements or user stories for the functionality.'),
  architecture: z.string().describe('Description of the system architecture, including API endpoints, database models, or component interactions.'),
  programmingLanguage: z.string().describe('The programming language for code generation (e.g., TypeScript, Python).'),
  framework: z.string().optional().describe('The framework to use (e.g., Next.js, React, Express).'),
  existingCode: z.string().optional().describe('Any existing relevant code snippet that the AI should consider or integrate with.'),
});
export type DeveloperCodeGenerationInput = z.infer<typeof DeveloperCodeGenerationInputSchema>;

const DeveloperCodeGenerationOutputSchema = z.object({
  generatedCode: z.string().describe('The actual generated code as a string.'),
  suggestedFileName: z.string().describe('The suggested file name for the generated code, including extension.'),
  codeExplanation: z.string().describe('A brief explanation of the generated code, its purpose, and how to use it.'),
});
export type DeveloperCodeGenerationOutput = z.infer<typeof DeveloperCodeGenerationOutputSchema>;

export async function developerCodeGeneration(input: DeveloperCodeGenerationInput): Promise<DeveloperCodeGenerationOutput> {
  return developerCodeGenerationFlow(input);
}

const developerCodePrompt = ai.definePrompt({
  name: 'developerCodePrompt',
  input: { schema: DeveloperCodeGenerationInputSchema },
  output: { schema: DeveloperCodeGenerationOutputSchema },
  prompt: `You are an expert software developer AI. Your task is to generate clean, optimized, and well-documented code for a specific functionality based on provided requirements and architectural design.

Programming Language: {{{programmingLanguage}}}
{{#if framework}}
Framework: {{{framework}}}
{{/if}}

---
Requirements for the functionality:
{{{requirements}}}

---
Approved System Architecture Details:
{{{architecture}}}

---
{{#if existingCode}}
Existing relevant code (consider this for integration/context, but do not necessarily modify it unless explicitly asked in requirements):
---
\`\`\`
{{{existingCode}}}
\`\`\`
---
{{/if}}

Your response should only contain the generated code, a suggested filename, and a brief explanation of the code, following the specified output JSON schema. Ensure the code adheres to best practices for the given language/framework.`,
});

const developerCodeGenerationFlow = ai.defineFlow(
  {
    name: 'developerCodeGenerationFlow',
    inputSchema: DeveloperCodeGenerationInputSchema,
    outputSchema: DeveloperCodeGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await developerCodePrompt(input);
    if (!output) {
      throw new Error('AI Developer failed to generate a valid response.');
    }
    return output;
  },
);
