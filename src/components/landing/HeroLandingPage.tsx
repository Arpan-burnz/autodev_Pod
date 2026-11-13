'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Boxes, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Rocket, 
  Users, 
  Play, 
  FileCode, 
  Database,
  ChevronRight,
  Activity,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const TEMPLATES = [
  {
    title: 'Medical Clinic Queue & Triage',
    category: 'Healthcare',
    description: 'Patient intake, triage priority categorization (Routine, Urgent, Emergency), department queues, and clinical notes.',
    features: ['Real-time triage queue', 'Department routing', 'Clinical symptom validation'],
  },
  {
    title: 'IT Helpdesk & Incident Tickets',
    category: 'IT Operations',
    description: 'Customer ticket submission, priority classification (Low, Medium, High, Critical), assignee routing, and SLA tracking.',
    features: ['SLA urgency tracking', 'Severity matrices', 'Ticket status workflows'],
  },
  {
    title: 'Equipment & Asset Catalog',
    category: 'Logistics',
    description: 'Hardware, software license, and facility inventory tracker with stock counts, unit costs, and maintenance schedules.',
    features: ['SKU code validation', 'Inventory valuation KPIs', 'Maintenance inspection logs'],
  },
];

export function HeroLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground font-sans antialiased">
      {/* Top Quiet Chrome Navigation */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Boxes size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-foreground">AutoDev Studio</span>
            <span className="hidden sm:inline-block text-[10px] text-muted-foreground font-mono ml-2">
              Autonomous Engineering Pod
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#pipeline" className="hover:text-foreground transition-colors">Agent Pod</a>
          <a href="#runtime" className="hover:text-foreground transition-colors">Live Runtime</a>
          <a href="#templates" className="hover:text-foreground transition-colors">Templates</a>
          <a href="#code" className="hover:text-foreground transition-colors">Code Stack</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              Get Started <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted/60 border border-border text-xs font-medium text-foreground/80 shadow-sm">
          <Sparkles size={13} className="text-primary" />
          <span>Autonomous Multi-Agent Engineering Studio</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.12]">
          From business requirement to working software in seconds.
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Describe your application workflow, attach optional documents or schemas, and let a coordinated pod of 5 AI agents architect, compile, audit, and launch a working application with live local data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/auth">
            <Button size="lg" className="h-11 px-6 text-xs font-semibold gap-2 shadow-sm w-full sm:w-auto">
              Start Building Free <ArrowRight size={14} />
            </Button>
          </Link>
          <a href="#templates">
            <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-medium w-full sm:w-auto">
              Explore Sample Workflows
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground pt-3 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-primary" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-primary" /> Instant live preview
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-primary" /> Local & cloud persistence
          </span>
        </div>
      </section>

      {/* Visual Product Scene Mockup (Hero Showcase) */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto w-full pb-20">
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Mock Browser Chrome Bar */}
          <div className="h-10 bg-muted/60 border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="px-4 py-1 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground">
              autodev.studio/workspace/clinical-intake
            </div>
            <div className="w-12" />
          </div>

          {/* Mock Window Interior */}
          <div className="p-6 bg-background space-y-6">
            {/* Top 5-Agent Pipeline Stepper */}
            <div className="p-3 bg-muted/30 border border-border rounded-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Activity size={13} className="text-primary" /> Multi-Agent Execution Pod
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  5/5 Nodes Verified
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 bg-background border border-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">01_PM</span>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <p className="font-medium truncate">Product Manager</p>
                  <p className="text-[10px] text-muted-foreground">4 User Stories</p>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">02_ARCH</span>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <p className="font-medium truncate">System Architect</p>
                  <p className="text-[10px] text-muted-foreground">Schema & APIs</p>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">03_DEV</span>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <p className="font-medium truncate">Lead Developer</p>
                  <p className="text-[10px] text-muted-foreground">3 Code Modules</p>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">04_QA</span>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <p className="font-medium truncate">Quality Assurance</p>
                  <p className="text-[10px] text-muted-foreground">4 Test Cases</p>
                </div>

                <div className="p-2.5 bg-background border border-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">05_OPS</span>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <p className="font-medium truncate">DevOps Engineer</p>
                  <p className="text-[10px] text-muted-foreground">CI/CD Manifest</p>
                </div>
              </div>
            </div>

            {/* Generated App Interactive Preview Mockup */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-background flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    M
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">MediCare Clinical Records</h4>
                    <p className="text-[10px] text-muted-foreground">Live Application Runtime</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">Overview</span>
                  <span className="px-2 py-0.5 rounded text-muted-foreground text-[10px]">Patient Queue</span>
                  <span className="px-2 py-0.5 rounded text-muted-foreground text-[10px]">+ New Patient</span>
                </div>
              </div>

              {/* Mock KPIs & Table */}
              <div className="p-5 space-y-4 bg-muted/10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-card border border-border rounded-lg">
                    <span className="text-[10px] text-muted-foreground">Total Patients Registered</span>
                    <p className="text-xl font-bold font-mono text-foreground mt-1">124</p>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-lg">
                    <span className="text-[10px] text-muted-foreground">Emergency / Urgent Triage</span>
                    <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">5</p>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-lg">
                    <span className="text-[10px] text-muted-foreground">Consultations Completed</span>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">42</p>
                  </div>
                </div>

                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                      <tr>
                        <th className="px-4 py-2 text-left">Patient Name</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Triage Status</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">Eleanor Vance</td>
                        <td className="px-4 py-2.5 text-muted-foreground">Cardiology</td>
                        <td className="px-4 py-2.5"><Badge variant="destructive" className="text-[9px] py-0 font-normal">Urgent</Badge></td>
                        <td className="px-4 py-2.5 text-muted-foreground font-mono">2026-11-13</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">Marcus Sterling</td>
                        <td className="px-4 py-2.5 text-muted-foreground">General Medicine</td>
                        <td className="px-4 py-2.5"><Badge variant="default" className="text-[9px] py-0 font-normal">Completed</Badge></td>
                        <td className="px-4 py-2.5 text-muted-foreground font-mono">2026-11-13</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities (Feature Pillars) */}
      <section id="pipeline" className="px-6 lg:px-12 py-20 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Autonomous Software Engineering System
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on a decoupled multi-agent architecture where every deliverable is verified before execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Sequential 5-Agent Pod</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Chains Product Manager, System Architect, Lead Developer, QA, and DevOps. Dynamic inter-agent communication passes schemas, contracts, and test specs seamlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Play size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Live Dynamic Runtime</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates working, interactive applications directly in your browser. Complete with navigation, responsive forms, real-time field validation, and local storage CRUD.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FileCode size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Production Code Stack</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates clean TypeScript data models, storage services, SQL DDL schemas, and React components ready to export and deploy to Vercel or Cloud Run.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="px-6 lg:px-12 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quick-Start Business Presets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Test the dynamic generator with 1-click starter business applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((tmpl, i) => (
            <Card key={i} className="border-border bg-card shadow-sm rounded-xl flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-normal py-0">
                    {tmpl.category}
                  </Badge>
                  <Sparkles size={13} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{tmpl.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border">
                  {tmpl.features.map((feat, j) => (
                    <div key={j} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Check size={11} className="text-primary" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="w-full text-xs font-medium gap-1.5 h-9">
                    Launch Template <ChevronRight size={13} />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 lg:px-12 pb-20 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl bg-slate-950 text-slate-100 p-8 sm:p-12 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ready to generate your application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Start building autonomous applications with the 5-agent engineering pod in under a minute.
            </p>
          </div>

          <Link href="/auth">
            <Button size="lg" className="h-11 px-8 text-xs font-semibold gap-2 shadow-sm shrink-0">
              Get Started Free <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-border bg-background py-8 px-6 lg:px-12 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>© 2026 AutoDev Dynamic Studio. Autonomous Multi-Agent Software Delivery.</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Operational</span>
          </span>
          <Link href="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}

