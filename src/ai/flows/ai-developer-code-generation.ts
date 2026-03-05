'use server';
/**
 * @fileOverview An AI Developer agent flow that generates code for specific functionalities.
 *
 * - developerCodeGeneration - A function that handles the code generation process.
 * - DeveloperCodeGenerationInput - The input type for the developerCodeGeneration function.
 * - DeveloperCodeGenerationOutput - The return type for the developerCodeGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DeveloperCodeGenerationInputSchema = z.object({
  requirements: z.string().describe('Detailed functional requirements or user stories.'),
  architecture: z.string().describe('System architecture description.'),
  programmingLanguage: z.string().describe('The programming language for code generation.'),
  framework: z.string().optional().describe('The framework to use.'),
  existingCode: z.string().optional().describe('Existing relevant code snippet.'),
});
export type DeveloperCodeGenerationInput = z.infer<typeof DeveloperCodeGenerationInputSchema>;

const DeveloperCodeGenerationOutputSchema = z.object({
  generatedCode: z.string().describe('The generated code.'),
  suggestedFileName: z.string().describe('Suggested file name with extension.'),
  codeExplanation: z.string().describe('Explanation of the code.'),
});
export type DeveloperCodeGenerationOutput = z.infer<typeof DeveloperCodeGenerationOutputSchema>;

export async function developerCodeGeneration(input: DeveloperCodeGenerationInput): Promise<DeveloperCodeGenerationOutput> {
  return developerCodeGenerationFlow(input);
}

const developerCodePrompt = ai.definePrompt({
  name: 'developerCodePrompt',
  input: { schema: DeveloperCodeGenerationInputSchema },
  output: { schema: DeveloperCodeGenerationOutputSchema },
  prompt: `You are an expert software developer AI. Generate clean, optimized code for the following:

Language: {{{programmingLanguage}}}
Framework: {{#if framework}}{{{framework}}}{{else}}None{{/if}}

Requirements:
{{{requirements}}}

Architecture:
{{{architecture}}}

{{#if existingCode}}
Existing Context:
{{{existingCode}}}
{{/if}}

Provide the full source code and a detailed explanation.`,
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