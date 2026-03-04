'use server';
/**
 * @fileOverview An AI DevOps agent that suggests optimal deployment strategies and outlines CI/CD pipelines.
 *
 * - aiDevOpsDeploymentSuggestions - A function that handles the generation of deployment suggestions.
 * - DevOpsDeploymentInput - The input type for the aiDevOpsDeploymentSuggestions function.
 * - DevOpsDeploymentOutput - The return type for the aiDevOpsDeploymentSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DevOpsDeploymentInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project, its purpose, and functionalities.'),
  technologiesUsed: z
    .array(z.string())
    .describe('A list of programming languages, frameworks, and tools used in the project.'),
  targetEnvironments: z
    .array(z.string())
    .describe('A list of target deployment environments (e.g., "AWS EC2", "Google Cloud Run", "Kubernetes", "Vercel").'),
  codeSummary: z
    .string()
    .optional()
    .describe('An optional summary of the codebase structure and key components.'),
});
export type DevOpsDeploymentInput = z.infer<typeof DevOpsDeploymentInputSchema>;

const DevOpsDeploymentOutputSchema = z.object({
  suggestedDeploymentStrategies: z
    .array(z.string())
    .describe('A list of optimal deployment strategies tailored to the project, e.g., "Containerization with Docker and Kubernetes", "Serverless deployment on Google Cloud Run".'),
  ciCdPipelineOutline: z
    .string()
    .describe('A markdown-formatted detailed outline of a CI/CD pipeline, including stages like build, test, deploy.'),
  stepByStepInstructions: z
    .string()
    .describe('Markdown-formatted step-by-step instructions for deploying the application to the specified target environments.'),
});
export type DevOpsDeploymentOutput = z.infer<typeof DevOpsDeploymentOutputSchema>;

export async function aiDevOpsDeploymentSuggestions(
  input: DevOpsDeploymentInput
): Promise<DevOpsDeploymentOutput> {
  return aiDevOpsDeploymentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'devOpsDeploymentPrompt',
  input: { schema: DevOpsDeploymentInputSchema },
  output: { schema: DevOpsDeploymentOutputSchema },
  prompt: `You are an expert DevOps engineer specializing in deployment strategies and CI/CD pipeline design.
Your goal is to suggest optimal deployment strategies and outline a CI/CD pipeline, along with step-by-step instructions, for the given project.

Use the following project details:

Project Description: {{{projectDescription}}}
Technologies Used: {{#each technologiesUsed}}- {{{this}}}{{/each}}
Target Deployment Environments: {{#each targetEnvironments}}- {{{this}}}{{/each}}

{{#if codeSummary}}Code Summary: {{{codeSummary}}}{{/if}}

Based on this information, provide:
1.  **suggestedDeploymentStrategies**: A list of optimal deployment strategies. Consider the technologies used and target environments.
2.  **ciCdPipelineOutline**: A detailed, markdown-formatted outline for a CI/CD pipeline. Include stages like 'Build', 'Test', 'Deploy', and specify tools or actions for each.
3.  **stepByStepInstructions**: Markdown-formatted, step-by-step instructions for deploying the application to the specified target environments. Be clear and concise.

Ensure the output is a valid JSON object matching the DevOpsDeploymentOutputSchema.`,
});

const aiDevOpsDeploymentSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiDevOpsDeploymentSuggestionsFlow',
    inputSchema: DevOpsDeploymentInputSchema,
    outputSchema: DevOpsDeploymentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI DevOps Agent failed to generate a valid response.');
    }
    return output;
  }
);
