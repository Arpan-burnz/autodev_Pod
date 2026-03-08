"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  MessageSquare,
  Cpu as CpuIcon
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
import { cn } from '@/lib/utils';

// AI Flow imports
import { generateProjectRequirements } from '@/ai/flows/ai-product-manager-requirements-generation';
import { aiSystemArchitectDesignGeneration } from '@/ai/flows/ai-system-architect-design-generation';
import { developerCodeGeneration } from '@/ai/flows/ai-developer-code-generation';
import { aiQaTestGenerationAndExecution } from '@/ai/flows/ai-qa-test-generation-and-execution';
import { aiDevOpsDeploymentSuggestions } from '@/ai/flows/ai-dev-ops-deployment-suggestions';

type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
  type: 'status' | 'info' | 'error' | 'success';
}

interface ProjectState {
  id?: string;
  idea: string;
  requirements?: any;
  architecture?: any;
  code?: {
    files?: Array<{ fileName: string; content: string }>;
    content?: string;
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [statuses, setStatuses] = useState<AgentStatus[]>([
    'idle', 'idle', 'idle', 'idle', 'idle'
  ]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (agent: string, message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { timestamp, agent, message, type }]);
  };

  // History Fetching
  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection<ProjectState>(projectsQuery);

  const stages = [
    { name: 'Product Manager', id: 'pm', icon: <Users size={16} />, tab: 'requirements' },
    { name: 'System Architect', id: 'arch', icon: <Layers size={16} />, tab: 'architecture' },
    { name: 'Developer', id: 'dev', icon: <Terminal size={16} />, tab: 'code' },
    { name: 'Quality Assurance', id: 'qa', icon: <ShieldCheck size={16} />, tab: 'qa' },
    { name: 'DevOps', id: 'ops', icon: <Rocket size={16} />, tab: 'devops' }
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

    if (!user || !db) return;

    setIsProcessing(true);
    setQuotaError(false);
    setLogs([]);
    addLog('SYSTEM', 'Initializing multi-agent workflow...', 'status');
    
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
        addLog('SYSTEM', `Assigned Project ID: ${projectId}`, 'info');
      } catch (e) {
        // Silently handle doc creation issues
      }
    } else {
      projectRef = doc(db, 'users', user.uid, 'projects', projectId);
      updateDocumentNonBlocking(projectRef, { status: 'working', updatedAt: serverTimestamp() });
      addLog('SYSTEM', `Resuming Project: ${projectId}`, 'info');
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
        addLog('PM', 'Analyzing project concept and user needs...', 'status');
        const results = await generateProjectRequirements({ projectIdea: project.idea });
        currentRequirements = results;
        setProject(prev => ({ ...prev, requirements: results }));
        updateDocumentNonBlocking(projectRef, { requirements: results, updatedAt: serverTimestamp() });
        addLog('PM', `Generated ${results.userStories.length} user stories and specifications.`, 'success');
        updateStatus(0, 'completed');
        await delay(800);
      } else {
        updateStatus(0, 'completed');
        addLog('PM', 'Requirements cached from previous run.', 'info');
      }

      // STAGE 1: SYSTEM ARCHITECT
      setActiveStage(1);
      if (!currentArchitecture) {
        setSelectedTab('architecture');
        updateStatus(1, 'working');
        addLog('ARCH', 'Drafting system blueprint and database schema...', 'status');
        const results = await aiSystemArchitectDesignGeneration({ 
          projectRequirements: JSON.stringify(currentRequirements) 
        });
        currentArchitecture = results;
        setProject(prev => ({ ...prev, architecture: results }));
        updateDocumentNonBlocking(projectRef, { architecture: results, updatedAt: serverTimestamp() });
        addLog('ARCH', 'Architecture design and technical diagram complete.', 'success');
        updateStatus(1, 'completed');
        await delay(800);
      } else {
        updateStatus(1, 'completed');
        addLog('ARCH', 'Architecture cached from previous run.', 'info');
      }

      // STAGE 2: DEVELOPER
      setActiveStage(2);
      if (!currentCode) {
        setSelectedTab('code');
        updateStatus(2, 'working');
        addLog('DEV', 'Translating requirements into production code...', 'status');
        const results = await developerCodeGeneration({
          requirements: JSON.stringify(currentRequirements.userStories),
          architecture: currentArchitecture.systemArchitectureDescription,
          programmingLanguage: 'TypeScript',
          framework: 'Next.js'
        });
        currentCode = results;
        setProject(prev => ({ ...prev, code: results }));
        updateDocumentNonBlocking(projectRef, { code: results, updatedAt: serverTimestamp() });
        addLog('DEV', `Successfully generated ${results.files?.length || 1} source files.`, 'success');
        updateStatus(2, 'completed');
        await delay(800);
      } else {
        updateStatus(2, 'completed');
        addLog('DEV', 'Codebase cached from previous run.', 'info');
      }

      // STAGE 3: QA
      setActiveStage(3);
      if (!currentQa) {
        setSelectedTab('qa');
        updateStatus(3, 'working');
        addLog('QA', 'Executing automated test suites and vulnerability scans...', 'status');
        const results = await aiQaTestGenerationAndExecution({
          code: currentCode?.files?.map((f: any) => f.content).join('\n') || currentCode?.content || '',
          requirements: JSON.stringify(currentRequirements.requirements),
          architecture: currentArchitecture.systemArchitectureDescription
        });
        currentQa = results;
        setProject(prev => ({ ...prev, qa: results }));
        updateDocumentNonBlocking(projectRef, { qa: results, updatedAt: serverTimestamp() });
        addLog('QA', `Audit complete. ${results.identifiedIssues.length} issues detected.`, results.identifiedIssues.length > 0 ? 'info' : 'success');
        updateStatus(3, 'completed');
        await delay(800);
      } else {
        updateStatus(3, 'completed');
        addLog('QA', 'QA reports cached from previous run.', 'info');
      }

      // STAGE 4: DEVOPS
      setActiveStage(4);
      if (!currentDevops) {
        setSelectedTab('devops');
        updateStatus(4, 'working');
        addLog('OPS', 'Formulating CI/CD strategies and cloud deployment steps...', 'status');
        const results = await aiDevOpsDeploymentSuggestions({
          projectDescription: project.idea,
          technologiesUsed: ['Next.js', 'TypeScript', 'TailwindCSS'],
          targetEnvironments: ['Vercel', 'AWS Amplify'],
          codeSummary: currentCode?.codeExplanation || ''
        });
        currentDevops = results;
        setProject(prev => ({ ...prev, devops: results, status: 'completed' }));
        updateDocumentNonBlocking(projectRef, { devops: results, status: 'completed', updatedAt: serverTimestamp() });
        addLog('OPS', 'Infrastructure plan finalized.', 'success');
        updateStatus(4, 'completed');
      } else {
        updateStatus(4, 'completed');
        addLog('OPS', 'DevOps plan cached from previous run.', 'info');
      }

      addLog('SYSTEM', 'Autonomous pipeline execution completed successfully.', 'success');
      toast({ title: "PIPELINE COMPLETE", description: "All artifacts have been verified." });

    } catch (error: any) {
      const errorMessage = error.message || '';
      const isQuota = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      addLog('SYSTEM', `Pipeline Error: ${errorMessage}`, 'error');
      if (isQuota) {
        setQuotaError(true);
      } else {
        toast({ title: "PROCESS ERROR", description: errorMessage, variant: "destructive" });
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
    setLogs([{ timestamp: 'SYSTEM', agent: 'ARCHIVE', message: `Restored session: ${proj.id}`, type: 'info' }]);
    
    const firstIncomplete = newStatuses.findIndex(s => s === 'idle');
    const resumeAt = firstIncomplete === -1 ? 4 : firstIncomplete;
    
    setActiveStage(resumeAt);
    setSelectedTab(stages[resumeAt].tab);
    setQuotaError(false);
    
    toast({ title: "PROJECT LOADED", description: "Session restored from archive." });
  };

  const handleClearBuffer = () => {
    setProject({ idea: '' });
    setStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
    setActiveStage(0);
    setQuotaError(false);
    setSelectedTab('requirements');
    setLogs([]);
  };

  const handleDownloadReport = () => {
    if (!isPipelineComplete && !project.devops) return;

    const reportContent = `
# AUTODEV_POD FINAL REPORT
Generated for: ${project.idea}
Status: VERIFIED

## 01. PRODUCT REQUIREMENTS
### FEATURE SPECIFICATIONS
${project.requirements?.featureSpecifications?.map((f: any) => `- **${f.name}**: ${f.description}`).join('\n')}

### USER STORIES
${project.requirements?.userStories?.map((s: any) => `- ${s}`).join('\n')}

## 02. SYSTEM ARCHITECTURE
### NARRATIVE
${project.architecture?.systemArchitectureDescription}

## 03. SOURCE CODE
${project.code?.files?.map((f: any) => `### FILE: ${f.fileName}\n\`\`\`typescript\n${f.content}\n\`\`\``).join('\n\n')}

## 04. QUALITY ASSURANCE
### OVERALL ASSESSMENT
${project.qa?.overallAssessment}

## 05. DEVOPS
### PIPELINE OUTLINE
${project.devops?.ciCdPipelineOutline}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autodev-report-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-body technical-grid overflow-hidden">
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
          <Button variant="ghost" size="icon" className="hover:bg-foreground/5 rounded-none h-10 w-10 border border-border" onClick={() => auth.signOut()}>
            <LogOut size={16} className="text-foreground/60" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 border-r border-border bg-card flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={10} className="text-primary" /> Project_Definition
                </label>
                <textarea
                  placeholder="DESCRIBE_SYSTEM_REQUIREMENTS..."
                  className="w-full h-48 bg-muted border border-border rounded-none p-5 text-[11px] font-code focus:border-primary outline-none resize-none transition-all placeholder:text-foreground/20 leading-relaxed uppercase text-foreground"
                  value={project.idea}
                  onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                  disabled={isProcessing}
                />
                <Button 
                  className="w-full font-bold h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] tracking-[0.2em] uppercase transition-all shadow-lg"
                  onClick={handleStartPipeline}
                  disabled={isProcessing || !project.idea}
                >
                  {isProcessing ? <><Loader2 className="mr-3 animate-spin" size={16} /> Processing</> : <><Play className="mr-3 fill-current" size={14} /> Execute Pipeline</>}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-none border-primary text-[10px] tracking-[0.2em] uppercase"
                  onClick={handleClearBuffer}
                  disabled={isProcessing}
                >
                  <RotateCcw size={14} className="mr-3" /> Reset
                </Button>
              </div>

              <div className="space-y-6">
                <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={12} className="text-primary" /> Node_Matrix
                </h3>
                <div className="space-y-2">
                  {stages.map((stage, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedTab(stage.tab)}
                      className={cn(
                        "w-full h-14 px-5 transition-all flex items-center justify-between border text-left",
                        selectedTab === stage.tab 
                          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary' 
                          : 'border-border hover:border-primary/20'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-5 h-5 flex items-center justify-center", selectedTab === stage.tab ? 'text-primary' : 'text-foreground/20')}>
                          {statuses[idx] === 'completed' ? <CheckCircle2 size={14} className="text-primary" /> : statuses[idx] === 'working' ? <Loader2 size={14} className="animate-spin text-primary" /> : stage.icon}
                        </div>
                        <span className="text-[9px] font-bold tracking-wider uppercase">{stage.name}</span>
                      </div>
                      <span className={cn(
                        "text-[7px] font-bold px-2 py-0.5 uppercase",
                        statuses[idx] === 'working' ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted text-foreground/40'
                      )}>
                        {statuses[idx]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HistoryIcon size={12} className="text-primary" /> Archive_Logs
                </h3>
                <div className="space-y-2">
                  {isProjectsLoading ? (
                    <div className="flex justify-center p-4"><Loader2 size={16} className="animate-spin opacity-20" /></div>
                  ) : projects?.map((proj) => (
                    <div 
                      key={proj.id}
                      onClick={() => handleLoadProject(proj)}
                      className={cn(
                        "p-3 border group cursor-pointer transition-all",
                        project.id === proj.id ? 'border-primary bg-primary/[0.02]' : 'border-border hover:border-primary/20'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[7px] font-bold text-foreground/30 uppercase tracking-tighter">
                          {proj.id?.substring(0, 8)}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(proj.id!); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive">
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <p className="text-[9px] font-bold uppercase truncate text-foreground/70">{proj.idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Artifact Area */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-hidden bg-background">
          <div className="flex-1 overflow-hidden p-10 flex flex-col gap-10">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-border pb-6 overflow-x-auto shrink-0">
                <TabsList className="bg-transparent h-auto gap-10 p-0 flex flex-nowrap">
                  {stages.map((stage, i) => (
                    <TabsTrigger 
                      key={stage.tab}
                      value={stage.tab} 
                      className="data-[state=active]:text-primary text-foreground/30 font-bold text-[9px] uppercase tracking-[0.4em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 transition-all"
                    >
                      0{i+1}_{stage.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger value="summary" className="data-[state=active]:text-primary text-foreground/30 font-bold text-[9px] uppercase tracking-[0.4em] p-0 bg-transparent rounded-none shadow-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 transition-all">
                    06_REPORT
                  </TabsTrigger>
                </TabsList>
                {(isPipelineComplete || project.devops) && (
                  <Button variant="outline" size="sm" className="h-9 px-6 rounded-none text-[9px] font-bold tracking-[0.2em] uppercase" onClick={handleDownloadReport}>
                    <Download size={14} className="mr-2" /> Download_Report
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-hidden mt-10">
                <TabsContent value="requirements" className="m-0 h-full">
                  {project.requirements ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                      <AgentArtifact title="Feature Specifications" type="list" content={project.requirements.featureSpecifications.map((f: any) => `${f.name}: ${f.description}`)} icon={<FileText size={16} />} />
                      <div className="space-y-8 h-full flex flex-col">
                        <AgentArtifact title="User Stories" type="list" content={project.requirements.userStories} icon={<Lightbulb size={16} />} />
                        <AgentArtifact title="Constraints" type="list" content={project.requirements.requirements} icon={<ShieldCheck size={16} />} />
                      </div>
                    </div>
                  ) : <EmptyView name="Product Requirements" icon={<Users size={48} />} />}
                </TabsContent>

                <TabsContent value="architecture" className="m-0 h-full">
                  {project.architecture ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8 h-full">
                        <AgentArtifact title="System Blueprint" type="image" content={project.architecture.diagramUrl} icon={<Layers size={16} />} />
                        <AgentArtifact title="Description" type="text" content={project.architecture.systemArchitectureDescription} />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-8 h-full">
                        <AgentArtifact title="Data Schema" type="code" content={project.architecture.databaseSchema} />
                        <AgentArtifact title="APIs" type="text" content={project.architecture.apiDesigns} />
                      </div>
                    </div>
                  ) : <EmptyView name="System Architecture" icon={<Layers size={48} />} />}
                </TabsContent>

                <TabsContent value="code" className="m-0 h-full">
                  {project.code ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-9 h-full">
                        <AgentArtifact 
                          title="SOURCE_CODE_ASSETS" 
                          type="code" 
                          content={project.code} 
                          icon={<Code size={16} />} 
                        />
                      </div>
                      <div className="lg:col-span-3 h-full">
                        <AgentArtifact title="Logics" type="text" content={project.code.codeExplanation} />
                      </div>
                    </div>
                  ) : <EmptyView name="AI Developer" icon={<Terminal size={48} />} />}
                </TabsContent>

                <TabsContent value="qa" className="m-0 h-full">
                  {project.qa ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-6 h-full">
                        <AgentArtifact title="Audit Report" type="text" content={project.qa.overallAssessment} icon={<Activity size={16} />} />
                      </div>
                      <div className="lg:col-span-6 space-y-8 flex flex-col">
                        <AgentArtifact title="Identified Issues" type="list" content={project.qa.identifiedIssues?.map((i: any) => `[${i.severity.toUpperCase()}] ${i.description}`)} />
                        <AgentArtifact title="Validation Plan" type="list" content={project.qa.testPlan?.map((t: any) => `${t.type.toUpperCase()}: ${t.description}`)} />
                      </div>
                    </div>
                  ) : <EmptyView name="Quality Assurance" icon={<ShieldCheck size={48} />} />}
                </TabsContent>

                <TabsContent value="devops" className="m-0 h-full">
                  {project.devops ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-7 h-full">
                        <AgentArtifact title="Delivery Pipeline" type="text" content={project.devops.ciCdPipelineOutline} icon={<Rocket size={16} />} />
                      </div>
                      <div className="lg:col-span-5 h-full">
                        <AgentArtifact title="Strategy" type="list" content={project.devops.suggestedDeploymentStrategies} />
                      </div>
                    </div>
                  ) : <EmptyView name="DevOps" icon={<Rocket size={48} />} />}
                </TabsContent>
              </div>
            </Tabs>

            {/* Terminal Activity Logs */}
            <div className="h-48 shrink-0 bg-black/90 border border-primary/20 flex flex-col shadow-2xl relative">
              <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
              <div className="h-8 border-b border-white/5 px-4 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <CpuIcon size={12} className="text-primary animate-pulse" />
                  <span className="text-[9px] font-bold text-primary/70 tracking-[0.4em] uppercase">Subsystem_Logs</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  </div>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 terminal-scroll font-code text-[10px] leading-relaxed">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex gap-4 mb-1">
                    <span className="text-white/20 whitespace-nowrap">[{log.timestamp}]</span>
                    <span className={cn(
                      "font-bold uppercase whitespace-nowrap w-16",
                      log.agent === 'SYSTEM' ? "text-primary/70" : "text-foreground/40"
                    )}>{log.agent}</span>
                    <span className={cn(
                      "flex-1",
                      log.type === 'error' ? "text-destructive" :
                      log.type === 'success' ? "text-primary" :
                      log.type === 'status' ? "text-primary/60 italic" : "text-foreground/60"
                    )}>{log.message}</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-2 text-foreground/20 italic">
                    <span className="animate-pulse">_</span>
                    <span>System idle. Awaiting instruction.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs font-bold uppercase tracking-[0.2em]">Delete Project Archive?</AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] uppercase tracking-wider">
              This will permanently remove the project and all generated artifacts from the system database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none text-[10px] uppercase font-bold tracking-widest">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (projectToDelete && user && db) {
                  deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'projects', projectToDelete));
                  if (project.id === projectToDelete) handleClearBuffer();
                  setProjectToDelete(null);
                  toast({ title: "ARCHIVE REMOVED", description: "Project data purged." });
                }
              }} 
              className="rounded-none bg-destructive text-destructive-foreground text-[10px] uppercase font-bold tracking-widest"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyView({ name, icon, description = "Awaiting deployment parameters..." }: { name: string, icon: React.ReactNode, description?: string }) {
  return (
    <div className="h-full border border-border bg-card flex flex-col items-center justify-center text-center p-20 space-y-8 shadow-sm">
      <div className="w-20 h-20 border border-border flex items-center justify-center text-foreground/5 bg-background">
        {React.cloneElement(icon as React.ReactElement, { size: 40 })}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.5em] text-foreground/40">{name}</h3>
        <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/20 font-bold max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
