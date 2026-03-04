'use server';
/**
 * @fileOverview An AI Quality Assurance agent responsible for generating test cases and identifying bugs/vulnerabilities in provided code.
 *
 * - aiQaTestGenerationAndExecution - A function that orchestrates the QA process.
 * - AiQaTestGenerationAndExecutionInput - The input type for the aiQaTestGenerationAndExecution function.
 * - AiQaTestGenerationAndExecutionOutput - The return type for the aiQaTestGenerationAndExecution function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiQaTestGenerationAndExecutionInputSchema = z.object({
  code: z.string().describe('The generated source code to be reviewed and tested.'),
  requirements: z
    .string()
    .optional()
    .describe('The original project requirements for context.'),
  architecture: z
    .string()
    .optional()
    .describe('The system architecture design for context.'),
});
export type AiQaTestGenerationAndExecutionInput = z.infer<
  typeof AiQaTestGenerationAndExecutionInputSchema
>;

const AiQaTestGenerationAndExecutionOutputSchema = z.object({
  testPlan: z
    .array(
      z.object({
        description: z.string().describe('A clear description of the test case.'),
        type: z
          .enum(['unit', 'integration', 'e2e', 'security', 'performance'])
          .describe('The type of test case.'),
        expectedBehavior: z.string().describe('The expected behavior or outcome of the test.'),
        stepsToReproduce: z
          .string()
          .optional()
          .describe('Optional steps to manually reproduce the test.'),
      })
    )
    .describe('A list of generated test cases.'),
  codeReviewSummary: z
    .string()
    .describe('A general summary of the code quality, adherence to best practices, and potential areas for improvement.'),
  identifiedIssues: z
    .array(
      z.object({
        type: z.enum(['bug', 'vulnerability', 'suggestion']).describe('The type of issue identified.'),
        description: z.string().describe('A detailed description of the identified issue.'),
        severity: z
          .enum(['critical', 'high', 'medium', 'low'])
          .describe('The severity of the issue.'),
        location: z
          .string()
          .optional()
          .describe('Optional: file name, line number, or component where the issue was found.'),
        recommendation: z
          .string()
          .describe('Suggested fix or mitigation for the identified issue.'),
      })
    )
    .describe('A list of identified bugs, security vulnerabilities, or suggestions.'),
  overallAssessment: z
    .string()
    .describe('An overall assessment of the code\'s quality, stability, and security posture.'),
});
export type AiQaTestGenerationAndExecutionOutput = z.infer<
  typeof AiQaTestGenerationAndExecutionOutputSchema
>;

export async function aiQaTestGenerationAndExecution(
  input: AiQaTestGenerationAndExecutionInput
): Promise<AiQaTestGenerationAndExecutionOutput> {
  return aiQaTestGenerationAndExecutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'qaAgentPrompt',
  input: { schema: AiQaTestGenerationAndExecutionInputSchema },
  output: { schema: AiQaTestGenerationAndExecutionOutputSchema },
  prompt: `You are an expert AI Quality Assurance (QA) engineer.
Your task is to analyze the provided source code, generate relevant test cases, simulate their execution (by reporting potential issues), and identify any bugs or security vulnerabilities.

Act as if you have access to a testing environment where you can execute these tests.

Given the following information, provide a comprehensive QA report:

### Requirements:
{{{requirements}}}

### Architecture:
{{{architecture}}}

### Generated Code:
'"""{{{code}}}"""'

Your output MUST be a JSON object strictly conforming to the output schema. Focus on thoroughness and provide actionable recommendations.
`,
});

const aiQaTestGenerationAndExecutionFlow = ai.defineFlow(
  {
    name: 'aiQaTestGenerationAndExecutionFlow',
    inputSchema: AiQaTestGenerationAndExecutionInputSchema,
    outputSchema: AiQaTestGenerationAndExecutionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI QA Agent failed to generate a valid response.');
    }
    return output;
  }
);
