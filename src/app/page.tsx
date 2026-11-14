"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Download, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  LogOut, 
  ChevronRight, 
  History as HistoryIcon, 
  Trash2, 
  Copy, 
  Check, 
  CalendarDays, 
  FileText,
  Boxes,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { 
  useUser, 
  useAuth, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Dynamic App Engine Imports
import { DynamicAppRunner } from '@/components/dynamic-app/DynamicAppRunner';
import { DocumentUploader } from '@/components/dynamic-app/DocumentUploader';
import { MultiAgentPipelineSection } from '@/components/pipeline/MultiAgentPipelineSection';
import { HeroLandingPage } from '@/components/landing/HeroLandingPage';
import { DynamicAppSpec, GeneratedSourceFile } from '@/types/dynamic-app';
import { PipelineData } from '@/types/pipeline';
import { createClientFallbackAppSpec, generateClientCodeStack } from '@/lib/client-app-generator';

interface ProjectState {
  id?: string;
  idea: string;
  supportingDocument?: string;
  supportingDocName?: string;
  appSpec?: DynamicAppSpec;
  codeFiles?: GeneratedSourceFile[];
  pipelineData?: PipelineData;
  summary?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

const PRESET_REQUIREMENTS = [
  {
    title: 'Medical Clinic Queue & Triage',
    category: 'Healthcare',
    description: 'Patient registration, triage categorization (Routine, Urgent, Emergency), department queues, and clinical notes.',
    prompt: 'A clinical intake and triage queue portal for a private multi-specialty medical clinic. Doctors and receptionists register arriving patients, assign them to departments (Cardiology, Pediatrics, General Medicine, Orthopedics), tag them with triage priority (Emergency, Urgent, Routine), record intake symptoms, and track status (Waiting, In Consultation, Completed).',
    docPreview: 'Specification: Clinic Operating Hours: 08:00 - 20:00. Mandatory Fields: Patient Full Name, Email, Department, Triage Priority, Status, Intake Date.',
  },
  {
    title: 'IT Helpdesk & Incident Tickets',
    category: 'IT Operations',
    description: 'Customer ticket submission, priority classification (Low, Medium, High, Critical), assignee routing, and SLA tracking.',
    prompt: 'Enterprise IT helpdesk incident portal. Customers and staff log technical issues across categories (Account Access, Billing & Invoicing, Technical Bug, Security). Each ticket must have a severity rating, assigned support engineer, status tracker (Open, In Progress, Resolved), and resolution notes.',
    docPreview: 'SLA Policy: Critical incidents must be assigned within 15 minutes. High severity within 1 hour. All tickets require customer contact email and detailed issue description.',
  },
  {
    title: 'Equipment & Asset Catalog',
    category: 'Logistics',
    description: 'Hardware, software license, and facility inventory tracker with stock counts, unit costs, and maintenance schedules.',
    prompt: 'Internal company asset and equipment management registry. IT and facilities staff track inventory items (Hardware, Software Licenses, Office Equipment, Infrastructure). Each item tracks asset SKU code, unit cost, available quantity, operational status (Available, In Use, Maintenance), and last inspection date.',
    docPreview: 'Asset Registry Schema: Fields: Asset Code (SKU), Item Name, Category, Stock Quantity (Integer >= 0), Unit Cost (Decimal), Status, Last Inspection Date.',
  },
];

export default function AutoDevPodDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [project, setProject] = useState<ProjectState>({ idea: '' });
  const [supportingDoc, setSupportingDoc] = useState<string>('');
  const [supportingDocName, setSupportingDocName] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedWorkspaceTab, setSelectedWorkspaceTab] = useState<string>('app');
  const [selectedCodeFileIndex, setSelectedCodeFileIndex] = useState(0);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Saved Projects from Firestore
  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection<ProjectState>(projectsQuery);

  const handleApplyPreset = (preset: typeof PRESET_REQUIREMENTS[0]) => {
    setProject(prev => ({ ...prev, idea: preset.prompt }));
    setSupportingDoc(preset.docPreview);
    setSupportingDocName(`${preset.title.replace(/\s+/g, '-').toLowerCase()}-spec.txt`);
    toast({
      title: "Preset Loaded",
      description: `Loaded "${preset.title}". Click "Generate Application" to run.`,
    });
  };

  const handleStartGeneration = async () => {
    if (!project.idea.trim()) {
      toast({
        title: "Requirement Required",
        description: "Please describe your business requirement or pick a preset.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    let projectId = project.id;
    let projectRef: any = null;

    if (user && db) {
      if (!projectId) {
        projectRef = doc(collection(db, 'users', user.uid, 'projects'));
        projectId = projectRef.id;
        const initialData = {
          id: projectId,
          ownerId: user.uid,
          idea: project.idea,
          supportingDocument: supportingDoc,
          supportingDocName: supportingDocName,
          status: 'generating',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        try {
          await setDoc(projectRef, initialData);
        } catch (e) {
          console.warn('Firestore write omitted:', e);
        }
      }
    }

    try {
      let result: any = null;
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessRequirement: project.idea,
            supportingDocument: supportingDoc,
          }),
        });
        if (response.ok) {
          result = await response.json();
        }
      } catch (netErr) {
        console.warn('API /api/generate fetch failed, switching to client synthesizer:', netErr);
      }

      if (!result || !result.appSpec) {
        const fallbackSpec = createClientFallbackAppSpec(project.idea);
        const codeFiles = generateClientCodeStack(fallbackSpec);
        result = {
          appSpec: fallbackSpec,
          codeFiles,
          summary: `Synthesized application ${fallbackSpec.name} with real-time validated workflows and localStorage persistence.`,
        };
      }

      const updatedState: ProjectState = {
        ...project,
        id: projectId,
        idea: project.idea,
        supportingDocument: supportingDoc,
        supportingDocName: supportingDocName,
        appSpec: result.appSpec,
        codeFiles: result.codeFiles,
        summary: result.summary,
        status: 'completed',
      };

      setProject(updatedState);
      setSelectedWorkspaceTab('app');

      if (user && db && projectId) {
        const pRef = doc(db, 'users', user.uid, 'projects', projectId);
        updateDocumentNonBlocking(pRef, {
          appSpec: result.appSpec,
          codeFiles: result.codeFiles,
          summary: result.summary,
          status: 'completed',
          updatedAt: serverTimestamp(),
        });
      }

      toast({
        title: "Application Ready",
        description: `Generated ${result.appSpec.name} with live workflows and local storage.`,
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadProject = (proj: ProjectState) => {
    setProject(proj);
    setSupportingDoc(proj.supportingDocument || '');
    setSupportingDocName(proj.supportingDocName);
    setSelectedWorkspaceTab('app');
    toast({
      title: "Project Restored",
      description: `Loaded session: ${proj.appSpec?.name || proj.idea.slice(0, 30)}...`,
    });
  };

  const handleClearBuffer = () => {
    setProject({ idea: '' });
    setSupportingDoc('');
    setSupportingDocName(undefined);
  };

  const handleCopyCode = () => {
    if (!project.codeFiles || !project.codeFiles[selectedCodeFileIndex]) return;
    navigator.clipboard.writeText(project.codeFiles[selectedCodeFileIndex].content);
    setCopiedCode(true);
    toast({ title: "Copied", description: "Source code copied to clipboard." });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadAllCode = () => {
    if (!project.codeFiles || !project.codeFiles.length) return;
    const combined = project.codeFiles.map(f => `// ==========================================\n// FILE: ${f.fileName}\n// ==========================================\n\n${f.content}`).join('\n\n');
    const blob = new Blob([combined], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.appSpec?.name || 'app').toLowerCase().replace(/\s+/g, '-')}-code.ts`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Source code archive downloaded." });
  };

  const getFriendlyTime = (timestamp: any) => {
    if (!timestamp || !isClient) return 'Recently';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, HH:mm');
    } catch {
      return 'Recently';
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <HeroLandingPage />;
  }

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Top Quiet Chrome Header */}
      <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Boxes size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground leading-none">
              AutoDev Dynamic Studio
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Instant Application Synthesis & Live Runtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-medium text-foreground">{user.email}</span>
            <span className="text-[10px] text-muted-foreground">Authenticated Workspace</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => auth.signOut()}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Side: Requirement Input, Documents & Presets */}
        <div className="lg:col-span-4 border-r border-border bg-card/50 flex flex-col h-full overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" /> Business Requirement
              </label>
              <textarea
                placeholder="Describe your application requirements, workflow, data fields, and target users..."
                className="w-full h-36 bg-background border border-border rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                value={project.idea}
                onChange={(e) => setProject(prev => ({ ...prev, idea: e.target.value }))}
                disabled={isProcessing}
              />
            </div>

            {/* Supporting Document Uploader */}
            <DocumentUploader
              onDocumentChange={(content, name) => {
                setSupportingDoc(content);
                setSupportingDocName(name);
              }}
              documentContent={supportingDoc}
              documentName={supportingDocName}
              disabled={isProcessing}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                className="flex-1 h-10 text-xs font-semibold gap-2 shadow-sm"
                onClick={handleStartGeneration}
                disabled={isProcessing || !project.idea.trim()}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Generating App...
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    Generate & Launch App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearBuffer}
                disabled={isProcessing || (!project.idea && !supportingDoc)}
                className="h-10 text-xs px-3 text-muted-foreground"
              >
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>

          {/* Quick Start Presets */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Quick-Start Business Presets
            </span>
            <div className="space-y-2">
              {PRESET_REQUIREMENTS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => !isProcessing && handleApplyPreset(preset)}
                  className="p-3 bg-card border border-border rounded-lg hover:border-primary/40 cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {preset.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal py-0">
                      {preset.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Saved History Drawer */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HistoryIcon size={12} /> Saved Applications
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {projects?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {isProjectsLoading ? (
                <div className="py-4 text-center text-xs text-muted-foreground">Loading archives...</div>
              ) : projects && projects.length > 0 ? (
                projects.slice(0, 5).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleLoadProject(proj)}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 group",
                      project.id === proj.id ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {proj.appSpec?.name || proj.idea}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <CalendarDays size={10} /> {getFriendlyTime(proj.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proj.id!);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground italic">No saved applications yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Working Application Viewport & Workspace Tabs */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-background">
          {project.appSpec ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Segmented Top View Mode Switcher */}
              <div className="px-6 py-3.5 border-b border-border bg-card/40 flex items-center justify-between shrink-0 z-20">
                <Tabs value={selectedWorkspaceTab} onValueChange={setSelectedWorkspaceTab}>
                  <TabsList className="bg-muted/60 p-1 border border-border">
                    <TabsTrigger value="app" className="text-xs font-medium gap-1.5 data-[state=active]:font-semibold data-[state=active]:text-foreground">
                      <Play size={12} className="text-primary fill-primary" /> Live Application
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="text-xs font-medium gap-1.5 data-[state=active]:font-semibold data-[state=active]:text-foreground">
                      <Boxes size={12} className="text-primary" /> Multi-Agent Pipeline (5 Nodes)
                    </TabsTrigger>
                    <TabsTrigger value="code" className="text-xs font-medium gap-1.5 data-[state=active]:font-semibold data-[state=active]:text-foreground">
                      <FileCode size={12} /> Source Code
                    </TabsTrigger>
                    <TabsTrigger value="architecture" className="text-xs font-medium gap-1.5 data-[state=active]:font-semibold data-[state=active]:text-foreground">
                      <Layers size={12} /> Schema & Spec
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-mono py-0.5">
                    {project.appSpec.entities[0]?.pluralName} store active
                  </Badge>
                </div>
              </div>

              {/* View 1: The Live Rendered Application */}
              {selectedWorkspaceTab === 'app' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <DynamicAppRunner appSpec={project.appSpec} />
                </div>
              )}

              {/* View 2: Multi-Agent Engineering Pipeline */}
              {selectedWorkspaceTab === 'pipeline' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <MultiAgentPipelineSection
                    initialIdea={project.idea}
                    initialData={project.pipelineData}
                    onPipelineDataChange={(data) => {
                      setProject(prev => ({ ...prev, pipelineData: data }));
                    }}
                  />
                </div>
              )}

              {/* View 2: Generated TypeScript Source Code */}
              {selectedWorkspaceTab === 'code' && (
                <div className="flex-1 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {project.codeFiles?.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCodeFileIndex(idx)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-mono rounded-md transition-colors",
                            selectedCodeFileIndex === idx
                              ? "bg-background text-foreground font-semibold shadow-sm border border-border"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {file.fileName}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="h-8 text-xs gap-1.5"
                      >
                        {copiedCode ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
                        {copiedCode ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAllCode}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Download size={13} /> Export all
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-auto font-mono text-xs bg-muted/10 leading-relaxed text-foreground">
                    <pre className="whitespace-pre-wrap">
                      <code>{project.codeFiles?.[selectedCodeFileIndex]?.content}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* View 3: Architecture & Schema Breakdown */}
              {selectedWorkspaceTab === 'architecture' && (
                <div className="flex-1 overflow-auto space-y-6">
                  <Card className="border-border shadow-none">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">Entity Data Models</CardTitle>
                      <CardDescription className="text-xs">
                        Schema definitions, field types, and validation rules generated from your requirements.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.appSpec.entities.map(entity => (
                        <div key={entity.name} className="border border-border rounded-lg overflow-hidden">
                          <div className="px-4 py-2.5 bg-muted/40 border-b border-border font-medium text-xs flex items-center justify-between">
                            <span className="font-mono text-foreground font-semibold">
                              {entity.name} ({entity.pluralName})
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              Primary key: {entity.primaryKey}
                            </span>
                          </div>
                          <table className="w-full text-xs">
                            <thead className="bg-muted/10 border-b border-border text-muted-foreground font-medium">
                              <tr>
                                <th className="px-4 py-2 text-left">Field</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Validation</th>
                                <th className="px-4 py-2 text-left">Options</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {entity.fields.map(f => (
                                <tr key={f.name}>
                                  <td className="px-4 py-2 font-mono font-medium text-foreground">{f.name}</td>
                                  <td className="px-4 py-2 text-muted-foreground">{f.type}</td>
                                  <td className="px-4 py-2 text-muted-foreground">
                                    {f.validation?.required ? (
                                      <Badge variant="outline" className="text-[10px] font-normal py-0">Required</Badge>
                                    ) : (
                                      <span className="text-muted-foreground/60">Optional</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-muted-foreground">
                                    {f.options?.join(', ') || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Ready to Generate */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                <Compass size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Ready to Generate Your Application
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter a business requirement in the panel on the left (or pick one of the quick-start presets), optionally attach a supporting document, and click <strong>Generate & Launch App</strong>.
                </p>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl text-left space-y-3 w-full">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  What your generated application includes:
                </span>
                <ul className="text-xs text-foreground/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Multi-screen Navigation & Layout (Dashboard, Table, Kanban, Forms)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Visual Analytics & KPI Lifecycle Distribution (Recharts)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Interactive Kanban Workflow Stage Management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Slide-Out Record Detail Inspection Drawer (Sheet)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Column Sorting, Checkbox Batch Actions & Pagination
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> RFC-4180 CSV & JSON Two-Way Import & Export
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-primary" /> Full Exportable TypeScript Next.js Code Stack
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Project Archive Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Delete Saved Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove this project from your workspace archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (projectToDelete && user && db) {
                  deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'projects', projectToDelete));
                  if (project.id === projectToDelete) handleClearBuffer();
                  setProjectToDelete(null);
                  toast({ title: "Removed", description: "Project archive deleted." });
                }
              }}
              className="bg-destructive text-destructive-foreground text-xs h-9 hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
