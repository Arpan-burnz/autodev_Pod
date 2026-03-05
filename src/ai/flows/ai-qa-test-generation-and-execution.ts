'use server';
/**
 * @fileOverview An AI Quality Assurance agent responsible for generating test cases and identifying bugs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export async function aiQaTestGenerationAndExecution(input: AiQaTestGenerationAndExecutionInput): Promise<AiQaTestGenerationAndExecutionOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error('AI QA Agent failed to generate a valid response.');
  }
  return output;
}
