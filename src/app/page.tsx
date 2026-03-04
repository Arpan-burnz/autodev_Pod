"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Lightbulb, 
  Terminal, 
  ShieldCheck, 
  Rocket, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Loader2,
  Cpu,
  LayoutDashboard,
  Box,
  Layers,
  Search,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentArtifact } from '@/components/AgentArtifact';
import { useToast } from '@/hooks/use-toast';

// AI Flow imports
import { generateProjectRequirements } from '@/ai/flows/ai-product-manager-requirements-generation';
import { aiSystemArchitectDesignGeneration } from '@/ai/flows/ai-system-architect-design-generation';
import { developerCodeGeneration } from '@/ai/flows/ai-developer-code-generation';
import { aiQaTestGenerationAndExecution } from '@/ai/flows/ai-qa-test-generation-and-execution';
import { aiDevOpsDeploymentSuggestions } from '@/ai/flows/ai-dev-ops-deployment-suggestions';

type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

interface ProjectState {
  idea: string;
  requirements?: any;
  architecture?: any;
  code?: any;
  qa?: any;
  devops?: any;
}

export default function AutoDevPodDashboard() {
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState<number>(0);
  const [project, setProject] = useState<ProjectState>({ idea: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [statuses, setStatuses] = useState<AgentStatus[]>([
    'idle', 'idle', 'idle', 'idle', 'idle'
  ]);

  const stages = [
    { name: 'Product Manager', icon: <Users size={18} />, color: 'primary' },
    { name: 'System Architect', icon: <Layers size={18} />, color: 'accent' },
    { name: 'Developer', icon: <Terminal size={18} />, color: 'primary' },
    { name: 'Quality Assurance', icon: <ShieldCheck size={18} />, color: 'accent' },
    { name: 'DevOps', icon: <Rocket size={18} />, color: 'primary' }
  ];

  const updateStatus = (index: number, status: AgentStatus) => {
    setStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const handleStartPipeline = async () => {
    if (!project.idea) {
      toast({ title: "Idea missing", description: "Please enter a project idea first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. PM STAGE
      setActiveStage(0);
      updateStatus(0, 'working');
      const pmResults = await generateProjectRequirements({ projectIdea: project.idea });
      setProject(prev => ({ ...prev, requirements: pmResults }));
      updateStatus(0, 'completed');
      
      // 2. ARCHITECT STAGE
      setActiveStage(1);
      updateStatus(1, 'working');
      const archResults = await aiSystemArchitectDesignGeneration({ 
        projectRequirements: JSON.stringify(pmResults) 
      });
      setProject(prev => ({ ...prev, architecture: archResults }));
      updateStatus(1, 'completed');

      // 3. DEVELOPER STAGE
      setActiveStage(2);
      updateStatus(2, 'working');
      const devResults = await developerCodeGeneration({
        requirements: JSON.stringify(pmResults.userStories),
        architecture: archResults.systemArchitectureDescription,
        programmingLanguage: 'TypeScript',
        framework: 'Next.js'
      });
      setProject(prev => ({ ...prev, code: devResults }));
      updateStatus(2, 'completed');

      // 4. QA STAGE
      setActiveStage(3);
      updateStatus(3, 'working');
      const qaResults = await aiQaTestGenerationAndExecution({
        code: devResults.generatedCode,
        requirements: JSON.stringify(pmResults.requirements),
        architecture: archResults.systemArchitectureDescription
      });
      setProject(prev => ({ ...prev, qa: qaResults }));
      updateStatus(3, 'completed');

      // 5. DEVOPS STAGE
      setActiveStage(4);
      updateStatus(4, 'working');
      const devopsResults = await aiDevOpsDeploymentSuggestions({
        projectDescription: project.idea,
        technologiesUsed: ['Next.js', 'TypeScript', 'TailwindCSS'],
        targetEnvironments: ['Vercel', 'AWS Amplify'],
        codeSummary: devResults.codeExplanation
      });
      setProject(prev => ({ ...prev, devops: devopsResults }));
      updateStatus(4, 'completed');

    } catch (error) {
      console.error(error);
      toast({ title: "Pipeline Error", description: "An error occurred during agent processing.", variant: "destructive" });
      updateStatus(activeStage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProject = () => {
    setProject({ idea: '' });
    setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
    setActiveStage(0);
  };

  const progress = (statuses.filter(s => s === 'completed').length / stages.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            <Cpu size={20} />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AutoDev Pod
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mr-4">
            <LayoutDashboard size={14} />
            <span>Project Workspace</span>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings size={18} />
          </Button>
          <div className="w-8 h-8 rounded-full bg-secondary border border-white/10" />
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left: Input & Pipeline Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-2xl glass-panel">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb size={12} className="text-accent" />
                  Your Project Idea
                </label>
                <textarea
                  placeholder="Describe your app idea here... (e.g. A task manager with social sharing)"
                  className="w-full h-32 bg-background/50 border border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
                  value={project.idea}
                  onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1 font-headline font-bold h-11"
                  onClick={handleStartPipeline}
                  disabled={isProcessing || !project.idea}
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 animate-spin" size={18} /> Processing</>
                  ) : (
                    <><Play className="mr-2" size={16} /> Deploy Agents</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-11 w-11 border-white/10"
                  onClick={resetProject}
                  disabled={isProcessing}
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Agent Workflow</h3>
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                    activeStage === idx 
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                      : 'bg-card/30 border-white/5 opacity-60'
                  } ${statuses[idx] === 'completed' ? 'opacity-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      statuses[idx] === 'completed' 
                        ? 'bg-accent/20 text-accent' 
                        : activeStage === idx ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {statuses[idx] === 'completed' ? <CheckCircle2 size={16} /> : stage.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{stage.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {statuses[idx] === 'working' ? 'Analyzing...' : statuses[idx]}
                      </p>
                    </div>
                  </div>
                  {statuses[idx] === 'working' && <Loader2 className="animate-spin text-primary" size={14} />}
                </div>
              ))}
            </div>
            
            <div className="px-1 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                <span>TOTAL PIPELINE PROGRESS</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-white/5" />
            </div>
          </div>
        </div>

        {/* Right: Agent Outputs & Artifacts */}
        <div className="lg:col-span-9 space-y-6">
          {!project.idea && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-40">
              <Box size={80} className="text-primary" />
              <div className="max-w-md">
                <h2 className="text-2xl font-headline font-bold mb-2">Ready to Launch your Pod?</h2>
                <p className="text-muted-foreground">Enter a project idea on the left and our AI team will handle requirements, architecture, code, testing, and deployment suggestions.</p>
              </div>
            </div>
          )}

          {(project.requirements || isProcessing) && (
            <Tabs defaultValue="requirements" className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 bg-card/30 p-1 rounded-xl border border-white/5">
                <TabsList className="bg-transparent h-10 gap-2 p-1">
                  <TabsTrigger 
                    value="requirements" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs px-4 rounded-lg"
                    disabled={!project.requirements && activeStage !== 0}
                  >
                    PM Artifacts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="architecture" 
                    className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent font-bold text-xs px-4 rounded-lg"
                    disabled={!project.architecture && activeStage !== 1}
                  >
                    Architecture
                  </TabsTrigger>
                  <TabsTrigger 
                    value="code" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs px-4 rounded-lg"
                    disabled={!project.code && activeStage !== 2}
                  >
                    Source Code
                  </TabsTrigger>
                  <TabsTrigger 
                    value="qa" 
                    className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent font-bold text-xs px-4 rounded-lg"
                    disabled={!project.qa && activeStage !== 3}
                  >
                    QA Report
                  </TabsTrigger>
                  <TabsTrigger 
                    value="devops" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs px-4 rounded-lg"
                    disabled={!project.devops && activeStage !== 4}
                  >
                    Deployment
                  </TabsTrigger>
                </TabsList>
                
                {isProcessing && (
                  <div className="flex items-center gap-2 px-4 text-xs font-bold text-accent animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    Agent is thinking...
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden min-h-[600px]">
                <TabsContent value="requirements" className="mt-0 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.requirements ? (
                    <>
                      <AgentArtifact 
                        title="Functional Requirements" 
                        type="list" 
                        content={project.requirements.requirements} 
                        icon={<Users size={16} />}
                      />
                      <AgentArtifact 
                        title="User Stories" 
                        type="list" 
                        content={project.requirements.userStories} 
                        icon={<Lightbulb size={16} />}
                      />
                    </>
                  ) : activeStage === 0 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="architecture" className="mt-0 h-full grid grid-cols-1 gap-4">
                  {project.architecture ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                      <div className="lg:col-span-2">
                        <AgentArtifact 
                          title="System Overview" 
                          type="text" 
                          content={project.architecture.systemArchitectureDescription} 
                          icon={<Layers size={16} />}
                        />
                      </div>
                      <div className="space-y-4">
                        <AgentArtifact 
                          title="Database Schema" 
                          type="code" 
                          content={project.architecture.databaseSchema} 
                        />
                      </div>
                    </div>
                  ) : activeStage === 1 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="code" className="mt-0 h-full grid grid-cols-1 gap-4">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                      <div className="lg:col-span-2">
                        <AgentArtifact 
                          title={project.code.suggestedFileName || 'generated-source.ts'} 
                          type="code" 
                          content={project.code.generatedCode} 
                          icon={<Terminal size={16} />}
                        />
                      </div>
                      <AgentArtifact 
                        title="Implementation Details" 
                        type="text" 
                        content={project.code.codeExplanation} 
                      />
                    </div>
                  ) : activeStage === 2 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="qa" className="mt-0 h-full grid grid-cols-1 gap-4">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                      <AgentArtifact 
                        title="Identified Issues" 
                        type="list" 
                        content={project.qa.identifiedIssues.map((issue: any) => `${issue.severity.toUpperCase()}: ${issue.description}`)} 
                        icon={<ShieldCheck size={16} />}
                      />
                      <AgentArtifact 
                        title="Test Plan" 
                        type="list" 
                        content={project.qa.testPlan.map((test: any) => test.description)} 
                      />
                    </div>
                  ) : activeStage === 3 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="devops" className="mt-0 h-full grid grid-cols-1 gap-4">
                  {project.devops ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                      <AgentArtifact 
                        title="Deployment Pipeline" 
                        type="text" 
                        content={project.devops.ciCdPipelineOutline} 
                        icon={<Rocket size={16} />}
                      />
                      <AgentArtifact 
                        title="Target Environments" 
                        type="list" 
                        content={project.devops.suggestedDeploymentStrategies} 
                      />
                    </div>
                  ) : activeStage === 4 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-10 border-t border-white/5 bg-background flex items-center px-6 justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> AI Pod Online</span>
          <span>Build v1.0.4</span>
        </div>
        <div className="flex gap-4">
          <span>Latency: 24ms</span>
          <span>Agents: 5 Active</span>
        </div>
      </footer>
    </div>
  );
}

function SkeletonArtifact({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full rounded-xl border border-white/5 bg-white/5 animate-pulse flex flex-col p-6 space-y-4">
          <div className="h-6 w-1/3 bg-white/10 rounded-md" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-full bg-white/5 rounded-md" />
            <div className="h-4 w-5/6 bg-white/5 rounded-md" />
            <div className="h-4 w-4/6 bg-white/5 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}