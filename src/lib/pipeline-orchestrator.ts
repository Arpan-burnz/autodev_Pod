import { 
  AgentId, 
  AgentStatus, 
  InterAgentMessage, 
  PipelineData, 
  ProductManagerOutput, 
  SystemArchitectOutput, 
  LeadDeveloperOutput, 
  QualityAssuranceOutput, 
  DevOpsOutput,
  StageDefinition
} from '@/types/pipeline';

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: 'pm',
    name: 'Product Manager',
    roleTitle: 'Technical Product Lead',
    badgeLabel: '01_PM',
    description: 'Distills requirements into user stories, feature specs, and acceptance criteria.',
    handoffLabel: 'Stories & Specs',
  },
  {
    id: 'arch',
    name: 'System Architect',
    roleTitle: 'Enterprise Architect',
    badgeLabel: '02_ARCH',
    description: 'Designs scalable system blueprints, database schemas, and REST API contracts.',
    handoffLabel: 'Schemas & APIs',
  },
  {
    id: 'dev',
    name: 'Lead Developer',
    roleTitle: 'Principal Software Engineer',
    badgeLabel: '03_DEV',
    description: 'Generates production-grade modular TypeScript code with strict separation of concerns.',
    handoffLabel: 'Source Code Stack',
  },
  {
    id: 'qa',
    name: 'Quality Assurance',
    roleTitle: 'Automated QA Lead',
    badgeLabel: '04_QA',
    description: 'Conducts code audits, categorizes vulnerability severities, and generates test suites.',
    handoffLabel: 'Audit & Test Suites',
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    roleTitle: 'Cloud Platform Architect',
    badgeLabel: '05_OPS',
    description: 'Formulates CI/CD delivery pipelines, containerization specs, and deployment plans.',
    handoffLabel: 'Delivery Manifest',
  },
];

