'use server';
/**
 * @fileOverview An AI DevOps agent that suggests optimal deployment strategies.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DevOpsDeploymentInputSchema = z.object({
  projectDescription: z.string().describe('Project description.'),
  technologiesUsed: z.array(z.string()).describe('Technologies used.'),
  targetEnvironments: z.array(z.string()).describe('Target environments.'),
  codeSummary: z.string().optional().describe('Optional code summary.'),
});
export type DevOpsDeploymentInput = z.infer<typeof DevOpsDeploymentInputSchema>;

const DevOpsDeploymentOutputSchema = z.object({
  suggestedDeploymentStrategies: z.array(z.string()).describe('List of strategies.'),
  ciCdPipelineOutline: z.string().describe('Markdown CI/CD outline.'),
  stepByStepInstructions: z.string().describe('Markdown instructions.'),
});
export type DevOpsDeploymentOutput = z.infer<typeof DevOpsDeploymentOutputSchema>;

const prompt = ai.definePrompt({
  name: 'devOpsDeploymentPrompt',
  input: { schema: DevOpsDeploymentInputSchema },
  output: { schema: DevOpsDeploymentOutputSchema },
  prompt: "You are an expert DevOps engineer. Suggest deployment strategies for:\n\n" +
    "Project: {{{projectDescription}}}\n" +
    "Tech: {{#each technologiesUsed}}- {{{this}}}{{/each}}\n" +
    "Environments: {{#each targetEnvironments}}- {{{this}}}{{/each}}\n\n" +
    "{{#if codeSummary}}Summary: {{{codeSummary}}}{{/if}}\n\n" +
    "Provide strategies, a CI/CD outline, and step-by-step instructions.",
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
    throw new Error(errorMessage || 'AI DevOps Agent encountered a system error.');
  }
}

export async function aiDevOpsDeploymentSuggestions(
  input: DevOpsDeploymentInput
): Promise<DevOpsDeploymentOutput> {
  return withRetry(async () => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI DevOps Agent failed to generate a valid response.');
    }
    return output;
  });
}
