"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Lightbulb, 
  Terminal, 
  ShieldCheck, 
  Rocket, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Loader2,
  Cpu,
  LayoutDashboard,
  Box,
  Layers,
  LogOut,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentArtifact } from '@/components/AgentArtifact';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import Link from 'next/link';

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
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState<number>(0);
  const [project, setProject] = useState<ProjectState>({ idea: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [statuses, setStatuses] = useState<AgentStatus[]>([
    'idle', 'idle', 'idle', 'idle', 'idle'
  ]);

  const stages = [
    { name: 'Product Manager', icon: <Users size={18} /> },
    { name: 'System Architect', icon: <Layers size={18} /> },
    { name: 'Developer', icon: <Terminal size={18} /> },
    { name: 'Quality Assurance', icon: <ShieldCheck size={18} /> },
    { name: 'DevOps', icon: <Rocket size={18} /> }
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
      toast({ title: "IDEA REQUIRED", description: "Please enter a project concept to begin.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      setActiveStage(0);
      updateStatus(0, 'working');
      const pmResults = await generateProjectRequirements({ projectIdea: project.idea });
      setProject(prev => ({ ...prev, requirements: pmResults }));
      updateStatus(0, 'completed');
      
      setActiveStage(1);
      updateStatus(1, 'working');
      const archResults = await aiSystemArchitectDesignGeneration({ 
        projectRequirements: JSON.stringify(pmResults) 
      });
      setProject(prev => ({ ...prev, architecture: archResults }));
      updateStatus(1, 'completed');

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

      setActiveStage(3);
      updateStatus(3, 'working');
      const qaResults = await aiQaTestGenerationAndExecution({
        code: devResults.generatedCode,
        requirements: JSON.stringify(pmResults.requirements),
        architecture: archResults.systemArchitectureDescription
      });
      setProject(prev => ({ ...prev, qa: qaResults }));
      updateStatus(3, 'completed');

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
      toast({ title: "PROCESS INTERRUPTED", description: "The agent pipeline encountered an error.", variant: "destructive" });
      updateStatus(activeStage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-center selection:bg-white selection:text-black">
        <div className="w-16 h-16 bg-white flex items-center justify-center text-black mb-12">
          <Cpu size={32} />
        </div>
        <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 tracking-tighter leading-none">
          AI DRIVEN<br />DEVELOPMENT.
        </h1>
        <p className="text-lg text-white/50 mb-12 max-w-xl leading-tight uppercase tracking-widest font-medium">
          Automated multi-agent engineering workflows.
        </p>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button size="lg" className="h-14 px-12 text-lg font-bold rounded-none hover:bg-white/90 transition-all">
              ENTER SYSTEM <ChevronRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (statuses.filter(s => s === 'completed').length / stages.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-black flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black">
            <Cpu size={18} />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tighter">
            AUTODEV POD
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 text-[10px] font-bold tracking-widest text-white/40 uppercase">
            <span className="truncate max-w-[200px]">{user.email}</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>OPERATOR_01</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-none h-8 w-8" onClick={handleLogout}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1800px] mx-auto w-full">
        <div className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                PROJECT_INPUT
              </label>
              {isProcessing && <Loader2 size={12} className="animate-spin text-white/40" />}
            </div>
            <textarea
              placeholder="DEFINE PROJECT CONCEPT..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-none p-4 text-xs font-code focus:border-white/40 outline-none resize-none transition-all placeholder:text-white/20"
              value={project.idea}
              onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
              disabled={isProcessing}
            />
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 font-bold h-12 rounded-none bg-white text-black hover:bg-white/90"
                onClick={handleStartPipeline}
                disabled={isProcessing || !project.idea}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 animate-spin" size={18} /> PROCESSING</>
                ) : (
                  <><Play className="mr-2 fill-current" size={14} /> DEPLOY_PIPELINE</>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 border-white/10 rounded-none hover:bg-white/10"
                onClick={() => {
                  setProject({ idea: '' });
                  setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
                  setActiveStage(0);
                }}
                disabled={isProcessing}
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">AGENT_WORKFLOW</h3>
            <div className="space-y-1">
              {stages.map((stage, idx) => (
                <div 
                  key={idx}
                  className={`p-4 transition-all duration-300 flex items-center justify-between border-l-2 ${
                    activeStage === idx 
                      ? 'bg-white/10 border-white' 
                      : 'border-transparent opacity-40'
                  } ${statuses[idx] === 'completed' ? 'opacity-100 border-white/40' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {statuses[idx] === 'completed' ? <CheckCircle2 size={16} /> : stage.icon}
                    </div>
                    <span className="text-xs font-bold tracking-tight uppercase">{stage.name}</span>
                  </div>
                  <span className="text-[9px] font-bold tracking-tighter opacity-40">
                    {statuses[idx].toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-[9px] font-bold text-white/40 mb-2 uppercase tracking-widest">
                <span>SYSTEM_PROGRESS</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-0.5 bg-white/5" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8 min-h-[700px]">
          {!project.idea && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
              <Box size={60} className="text-white/10" />
              <div className="max-w-md">
                <h2 className="text-2xl font-headline font-bold mb-3 tracking-tighter uppercase">Awaiting System Definition.</h2>
                <p className="text-white/40 text-xs tracking-widest leading-relaxed uppercase">Enter project requirements in the sidebar to initialize agent deployment.</p>
              </div>
            </div>
          )}

          {(project.requirements || isProcessing) && (
            <Tabs defaultValue="requirements" className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <TabsList className="bg-transparent h-auto gap-8 p-0">
                  <TabsTrigger value="requirements" className="data-[state=active]:text-white text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-2">PRODUCT_ARTIFACTS</TabsTrigger>
                  <TabsTrigger value="architecture" className="data-[state=active]:text-white text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-2" disabled={!project.architecture && activeStage !== 1}>ARCHITECTURE_SCHEMA</TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:text-white text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-2" disabled={!project.code && activeStage !== 2}>SOURCE_REPOSITORY</TabsTrigger>
                  <TabsTrigger value="qa" className="data-[state=active]:text-white text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-2" disabled={!project.qa && activeStage !== 3}>QUALITY_REPORT</TabsTrigger>
                  <TabsTrigger value="devops" className="data-[state=active]:text-white text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-2" disabled={!project.devops && activeStage !== 4}>DEPLOYMENT_PLAN</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[600px]">
                <TabsContent value="requirements" className="mt-0 h-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.requirements ? (
                    <>
                      <AgentArtifact title="Functional Requirements" type="list" content={project.requirements.requirements} icon={<Users size={16} />} />
                      <AgentArtifact title="User Stories" type="list" content={project.requirements.userStories} icon={<Lightbulb size={16} />} />
                    </>
                  ) : activeStage === 0 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="architecture" className="mt-0 h-full">
                  {project.architecture ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      <div className="lg:col-span-2">
                        <AgentArtifact title="System Overview" type="text" content={project.architecture.systemArchitectureDescription} icon={<Layers size={16} />} />
                      </div>
                      <AgentArtifact title="Database Schema" type="code" content={project.architecture.databaseSchema} />
                    </div>
                  ) : activeStage === 1 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="code" className="mt-0 h-full">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      <div className="lg:col-span-2">
                        <AgentArtifact title={project.code.suggestedFileName || 'SOURCE.TS'} type="code" content={project.code.generatedCode} icon={<Terminal size={16} />} />
                      </div>
                      <AgentArtifact title="Implementation Details" type="text" content={project.code.codeExplanation} />
                    </div>
                  ) : activeStage === 2 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="qa" className="mt-0 h-full">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <AgentArtifact title="Identified Issues" type="list" content={project.qa.identifiedIssues.map((i: any) => `${i.severity.toUpperCase()}: ${i.description}`)} icon={<ShieldCheck size={16} />} />
                      <AgentArtifact title="Test Plan" type="list" content={project.qa.testPlan.map((t: any) => t.description)} />
                    </div>
                  ) : activeStage === 3 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="devops" className="mt-0 h-full">
                  {project.devops ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <AgentArtifact title="Deployment Pipeline" type="text" content={project.devops.ciCdPipelineOutline} icon={<Rocket size={16} />} />
                      <AgentArtifact title="Target Environments" type="list" content={project.devops.suggestedDeploymentStrategies} />
                    </div>
                  ) : activeStage === 4 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </main>

      <footer className="h-12 border-t border-white/10 bg-black flex items-center px-8 justify-between text-[8px] text-white/20 uppercase font-bold tracking-[0.4em]">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1 h-1 bg-white animate-pulse" /> SYSTEM_ONLINE</span>
          <span>CORE_V1.2.0</span>
          <span>TERMINAL_ID: 8821-X</span>
        </div>
        <span>© 2024 AUTODEV_SYSTEMS</span>
      </footer>
    </div>
  );
}

function SkeletonArtifact({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full border border-white/10 bg-white/[0.02] animate-pulse flex flex-col p-8 space-y-6">
          <div className="h-4 w-1/4 bg-white/5" />
          <div className="space-y-3 flex-1">
            <div className="h-3 w-full bg-white/5" />
            <div className="h-3 w-5/6 bg-white/5" />
            <div className="h-3 w-4/6 bg-white/5" />
          </div>
        </div>
      ))}
    </>
  );
}