export function createFallbackPipelineData(requirement: string): PipelineData {
  const lower = (requirement || '').toLowerCase();
  const domain = lower.includes('clinic') || lower.includes('health') || lower.includes('patient')
    ? 'Healthcare'
    : lower.includes('ticket') || lower.includes('support') || lower.includes('helpdesk')
    ? 'Customer Support'
    : 'Asset & Operations';

  const pm: ProductManagerOutput = {
    requirements: [
      `System must allow authenticated operators to register new ${domain} records with unique identifiers.`,
      `State transitions must enforce role-based access validation and status auditing.`,
      `Search and filtering latency must remain sub-50ms for local queries up to 10,000 records.`,
      `All sensitive fields (PII, customer emails) must enforce client and server-side validation regex.`,
    ],
    userStories: [
      `As an Operator, I want to create a new ${domain} record with validated fields so that operations proceed without data corruption.`,
      `As a Supervisor, I want a real-time dashboard of active, pending, and resolved entries so that team throughput is tracked.`,
      `As a Support Lead, I want to filter and search records by status or category so that high-priority items are handled first.`,
      `As an Auditor, I want an exportable JSON/CSV audit log so that historical compliance records are preserved.`,
    ],
    featureSpecifications: [
      {
        name: 'Dynamic Intake & Validation Engine',
        description: 'Multi-field input system supporting real-time regex validation, range checking, and accessible error badges.',
      },
      {
        name: 'Reactive Telemetry Dashboard',
        description: 'Live metric aggregates computing counts, status ratios, and category breakdowns directly from stored entities.',
      },
      {
        name: 'Filterable Records Directory',
        description: 'Interactive table with column sorting, keyword search, badge formatting, and inline record actions.',
      },
      {
        name: 'Persistent Local Store Layer',
        description: 'Client-first transactional state management backed by localStorage with instant synchronization.',
      },
    ],
  };

  const arch: SystemArchitectOutput = {
    systemArchitectureDescription: `The ${domain} system employs an Event-Driven Modular Component pattern. The presentation tier is built using Next.js 15 App Router with Turbopack, maintaining client-side state in an isolated reactive store. Inter-module communication uses typed interfaces to guarantee zero-mutation updates and sub-millisecond local filtering.`,
    systemBlueprintPoints: [
      'Stateless UI Layer: React Server Components paired with isolated client controllers.',
      'Data Store: Local transactional cache with fallback remote synchronization.',
      'Validation Boundary: Zod schema enforcement at form and service boundaries.',
      'Security Tier: Identity Platform token authorization with path-based owner verification.',
      'Audit Logging: Immutable action trail recorded on every state mutation.',
    ],
    databaseSchema: `-- SQL DDL / Relational Schema
CREATE TABLE records (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'Routine',
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_created ON records(created_at DESC);`,
    apiDesigns: `### REST API Contracts:
- GET /api/v1/records - Fetch paginated records with optional filters (?status=Active&query=keyword)
- POST /api/v1/records - Create a new record (Payload: { title, category, priority, metadata })
- GET /api/v1/records/:id - Retrieve record details and historical audit trail
- PUT /api/v1/records/:id - Update mutable attributes with schema validation
- DELETE /api/v1/records/:id - Remove or soft-delete record with confirmation`,
  };

  const dev: LeadDeveloperOutput = {
    codeExplanation: `Implemented a clean, decoupled 3-tier architecture: TypeScript data models with strict Zod validation, a persistent client storage layer, and reactive view components utilizing TailwindCSS design tokens.`,
    files: [
      {
        fileName: 'src/types/record.ts',
        content: `export interface RecordEntity {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export type CreateRecordInput = Omit<RecordEntity, 'id' | 'createdAt'>;
`,
      },
      {
        fileName: 'src/services/record-store.ts',
        content: `import { RecordEntity, CreateRecordInput } from '@/types/record';

const KEY = 'autodev_records_store';

export function getStoredRecords(): RecordEntity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecord(input: CreateRecordInput): RecordEntity {
  const list = getStoredRecords();
  const created: RecordEntity = {
    id: 'REC-' + Math.floor(100 + Math.random() * 900),
    createdAt: new Date().toISOString().split('T')[0],
    ...input,
  };
  localStorage.setItem(KEY, JSON.stringify([created, ...list]));
  return created;
}
`,
      },
      {
        fileName: 'src/components/RecordManagerView.tsx',
        content: `'use client';

import React, { useState, useEffect } from 'react';
import { getStoredRecords } from '@/services/record-store';
import { RecordEntity } from '@/types/record';

export function RecordManagerView() {
  const [records, setRecords] = useState<RecordEntity[]>([]);

  useEffect(() => {
    setRecords(getStoredRecords());
  }, []);

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h2 className="text-sm font-bold text-foreground">Active Directory</h2>
      <p className="text-xs text-muted-foreground mt-1">Total items: {records.length}</p>
    </div>
  );
}
`,
      },
    ],
  };

  const qa: QualityAssuranceOutput = {
    overallAssessment: `The system demonstrates exceptional architectural cleanliness. Validation rules prevent injection of malformed inputs, state isolation avoids race conditions, and test suites cover 100% of critical paths.`,
    codeReviewSummary: `Verified adherence to TypeScript strict mode, clean component composition, and responsive styling without memory leaks.`,
    identifiedIssues: [
      {
        type: 'suggestion',
        severity: 'low',
        description: 'Add debounce optimization to search input to optimize performance on datasets over 5,000 records.',
        recommendation: 'Implement useDeferredValue or a 150ms debounce hook on the search input query.',
      },
      {
        type: 'suggestion',
        severity: 'low',
        description: 'Consider adding offline service worker caching for complete air-gapped usability.',
        recommendation: 'Register next-pwa worker for offline asset caching.',
      },
    ],
    testPlan: [
      {
        type: 'unit',
        description: 'Verify regex email and character length validation on form submission.',
        expectedBehavior: 'Submitting invalid email triggers validation badge and halts submission.',
      },
      {
        type: 'integration',
        description: 'Verify record creation immediately updates KPI metric card counters.',
        expectedBehavior: 'Adding a record increments total record count and relevant status cards.',
      },
      {
        type: 'e2e',
        description: 'Complete user flow: register record -> search in table -> edit fields -> delete record.',
        expectedBehavior: 'All CRUD operations succeed, survive page refresh, and update UI in real time.',
      },
      {
        type: 'security',
        description: 'Verify client input sanitization against XSS payloads in notes and titles.',
        expectedBehavior: 'HTML entities are safely escaped without DOM execution.',
      },
    ],
  };

  const devops: DevOpsOutput = {
    ciCdPipelineOutline: `name: CI/CD Delivery Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build

  deploy:
    needs: verify
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel / Cloud Hosting
        run: npx vercel --prod --token=\${{ secrets.VERCEL_TOKEN }}`,
    suggestedDeploymentStrategies: [
      'Vercel Edge Platform: Optimal for global Next.js static and serverless edge delivery.',
      'Google Cloud Run (Containerized): Multi-region deployment using minimal alpine Docker container.',
      'AWS Amplify / ECS: Scalable enterprise hosting with custom VPC routing.',
    ],
    stepByStepInstructions: `1. Ensure environment variables (NEXT_PUBLIC_FIREBASE_*, GEMINI_API_KEY) are configured in CI secrets.
2. Trigger automated validation on pull request creation.
3. Automatically deploy preview branches for staging review.
4. Auto-promote to production on merge to main with zero-downtime blue/green routing.`,
  };

  return { pm, arch, dev, qa, devops };
}

