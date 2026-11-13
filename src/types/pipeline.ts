export type AgentId = 'pm' | 'arch' | 'dev' | 'qa' | 'devops';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface InterAgentMessage {
  id: string;
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  type: 'status' | 'handoff' | 'success' | 'error' | 'info';
  payloadSnippet?: string;
}

export interface ProductManagerOutput {
  requirements: string[];
  userStories: string[];
  featureSpecifications: Array<{
    name: string;
    description: string;
  }>;
}

export interface SystemArchitectOutput {
  systemArchitectureDescription: string;
  databaseSchema: string;
  apiDesigns: string;
  systemBlueprintPoints: string[];
}

export interface LeadDeveloperOutput {
  files: Array<{
    fileName: string;
    content: string;
  }>;
  codeExplanation: string;
}

export interface QaIssue {
  type: 'bug' | 'vulnerability' | 'suggestion';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface QaTestCase {
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  expectedBehavior: string;
}

export interface QualityAssuranceOutput {
  testPlan: QaTestCase[];
  codeReviewSummary: string;
  identifiedIssues: QaIssue[];
  overallAssessment: string;
}

export interface DevOpsOutput {
  suggestedDeploymentStrategies: string[];
  ciCdPipelineOutline: string;
  stepByStepInstructions: string;
}

export interface PipelineData {
  pm?: ProductManagerOutput;
  arch?: SystemArchitectOutput;
  dev?: LeadDeveloperOutput;
  qa?: QualityAssuranceOutput;
  devops?: DevOpsOutput;
}

export interface StageDefinition {
  id: AgentId;
  name: string;
  roleTitle: string;
  badgeLabel: string;
  description: string;
  handoffLabel: string;
}

