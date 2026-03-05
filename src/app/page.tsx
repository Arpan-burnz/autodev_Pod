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
  Box,
  Layers,
  LogOut,
  ChevronRight,
  Code,
  FileText,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { name: 'Product Manager', icon: <Users size={16} /> },
    { name: 'System Architect', icon: <Layers size={16} /> },
    { name: 'Developer', icon: <Terminal size={16} /> },
    { name: 'Quality Assurance', icon: <ShieldCheck size={16} /> },
    { name: 'DevOps', icon: <Rocket size={16} /> }
  ];

  const updateStatus = (index: number, status: AgentStatus) => {
    setStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleStartPipeline = async () => {
    if (!project.idea) {
      toast({ title: "IDEA REQUIRED", description: "Please enter a project concept to begin.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. PM
      setActiveStage(0);
      updateStatus(0, 'working');
      const pmResults = await generateProjectRequirements({ projectIdea: project.idea });
      setProject(prev => ({ ...prev, requirements: pmResults }));
      updateStatus(0, 'completed');
      await delay(1000); // Small cooldown between agents
      
      // 2. Architect
      setActiveStage(1);
      updateStatus(1, 'working');
      const archResults = await aiSystemArchitectDesignGeneration({ 
        projectRequirements: JSON.stringify(pmResults) 
      });
      setProject(prev => ({ ...prev, architecture: archResults }));
      updateStatus(1, 'completed');
      await delay(1000);

      // 3. Developer
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
      await delay(1000);

      // 4. QA
      setActiveStage(3);
      updateStatus(3, 'working');
      const qaResults = await aiQaTestGenerationAndExecution({
        code: devResults.generatedCode,
        requirements: JSON.stringify(pmResults.requirements),
        architecture: archResults.systemArchitectureDescription
      });
      setProject(prev => ({ ...prev, qa: qaResults }));
      updateStatus(3, 'completed');
      await delay(1000);

      // 5. DevOps
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

    } catch (error: any) {
      console.error(error);
      const isQuota = error.message?.includes('429');
      toast({ 
        title: isQuota ? "QUOTA EXCEEDED" : "PROCESS INTERRUPTED", 
        description: isQuota ? "Too many requests. Please wait a moment and retry." : "The agent pipeline encountered an error.", 
        variant: "destructive" 
      });
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
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-center selection:bg-white selection:text-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div className="w-20 h-20 border border-white/20 flex items-center justify-center text-white mb-16 relative z-10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <Cpu size={36} />
        </div>
        <h1 className="text-6xl md:text-9xl font-headline font-bold mb-10 tracking-tighter leading-none relative z-10 text-white">
          AUTO_DEV<br /><span className="text-white/20">SYSTEMS.</span>
        </h1>
        <p className="text-[10px] text-white/30 mb-16 max-w-xl leading-tight uppercase tracking-[1em] font-bold relative z-10">
          Autonomous multi-agent engineering workflows
        </p>
        <div className="relative z-10">
          <Link href="/auth">
            <Button size="lg" className="h-16 px-16 text-[12px] font-bold rounded-none bg-white text-black hover:bg-white/90 transition-all uppercase tracking-[0.4em]">
              Initialize Core <ChevronRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (statuses.filter(s => s === 'completed').length / stages.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black font-body">
      <header className="h-20 border-b border-white/10 bg-black flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Cpu size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-headline font-bold tracking-tighter">AUTODEV_POD</h1>
            <span className="text-[8px] font-bold tracking-[0.4em] text-white/20 uppercase">Core Management Interface</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase truncate max-w-[200px]">{user.email}</span>
            <span className="text-[7px] font-bold tracking-[0.3em] text-white/20 uppercase">Operator Verified</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-none h-10 w-10 border border-white/5" onClick={handleLogout}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[2000px] mx-auto w-full">
        <div className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] flex items-center gap-3">
              <Zap size={10} className="text-white" /> Deployment_Input
            </label>
            <div className="relative">
              <textarea
                placeholder="DEFINE_PROJECT_PARAMETERS..."
                className="w-full h-48 bg-white/[0.03] border border-white/10 rounded-none p-6 text-[11px] font-code focus:border-white/40 outline-none resize-none transition-all placeholder:text-white/10 leading-relaxed uppercase"
                value={project.idea}
                onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                disabled={isProcessing}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-20">
                <span className="text-[8px] font-bold tracking-widest">UTF-8</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full font-bold h-14 rounded-none bg-white text-black hover:bg-white/90 text-[11px] tracking-[0.3em] uppercase group"
                onClick={handleStartPipeline}
                disabled={isProcessing || !project.idea}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-3 animate-spin" size={16} /> Executing_Pipeline</>
                ) : (
                  <><Play className="mr-3 fill-current" size={14} /> Boot_Agents</>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-14 w-full border-white/10 rounded-none hover:bg-white hover:text-black text-[11px] tracking-[0.3em] uppercase transition-all"
                onClick={() => {
                  setProject({ idea: '' });
                  setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
                  setActiveStage(0);
                }}
                disabled={isProcessing}
              >
                <RotateCcw size={14} className="mr-3" /> Reset_System
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Node_Workflow</h3>
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div 
                  key={idx}
                  className={`p-5 transition-all duration-500 flex items-center justify-between border ${
                    activeStage === idx 
                      ? 'bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'border-white/5 opacity-30'
                  } ${statuses[idx] === 'completed' ? 'opacity-100 border-white/20' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 flex items-center justify-center ${activeStage === idx ? 'text-white' : 'text-white/50'}`}>
                      {statuses[idx] === 'completed' ? <CheckCircle2 size={16} /> : stage.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase">{stage.name}</span>
                  </div>
                  <span className={`text-[8px] font-bold tracking-tighter ${statuses[idx] === 'working' ? 'animate-pulse' : ''}`}>
                    {statuses[idx].toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between text-[9px] font-bold text-white/40 mb-3 uppercase tracking-[0.3em]">
                <span>Pipeline_Load</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 rounded-none bg-white/5" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col min-h-[800px]">
          {!project.idea && !isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-10 border border-white/5 bg-white/[0.01]">
              <div className="relative">
                <Box size={80} className="text-white/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-white/20 animate-pulse" />
                </div>
              </div>
              <div className="max-w-md space-y-4">
                <h2 className="text-3xl font-headline font-bold tracking-tighter uppercase">System_Standby</h2>
                <p className="text-white/30 text-[10px] tracking-[0.3em] leading-relaxed uppercase font-bold">Input requirements to initialize the autonomous development pod.</p>
              </div>
            </div>
          )}

          {(project.requirements || isProcessing) && (
            <Tabs defaultValue="requirements" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
                <TabsList className="bg-transparent h-auto gap-12 p-0 flex-wrap">
                  <TabsTrigger value="requirements" className="data-[state=active]:text-white text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-3 transition-all">01_Product</TabsTrigger>
                  <TabsTrigger value="architecture" className="data-[state=active]:text-white text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-3 transition-all" disabled={!project.architecture && activeStage !== 1}>02_Architecture</TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:text-white text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-3 transition-all" disabled={!project.code && activeStage !== 2}>03_Repository</TabsTrigger>
                  <TabsTrigger value="qa" className="data-[state=active]:text-white text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-3 transition-all" disabled={!project.qa && activeStage !== 3}>04_Quality</TabsTrigger>
                  <TabsTrigger value="devops" className="data-[state=active]:text-white text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-white pb-3 transition-all" disabled={!project.devops && activeStage !== 4}>05_DevOps</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[700px]">
                <TabsContent value="requirements" className="mt-0 h-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  {project.requirements ? (
                    <>
                      <AgentArtifact title="Feature Specifications" type="list" content={project.requirements.featureSpecifications.map((f: any) => `${f.name}: ${f.description}`)} icon={<FileText size={16} />} />
                      <div className="space-y-8">
                        <AgentArtifact title="User Stories" type="list" content={project.requirements.userStories} icon={<Lightbulb size={16} />} />
                        <AgentArtifact title="Functional Constraints" type="list" content={project.requirements.requirements} icon={<ShieldCheck size={16} />} />
                      </div>
                    </>
                  ) : activeStage === 0 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="architecture" className="mt-0 h-full">
                  {project.architecture ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                        <AgentArtifact title="Architecture Visualization" type="image" content={project.architecture.diagramUrl} icon={<Layers size={16} />} />
                        <AgentArtifact title="System Overview" type="text" content={project.architecture.systemArchitectureDescription} />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-8">
                        <AgentArtifact title="Data Schema" type="code" content={project.architecture.databaseSchema} />
                        <AgentArtifact title="API Interfaces" type="text" content={project.architecture.apiDesigns} />
                      </div>
                    </div>
                  ) : activeStage === 1 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="code" className="mt-0 h-full">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8">
                        <AgentArtifact title={project.code.suggestedFileName || 'MODULE_01.TS'} type="code" content={project.code.generatedCode} icon={<Code size={16} />} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Documentation" type="text" content={project.code.codeExplanation} />
                      </div>
                    </div>
                  ) : activeStage === 2 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="qa" className="mt-0 h-full">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-4 space-y-8">
                        <AgentArtifact title="Overall Assessment" type="text" content={project.qa.overallAssessment} icon={<Activity size={16} />} />
                        <AgentArtifact title="Code Review" type="text" content={project.qa.codeReviewSummary} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Security & Vulnerabilities" type="list" content={project.qa.identifiedIssues.map((i: any) => `[${i.severity.toUpperCase()}] ${i.description}`)} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Test Suite" type="list" content={project.qa.testPlan.map((t: any) => `${t.type.toUpperCase()}: ${t.description}`)} />
                      </div>
                    </div>
                  ) : activeStage === 3 && isProcessing && <SkeletonArtifact count={3} />}
                </TabsContent>

                <TabsContent value="devops" className="mt-0 h-full">
                  {project.devops ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-7 space-y-8">
                        <AgentArtifact title="CI/CD Pipeline" type="text" content={project.devops.ciCdPipelineOutline} icon={<Rocket size={16} />} />
                        <AgentArtifact title="Deployment Instructions" type="text" content={project.devops.stepByStepInstructions} />
                      </div>
                      <div className="lg:col-span-5">
                        <AgentArtifact title="Target Environments" type="list" content={project.devops.suggestedDeploymentStrategies} />
                      </div>
                    </div>
                  ) : activeStage === 4 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </main>

      <footer className="h-16 border-t border-white/10 bg-black flex items-center px-10 justify-between text-[9px] text-white/20 uppercase font-bold tracking-[0.5em]">
        <div className="flex gap-12">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white animate-pulse" /> Status: Operational</span>
          <span>Version: 4.2.0_Secure</span>
          <span>Terminal_ID: AD-772-B</span>
        </div>
        <span>© 2024 AUTODEV_SYSTEMS_GLOBAL</span>
      </footer>
    </div>
  );
}

function SkeletonArtifact({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full border border-white/10 bg-white/[0.02] animate-pulse flex flex-col p-10 space-y-8">
          <div className="h-4 w-1/4 bg-white/5" />
          <div className="space-y-4 flex-1">
            <div className="h-4 w-full bg-white/5" />
            <div className="h-4 w-11/12 bg-white/5" />
            <div className="h-4 w-4/6 bg-white/5" />
          </div>
        </div>
      ))}
    </>
  );
}