export function generateTelemetryLog(
  stageId: AgentId, 
  phase: 'start' | 'complete' | 'handoff',
  payloadDetail?: string
): InterAgentMessage {
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const messages: Record<AgentId, Record<string, { from: string; to: string; msg: string; type: InterAgentMessage['type'] }>> = {
    pm: {
      start: { from: 'SYSTEM', to: 'PM', msg: 'Ingesting business requirement & documentation context...', type: 'status' },
      complete: { from: 'PM', to: 'SYSTEM', msg: 'Distilled PRD: Extracted requirements, user stories, and specs.', type: 'success' },
      handoff: { from: 'PM', to: 'ARCH', msg: `Context Handoff: Delivering user stories and constraints to System Architect.`, type: 'handoff' },
    },
    arch: {
      start: { from: 'ARCH', to: 'SYSTEM', msg: 'Analyzing requirements to formulate scalable architecture...', type: 'status' },
      complete: { from: 'ARCH', to: 'SYSTEM', msg: 'Architecture finalized: Blueprint, database schemas, and REST contracts ready.', type: 'success' },
      handoff: { from: 'ARCH', to: 'DEV', msg: `Context Handoff: Handing off system blueprints and data schemas to Lead Developer.`, type: 'handoff' },
    },
    dev: {
      start: { from: 'DEV', to: 'SYSTEM', msg: 'Generating vertical production code stack in TypeScript...', type: 'status' },
      complete: { from: 'DEV', to: 'SYSTEM', msg: 'Code stack compiled: Types, service stores, and components generated.', type: 'success' },
      handoff: { from: 'DEV', to: 'QA', msg: `Context Handoff: Submitting code modules to Quality Assurance for automated audit.`, type: 'handoff' },
    },
    qa: {
      start: { from: 'QA', to: 'SYSTEM', msg: 'Executing automated code audit and vulnerability inspection...', type: 'status' },
      complete: { from: 'QA', to: 'SYSTEM', msg: 'QA audit complete: Verified test cases and confirmed zero critical blockers.', type: 'success' },
      handoff: { from: 'QA', to: 'OPS', msg: `Context Handoff: Verified stack passed to DevOps for CI/CD pipeline packaging.`, type: 'handoff' },
    },
    devops: {
      start: { from: 'OPS', to: 'SYSTEM', msg: 'Formulating CI/CD pipeline and multi-cloud deployment strategies...', type: 'status' },
      complete: { from: 'OPS', to: 'SYSTEM', msg: 'Pipeline manifest generated: Cloud workflows and container configs ready.', type: 'success' },
      handoff: { from: 'OPS', to: 'SYSTEM', msg: `Pipeline complete: All 5 agent nodes successfully verified software delivery.`, type: 'success' },
    },
  };

  const current = messages[stageId][phase];
  return {
    id,
    timestamp,
    fromAgent: current.from,
    toAgent: current.to,
    message: current.msg,
    type: current.type,
    payloadSnippet: payloadDetail,
  };
}

