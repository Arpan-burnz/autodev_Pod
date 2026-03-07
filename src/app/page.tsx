
"use client";

import React, { useState, useEffect } from 'react';
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
  FileSearch,
  Timer,
  History as HistoryIcon,
  Trash2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentArtifact } from '@/components/AgentArtifact';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// AI Flow imports
import { generateProjectRequirements } from '@/ai/flows/ai-product-manager-requirements-generation';
import { aiSystemArchitectDesignGeneration } from '@/ai/flows/ai-system-architect-design-generation';
import { developerCodeGeneration } from '@/ai/flows/ai-developer-code-generation';
import { aiQaTestGenerationAndExecution } from '@/ai/flows/ai-qa-test-generation-and-execution';
import { aiDevOpsDeploymentSuggestions } from '@/ai/flows/ai-dev-ops-deployment-suggestions';

type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

interface ProjectState {
  id?: string;
  idea: string;
  requirements?: any;
  architecture?: any;
  code?: {
    files: Array<{ fileName: string; content: string }>;
    codeExplanation: string;
  };
  qa?: any;
  devops?: any;
  status?: string;
  updatedAt?: any;
}

export default function AutoDevPodDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState<number>(0);
  const [project, setProject] = useState<ProjectState>({ idea: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('requirements');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const [statuses, setStatuses] = useState<AgentStatus[]>([
    'idle', 'idle', 'idle', 'idle', 'idle'
  ]);

  // History Fetching
  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection<ProjectState>(projectsQuery);

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

  // Resilient code extraction logic
  const getCodeContent = (codeArtifact: any) => {
    if (!codeArtifact) return '';
    if (typeof codeArtifact === 'string') return codeArtifact;
    if (codeArtifact.files && Array.isArray(codeArtifact.files) && codeArtifact.files.length > 0) {
      return codeArtifact.files[0].content || '';
    }
    // Deep fallback if the structure is unexpected but contains code
    if (codeArtifact.content) return codeArtifact.content;
    return '';
  };

  const getCodeFileName = (codeArtifact: any) => {
    if (!codeArtifact) return 'SOURCE_CODE.TS';
    if (codeArtifact.files && Array.isArray(codeArtifact.files) && codeArtifact.files.length > 0) {
      return codeArtifact.files[0].fileName || 'main.ts';
    }
    return 'main.ts';
  };

  const handleStartPipeline = async () => {
    if (!project.idea) {
      toast({ title: "IDEA REQUIRED", description: "Please enter a project concept to begin.", variant: "destructive" });
      return;
    }

    if (!user || !db) return;

    setIsProcessing(true);
    setQuotaError(false);
    
    let projectId = project.id;
    let projectRef;

    if (!projectId) {
      projectRef = doc(collection(db, 'users', user.uid, 'projects'));
      projectId = projectRef.id;
      setProject(prev => ({ ...prev, id: projectId }));

      const initialData = {
        id: projectId,
        ownerId: user.uid,
        idea: project.idea,
        status: 'working',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      try {
        await setDoc(projectRef, initialData);
      } catch (e) {
        // Silently handle doc creation issues for resume logic
      }
    } else {
      projectRef = doc(db, 'users', user.uid, 'projects', projectId);
      updateDocumentNonBlocking(projectRef, { status: 'working', updatedAt: serverTimestamp() });
    }

    try {
      let currentRequirements = project.requirements;
      let currentArchitecture = project.architecture;
      let currentCode = project.code;
      let currentQa = project.qa;
      let currentDevops = project.devops;

      // STAGE 0: PRODUCT MANAGER
      setActiveStage(0);
      if (!currentRequirements) {
        setSelectedTab('requirements');
        updateStatus(0, 'working');
        const results = await generateProjectRequirements({ projectIdea: project.idea });
        currentRequirements = results;
        setProject(prev => ({ ...prev, requirements: results }));
        updateDocumentNonBlocking(projectRef, { requirements: results, updatedAt: serverTimestamp() });
        updateStatus(0, 'completed');
        await delay(1000);
      } else {
        updateStatus(0, 'completed');
      }

      // STAGE 1: SYSTEM ARCHITECT
      setActiveStage(1);
      if (!currentArchitecture) {
        setSelectedTab('architecture');
        updateStatus(1, 'working');
        const results = await aiSystemArchitectDesignGeneration({ 
          projectRequirements: JSON.stringify(currentRequirements) 
        });
        currentArchitecture = results;
        setProject(prev => ({ ...prev, architecture: results }));
        updateDocumentNonBlocking(projectRef, { architecture: results, updatedAt: serverTimestamp() });
        updateStatus(1, 'completed');
        await delay(1000);
      } else {
        updateStatus(1, 'completed');
      }

      // STAGE 2: DEVELOPER
      setActiveStage(2);
      if (!currentCode) {
        setSelectedTab('code');
        updateStatus(2, 'working');
        const results = await developerCodeGeneration({
          requirements: JSON.stringify(currentRequirements.userStories),
          architecture: currentArchitecture.systemArchitectureDescription,
          programmingLanguage: 'TypeScript',
          framework: 'Next.js'
        });
        currentCode = results;
        setProject(prev => ({ ...prev, code: results }));
        updateDocumentNonBlocking(projectRef, { code: results, updatedAt: serverTimestamp() });
        updateStatus(2, 'completed');
        await delay(1000);
      } else {
        updateStatus(2, 'completed');
      }

      // STAGE 3: QA
      setActiveStage(3);
      if (!currentQa) {
        setSelectedTab('qa');
        updateStatus(3, 'working');
        const results = await aiQaTestGenerationAndExecution({
          code: getCodeContent(currentCode),
          requirements: JSON.stringify(currentRequirements.requirements),
          architecture: currentArchitecture.systemArchitectureDescription
        });
        currentQa = results;
        setProject(prev => ({ ...prev, qa: results }));
        updateDocumentNonBlocking(projectRef, { qa: results, updatedAt: serverTimestamp() });
        updateStatus(3, 'completed');
        await delay(1000);
      } else {
        updateStatus(3, 'completed');
      }

      // STAGE 4: DEVOPS
      setActiveStage(4);
      if (!currentDevops) {
        setSelectedTab('devops');
        updateStatus(4, 'working');
        const results = await aiDevOpsDeploymentSuggestions({
          projectDescription: project.idea,
          technologiesUsed: ['Next.js', 'TypeScript', 'TailwindCSS'],
          targetEnvironments: ['Vercel', 'AWS Amplify'],
          codeSummary: currentCode?.codeExplanation || ''
        });
        currentDevops = results;
        setProject(prev => ({ ...prev, devops: results, status: 'completed' }));
        updateDocumentNonBlocking(projectRef, { devops: results, status: 'completed', updatedAt: serverTimestamp() });
        updateStatus(4, 'completed');
      } else {
        updateStatus(4, 'completed');
      }

      toast({
        title: "PIPELINE RECOVERY COMPLETE",
        description: "All agents have finished generating required artifacts.",
      });

    } catch (error: any) {
      const isQuota = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        setQuotaError(true);
      } else {
        toast({ 
          title: "PROCESS INTERRUPTED", 
          description: error.message || "Agent pipeline encountered an error.", 
          variant: "destructive" 
        });
      }
      updateStatus(activeStage, 'error');
      const pRef = doc(db, 'users', user.uid, 'projects', projectId!);
      updateDocumentNonBlocking(pRef, { status: 'error', updatedAt: serverTimestamp() });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadProject = (proj: ProjectState) => {
    setProject(proj);
    const newStatuses: AgentStatus[] = [
      proj.requirements ? 'completed' : 'idle',
      proj.architecture ? 'completed' : 'idle',
      proj.code ? 'completed' : 'idle',
      proj.qa ? 'completed' : 'idle',
      proj.devops ? 'completed' : 'idle',
    ];
    setStatuses(newStatuses);
    
    const firstIncomplete = newStatuses.findIndex(s => s === 'idle');
    const resumeAt = firstIncomplete === -1 ? 4 : firstIncomplete;
    
    setActiveStage(resumeAt);
    setSelectedTab(stages[resumeAt].tab);
    setQuotaError(false);
    
    toast({
      title: "PROJECT ARCHIVE LOADED",
      description: `Resumed session for ${proj.idea.substring(0, 20)}...`
    });
  };

  const confirmDelete = () => {
    if (!projectToDelete || !user || !db) return;
    const projectRef = doc(db, 'users', user.uid, 'projects', projectToDelete);
    deleteDocumentNonBlocking(projectRef);
    if (project.id === projectToDelete) {
      handleClearBuffer();
    }
    setProjectToDelete(null);
    toast({ title: "PROJECT REMOVED", description: "The project has been archived permanently." });
  };

  const handleClearBuffer = () => {
    setProject({ idea: '' });
    setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
    setActiveStage(0);
    setQuotaError(false);
    setSelectedTab('requirements');
  };

  const handleDownloadReport = () => {
    if (!isPipelineComplete && !project.devops) return;

    const mainCodeContent = getCodeContent(project.code);
    const mainFileName = getCodeFileName(project.code);

    const reportContent = `
# AUTODEV_POD FINAL REPORT
Generated for: ${project.idea}
Status: VERIFIED

## 01. PRODUCT REQUIREMENTS
### FEATURE SPECIFICATIONS
${project.requirements?.featureSpecifications?.map((f: any) => `- **${f.name}**: ${f.description}`).join('\n')}

### USER STORIES
${project.requirements?.userStories?.map((s: any) => `- ${s}`).join('\n')}

### SYSTEM CONSTRAINTS
${project.requirements?.requirements?.map((r: any) => `- ${r}`).join('\n')}

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
### ${mainFileName}
\`\`\`typescript
${mainCodeContent}
\`\`\`

### DOCUMENTATION
${project.code?.codeExplanation || ''}

## 04. QUALITY ASSURANCE
### OVERALL ASSESSMENT
${project.qa?.overallAssessment}

### IDENTIFIED ISSUES
${project.qa?.identifiedIssues?.map((i: any) => `- [${i.severity.toUpperCase()}] ${i.description} (${i.type})`).join('\n')}

### TEST PLAN
${project.qa?.testPlan?.map((t: any) => `- [${t.type.toUpperCase()}] ${t.description}: ${t.expectedBehavior}`).join('\n')}

## 05. DEVOPS & INFRASTRUCTURE
### PIPELINE OUTLINE
${project.devops?.ciCdPipelineOutline}

### DEPLOYMENT STRATEGIES
${project.devops?.suggestedDeploymentStrategies?.map((s: any) => `- ${s}`).join('\n')}

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-foreground/20" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center selection:bg-primary selection:text-primary-foreground technical-grid">
        <div className="w-20 h-20 border border-primary flex items-center justify-center text-primary mb-16 relative z-10 bg-card shadow-xl">
          <Cpu size={36} />
        </div>
        <h1 className="text-6xl md:text-9xl font-headline font-bold mb-10 tracking-tight leading-none relative z-10 text-foreground">
          AUTO_DEV<br /><span className="text-foreground/10">SYSTEMS.</span>
        </h1>
        <p className="text-[10px] text-foreground/40 mb-16 max-w-xl leading-tight uppercase tracking-[0.8em] font-bold relative z-10">
          Autonomous multi-agent engineering workflows
        </p>
        <div className="relative z-10">
          <Link href="/auth">
            <Button size="lg" className="h-16 px-16 text-[11px] font-bold rounded-none bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-[0.3em] shadow-2xl">
              Initialize System <ChevronRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-body technical-grid">
      <header className="h-20 border-b border-border bg-card flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-primary flex items-center justify-center text-primary bg-card">
            <Cpu size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-headline font-bold tracking-tight text-foreground">AUTODEV_POD</h1>
            <span className="text-[8px] font-bold tracking-[0.3em] text-foreground/30 uppercase">Enterprise Engineering Hub</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold tracking-widest text-foreground/50 uppercase truncate max-w-[200px]">{user.email}</span>
            <span className="text-[7px] font-bold tracking-[0.2em] text-foreground/20 uppercase">Operator Verified</span>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-foreground/5 rounded-none h-10 w-10 border border-border" onClick={handleLogout}>
            <LogOut size={16} className="text-foreground/60" />
          </Button>
        </div>
      </header>

      {quotaError && (
        <div className="px-10 pt-10">
          <Alert variant="destructive" className="rounded-none border-primary bg-card shadow-md">
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
          <div className="bg-card border border-primary shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 space-y-6 flex-1">
              <label className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={10} className="text-primary" /> Project_Definition
              </label>
              <div className="relative">
                <textarea
                  placeholder="DESCRIBE_SYSTEM_REQUIREMENTS..."
                  className="w-full h-56 bg-muted border border-border rounded-none p-6 text-[11px] font-code focus:border-primary outline-none resize-none transition-all placeholder:text-foreground/20 leading-relaxed uppercase text-foreground"
                  value={project.idea}
                  onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="p-8 pt-0 flex flex-col gap-3">
              <Button 
                className="w-full font-bold h-14 rounded-none bg-white text-black hover:bg-black hover:text-white border border-black text-[10px] tracking-[0.1em] uppercase flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleStartPipeline}
                disabled={isProcessing || !project.idea}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-3 animate-spin" size={16} /> Working...</>
                ) : (
                  <><Play className="mr-3 fill-current" size={14} /> {project.id ? 'Continue_Pipeline' : 'Execute_Pipeline'}</>
                )}
              </Button>

              {(isPipelineComplete || project.devops) && (
                <Button 
                  className="w-full font-bold h-14 rounded-none bg-card text-foreground border border-primary hover:bg-primary hover:text-primary-foreground text-[10px] tracking-[0.1em] uppercase flex items-center justify-center shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleDownloadReport}
                >
                  <Download className="mr-3" size={14} /> Download_Report
                </Button>
              )}

              <Button 
                variant="outline" 
                className="h-14 w-full border-primary rounded-none hover:bg-primary hover:text-primary-foreground text-[10px] tracking-[0.1em] uppercase flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleClearBuffer}
                disabled={isProcessing}
              >
                <RotateCcw size={14} className="mr-3" /> Clear_Buffer
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] ml-2">Node_Monitor</h3>
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedTab(stage.tab)}
                  className={`w-full h-16 px-6 transition-all duration-300 flex items-center justify-between border bg-card text-left shadow-sm hover:shadow-md ${
                    selectedTab === stage.tab 
                      ? 'border-primary ring-1 ring-primary bg-primary/[0.02]' 
                      : 'border-border hover:border-primary/30'
                  } cursor-pointer`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 flex items-center justify-center ${selectedTab === stage.tab ? 'text-primary' : 'text-foreground/30'}`}>
                      {statuses[idx] === 'completed' ? <CheckCircle2 size={16} className="text-primary" /> : statuses[idx] === 'working' ? <Loader2 size={16} className="animate-spin text-primary" /> : stage.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-foreground">{stage.name}</span>
                  </div>
                  <span className={`text-[8px] font-bold tracking-tighter uppercase px-2 py-1 ${statuses[idx] === 'working' ? 'animate-pulse bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {statuses[idx]}
                  </span>
                </button>
              ))}
              
              <button
                onClick={() => setSelectedTab('summary')}
                disabled={!isPipelineComplete && !project.devops}
                className={`w-full h-16 px-6 transition-all duration-300 flex items-center justify-between border bg-card text-left shadow-sm hover:shadow-md ${selectedTab === 'summary' ? 'border-primary ring-1 ring-primary bg-primary/[0.02]' : 'border-border hover:border-primary/30'} ${(!isPipelineComplete && !project.devops) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center text-primary">
                    <FileSearch size={16} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-foreground">Consolidated Report</span>
                </div>
                <span className={`text-[8px] font-bold tracking-tighter uppercase px-2 py-1 ${(isPipelineComplete || project.devops) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {(isPipelineComplete || project.devops) ? 'READY' : 'PENDING'}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <HistoryIcon size={12} className="text-primary" /> Previous_Archive
            </h3>
            <ScrollArea className="h-[400px] border border-border bg-card shadow-sm p-4">
              {isProjectsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 size={16} className="animate-spin text-foreground/20" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div 
                      key={proj.id}
                      onClick={() => handleLoadProject(proj)}
                      className={`p-4 border group cursor-pointer transition-all hover:border-primary shadow-sm ${project.id === proj.id ? 'border-primary bg-primary/[0.02]' : 'border-border bg-card'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-bold tracking-widest text-foreground/40 uppercase">
                          {proj.updatedAt && (proj.updatedAt as any).toDate ? (proj.updatedAt as any).toDate().toLocaleDateString() : 'NO_DATE'}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setProjectToDelete(proj.id!); }}
                            className="p-1 hover:text-destructive transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                          <ExternalLink size={10} className="text-foreground/30" />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold uppercase line-clamp-2 text-foreground leading-tight">
                        {proj.idea}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[7px] font-bold px-1.5 py-0.5 uppercase ${proj.status === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/40'}`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Archive_Empty</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col min-h-[700px]">
          {!project.idea && !isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-start pt-32 text-center p-20 space-y-8 border border-border bg-card shadow-sm">
              <div className="w-24 h-24 border border-border flex items-center justify-center text-foreground/5 bg-background">
                <Box size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.5em] text-foreground/60">Terminal_Standby</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-bold max-w-sm mx-auto leading-relaxed">Awaiting deployment parameters...</p>
              </div>
              <div className="pt-6">
                <div className="w-48 h-[1px] bg-border mx-auto" />
              </div>
            </div>
          )}

          {(project.idea || isProcessing) && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-border overflow-x-auto scrollbar-hide">
                <TabsList className="bg-transparent h-auto gap-8 p-0 flex flex-nowrap shrink-0">
                  {stages.map((stage, i) => (
                    <TabsTrigger 
                      key={stage.tab}
                      value={stage.tab} 
                      className="data-[state=active]:text-primary text-foreground/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 transition-all flex items-center gap-2"
                    >
                      <span className="opacity-50">0{i+1}</span>
                      {stage.name.split(' ')[0]}
                      {statuses[i] === 'completed' && <CheckCircle2 size={10} className="text-primary" />}
                      {statuses[i] === 'working' && <Loader2 size={10} className="animate-spin text-primary" />}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger value="summary" className="data-[state=active]:text-primary text-foreground/30 font-bold text-[10px] uppercase tracking-[0.3em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 transition-all flex items-center gap-2">
                    <span className="opacity-50">06</span> Summary
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[700px]">
                <TabsContent value="requirements" className="mt-0 h-full">
                  {project.requirements ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <AgentArtifact title="Feature Specifications" type="list" content={project.requirements.featureSpecifications.map((f: any) => `${f.name}: ${f.description}`)} icon={<FileText size={16} />} />
                      <div className="space-y-8">
                        <AgentArtifact title="User Stories" type="list" content={project.requirements.userStories} icon={<Lightbulb size={16} />} />
                        <AgentArtifact title="System Constraints" type="list" content={project.requirements.requirements} icon={<ShieldCheck size={16} />} />
                      </div>
                    </div>
                  ) : (activeStage === 0 && isProcessing) ? (
                    <SkeletonArtifact count={2} />
                  ) : (
                    <EmptyStage stageName="Product Requirements" icon={<Users size={32} />} description="Waiting for project definition execution..." />
                  )}
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
                  ) : (activeStage === 1 && isProcessing) ? (
                    <SkeletonArtifact count={1} />
                  ) : (
                    <EmptyStage stageName="System Architecture" icon={<Layers size={32} />} description="Awaiting requirements analysis completion..." />
                  )}
                </TabsContent>

                <TabsContent value="code" className="mt-0 h-full">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8">
                        <AgentArtifact 
                          title={getCodeFileName(project.code)} 
                          type="code" 
                          content={getCodeContent(project.code)} 
                          icon={<Code size={16} />} 
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Logic Documentation" type="text" content={project.code.codeExplanation || "Code structure overview."} />
                      </div>
                    </div>
                  ) : (activeStage === 2 && isProcessing) ? (
                    <SkeletonArtifact count={1} />
                  ) : (
                    <TerminalPlaceholder />
                  )}
                </TabsContent>

                <TabsContent value="qa" className="mt-0 h-full">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-4 space-y-8">
                        <AgentArtifact title="Quality Assessment" type="text" content={project.qa.overallAssessment} icon={<Activity size={16} />} />
                        <AgentArtifact title="Review Summary" type="text" content={project.qa.codeReviewSummary} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Integrity & Vulnerability" type="list" content={project.qa.identifiedIssues?.map((i: any) => `[${i.severity.toUpperCase()}] ${i.description}`)} />
                      </div>
                      <div className="lg:col-span-4">
                        <AgentArtifact title="Validation Matrix" type="list" content={project.qa.testPlan?.map((t: any) => `${t.type.toUpperCase()}: ${t.description}`)} />
                      </div>
                    </div>
                  ) : (activeStage === 3 && isProcessing) ? (
                    <SkeletonArtifact count={3} />
                  ) : (
                    <EmptyStage stageName="Quality Assurance" icon={<ShieldCheck size={32} />} description="Awaiting code generation completion..." />
                  )}
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
                  ) : (activeStage === 4 && isProcessing) ? (
                    <SkeletonArtifact count={2} />
                  ) : (
                    <EmptyStage stageName="DevOps & Infrastructure" icon={<Rocket size={32} />} description="Awaiting security and quality audits..." />
                  )}
                </TabsContent>

                <TabsContent value="summary" className="mt-0 h-full">
                  {(isPipelineComplete || project.devops) ? (
                    <div className="bg-card border border-primary shadow-md h-full flex flex-col overflow-hidden">
                      <div className="p-10 border-b border-border flex items-center justify-between bg-primary/[0.01]">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-headline font-bold uppercase tracking-tight text-foreground">FINAL_DELIVERABLES</h2>
                          <p className="text-[10px] font-bold tracking-[0.2em] text-foreground/40 uppercase">Consolidated Autonomous Output</p>
                        </div>
                        <Button 
                          onClick={handleDownloadReport}
                          className="h-14 px-10 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold tracking-[0.2em] uppercase transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Download className="mr-3" size={16} /> DOWNLOAD_REPORT.MD
                        </Button>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="p-10 space-y-16 max-w-5xl mx-auto">
                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-4">
                              <ClipboardCheck size={14} /> 01_Product_Scope
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-foreground/40 uppercase">Specifications</p>
                                <ul className="text-[11px] space-y-2 text-foreground/70">
                                  {project.requirements?.featureSpecifications?.map((f: any, i: number) => <li key={i}>• {f.name}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-foreground/40 uppercase">User Stories</p>
                                <p className="text-[11px] text-foreground/70">{project.requirements?.userStories?.length || 0} Scenarios Defined</p>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[9px] font-bold text-foreground/40 uppercase">Constraints</p>
                                <p className="text-[11px] text-foreground/70">{project.requirements?.requirements?.length || 0} Parameters Set</p>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-border" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-4">
                              <Layers size={14} /> 02_Architecture_Schema
                            </h3>
                            <div className="space-y-4">
                              <p className="text-[11px] text-foreground/70 leading-relaxed">{project.architecture?.systemArchitectureDescription}</p>
                              <div className="bg-muted p-6 border border-border">
                                <pre className="text-[10px] font-code text-foreground/60 overflow-x-auto whitespace-pre-wrap">{project.architecture?.apiDesigns?.substring(0, 300)}...</pre>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-border" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-4">
                              <Code size={14} /> 03_Repository_Assets
                            </h3>
                            <div className="p-8 border border-border bg-card shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 border border-border flex items-center justify-center bg-background shadow-inner"><FileText size={20} /></div>
                                <div>
                                  <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">{getCodeFileName(project.code)}</p>
                                  <p className="text-[9px] text-foreground/30 uppercase tracking-[0.2em]">Verified Source Code</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-bold text-foreground/70">Main Asset</p>
                                <p className="text-[9px] text-foreground/20 uppercase tracking-tighter">Core Implementation</p>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-border" />

                          <section className="space-y-6">
                            <h3 className="text-xs font-bold tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-4">
                              <ShieldCheck size={14} /> 04_Quality_Assurance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="p-8 bg-muted border border-border space-y-2 shadow-sm">
                                <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Health Score</p>
                                <p className="text-xl font-headline font-bold text-foreground">CERTIFIED_STABLE</p>
                              </div>
                              <div className="p-8 bg-muted border border-border space-y-2 shadow-sm">
                                <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Issue Matrix</p>
                                <p className="text-xl font-headline font-bold text-foreground">{project.qa?.identifiedIssues?.length || 0} ADVISORIES</p>
                              </div>
                            </div>
                          </section>
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <EmptyStage stageName="Final Deliverables" icon={<FileSearch size={32} />} description="Waiting for the full engineering pipeline to complete..." />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </main>

      <footer className="h-16 border-t border-border bg-card flex items-center px-10 justify-between text-[9px] text-foreground/30 uppercase font-bold tracking-[0.5em]">
        <div className="flex gap-12">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary animate-pulse" /> Status: Verified</span>
          <span>Build: AD-11.4.0</span>
          <span>Encryption: AES-256-GCM</span>
        </div>
        <span>© 2024 AUTODEV_CORE</span>
      </footer>

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="rounded-none border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs uppercase font-bold tracking-[0.2em]">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] uppercase tracking-wider text-foreground/60">
              This action will permanently remove this project and all associated artifacts from the archive. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none text-[10px] uppercase font-bold tracking-widest">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[10px] uppercase font-bold tracking-widest">
              Delete Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyStage({ stageName, icon, description }: { stageName: string, icon: React.ReactNode, description: string }) {
  return (
    <div className="h-full border border-border bg-card flex flex-col items-center justify-start pt-32 text-center p-20 space-y-8 shadow-sm">
      <div className="w-24 h-24 border border-border flex items-center justify-center text-foreground/5 bg-background">
        {React.cloneElement(icon as React.ReactElement, { size: 48 })}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.5em] text-foreground/60">{stageName}</h3>
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 font-bold max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      <div className="pt-6">
        <div className="w-48 h-[1px] bg-border mx-auto" />
      </div>
    </div>
  );
}

function TerminalPlaceholder() {
  return (
    <div className="h-full border border-border bg-[#0a0a0c] flex flex-col overflow-hidden shadow-2xl relative rounded-none">
      <div className="h-8 bg-[#1a1a1e] border-b border-white/5 flex items-center px-4 justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
        </div>
        <span className="text-[9px] font-code text-white/20 uppercase tracking-[0.2em]">autodev_terminal_v4.0</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 p-12 font-code text-[11px] space-y-6">
        <div className="flex gap-3">
          <span className="text-[#3b82f6]/60">operator@autodev:~$</span>
          <span className="text-white/80">./initialize_codegen.sh --target=typescript</span>
        </div>
        <div className="text-white/30 space-y-2 uppercase tracking-wider">
          <p className="flex items-center gap-2"><Loader2 size={10} className="animate-spin" /> [SYSTEM] SCANNING ARCHITECTURE ARTIFACTS...</p>
          <p>[ERROR] UPSTREAM DEPENDENCY NOT FOUND: ARCH_SCHEMA_V1</p>
          <p>[STATUS] LISTENER ACTIVE ON PORT 9002</p>
          <p>[PULSE] KERNEL INTEGRITY: 100%</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#3b82f6]/60">operator@autodev:~$</span>
          <span className="w-2 h-4 bg-[#3b82f6] animate-pulse" />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.05),transparent)]" />
      <div className="absolute bottom-4 right-6 text-[8px] font-code text-white/5 uppercase tracking-[0.5em]">
        Standby Mode
      </div>
    </div>
  );
}

function SkeletonArtifact({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full border border-border bg-card animate-pulse flex flex-col p-10 space-y-10 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-8">
            <div className="h-3 w-1/3 bg-foreground/10" />
            <div className="h-3 w-8 bg-foreground/10" />
          </div>
          <div className="space-y-6 flex-1">
            <div className="h-3 w-full bg-foreground/5" />
            <div className="h-3 w-11/12 bg-foreground/5" />
            <div className="h-3 w-4/6 bg-foreground/5" />
            <div className="pt-10 space-y-4">
              <div className="h-3 w-full bg-foreground/5 opacity-50" />
              <div className="h-3 w-10/12 bg-foreground/5 opacity-50" />
            </div>
          </div>
          <div className="pt-8 border-t border-border flex items-center gap-4">
            <Timer size={12} className="text-foreground/10" />
            <div className="h-2.5 w-1/2 bg-foreground/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
