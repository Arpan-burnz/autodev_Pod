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
  files: z.array(z.object({
    fileName: z.string().describe('Suggested file name with extension.'),
    content: z.string().describe('The full source code for this specific file.'),
  })).describe('A collection of generated source files.'),
  codeExplanation: z.string().describe('High-level explanation of the implementation strategy.'),
});
export type DeveloperCodeGenerationOutput = z.infer<typeof DeveloperCodeGenerationOutputSchema>;

const developerCodePrompt = ai.definePrompt({
  name: 'developerCodePrompt',
  input: { schema: DeveloperCodeGenerationInputSchema },
  output: { schema: DeveloperCodeGenerationOutputSchema },
  prompt: `You are a Senior Principal Software Engineer. Your task is to transform requirements and architecture into production-ready, highly readable, and modular code.

CONTEXT:
Language: {{{programmingLanguage}}}
Framework: {{#if framework}}{{{framework}}}{{else}}None specified{{/if}}

REQUIREMENTS:
{{{requirements}}}

ARCHITECTURE:
{{{architecture}}}

CRITICAL FORMATTING REQUIREMENT (STACK FORM):
1. MANDATORY VERTICAL LAYOUT: You MUST use multiple lines for every statement, function, and object property. 
2. NO HORIZONTAL COLLAPSING: DO NOT collapse code into a single line. DO NOT put multiple imports, variable declarations, or interface properties on a single line.
3. STACK FORM: Every logical block, interface property, and variable declaration MUST be on its own line.
4. NEWLINES: Use literal newline characters (\\n) extensively to ensure the code appears as a vertical "stack".
5. INDENTATION: Use a consistent 2-space indentation pattern.

Return an array of files with 'fileName' and the full source 'content'. Ensure the 'content' field is a raw string containing all necessary newline characters (\\n) for the stack-style vertical layout.`,
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
