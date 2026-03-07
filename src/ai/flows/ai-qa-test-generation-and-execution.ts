'use server';
/**
 * @fileOverview An AI Quality Assurance agent responsible for generating test cases and identifying bugs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const AiQaTestGenerationAndExecutionInputSchema = z.object({
  code: z.string().describe('The generated source code to be reviewed and tested.'),
  requirements: z.string().optional().describe('The original project requirements for context.'),
  architecture: z.string().optional().describe('The system architecture design for context.'),
});
export type AiQaTestGenerationAndExecutionInput = z.infer<typeof AiQaTestGenerationAndExecutionInputSchema>;

const AiQaTestGenerationAndExecutionOutputSchema = z.object({
  testPlan: z.array(z.object({
    description: z.string().describe('A clear description of the test case.'),
    type: z.enum(['unit', 'integration', 'e2e', 'security', 'performance']).describe('The type of test case.'),
    expectedBehavior: z.string().describe('The expected behavior or outcome of the test.'),
  })).describe('A list of generated test cases.'),
  codeReviewSummary: z.string().describe('A general summary of the code quality.'),
  identifiedIssues: z.array(z.object({
    type: z.enum(['bug', 'vulnerability', 'suggestion']).describe('The type of issue identified.'),
    description: z.string().describe('A detailed description of the identified issue.'),
    severity: z.enum(['critical', 'high', 'medium', 'low']).describe('The severity of the issue.'),
    recommendation: z.string().describe('Suggested fix or mitigation.'),
  })).describe('A list of identified bugs, security vulnerabilities, or suggestions.'),
  overallAssessment: z.string().describe('An overall assessment of the code\'s quality.'),
});
export type AiQaTestGenerationAndExecutionOutput = z.infer<typeof AiQaTestGenerationAndExecutionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'qaAgentPrompt',
  input: { schema: AiQaTestGenerationAndExecutionInputSchema },
  output: { schema: AiQaTestGenerationAndExecutionOutputSchema },
  prompt: "You are an expert AI Quality Assurance engineer. Analyze the provided source code, generate test cases, and identify any bugs or vulnerabilities.\n\n" +
    "Requirements: {{{requirements}}}\n\n" +
    "Architecture: {{{architecture}}}\n\n" +
    "Generated Code: {{{code}}}\n\n" +
    "Focus on thoroughness and provide actionable recommendations.",
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
    throw new Error(errorMessage || 'AI QA Agent encountered a system error.');
  }
}

export async function aiQaTestGenerationAndExecution(input: AiQaTestGenerationAndExecutionInput): Promise<AiQaTestGenerationAndExecutionOutput> {
  return withRetry(async () => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI QA Agent failed to generate a valid response.');
    }
    return output;
  });
}
