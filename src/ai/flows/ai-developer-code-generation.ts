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
  prompt: `You are a Senior Principal Software Engineer. Your goal is to generate production-ready, highly maintainable, and architecturally sound code.

CONTEXT:
Language: {{{programmingLanguage}}}
Framework: {{#if framework}}{{{framework}}}{{else}}None specified{{/if}}

BUSINESS REQUIREMENTS & USER STORIES:
{{{requirements}}}

TECHNICAL ARCHITECTURE DESIGN:
{{{architecture}}}

{{#if existingCode}}
EXISTING SYSTEM CONTEXT:
SOURCE_START
{{{existingCode}}}
SOURCE_END
{{/if}}

CORE DIRECTIVES:
1. DESIGN PATTERNS: Implement industry-standard design patterns (e.g., Factory, Strategy, Observer, Repository) where appropriate to solve the problem elegantly.
2. MODULARITY: Favor small, specialized components/modules over monolithic files. Ensure strict separation of concerns (UI, Logic, Data Access, State Management).
3. TYPE SAFETY: Utilize advanced TypeScript features (Generics, Utility Types, Discriminated Unions, Type Guards) for maximum reliability and self-documenting code.
4. ERROR HANDLING: Implement comprehensive error handling strategies, including graceful fallbacks, custom error classes, and clear logging.
5. PERFORMANCE: Optimize for efficient render cycles, minimized memory footprint, and high execution speed.
6. BEST PRACTICES: Follow the DRY (Don't Repeat Yourself), KISS (Keep It Simple, Stupid), and SOLID principles strictly.

DELIVERY REQUIREMENTS:
- Provide a comprehensive and logical file structure.
- Each file must be complete, correctly imported/exported, and ready for integration.
- Return an array of files, each with a clear 'fileName' and its full 'content'.`,
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
