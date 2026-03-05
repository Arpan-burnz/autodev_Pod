'use server';
/**
 * @fileOverview An AI Product Manager agent that converts high-level project ideas into detailed requirements, user stories, and feature specifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: "You are an expert AI Product Manager. Your task is to take a high-level project idea and break it down into detailed requirements, user stories, and feature specifications.\n\n" +
    "Project Idea: {{{projectIdea}}}\n\n" +
    "Based on the project idea, generate the following:\n\n" +
    "1. Requirements: List all essential functional and non-functional requirements.\n" +
    "2. User Stories: Create user stories in the format 'As a [type of user], I want [some goal] so that [some reason]'.\n" +
    "3. Feature Specifications: Provide a list of key features with a name and a detailed description for each.\n\n" +
    "Ensure the output is comprehensive, clear, and structured correctly.",
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 5000): Promise<T> {
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

export async function generateProjectRequirements(input: GenerateProjectRequirementsInput): Promise<GenerateProjectRequirementsOutput> {
  return withRetry(async () => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI Product Manager failed to generate a valid response.');
    }
    return output;
  });
}
