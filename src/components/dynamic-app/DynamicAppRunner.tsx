'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Search,
  RotateCcw,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  FileSpreadsheet,
  Kanban as KanbanIcon,
  Sparkles,
  CheckSquare,
  Square,
  Eye
} from 'lucide-react';
import {
  DynamicAppSpec,
  ScreenSpec,
  EntitySpec,
  FieldSpec,
  TableConfig,
  FormConfig,
  DashboardConfig
} from '@/types/dynamic-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Newly engineered modular studio components
import { AnalyticsCharts } from './AnalyticsCharts';
import { KanbanBoard } from './KanbanBoard';
import { RecordDetailSheet } from './RecordDetailSheet';
import {
  exportRecordsToCsv,
  parseCsvToRecords,
  generateSampleRecord
} from '@/lib/dynamic-app-helpers';

interface DynamicAppRunnerProps {
  appSpec: DynamicAppSpec;
  className?: string;
}

export function DynamicAppRunner({ appSpec, className }: DynamicAppRunnerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryEntity = appSpec.entities[0] || {
    name: 'item',
    pluralName: 'items',
    primaryKey: 'id',
    fields: [],
    initialData: [],
  };

  const storageKey = `autodev_app_${appSpec.id}_${primaryEntity.name}`;

  // Local Storage State
  const [records, setRecords] = useState<Array<Record<string, any>>>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Screen Navigation (dashboard, table, kanban, or form)
  const [activeScreenId, setActiveScreenId] = useState<string>(
    appSpec.navigation.defaultScreenId || appSpec.screens[0]?.id || 'dashboard'
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inspecting Record for Slide-Out Drawer
  const [inspectingRecord, setInspectingRecord] = useState<Record<string, any> | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Find status field for transitions and batch workflows
  const statusField = useMemo(() => {
    return primaryEntity.fields.find(f =>
      f.name.toLowerCase().includes('status') ||
      f.name.toLowerCase().includes('stage') ||
      f.name.toLowerCase().includes('state')
    );
  }, [primaryEntity]);

  // Initialize or load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        setRecords(primaryEntity.initialData || []);
        localStorage.setItem(storageKey, JSON.stringify(primaryEntity.initialData || []));
      }
    } catch {
      setRecords(primaryEntity.initialData || []);
    }
    setIsLoaded(true);
  }, [storageKey, primaryEntity.initialData]);

  // Persist records when modified
  const updateStorage = (newRecords: Array<Record<string, any>>) => {
    setRecords(newRecords);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newRecords));
    }
  };

  const handleResetData = () => {
    updateStorage(primaryEntity.initialData || []);
    setSelectedIds([]);
    toast({
      title: "Data Reset",
      description: "Restored baseline demo records.",
    });
  };

  const handleExportJson = () => {
    if (!records.length) return;
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appSpec.name.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({
      title: "JSON Exported",
      description: `Downloaded ${records.length} records.`,
    });
  };

  const handleExportCsv = (recordsToExport?: Array<Record<string, any>>) => {
    const data = recordsToExport || records;
    if (!data.length) return;
    exportRecordsToCsv(
      data,
      primaryEntity.fields,
      `${appSpec.name.toLowerCase().replace(/\s+/g, '-')}-records.csv`
    );
    toast({
      title: "CSV Exported",
      description: `Exported ${data.length} records to CSV format.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        let imported: Array<Record<string, any>> = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          imported = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          imported = parseCsvToRecords(content, primaryEntity.fields);
        }

        if (imported.length > 0) {
          const updated = [...imported, ...records];
          updateStorage(updated);
          toast({
            title: "Data Imported",
            description: `Successfully loaded ${imported.length} records from ${file.name}.`,
          });
        } else {
          toast({
            title: "Import Notice",
            description: "No valid records could be extracted from file.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Import Error",
          description: err.message || "Failed to parse file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Status transition callback
  const handleStatusChange = (recordId: string, newStatus: string) => {
    if (!statusField) return;
    const updated = records.map(r => {
      if (r.id === recordId) {
        return { ...r, [statusField.name]: newStatus };
      }
      return r;
    });
    updateStorage(updated);

    if (inspectingRecord && inspectingRecord.id === recordId) {
      setInspectingRecord(prev => prev ? { ...prev, [statusField.name]: newStatus } : null);
    }

    toast({
      title: "Status Updated",
      description: `Record ${recordId} transitioned to "${newStatus}".`,
    });
  };

  // Sorting toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Validation function
  const validateField = (field: FieldSpec, value: any): string | null => {
    const val = field.validation;
    const stringVal = value !== undefined && value !== null ? String(value).trim() : '';

    if (val?.required && !stringVal) {
      return val.message || `${field.label} is required`;
    }

    if (field.type === 'email' && stringVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringVal)) {
        return val?.message || 'Please enter a valid email address';
      }
    }

    if (field.type === 'number' && stringVal) {
      const num = Number(stringVal);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
      if (val?.min !== undefined && num < val.min) {
        return `Minimum value is ${val.min}`;
      }
      if (val?.max !== undefined && num > val.max) {
        return `Maximum value is ${val.max}`;
      }
    }

    if (field.type === 'text' && stringVal && val?.minLength !== undefined) {
      if (stringVal.length < val.minLength) {
        return `Must be at least ${val.minLength} characters`;
      }
    }

    return null;
  };

  // Handle Form Submission (Create Record)
  const handleFormSubmit = (e: React.FormEvent, formConfig?: FormConfig) => {
    e.preventDefault();
    const fieldsToValidate = primaryEntity.fields.filter(f =>
      !formConfig?.fields || formConfig.fields.includes(f.name)
    );

    const errors: Record<string, string> = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields.",
        variant: "destructive",
      });
      return;
    }

    setFormErrors({});
    const newRecordId = `REC-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord = {
      id: newRecordId,
      ...formData,
    };

    const updated = [newRecord, ...records];
    updateStorage(updated);
    setFormData({});

    toast({
      title: "Record Created",
      description: `Added ${primaryEntity.name} ${newRecordId} successfully.`,
    });

    // Redirect to configured success screen or table
    if (formConfig?.successRedirectScreenId) {
      setActiveScreenId(formConfig.successRedirectScreenId);
    } else {
      const tableScreen = appSpec.screens.find(s => s.type === 'table');
      if (tableScreen) setActiveScreenId(tableScreen.id);
    }
  };

  // Auto-Fill sample data inside create form
  const handleAutoFillSample = () => {
    const sample = generateSampleRecord(primaryEntity.fields, records.length);
    const { id, ...dataFields } = sample;
    setFormData(dataFields);
    setFormErrors({});
    toast({
      title: "Sample Data Loaded",
      description: "Filled fields with domain-realistic values.",
    });
  };

  // Handle Edit Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const errors: Record<string, string> = {};
    primaryEntity.fields.forEach(field => {
      const error = validateField(field, editingRecord[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditErrors({});
    const updated = records.map(r => r.id === editingRecord.id ? editingRecord : r);
    updateStorage(updated);
    setEditingRecord(null);

    toast({
      title: "Record Updated",
      description: `Updated ${editingRecord.id} successfully.`,
    });
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    const updated = records.filter(r => r.id !== deletingId);
    updateStorage(updated);
    setSelectedIds(prev => prev.filter(id => id !== deletingId));
    setDeletingId(null);

    toast({
      title: "Record Deleted",
      description: "Removed record from storage.",
    });
  };

  // Batch action handlers
  const handleBatchDelete = () => {
    if (!selectedIds.length) return;
    const toDeleteSet = new Set(selectedIds);
    const updated = records.filter(r => !toDeleteSet.has(r.id));
    updateStorage(updated);
    setSelectedIds([]);
    toast({
      title: "Batch Deleted",
      description: `Deleted ${toDeleteSet.size} records.`,
    });
  };

  const handleBatchStatusUpdate = (newStatus: string) => {
    if (!statusField || !selectedIds.length) return;
    const selectedSet = new Set(selectedIds);
    const updated = records.map(r => {
      if (selectedSet.has(r.id)) {
        return { ...r, [statusField.name]: newStatus };
      }
      return r;
    });
    updateStorage(updated);
    setSelectedIds([]);
    toast({
      title: "Batch Status Updated",
      description: `Updated ${selectedSet.size} records to "${newStatus}".`,
    });
  };

  // Filter & Search logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Free-text search
      const matchesSearch = !searchQuery.trim() || Object.values(record).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Status/Category filter
      let matchesCategory = true;
      if (statusFilter !== 'All') {
        const categoryField = primaryEntity.fields.find(f => f.type === 'select' || f.type === 'badge')?.name;
        if (categoryField) {
          matchesCategory = String(record[categoryField]) === statusFilter;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [records, searchQuery, statusFilter, primaryEntity.fields]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Reset page if filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const activeScreen: ScreenSpec = useMemo(() => {
    if (activeScreenId === 'kanban') {
      return {
        id: 'kanban',
        title: `${primaryEntity.name} Kanban Board`,
        subtitle: `Visual workflow stage management for ${primaryEntity.pluralName.toLowerCase()}`,
        type: 'kanban',
      };
    }
    return appSpec.screens.find(s => s.id === activeScreenId) || appSpec.screens[0];
  }, [activeScreenId, appSpec.screens, primaryEntity]);

  const getBadgeVariant = (format?: string, value?: string, badgeColorMap?: Record<string, string>) => {
    if (badgeColorMap && value && badgeColorMap[value]) {
      const mapVal = badgeColorMap[value];
      if (mapVal === 'destructive') return 'destructive';
      if (mapVal === 'warning') return 'outline';
      if (mapVal === 'success') return 'default';
      return 'secondary';
    }
    const lower = String(value).toLowerCase();
    if (lower.includes('emergency') || lower.includes('critical') || lower.includes('decommissioned')) return 'destructive';
    if (lower.includes('waiting') || lower.includes('open') || lower.includes('maintenance') || lower.includes('urgent')) return 'outline';
    if (lower.includes('completed') || lower.includes('resolved') || lower.includes('available')) return 'default';
    return 'secondary';
  };

  // Checkbox toggle helpers
  const isAllPageSelected = paginatedRecords.length > 0 && paginatedRecords.every(r => selectedIds.includes(r.id));
  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedRecords.map(r => r.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedRecords.map(r => r.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col min-h-[600px]", className)}>
      {/* Hidden File Input for CSV/JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv, .json, text/csv, application/json"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Dynamic App Header */}
      <header className="px-6 py-4 border-b border-border bg-background flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {appSpec.name}
              </h2>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-mono font-medium">
                Live App
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{appSpec.tagline}</p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs font-medium text-foreground gap-1.5"
            title="Import CSV or JSON data"
          >
            <Upload size={13} /> Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv()}
            className="h-8 text-xs font-medium text-foreground gap-1.5"
            title="Download records as CSV spreadsheet"
          >
            <FileSpreadsheet size={13} /> Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-8 text-xs font-medium text-foreground gap-1.5"
          >
            <Download size={13} /> Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw size={13} /> Reset
          </Button>
        </div>
      </header>

      {/* Navigation Menu Bar */}
      <nav className="px-6 bg-muted/40 border-b border-border flex items-center gap-1 overflow-x-auto">
        {appSpec.navigation.items.map(navItem => {
          const isActive = activeScreenId === navItem.id;
          return (
            <button
              key={navItem.id}
              onClick={() => setActiveScreenId(navItem.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-semibold bg-background/50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {navItem.id === 'dashboard' && <LayoutDashboard size={14} />}
              {navItem.id !== 'dashboard' && navItem.id.includes('form') && <PlusCircle size={14} />}
              {navItem.id !== 'dashboard' && !navItem.id.includes('form') && <List size={14} />}
              <span>{navItem.label}</span>
              {navItem.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-medium">
                  {records.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Dynamic Kanban View Tab */}
        <button
          onClick={() => setActiveScreenId('kanban')}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap",
            activeScreenId === 'kanban'
              ? "border-primary text-primary font-semibold bg-background/50"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <KanbanIcon size={14} />
          <span>Kanban Board</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-medium">
            {records.length}
          </span>
        </button>
      </nav>

      {/* Main Dynamic Screen Content */}
      <main className="flex-1 p-6 overflow-auto bg-muted/10">
        {/* VIEW 1: Overview Dashboard */}
        {activeScreen.type === 'dashboard' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Screen Header */}
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {activeScreen.title}
              </h3>
              {activeScreen.subtitle && (
                <p className="text-xs text-muted-foreground">{activeScreen.subtitle}</p>
              )}
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeScreen.dashboardConfig?.kpis.map((kpi, idx) => {
                let computedValue: any = 0;
                if (kpi.aggregation === 'sum' && kpi.field) {
                  computedValue = records.reduce((acc, curr) => acc + (Number(curr[kpi.field!]) || 0), 0);
                  computedValue = computedValue.toLocaleString();
                } else if (kpi.filterStatus && kpi.field) {
                  computedValue = records.filter(r => String(r[kpi.field!]) === kpi.filterStatus).length;
                } else {
                  computedValue = records.length;
                }

                return (
                  <Card key={idx} className="bg-card border-border shadow-none">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {kpi.title}
                      </CardTitle>
                      <Activity size={14} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                        {kpi.valuePrefix || ''}{computedValue}{kpi.valueSuffix || ''}
                      </div>
                      {kpi.change && (
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="text-primary">•</span> {kpi.change}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Visual Analytics Component (Recharts Category Donut & SLA Velocity) */}
            <AnalyticsCharts entity={primaryEntity} records={records} />

            {/* Quick Actions & Recent Data Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <Card className="bg-card border-border shadow-none lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                  <CardDescription className="text-xs">Direct workflow shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeScreen.dashboardConfig?.quickActions?.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-between text-xs font-medium h-9"
                      onClick={() => setActiveScreenId(action.targetScreenId)}
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle size={14} className="text-primary" /> {action.label}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs font-medium h-9"
                    onClick={() => setActiveScreenId('kanban')}
                  >
                    <span className="flex items-center gap-2">
                      <KanbanIcon size={14} className="text-primary" /> Open Kanban Board
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-xs font-medium h-9 text-muted-foreground hover:text-foreground"
                    onClick={() => handleExportCsv()}
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet size={14} /> Download CSV Dataset
                    </span>
                    <Download size={13} />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity Table */}
              <Card className="bg-card border-border shadow-none lg:col-span-2 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Recent {primaryEntity.pluralName}</CardTitle>
                    <CardDescription className="text-xs">Click any row to inspect attributes</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-medium text-primary"
                    onClick={() => {
                      const tableScreen = appSpec.screens.find(s => s.type === 'table');
                      if (tableScreen) setActiveScreenId(tableScreen.id);
                    }}
                  >
                    View all <ChevronRight size={12} className="ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 border-y border-border text-muted-foreground font-medium">
                        <tr>
                          {primaryEntity.fields.slice(0, 4).map(f => (
                            <th key={f.name} className="px-4 py-2 text-left">{f.label}</th>
                          ))}
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {records.slice(0, 4).map(record => (
                          <tr
                            key={record.id}
                            onClick={() => setInspectingRecord(record)}
                            className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          >
                            {primaryEntity.fields.slice(0, 4).map(f => (
                              <td key={f.name} className="px-4 py-2.5 font-medium text-foreground">
                                {f.type === 'badge' ? (
                                  <Badge variant={getBadgeVariant(f.type, record[f.name])} className="text-[10px] font-normal py-0">
                                    {record[f.name]}
                                  </Badge>
                                ) : (
                                  String(record[f.name] ?? '-')
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-2.5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRecord(record);
                                }}
                                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* VIEW 2: Interactive Records Table with Sorting, Batch Actions, & Pagination */}
        {activeScreen.type === 'table' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Screen Header & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {activeScreen.title}
                </h3>
                {activeScreen.subtitle && (
                  <p className="text-xs text-muted-foreground">{activeScreen.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-medium gap-1.5"
                  onClick={() => setActiveScreenId('kanban')}
                >
                  <KanbanIcon size={14} /> Kanban View
                </Button>

                {activeScreen.tableConfig?.allowCreate && (
                  <Button
                    size="sm"
                    className="h-9 text-xs font-medium gap-1.5"
                    onClick={() => {
                      const formScreenId = activeScreen.tableConfig?.createScreenId ||
                        appSpec.screens.find(s => s.type === 'form')?.id;
                      if (formScreenId) setActiveScreenId(formScreenId);
                    }}
                  >
                    <PlusCircle size={14} /> Add new {primaryEntity.name}
                  </Button>
                )}
              </div>
            </div>

            {/* Filter, Search & Batch Bar */}
            <div className="p-3 bg-card border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${primaryEntity.pluralName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-between sm:justify-end">
                {activeScreen.tableConfig?.filterOptions && (
                  <div className="flex items-center gap-2">
                    <Filter size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Filter:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs h-8 px-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="All">All Categories</option>
                      {activeScreen.tableConfig.filterOptions.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rows per page selector */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="text-xs h-8 px-2 rounded-md border border-input bg-background text-foreground focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Floating / Sticky Batch Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs font-mono py-0.5">
                    {selectedIds.length} selected
                  </Badge>
                  <span className="text-xs font-medium text-foreground">
                    Batch Actions:
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {statusField && statusField.options && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleBatchStatusUpdate(e.target.value);
                      }}
                      defaultValue=""
                      className="text-xs h-7 px-2 rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="" disabled>Set Status...</option>
                      {statusField.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedRecords = records.filter(r => selectedIds.includes(r.id));
                      handleExportCsv(selectedRecords);
                    }}
                    className="h-7 text-xs bg-background gap-1"
                  >
                    <FileSpreadsheet size={12} /> Export CSV
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="h-7 text-xs gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Records Table */}
            <Card className="bg-card border-border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      {/* Checkbox All */}
                      <th className="px-4 py-3 w-8">
                        <Checkbox
                          checked={isAllPageSelected}
                          onCheckedChange={toggleSelectAllPage}
                          aria-label="Select all on this page"
                        />
                      </th>
                      {activeScreen.tableConfig?.columns.map(col => {
                        const isSorted = sortField === col.field;
                        return (
                          <th
                            key={col.field}
                            onClick={() => handleSort(col.field)}
                            className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{col.header}</span>
                              {isSorted ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp size={12} className="text-primary" />
                                ) : (
                                  <ArrowDown size={12} className="text-primary" />
                                )
                              ) : (
                                <ArrowUpDown size={11} className="opacity-40" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedRecords.length > 0 ? (
                      paginatedRecords.map(record => {
                        const isSelected = selectedIds.includes(record.id);
                        return (
                          <tr
                            key={record.id}
                            onClick={() => setInspectingRecord(record)}
                            className={cn(
                              "hover:bg-muted/30 transition-colors cursor-pointer",
                              isSelected && "bg-primary/5"
                            )}
                          >
                            {/* Checkbox Row */}
                            <td
                              className="px-4 py-3 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelectOne(record.id)}
                                aria-label={`Select record ${record.id}`}
                              />
                            </td>

                            {activeScreen.tableConfig?.columns.map(col => {
                              const val = record[col.field];
                              return (
                                <td key={col.field} className="px-4 py-3 text-foreground font-medium">
                                  {col.format === 'badge' ? (
                                    <Badge
                                      variant={getBadgeVariant(col.format, val, col.badgeColorMap)}
                                      className="text-[10px] font-normal py-0"
                                    >
                                      {val ?? '-'}
                                    </Badge>
                                  ) : col.format === 'currency' ? (
                                    <span className="font-mono tabular-nums">
                                      ${Number(val || 0).toLocaleString()}
                                    </span>
                                  ) : col.format === 'number' ? (
                                    <span className="font-mono tabular-nums">
                                      {Number(val || 0).toLocaleString()}
                                    </span>
                                  ) : (
                                    String(val ?? '-')
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setInspectingRecord(record)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Inspect Details"
                                >
                                  <Eye size={13} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRecord(record)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingId(record.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={(activeScreen.tableConfig?.columns.length || 4) + 2}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle size={20} className="text-muted-foreground/60" />
                            <p className="text-xs font-medium">No matching records found</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                              className="h-7 text-xs mt-1"
                            >
                              Clear filters
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Showing <span className="font-mono tabular-nums text-foreground font-semibold">{sortedRecords.length ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-mono tabular-nums text-foreground font-semibold">{Math.min(currentPage * pageSize, sortedRecords.length)}</span> of <span className="font-mono tabular-nums text-foreground font-semibold">{sortedRecords.length}</span> records
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    <ChevronLeft size={13} /> Previous
                  </Button>

                  <span className="text-xs font-mono font-medium text-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-7 text-xs px-2 gap-1"
                  >
                    Next <ChevronRight size={13} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* VIEW 3: Visual Kanban Workflow Board */}
        {activeScreen.type === 'kanban' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {activeScreen.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Interactive stage board. Click any card to inspect full details or advance workflow status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-medium gap-1.5"
                  onClick={() => {
                    const tableScreen = appSpec.screens.find(s => s.type === 'table');
                    if (tableScreen) setActiveScreenId(tableScreen.id);
                  }}
                >
                  <List size={14} /> Table View
                </Button>

                <Button
                  size="sm"
                  className="h-9 text-xs font-medium gap-1.5"
                  onClick={() => {
                    const formScreenId = appSpec.screens.find(s => s.type === 'form')?.id;
                    if (formScreenId) setActiveScreenId(formScreenId);
                  }}
                >
                  <PlusCircle size={14} /> Add new {primaryEntity.name}
                </Button>
              </div>
            </div>

            <KanbanBoard
              entity={primaryEntity}
              records={records}
              onStatusChange={handleStatusChange}
              onRecordClick={(record) => setInspectingRecord(record)}
              onAddNewWithStatus={(status) => {
                if (statusField) {
                  setFormData({ [statusField.name]: status });
                }
                const formScreenId = appSpec.screens.find(s => s.type === 'form')?.id;
                if (formScreenId) setActiveScreenId(formScreenId);
              }}
              onDeleteRecord={(id) => setDeletingId(id)}
            />
          </div>
        )}

        {/* VIEW 4: Dynamic Create Form */}
        {activeScreen.type === 'form' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {activeScreen.title}
                </h3>
                {activeScreen.subtitle && (
                  <p className="text-xs text-muted-foreground">{activeScreen.subtitle}</p>
                )}
              </div>

              {/* Sample filler button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillSample}
                className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                title="Populate fields with domain-realistic dummy data"
              >
                <Sparkles size={13} className="text-primary" /> Auto-Fill Sample Data
              </Button>
            </div>

            <Card className="bg-card border-border shadow-none p-6">
              <form onSubmit={(e) => handleFormSubmit(e, activeScreen.formConfig)} className="space-y-4">
                {primaryEntity.fields
                  .filter(f => !activeScreen.formConfig?.fields || activeScreen.formConfig.fields.includes(f.name))
                  .map(field => {
                    const error = formErrors[field.name];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>
                            {field.label} {field.validation?.required && <span className="text-destructive">*</span>}
                          </span>
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className={cn(
                              "w-full text-xs p-2.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none",
                              error ? "border-destructive focus:ring-destructive" : "border-input"
                            )}
                          />
                        ) : field.type === 'select' || field.type === 'badge' ? (
                          <select
                            value={formData[field.name] || (field.options ? field.options[0] : '')}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className={cn(
                              "w-full text-xs h-9 px-2.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                              error ? "border-destructive focus:ring-destructive" : "border-input"
                            )}
                          >
                            <option value="">Select {field.label}...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className={cn("text-xs h-9", error && "border-destructive focus-visible:ring-destructive")}
                          />
                        )}

                        {error && (
                          <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle size={11} /> {error}
                          </p>
                        )}
                      </div>
                    );
                  })}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tableScreen = appSpec.screens.find(s => s.type === 'table');
                      if (tableScreen) setActiveScreenId(tableScreen.id);
                    }}
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="text-xs h-9 font-medium">
                    {activeScreen.formConfig?.submitButtonText || `Save ${primaryEntity.name}`}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* Record Detail Slide-Out Sheet (Drawer) */}
      <RecordDetailSheet
        isOpen={!!inspectingRecord}
        onClose={() => setInspectingRecord(null)}
        record={inspectingRecord}
        entity={primaryEntity}
        onEdit={(rec) => {
          setInspectingRecord(null);
          setEditingRecord(rec);
        }}
        onDelete={(id) => {
          setInspectingRecord(null);
          setDeletingId(id);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Edit Modal Dialog */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Edit {primaryEntity.name}</h4>
                <p className="text-xs text-muted-foreground font-mono">ID: {editingRecord.id}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingRecord(null)}
                className="h-8 w-8 p-0"
              >
                <X size={14} />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {primaryEntity.fields.map(field => {
                const error = editErrors[field.name];
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {field.label} {field.validation?.required && <span className="text-destructive">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={editingRecord[field.name] || ''}
                        onChange={(e) => setEditingRecord({ ...editingRecord, [field.name]: e.target.value })}
                        className={cn(
                          "w-full text-xs p-2.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none",
                          error ? "border-destructive" : "border-input"
                        )}
                      />
                    ) : field.type === 'select' || field.type === 'badge' ? (
                      <select
                        value={editingRecord[field.name] || ''}
                        onChange={(e) => setEditingRecord({ ...editingRecord, [field.name]: e.target.value })}
                        className={cn(
                          "w-full text-xs h-9 px-2.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                          error ? "border-destructive" : "border-input"
                        )}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={editingRecord[field.name] || ''}
                        onChange={(e) => setEditingRecord({ ...editingRecord, [field.name]: e.target.value })}
                        className={cn("text-xs h-9", error && "border-destructive")}
                      />
                    )}

                    {error && (
                      <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle size={11} /> {error}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRecord(null)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-9 font-medium">
                  Update record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">Delete Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete this record from local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
