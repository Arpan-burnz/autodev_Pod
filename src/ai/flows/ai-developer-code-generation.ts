'use server';
/**
 * @fileOverview An AI Developer agent flow that generates code for specific functionalities.
 * Now supports generating multiple files (e.g., components, pages, utilities).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const DeveloperCodeGenerationInputSchema = z.object({
  requirements: z.string().describe('Detailed functional requirements or user stories.'),
  architecture: z.string().describe('System architecture description.'),
  programmingLanguage: z.string().describe('The programming language for code generation.'),
  framework: z.string().optional().describe('The framework to use.'),
  existingCode: z.string().optional().describe('Existing relevant code snippet.'),
});
export type DeveloperCodeGenerationInput = z.infer<typeof DeveloperCodeGenerationInputSchema>;

const DeveloperCodeGenerationOutputSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().describe('Suggested file name with extension (e.g., page.tsx, button.tsx).'),
    content: z.string().describe('The full source code for this specific file.'),
  })).describe('A collection of generated source files.'),
  codeExplanation: z.string().describe('High-level explanation of the implementation strategy.'),
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
    "1. Decompose the requirements into a logical file structure.\n" +
    "2. Provide the full source code for EACH required file (e.g., main page, reusable components, styles, or types).\n" +
    "3. Ensure the code follows best practices for the chosen language and framework.\n" +
    "4. Return an array of files, each with a clear fileName and its full content.",
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
    throw new Error(errorMessage || 'AI Developer encountered a system error.');
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
