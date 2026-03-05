'use server';
/**
 * @fileOverview An AI Developer agent flow that generates code for specific functionalities.
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

const developerCodePrompt = ai.definePrompt({
  name: 'developerCodePrompt',
  input: { schema: DeveloperCodeGenerationInputSchema },
  output: { schema: DeveloperCodeGenerationOutputSchema },
  prompt: `You are an expert software developer AI. Your goal is to generate clean, professional, and optimized code based on the provided specifications.

CONTEXT:
Language: {{{programmingLanguage}}}
Framework: {{#if framework}}{{{framework}}}{{else}}None specified{{/if}}

REQUIREMENTS:
{{{requirements}}}

ARCHITECTURE:
{{{architecture}}}

{{#if existingCode}}
EXISTING CONTEXT:
{{{existingCode}}}
{{/if}}

INSTRUCTIONS:
1. Provide the full source code for the required functionality.
2. Ensure the code follows best practices for the chosen language and framework.
3. Provide a clear, technical explanation of the implementation details.
4. Return the source code as a single plain text block.`,
});

export async function developerCodeGeneration(input: DeveloperCodeGenerationInput): Promise<DeveloperCodeGenerationOutput> {
  const { output } = await developerCodePrompt(input);
  if (!output) {
    throw new Error('AI Developer failed to generate a valid response.');
  }
  return output;
}
