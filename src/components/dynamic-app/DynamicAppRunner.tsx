'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  List, 
  PlusCircle, 
  Search, 
  RotateCcw, 
  Download, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Activity, 
  Filter, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight,
  X,
  FileSpreadsheet
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

interface DynamicAppRunnerProps {
  appSpec: DynamicAppSpec;
  className?: string;
}

export function DynamicAppRunner({ appSpec, className }: DynamicAppRunnerProps) {
  const { toast } = useToast();
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

  // Active Screen Navigation
  const [activeScreenId, setActiveScreenId] = useState<string>(
    appSpec.navigation.defaultScreenId || appSpec.screens[0]?.id || 'dashboard'
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    toast({
      title: "Data Reset",
      description: "Restored baseline demo records.",
    });
  };

  const handleExportData = () => {
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
      title: "Data Exported",
      description: "Downloaded JSON dataset.",
    });
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
    }
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
    setDeletingId(null);
    toast({
      title: "Record Removed",
      description: "The item has been deleted.",
    });
  };

  // Filtered Records for Table View
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search filter
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

  const activeScreen = appSpec.screens.find(s => s.id === activeScreenId) || appSpec.screens[0];

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

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col min-h-[600px]", className)}>
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
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
            <RotateCcw size={13} /> Reset data
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
      </nav>

      {/* Main Dynamic Screen Content */}
      <main className="flex-1 p-6 overflow-auto bg-muted/10">
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
                    variant="ghost"
                    className="w-full justify-between text-xs font-medium h-9 text-muted-foreground hover:text-foreground"
                    onClick={handleExportData}
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet size={14} /> Download Dataset
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
                    <CardDescription className="text-xs">Latest records in local store</CardDescription>
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
                          <tr key={record.id} className="hover:bg-muted/20 transition-colors">
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
                                onClick={() => setEditingRecord(record)}
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

            {/* Filter & Search Bar */}
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

              {activeScreen.tableConfig?.filterOptions && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
            </div>

            {/* Records Table */}
            <Card className="bg-card border-border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      {activeScreen.tableConfig?.columns.map(col => (
                        <th key={col.field} className="px-5 py-3 text-left">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                          {activeScreen.tableConfig?.columns.map(col => {
                            const val = record[col.field];
                            return (
                              <td key={col.field} className="px-5 py-3 text-foreground font-medium">
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
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRecord(record)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 size={13} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingId(record.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan={(activeScreen.tableConfig?.columns.length || 4) + 1}
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
            </Card>
          </div>
        )}

        {activeScreen.type === 'form' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {activeScreen.title}
              </h3>
              {activeScreen.subtitle && (
                <p className="text-xs text-muted-foreground">{activeScreen.subtitle}</p>
              )}
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
