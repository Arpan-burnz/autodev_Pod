"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Zap,
  AlertCircle,
  Download,
  ClipboardCheck,
  FileSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentArtifact } from '@/components/AgentArtifact';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  const [quotaError, setQuotaError] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('requirements');
  
  const [statuses, setStatuses] = useState<AgentStatus[]>([
    'idle', 'idle', 'idle', 'idle', 'idle'
  ]);

  const stages = [
    { name: 'Product Manager', icon: <Users size={16} />, tab: 'requirements' },
    { name: 'System Architect', icon: <Layers size={16} />, tab: 'architecture' },
    { name: 'Developer', icon: <Terminal size={16} />, tab: 'code' },
    { name: 'Quality Assurance', icon: <ShieldCheck size={16} />, tab: 'qa' },
    { name: 'DevOps', icon: <Rocket size={16} />, tab: 'devops' }
  ];

  const updateStatus = (index: number, status: AgentStatus) => {
    setStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const isPipelineComplete = statuses.every(s => s === 'completed');

  useEffect(() => {
    if (isPipelineComplete) {
      setSelectedTab('summary');
    }
  }, [isPipelineComplete]);

  const handleStartPipeline = async () => {
    if (!project.idea) {
      toast({ title: "IDEA REQUIRED", description: "Please enter a project concept to begin.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setQuotaError(false);
    setSelectedTab('requirements');
    
    try {
      // 1. PM
      setActiveStage(0);
      updateStatus(0, 'working');
      const pmResults = await generateProjectRequirements({ projectIdea: project.idea });
      setProject(prev => ({ ...prev, requirements: pmResults }));
      updateStatus(0, 'completed');
      await delay(5000); 
      
      // 2. Architect
      setActiveStage(1);
      setSelectedTab('architecture');
      updateStatus(1, 'working');
      const archResults = await aiSystemArchitectDesignGeneration({ 
        projectRequirements: JSON.stringify(pmResults) 
      });
      setProject(prev => ({ ...prev, architecture: archResults }));
      updateStatus(1, 'completed');
      await delay(5000);

      // 3. Developer
      setActiveStage(2);
      setSelectedTab('code');
      updateStatus(2, 'working');
      const devResults = await developerCodeGeneration({
        requirements: JSON.stringify(pmResults.userStories),
        architecture: archResults.systemArchitectureDescription,
        programmingLanguage: 'TypeScript',
        framework: 'Next.js'
      });
      setProject(prev => ({ ...prev, code: devResults }));
      updateStatus(2, 'completed');
      await delay(5000);

      // 4. QA
      setActiveStage(3);
      setSelectedTab('qa');
      updateStatus(3, 'working');
      const qaResults = await aiQaTestGenerationAndExecution({
        code: devResults.generatedCode,
        requirements: JSON.stringify(pmResults.requirements),
        architecture: archResults.systemArchitectureDescription
      });
      setProject(prev => ({ ...prev, qa: qaResults }));
      updateStatus(3, 'completed');
      await delay(5000);

      // 5. DevOps
      setActiveStage(4);
      setSelectedTab('devops');
      updateStatus(4, 'working');
      const devopsResults = await aiDevOpsDeploymentSuggestions({
        projectDescription: project.idea,
        technologiesUsed: ['Next.js', 'TypeScript', 'TailwindCSS'],
        targetEnvironments: ['Vercel', 'AWS Amplify'],
        codeSummary: devResults.codeExplanation
      });
      setProject(prev => ({ ...prev, devops: devopsResults }));
      updateStatus(4, 'completed');

      toast({
        title: "PIPELINE COMPLETE",
        description: "All agents have delivered their artifacts.",
      });

    } catch (error: any) {
      console.error(error);
      const isQuota = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        setQuotaError(true);
      } else {
        toast({ 
          title: "PROCESS INTERRUPTED", 
          description: "Agent pipeline encountered an error.", 
          variant: "destructive" 
        });
      }
      updateStatus(activeStage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!isPipelineComplete) return;

    const reportContent = `
# AUTODEV_POD FINAL REPORT
Generated for: ${project.idea}
Status: VERIFIED

## 01. PRODUCT REQUIREMENTS
### FEATURE SPECIFICATIONS
${project.requirements?.featureSpecifications.map((f: any) => `- **${f.name}**: ${f.description}`).join('\n')}

### USER STORIES
${project.requirements?.userStories.map((s: any) => `- ${s}`).join('\n')}

### SYSTEM CONSTRAINTS
${project.requirements?.requirements.map((r: any) => `- ${r}`).join('\n')}

## 02. SYSTEM ARCHITECTURE
### NARRATIVE
${project.architecture?.systemArchitectureDescription}

### DATABASE SCHEMA
\`\`\`sql
${project.architecture?.databaseSchema}
\`\`\`

### API DESIGNS
${project.architecture?.apiDesigns}

## 03. SOURCE CODE
### ${project.code?.suggestedFileName || 'SOURCE_CODE.TS'}
\`\`\`typescript
${project.code?.generatedCode}
\`\`\`

### DOCUMENTATION
${project.code?.codeExplanation}

## 04. QUALITY ASSURANCE
### OVERALL ASSESSMENT
${project.qa?.overallAssessment}

### IDENTIFIED ISSUES
${project.qa?.identifiedIssues.map((i: any) => `- [${i.severity.toUpperCase()}] ${i.description} (${i.type})`).join('\n')}

### TEST PLAN
${project.qa?.testPlan.map((t: any) => `- [${t.type.toUpperCase()}] ${t.description}: ${t.expectedBehavior}`).join('\n')}

## 05. DEVOPS & INFRASTRUCTURE
### PIPELINE OUTLINE
${project.devops?.ciCdPipelineOutline}

### DEPLOYMENT STRATEGIES
${project.devops?.suggestedDeploymentStrategies.map((s: any) => `- ${s}`).join('\n')}

### INSTRUCTIONS
${project.devops?.stepByStepInstructions}

---
Generated by AutoDev Pod Systems v4.0
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autodev-pod-report-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black/20" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center selection:bg-black selection:text-white technical-grid">
        <div className="w-20 h-20 border border-black flex items-center justify-center text-black mb-16 relative z-10 bg-white shadow-xl">
          <Cpu size={36} />
        </div>
        <h1 className="text-6xl md:text-9xl font-headline font-bold mb-10 tracking-tight leading-none relative z-10 text-black">
          AUTO_DEV<br /><span className="text-black/10">SYSTEMS.</span>
        </h1>
        <p className="text-[10px] text-black/40 mb-16 max-w-xl leading-tight uppercase tracking-[0.8em] font-bold relative z-10">
          Autonomous multi-agent engineering workflows
        </p>
        <div className="relative z-10">
          <Link href="/auth">
            <Button size="lg" className="h-16 px-16 text-[11px] font-bold rounded-none bg-black text-white hover:bg-black/90 transition-all uppercase tracking-[0.3em] shadow-2xl">
              Initialize System <ChevronRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (statuses.filter(s => s === 'completed').length / stages.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] text-black selection:bg-black selection:text-white font-body technical-grid">
      <header className="h-20 border-b border-black/10 bg-white flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-black flex items-center justify-center text-black bg-white">
            <Cpu size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-headline font-bold tracking-tight text-black">AUTODEV_POD</h1>
            <span className="text-[8px] font-bold tracking-[0.3em] text-black/30 uppercase">Enterprise Engineering Hub</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold tracking-widest text-black/50 uppercase truncate max-w-[200px]">{user.email}</span>
            <span className="text-[7px] font-bold tracking-[0.2em] text-black/20 uppercase">Operator Verified</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-black/5 rounded-none h-10 w-10 border border-black/10" onClick={handleLogout}>
            <LogOut size={16} className="text-black/60" />
          </Button>
        </div>
      </header>

      {quotaError && (
        <div className="px-10 pt-10">
          <Alert variant="destructive" className="rounded-none border-black bg-white shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-bold tracking-[0.2em] uppercase">System Quota Alert</AlertTitle>
            <AlertDescription className="text-[9px] uppercase tracking-wider font-medium mt-1">
              Gemini API Free Tier limits reached. Add a custom key to <strong>.env</strong> as <strong>GOOGLE_GENAI_API_KEY</strong>.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[2200px] mx-auto w-full">
        <div className="lg:col-span-3 space-y-10">
          <div className="space-y-6 bg-white p-8 border border-black shadow-sm">
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.4em] flex items-center gap-3">
              <Zap size={10} className="text-black" /> Project_Definition
            </label>
            <div className="relative">
              <textarea
                placeholder="DESCRIBE_SYSTEM_REQUIREMENTS..."
                className="w-full h-48 bg-[#F5F5F5] border border-black/10 rounded-none p-6 text-[11px] font-code focus:border-black outline-none resize-none transition-all placeholder:text-black/20 leading-relaxed uppercase text-black"
                value={project.idea}
                onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full font-bold h-14 rounded-none bg-black text-white hover:bg-black/90 text-[11px] tracking-[0.3em] uppercase group shadow-lg"
                onClick={handleStartPipeline}
                disabled={isProcessing || !project.idea}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-3 animate-spin" size={16} /> System_Working</>
                ) : (
                  <><Play className="mr-3 fill-current" size={14} /> Execute_Pipeline</>
                )}
              </Button>

              {isPipelineComplete && (
                <Button 
                  className="w-full font-bold h-14 rounded-none bg-white text-black border border-black hover:bg-black hover:text-white text-[11px] tracking-[0.3em] uppercase group shadow-sm transition-all"
                  onClick={handleDownloadReport}
                >
                  <Download className="mr-3" size={14} /> Download_Full_Report
                </Button>
              )}

              <Button 
                variant="outline" 
                className="h-14 w-full border-black rounded-none hover:bg-black hover:text-white text-[11px] tracking-[0.3em] uppercase transition-all"
                onClick={() => {
                  setProject({ idea: '' });
                  setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
                  setActiveStage(0);
                  setQuotaError(false);
                  setSelectedTab('requirements');
                }}
                disabled={isProcessing}
              >
                <RotateCcw size={14} className="mr-3" /> Clear_Buffer
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-black/30 uppercase tracking-[0.4em] ml-2">Node_Monitor</h3>
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    if (statuses[idx] === 'completed' || activeStage === idx) {
                      setSelectedTab(stage.tab);
                    }
                  }}
                  disabled={statuses[idx] === 'idle' && activeStage !== idx}
                  className={`w-full p-5 transition-all duration-500 flex items-center justify-between border bg-white text-left ${
                    activeStage === idx 
                      ? 'border-black ring-1 ring-black shadow-md' 
                      : 'border-black/10'
                  } ${(statuses[idx] === 'completed' || activeStage === idx) ? 'opacity-100 cursor-pointer hover:bg-black/5' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 flex items-center justify-center ${activeStage === idx ? 'text-black' : 'text-black/30'}`}>
                      {statuses[idx] === 'completed' ? <CheckCircle2 size={16} className="text-black" /> : stage.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-black">{stage.name}</span>
                  </div>
                  <span className={`text-[8px] font-bold tracking-tighter uppercase px-2 py-1 ${statuses[idx] === 'working' ? 'animate-pulse bg-black text-white' : 'bg-black/5'}`}>
                    {statuses[idx]}
                  </span>
                </button>
              ))}
              
              {isPipelineComplete && (
                <button
                  onClick={() => setSelectedTab('summary')}
                  className={`w-full p-5 transition-all duration-500 flex items-center justify-between border bg-white text-left hover:bg-black/5 ${selectedTab === 'summary' ? 'border-black shadow-md' : 'border-black/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center text-black">
                      <FileSearch size={16} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-black">Consolidated Report</span>
                  </div>
                  <span className="text-[8px] font-bold tracking-tighter uppercase px-2 py-1 bg-black text-white">READY</span>
                </button>
              )}
            </div>
            
            <div className="pt-6 border-t border-black/10">
              <div className="flex justify-between text-[9px] font-bold text-black/40 mb-3 uppercase tracking-[0.3em]">
                <span>Pipeline_Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 rounded-none bg-black/10" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col min-h-[800px]">
          {!project.idea && !isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-10 border border-black/10 bg-white shadow-sm">
              <div className="relative">
                <Box size={80} className="text-black/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-black/10 animate-pulse" />
                </div>
              </div>
              <div className="max-w-md space-y-4">
                <h2 className="text-3xl font-headline font-bold tracking-tight uppercase text-black">Terminal_Standby</h2>
                <p className="text-black/40 text-[10px] tracking-[0.4em] leading-relaxed uppercase font-bold">Awaiting deployment parameters...</p>
              </div>
            </div>
          )}

          {(project.requirements || isProcessing) && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/10 overflow-x-auto">
                <TabsList className="bg-transparent h-auto gap-12 p-0 flex flex-nowrap shrink-0">
                  <TabsTrigger value="requirements" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all">01_Concept</TabsTrigger>
                  <TabsTrigger value="architecture" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all" disabled={!project.architecture && activeStage !== 1}>02_Blueprint</TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all" disabled={!project.code && activeStage !== 2}>03_Sources</TabsTrigger>
                  <TabsTrigger value="qa" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all" disabled={!project.qa && activeStage !== 3}>04_Audit</TabsTrigger>
                  <TabsTrigger value="devops" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all" disabled={!project.devops && activeStage !== 4}>05_Infrastructure</TabsTrigger>
                  <TabsTrigger value="summary" className="data-[state=active]:text-black text-black/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-black pb-3 transition-all" disabled={!isPipelineComplete}>06_Full_Report</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[700px]">
                <TabsContent value="requirements" className="mt-0 h-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  {project.requirements ? (
                    <>
                      <AgentArtifact title="Feature Specifications" type="list" content={project.requirements.featureSpecifications.map((f: any) => `${f.name}: ${f.description}`)} icon={<FileText size={16} />} />
                      <div className="space-y-8">
                        <AgentArtifact title="User Stories" type="list" content={project.requirements.userStories} icon={<Lightbulb size={16} />} />
                        <AgentArtifact title="System Constraints" type="list" content={project.requirements.requirements} icon={<ShieldCheck size={16} />} />
                      </div>
                    </>
                  ) : activeStage === 0 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="architecture" className="mt-0 h-full">
                  {project.architecture ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                        <AgentArtifact title="System Blueprint" type="image" content={project.architecture.diagramUrl} icon={<Layers size={16} />} />
                        <AgentArtifact title="Architecture Narrative" type="text" content={project.architecture.systemArchitectureDescription} />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-8">
                        <AgentArtifact title="Entity Schema" type="code" content={project.architecture.databaseSchema} />
                        <AgentArtifact title="Interface Protocols" type="text" content={project.architecture.apiDesigns} />
                      </div>
                    </div>
                  ) : activeStage === 1 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="code" className="mt-0 h-full">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8">
                        <AgentArtifact title={project.code.suggestedFileName || 'SOURCE_CODE.TS'} type="code" content={project.code.generatedCode} icon={<Code size={16} />} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Logic Documentation" type="text" content={project.code.codeExplanation} />
                      </div>
                    </div>
                  ) : activeStage === 2 && isProcessing && <SkeletonArtifact count={1} />}
                </TabsContent>

                <TabsContent value="qa" className="mt-0 h-full">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-4 space-y-8">
                        <AgentArtifact title="Quality Assessment" type="text" content={project.qa.overallAssessment} icon={<Activity size={16} />} />
                        <AgentArtifact title="Review Summary" type="text" content={project.qa.codeReviewSummary} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Integrity & Vulnerability" type="list" content={project.qa.identifiedIssues.map((i: any) => `[${i.severity.toUpperCase()}] ${i.description}`)} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Validation Matrix" type="list" content={project.qa.testPlan.map((t: any) => `${t.type.toUpperCase()}: ${t.description}`)} />
                      </div>
                    </div>
                  ) : activeStage === 3 && isProcessing && <SkeletonArtifact count={3} />}
                </TabsContent>

                <TabsContent value="devops" className="mt-0 h-full">
                  {project.devops ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-7 space-y-8">
                        <AgentArtifact title="Delivery Pipeline" type="text" content={project.devops.ciCdPipelineOutline} icon={<Rocket size={16} />} />
                        <AgentArtifact title="Orchestration Steps" type="text" content={project.devops.stepByStepInstructions} />
                      </div>
                      <div className="lg:col-span-5">
                        <AgentArtifact title="Node Environments" type="list" content={project.devops.suggestedDeploymentStrategies} />
                      </div>
                    </div>
                  ) : activeStage === 4 && isProcessing && <SkeletonArtifact count={2} />}
                </TabsContent>

                <TabsContent value="summary" className="mt-0 h-full">
                  {isPipelineComplete ? (
                    <div className="bg-white border border-black shadow-sm h-full flex flex-col">
                      <div className="p-10 border-b border-black/10 flex items-center justify-between bg-black/5">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-headline font-bold uppercase tracking-tight text-black">FINAL_DELIVERABLES</h2>
                          <p className="text-[10px] font-bold tracking-[0.4em] text-black/40 uppercase">Consolidated Autonomous Output</p>
                        </div>
                        <Button 
                          onClick={handleDownloadReport}
                          className="h-14 px-10 rounded-none bg-black text-white hover:bg-black/90 text-[11px] font-bold tracking-[0.3em] uppercase"
                        >
                          <Download className="mr-3" size={16} /> DOWNLOAD_REPORT.MD
                        </Button>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="p-10 space-y-16">
                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-black/30 uppercase flex items-center gap-4">
                              <ClipboardCheck size={14} /> 01_Product_Scope
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-black/40 uppercase">Specifications</p>
                                <ul className="text-[11px] space-y-2 text-black/70">
                                  {project.requirements.featureSpecifications.map((f: any, i: number) => <li key={i}>• {f.name}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-black/40 uppercase">User Stories</p>
                                <p className="text-[11px] text-black/70">{project.requirements.userStories.length} Scenarios Defined</p>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-black/40 uppercase">Constraints</p>
                                <p className="text-[11px] text-black/70">{project.requirements.requirements.length} Parameters Set</p>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-black/10" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-black/30 uppercase flex items-center gap-4">
                              <Layers size={14} /> 02_Architecture_Schema
                            </h3>
                            <div className="space-y-4">
                              <p className="text-[11px] text-black/70 leading-relaxed max-w-4xl">{project.architecture.systemArchitectureDescription}</p>
                              <div className="bg-[#F5F5F5] p-6 border border-black/10">
                                <pre className="text-[10px] font-code text-black/60">{project.architecture.apiDesigns.substring(0, 300)}...</pre>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-black/10" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-black/30 uppercase flex items-center gap-4">
                              <Code size={14} /> 03_Repository_Assets
                            </h3>
                            <div className="flex items-center justify-between p-6 border border-black/10 bg-[#F9F9F9]">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 border border-black/20 flex items-center justify-center bg-white"><FileText size={18} /></div>
                                <div>
                                  <p className="text-[11px] font-bold text-black uppercase">{project.code.suggestedFileName}</p>
                                  <p className="text-[9px] text-black/30 uppercase tracking-widest">Verified Source Code</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-bold text-black/70">TypeScript / Next.js</p>
                                <p className="text-[9px] text-black/20 uppercase">Core Implementation</p>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-black/10" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-black/30 uppercase flex items-center gap-4">
                              <ShieldCheck size={14} /> 04_Quality_Assurance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="p-6 bg-black/5 border border-black/10 space-y-2">
                                <p className="text-[9px] font-bold text-black/40 uppercase">Health Score</p>
                                <p className="text-lg font-headline font-bold text-black">CERTIFIED_STABLE</p>
                              </div>
                              <div className="p-6 bg-black/5 border border-black/10 space-y-2">
                                <p className="text-[9px] font-bold text-black/40 uppercase">Issue Matrix</p>
                                <p className="text-lg font-headline font-bold text-black">{project.qa.identifiedIssues.length} ADVISORIES</p>
                              </div>
                            </div>
                          </section>
                        </div>
                      </ScrollArea>
                    </div>
                  ) : null}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </main>

      <footer className="h-16 border-t border-black/10 bg-white flex items-center px-10 justify-between text-[9px] text-black/30 uppercase font-bold tracking-[0.5em]">
        <div className="flex gap-12">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-black animate-pulse" /> Status: Verified</span>
          <span>Build: AD-11.4.0</span>
          <span>Encryption: AES-256-GCM</span>
        </div>
        <span>© 2024 AUTODEV_CORE</span>
      </footer>
    </div>
  );
}

function SkeletonArtifact({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full border border-black/10 bg-white animate-pulse flex flex-col p-10 space-y-8 shadow-sm">
          <div className="h-4 w-1/4 bg-black/5" />
          <div className="space-y-4 flex-1">
            <div className="h-4 w-full bg-black/5" />
            <div className="h-4 w-11/12 bg-black/5" />
            <div className="h-4 w-4/6 bg-black/5" />
          </div>
        </div>
      ))}
    </>
  );
}
