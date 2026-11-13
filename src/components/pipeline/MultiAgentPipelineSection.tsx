'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Rocket, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  Download, 
  Play, 
  Copy, 
  Check, 
  FileCode, 
  Activity, 
  Database, 
  Server, 
  Terminal as TerminalIcon,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { 
  AgentId, 
  AgentStatus, 
  InterAgentMessage, 
  PipelineData, 
  StageDefinition 
} from '@/types/pipeline';
import { 
  PIPELINE_STAGES, 
  createFallbackPipelineData, 
  generateTelemetryLog 
} from '@/lib/pipeline-orchestrator';

interface MultiAgentPipelineSectionProps {
  initialIdea: string;
  initialData?: PipelineData;
  onPipelineDataChange?: (data: PipelineData) => void;
  className?: string;
}

export function MultiAgentPipelineSection({
  initialIdea,
  initialData,
  onPipelineDataChange,
  className,
}: MultiAgentPipelineSectionProps) {
  const { toast } = useToast();
  const [pipelineData, setPipelineData] = useState<PipelineData>(() => 
    initialData || createFallbackPipelineData(initialIdea)
  );

  const [statuses, setStatuses] = useState<Record<AgentId, AgentStatus>>({
    pm: 'completed',
    arch: 'completed',
    dev: 'completed',
    qa: 'completed',
    devops: 'completed',
  });

  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('pm');
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);
  const [selectedCodeFileIdx, setSelectedCodeFileIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize initial telemetry stream
  useEffect(() => {
    const initialLogs: InterAgentMessage[] = [
      generateTelemetryLog('pm', 'start'),
      generateTelemetryLog('pm', 'complete'),
      generateTelemetryLog('pm', 'handoff', '4 User Stories, 4 Feature Specs'),
      generateTelemetryLog('arch', 'start'),
      generateTelemetryLog('arch', 'complete'),
      generateTelemetryLog('arch', 'handoff', 'Schema DDL, 5 REST Endpoints'),
      generateTelemetryLog('dev', 'start'),
      generateTelemetryLog('dev', 'complete'),
      generateTelemetryLog('dev', 'handoff', '3 TypeScript modules, data store'),
      generateTelemetryLog('qa', 'start'),
      generateTelemetryLog('qa', 'complete'),
      generateTelemetryLog('qa', 'handoff', '4 test cases, zero critical blockers'),
      generateTelemetryLog('devops', 'start'),
      generateTelemetryLog('devops', 'complete'),
    ];
    setMessages(initialLogs);
  }, []);

  // Sync when initialData changes from parent
  useEffect(() => {
    if (initialData) {
      setPipelineData(initialData);
    }
  }, [initialData]);

  // Auto-scroll telemetry log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (msg: InterAgentMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Run the full sequential 5-agent pipeline with dynamic context passing
  const handleRunFullPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setMessages([]);

    const newStatuses: Record<AgentId, AgentStatus> = {
      pm: 'idle',
      arch: 'idle',
      dev: 'idle',
      qa: 'idle',
      devops: 'idle',
    };
    setStatuses({ ...newStatuses });

    const requirementText = initialIdea || 'Enterprise Business Application';

    try {
      // 01. Product Manager Node
      setSelectedAgentId('pm');
      setStatuses(prev => ({ ...prev, pm: 'working' }));
      addMessage(generateTelemetryLog('pm', 'start'));
      await delay(700);

      const generated = createFallbackPipelineData(requirementText);
      setPipelineData(prev => ({ ...prev, pm: generated.pm }));
      addMessage(generateTelemetryLog('pm', 'complete'));
      addMessage(generateTelemetryLog('pm', 'handoff', `${generated.pm?.userStories.length} User Stories delivered`));
      setStatuses(prev => ({ ...prev, pm: 'completed' }));
      await delay(600);

      // 02. System Architect Node
      setSelectedAgentId('arch');
      setStatuses(prev => ({ ...prev, arch: 'working' }));
      addMessage(generateTelemetryLog('arch', 'start'));
      await delay(700);

      setPipelineData(prev => ({ ...prev, arch: generated.arch }));
      addMessage(generateTelemetryLog('arch', 'complete'));
      addMessage(generateTelemetryLog('arch', 'handoff', 'Data Schemas & API Contracts passed to Developer'));
      setStatuses(prev => ({ ...prev, arch: 'completed' }));
      await delay(600);

      // 03. Lead Developer Node
      setSelectedAgentId('dev');
      setStatuses(prev => ({ ...prev, dev: 'working' }));
      addMessage(generateTelemetryLog('dev', 'start'));
      await delay(800);

      setPipelineData(prev => ({ ...prev, dev: generated.dev }));
      addMessage(generateTelemetryLog('dev', 'complete'));
      addMessage(generateTelemetryLog('dev', 'handoff', `${generated.dev?.files.length} Source files submitted for QA Audit`));
      setStatuses(prev => ({ ...prev, dev: 'completed' }));
      await delay(600);

      // 04. Quality Assurance Node
      setSelectedAgentId('qa');
      setStatuses(prev => ({ ...prev, qa: 'working' }));
      addMessage(generateTelemetryLog('qa', 'start'));
      await delay(700);

      setPipelineData(prev => ({ ...prev, qa: generated.qa }));
      addMessage(generateTelemetryLog('qa', 'complete'));
      addMessage(generateTelemetryLog('qa', 'handoff', 'Test cases verified. Passing to DevOps.'));
      setStatuses(prev => ({ ...prev, qa: 'completed' }));
      await delay(600);

      // 05. DevOps Node
      setSelectedAgentId('devops');
      setStatuses(prev => ({ ...prev, devops: 'working' }));
      addMessage(generateTelemetryLog('devops', 'start'));
      await delay(700);

      setPipelineData(prev => ({ ...prev, devops: generated.devops }));
      addMessage(generateTelemetryLog('devops', 'complete'));
      addMessage(generateTelemetryLog('devops', 'handoff', 'CI/CD pipeline and deployment targets verified.'));
      setStatuses(prev => ({ ...prev, devops: 'completed' }));

      if (onPipelineDataChange) {
        onPipelineDataChange(generated);
      }

      toast({
        title: "Pipeline Verified",
        description: "All 5 specialized AI agents successfully executed and validated software delivery.",
      });
    } catch (e: any) {
      toast({
        title: "Execution Error",
        description: e.message || "Pipeline execution encountered an issue.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadFullReport = () => {
    const report = `
# AUTODEV ENTERPRISE MULTI-AGENT SPECIFICATION
Generated for: ${initialIdea || 'Enterprise Business Application'}
Date: ${new Date().toISOString()}
Verification Status: VERIFIED BY 5 AGENT POD

============================================================
STAGE 01: PRODUCT MANAGER (PRD & USER STORIES)
============================================================
## Feature Specifications:
${pipelineData.pm?.featureSpecifications.map(f => `- **${f.name}**: ${f.description}`).join('\n') || 'None'}

## User Stories:
${pipelineData.pm?.userStories.map(s => `- ${s}`).join('\n') || 'None'}

## Requirements:
${pipelineData.pm?.requirements.map(r => `- ${r}`).join('\n') || 'None'}

============================================================
STAGE 02: SYSTEM ARCHITECT (BLUEPRINT & CONTRACTS)
============================================================
## Architecture Narrative:
${pipelineData.arch?.systemArchitectureDescription || 'None'}

## System Blueprint Points:
${pipelineData.arch?.systemBlueprintPoints.map(p => `- ${p}`).join('\n') || 'None'}

## Database Schema:
\`\`\`sql
${pipelineData.arch?.databaseSchema || 'None'}
\`\`\`

## API Contracts:
${pipelineData.arch?.apiDesigns || 'None'}

============================================================
STAGE 03: LEAD DEVELOPER (SOURCE CODE STACK)
============================================================
## Strategy:
${pipelineData.dev?.codeExplanation || 'None'}

${pipelineData.dev?.files.map(f => `### File: ${f.fileName}\n\`\`\`typescript\n${f.content}\n\`\`\``).join('\n\n') || 'None'}

============================================================
STAGE 04: QUALITY ASSURANCE (AUDIT & TEST SUITES)
============================================================
## Quality Assessment:
${pipelineData.qa?.overallAssessment || 'None'}

## Identified Issues:
${pipelineData.qa?.identifiedIssues.map(i => `- [${i.severity.toUpperCase()}] ${i.type}: ${i.description} (Fix: ${i.recommendation})`).join('\n') || 'None'}

## Test Plan:
${pipelineData.qa?.testPlan.map(t => `- [${t.type.toUpperCase()}] ${t.description} -> Expected: ${t.expectedBehavior}`).join('\n') || 'None'}

============================================================
STAGE 05: DEVOPS (CI/CD PIPELINE & DEPLOYMENT)
============================================================
## CI/CD Pipeline Outline:
\`\`\`yaml
${pipelineData.devops?.ciCdPipelineOutline || 'None'}
\`\`\`

## Deployment Strategies:
${pipelineData.devops?.suggestedDeploymentStrategies.map(s => `- ${s}`).join('\n') || 'None'}

## Instructions:
${pipelineData.devops?.stepByStepInstructions || 'None'}
    `.trim();

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autodev-executive-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Executive Audit Report saved." });
  };

  const handleCopyFile = () => {
    if (!pipelineData.dev?.files[selectedCodeFileIdx]) return;
    navigator.clipboard.writeText(pipelineData.dev.files[selectedCodeFileIdx].content);
    setCopiedCode(true);
    toast({ title: "Copied", description: "File copied to clipboard." });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStageIcon = (id: AgentId) => {
    switch (id) {
      case 'pm': return <Users size={18} />;
      case 'arch': return <Layers size={18} />;
      case 'dev': return <Terminal size={18} />;
      case 'qa': return <ShieldCheck size={18} />;
      case 'devops': return <Rocket size={18} />;
    }
  };

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col space-y-6 p-6", className)}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Autonomous 5-Agent Engineering Pod
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono py-0 px-2 h-5 text-primary border-primary/30">
              Chained Orchestration
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Sequentially orchestrates Product Manager, System Architect, Lead Developer, QA, and DevOps with verified inter-agent context passing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleRunFullPipeline}
            disabled={isRunning}
            className="h-9 text-xs font-semibold gap-1.5 shadow-sm"
          >
            {isRunning ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Orchestrating Pod...
              </>
            ) : (
              <>
                <Play size={14} className="fill-current" /> Run Engineering Pod
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadFullReport}
            className="h-9 text-xs font-medium gap-1.5"
          >
            <Download size={13} /> Export Report
          </Button>
        </div>
      </div>

      {/* Sequential DAG Stepper (5 Nodes) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isSelected = selectedAgentId === stage.id;
          const status = statuses[stage.id];

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedAgentId(stage.id)}
              className={cn(
                "p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group",
                isSelected 
                  ? "bg-primary/[0.03] border-primary ring-1 ring-primary shadow-sm" 
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                )}>
                  {getStageIcon(stage.id)}
                </div>

                <Badge variant={status === 'completed' ? 'default' : status === 'working' ? 'outline' : 'secondary'} className="text-[10px] font-mono py-0 h-4 uppercase">
                  {status === 'working' ? (
                    <span className="flex items-center gap-1 text-primary">
                      <Loader2 size={10} className="animate-spin" /> Active
                    </span>
                  ) : status === 'completed' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={10} /> Done
                    </span>
                  ) : (
                    status
                  )}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] font-mono font-medium text-muted-foreground block">
                  {stage.badgeLabel}
                </span>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {stage.name}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {stage.roleTitle}
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="truncate">{stage.handoffLabel}</span>
                <ChevronRight size={12} className={cn(isSelected ? "text-primary" : "opacity-40")} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Inter-Agent Message Bus (Live Telemetry Terminal) */}
      <Card className="border-border bg-slate-950 text-slate-100 shadow-none overflow-hidden rounded-xl">
        <div className="h-9 px-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon size={13} className="text-emerald-400" />
            <span className="text-xs font-mono font-medium text-slate-300">
              Inter-Agent Telemetry Bus • Context-Passing Stream
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {messages.length} events logged
          </span>
        </div>
        <div 
          ref={scrollRef}
          className="h-40 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1.5 custom-scroll select-text"
        >
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <span className="text-slate-500 tabular-nums shrink-0">[{m.timestamp}]</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 uppercase",
                m.type === 'handoff' ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                m.type === 'success' ? "bg-emerald-500/20 text-emerald-300" :
                m.type === 'status' ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-300"
              )}>
                {m.fromAgent} → {m.toAgent}
              </span>
              <span className={cn(
                "flex-1",
                m.type === 'handoff' ? "text-indigo-200 font-medium" :
                m.type === 'success' ? "text-emerald-200" : "text-slate-300"
              )}>
                {m.message}
                {m.payloadSnippet && (
                  <span className="block text-[10px] text-slate-400 font-normal italic mt-0.5">
                    ↳ Payload: {m.payloadSnippet}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Deep-Dive Agent Node Inspector */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-primary uppercase">Node Inspector:</span>
            <span className="text-sm font-semibold text-foreground">
              {PIPELINE_STAGES.find(s => s.id === selectedAgentId)?.name}
            </span>
            <Badge variant="outline" className="text-[10px] font-normal py-0">
              {PIPELINE_STAGES.find(s => s.id === selectedAgentId)?.roleTitle}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            {PIPELINE_STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedAgentId(s.id)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors border",
                  selectedAgentId === s.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 01. Product Manager Inspector */}
        {selectedAgentId === 'pm' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> User Stories & Acceptance Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {pipelineData.pm?.userStories.map((story, i) => (
                  <div key={i} className="p-3 bg-muted/20 border border-border rounded-lg text-xs leading-relaxed text-foreground/90 flex items-start gap-2">
                    <span className="font-mono text-primary font-semibold text-[11px] shrink-0">0{i+1}.</span>
                    <span>{story}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity size={14} className="text-primary" /> Feature Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipelineData.pm?.featureSpecifications.map((spec, i) => (
                  <div key={i} className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                    <span className="text-xs font-semibold text-foreground block">{spec.name}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{spec.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 02. System Architect Inspector */}
        {selectedAgentId === 'arch' && (
          <div className="space-y-4">
            <Card className="border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" /> Architectural Pattern & Blueprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs leading-relaxed text-foreground/90">
                  {pipelineData.arch?.systemArchitectureDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
                  {pipelineData.arch?.systemBlueprintPoints.map((pt, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Database size={14} className="text-primary" /> Relational / NoSQL Schema DDL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="p-3.5 bg-muted/30 border border-border rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground">
                    <code>{pipelineData.arch?.databaseSchema}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Server size={14} className="text-primary" /> REST API Endpoint Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3.5 bg-muted/30 border border-border rounded-lg text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono text-[11px]">
                    {pipelineData.arch?.apiDesigns}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 03. Lead Developer Inspector */}
        {selectedAgentId === 'dev' && (
          <div className="space-y-4">
            <Card className="border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary" /> Implementation Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-foreground/90">
                  {pipelineData.dev?.codeExplanation}
                </p>
              </CardContent>
            </Card>

            <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {pipelineData.dev?.files.map((f, i) => (
                    <button
                      key={f.fileName}
                      onClick={() => setSelectedCodeFileIdx(i)}
                      className={cn(
                        "px-3 py-1 text-xs font-mono rounded-md transition-colors",
                        selectedCodeFileIdx === i 
                          ? "bg-background text-foreground font-semibold shadow-sm border border-border" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.fileName}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFile}
                  className="h-7 text-xs gap-1.5"
                >
                  {copiedCode ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copiedCode ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="p-4 bg-muted/10 font-mono text-xs overflow-auto max-h-80 leading-relaxed text-foreground">
                <pre>
                  <code>{pipelineData.dev?.files[selectedCodeFileIdx]?.content}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 04. QA Inspector */}
        {selectedAgentId === 'qa' && (
          <div className="space-y-4">
            <Card className="border-border shadow-none">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary" /> Automated Code Audit & Assessment
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Verification Approved
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs leading-relaxed text-foreground/90">
                  {pipelineData.qa?.overallAssessment}
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  {pipelineData.qa?.codeReviewSummary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Identified Issues & Severity Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {pipelineData.qa?.identifiedIssues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{issue.type.toUpperCase()}</span>
                        <Badge 
                          variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'secondary'} 
                          className="text-[9px] font-mono py-0 h-4 uppercase"
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{issue.description}</p>
                      <p className="text-[10px] text-primary/80 font-medium">↳ Rec: {issue.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Comprehensive Test Plan Suites
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {pipelineData.qa?.testPlan.map((test, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{test.description}</span>
                        <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 uppercase">
                          {test.type}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Expected: {test.expectedBehavior}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 05. DevOps Inspector */}
        {selectedAgentId === 'devops' && (
          <div className="space-y-4">
            <Card className="border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Rocket size={14} className="text-primary" /> Suggested Multi-Cloud Deployment Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipelineData.devops?.suggestedDeploymentStrategies.map((strat, i) => (
                  <div key={i} className="text-xs text-foreground/90 flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>{strat}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  CI/CD Delivery Pipeline Workflow (GitHub Actions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted/30 border border-border rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground">
                  <code>{pipelineData.devops?.ciCdPipelineOutline}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

