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
  prompt: "You are an expert software developer AI. Generate clean, professional, and optimized code.\n\n" +
    "CONTEXT:\n" +
    "Language: {{{programmingLanguage}}}\n" +
    "Framework: {{#if framework}}{{{framework}}}{{else}}None specified{{/if}}\n\n" +
    "REQUIREMENTS:\n" +
    "{{{requirements}}}\n\n" +
    "ARCHITECTURE:\n" +
    "{{{architecture}}}\n\n" +
    "{{#if existingCode}}\n" +
    "EXISTING CONTEXT:\n" +
    "SOURCE_START\n" +
    "{{{existingCode}}}\n" +
    "SOURCE_END\n" +
    "{{/if}}\n\n" +
    "INSTRUCTIONS:\n" +
    "1. Provide the full source code for the required functionality.\n" +
    "2. Ensure the code follows best practices for the chosen language and framework.\n" +
    "3. Return the source code as a single plain text block.\n" +
    "4. Do not include markdown code blocks inside your JSON string response for the generatedCode field.",
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 10000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error.message || '';
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
    
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function developerCodeGeneration(input: DeveloperCodeGenerationInput): Promise<DeveloperCodeGenerationOutput> {
  return withRetry(async () => {
    const { output } = await developerCodePrompt(input);
    if (!output) {
      throw new Error('AI Developer failed to generate a valid response.');
    }
    return output;
  });
}
