'use server';
/**
 * @fileOverview An AI Product Manager agent that converts high-level project ideas into detailed requirements, user stories, and feature specifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const GenerateProjectRequirementsInputSchema = z.object({
  projectIdea: z.string().describe('A high-level description of the project idea.'),
});
export type GenerateProjectRequirementsInput = z.infer<typeof GenerateProjectRequirementsInputSchema>;

const GenerateProjectRequirementsOutputSchema = z.object({
  requirements: z.array(z.string()).describe('A list of detailed functional and non-functional requirements for the project.'),
  userStories: z.array(z.string()).describe('A list of user stories, each describing a feature from an end-user perspective.'),
  featureSpecifications: z.array(z.object({
    name: z.string().describe('The name of the feature.'),
    description: z.string().describe('A detailed description of the feature.'),
  })).describe('A list of detailed specifications for each major feature.'),
});
export type GenerateProjectRequirementsOutput = z.infer<typeof GenerateProjectRequirementsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateProjectRequirementsPrompt',
  input: { schema: GenerateProjectRequirementsInputSchema },
  output: { schema: GenerateProjectRequirementsOutputSchema },
  prompt: `You are an expert AI Product Manager specializing in Technical Product Management. Your task is to transform a project idea into a rigorous, detailed set of requirements.

PROJECT CONCEPT:
{{{projectIdea}}}

OUTPUT GUIDELINES:
1. REQUIREMENTS: Provide a mix of Functional (features) and Non-Functional requirements (scalability, security, performance, accessibility). Be specific about edge cases.
2. USER STORIES: Use the standard format: "As a [user type], I want [goal] so that [benefit]". Include acceptance criteria if possible.
3. FEATURE SPECIFICATIONS: For each major feature, provide a name and a deep-dive description that includes UX considerations and technical dependencies.

Ensure the output is highly structured, logical, and provides a solid foundation for architectural design.`,
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
    throw new Error(errorMessage || 'AI Product Manager encountered a system error.');
  }
}

export async function generateProjectRequirements(input: GenerateProjectRequirementsInput): Promise<GenerateProjectRequirementsOutput> {
  return withRetry(async () => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI Product Manager failed to generate a valid response.');
    }
    return output;
  });
}
