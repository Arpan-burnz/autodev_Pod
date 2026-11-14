'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { EntitySpec } from '@/types/dynamic-app';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart as PieChartIcon, CheckCircle2, Clock, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  entity: EntitySpec;
  records: Array<Record<string, any>>;
}

// Deliberate, clean Unslop color ramp (neutral tints + single accent)
const ACCENT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--muted-foreground) / 0.7)',
  'hsl(var(--muted-foreground) / 0.5)',
  'hsl(var(--muted-foreground) / 0.3)',
];

export function AnalyticsCharts({ entity, records }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [chartView, setChartView] = useState<'bar' | 'donut'>('donut');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Identify primary categorical / grouping field
  const categoryField = useMemo(() => {
    if (!entity?.fields?.length) return null;
    const priorityKeywords = ['category', 'department', 'type', 'severity', 'priority'];
    for (const key of priorityKeywords) {
      const found = entity.fields.find(f => f.name.toLowerCase().includes(key));
      if (found) return found;
    }
    // Fallback to any select or badge field
    const selectField = entity.fields.find(f => f.type === 'select' || f.type === 'badge');
    if (selectField) return selectField;
    // Otherwise fallback to second field
    return entity.fields[1] || entity.fields[0];
  }, [entity]);

  // 2. Identify status/workflow field
  const statusField = useMemo(() => {
    if (!entity?.fields?.length) return null;
    const statusKeywords = ['status', 'stage', 'state', 'condition'];
    for (const key of statusKeywords) {
      const found = entity.fields.find(f => f.name.toLowerCase().includes(key));
      if (found) return found;
    }
    return null;
  }, [entity]);

  // 3. Aggregate data for Category Chart
  const categoryChartData = useMemo(() => {
    if (!categoryField || !records.length) return [];
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const val = String(r[categoryField.name] || 'Unassigned');
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [categoryField, records]);

  // 4. Aggregate data for Status / SLA Velocity
  const statusMetrics = useMemo(() => {
    if (!records.length) {
      return { total: 0, completed: 0, inProgress: 0, open: 0, percent: 0, distribution: [] };
    }

    const total = records.length;
    let completed = 0;
    let inProgress = 0;
    let open = 0;

    const distribution: Array<{ name: string; count: number; percent: number }> = [];
    const statusCounts: Record<string, number> = {};

    records.forEach(r => {
      const val = statusField ? String(r[statusField.name] || 'Open') : 'Active';
      statusCounts[val] = (statusCounts[val] || 0) + 1;

      const lower = val.toLowerCase();
      if (lower.includes('complete') || lower.includes('resolve') || lower.includes('done') || lower.includes('available')) {
        completed += 1;
      } else if (lower.includes('progress') || lower.includes('consult') || lower.includes('review') || lower.includes('in use')) {
        inProgress += 1;
      } else {
        open += 1;
      }
    });

    Object.entries(statusCounts).forEach(([name, count]) => {
      distribution.push({
        name,
        count,
        percent: Math.round((count / total) * 100),
      });
    });

    const percent = Math.round((completed / total) * 100);

    return { total, completed, inProgress, open, percent, distribution };
  }, [statusField, records]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-64 animate-pulse">
        <div className="bg-muted/30 rounded-xl border border-border" />
        <div className="bg-muted/30 rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Categorical Distribution */}
      <Card className="bg-card border-border shadow-none flex flex-col justify-between">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={13} className="text-primary" />
                {categoryField ? `${categoryField.label} Distribution` : 'Distribution Overview'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Breakdown of active {entity.pluralName.toLowerCase()} by category
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-muted/40">
              <button
                onClick={() => setChartView('donut')}
                className={`p-1 rounded text-xs transition-colors ${
                  chartView === 'donut'
                    ? 'bg-background text-foreground shadow-xs font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Donut Chart"
              >
                <PieChartIcon size={13} />
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`p-1 rounded text-xs transition-colors ${
                  chartView === 'bar'
                    ? 'bg-background text-foreground shadow-xs font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Bar Chart"
              >
                <BarChart3 size={13} />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 flex-1 flex flex-col justify-center">
          {categoryChartData.length > 0 ? (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'donut' ? (
                  <PieChart>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} ${entity.pluralName}`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ACCENT_COLORS[index % ACCENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                ) : (
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} items`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
              No distribution data available
            </div>
          )}

          {/* Quick legend pill list */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-2">
            {categoryChartData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} 
                />
                <span className="truncate max-w-[100px]">{item.name}:</span>
                <span className="font-mono text-foreground tabular-nums font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Status Lifecycle & SLA Velocity */}
      <Card className="bg-card border-border shadow-none flex flex-col justify-between">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-primary" />
                Workflow Velocity & SLA
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Resolution throughput and lifecycle health
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono py-0 font-medium">
              {statusMetrics.percent}% Resolved
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Overall Completion Ratio</span>
              <span className="font-mono tabular-nums text-foreground font-semibold">
                {statusMetrics.completed} / {statusMetrics.total} records
              </span>
            </div>
            <Progress value={statusMetrics.percent} className="h-2" />
          </div>

          {/* Metric Triplet */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock size={11} className="text-amber-500" /> Open
              </div>
              <div className="text-lg font-bold font-mono text-foreground tabular-nums mt-1">
                {statusMetrics.open}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Activity size={11} className="text-blue-500" /> In Progress
              </div>
              <div className="text-lg font-bold font-mono text-foreground tabular-nums mt-1">
                {statusMetrics.inProgress}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle2 size={11} className="text-emerald-500" /> Completed
              </div>
              <div className="text-lg font-bold font-mono text-foreground tabular-nums mt-1">
                {statusMetrics.completed}
              </div>
            </div>
          </div>

          {/* Stage breakdown pills */}
          <div className="pt-2 flex flex-wrap gap-1.5">
            {statusMetrics.distribution.map(item => (
              <Badge 
                key={item.name} 
                variant="secondary" 
                className="text-[10px] font-normal py-0.5 px-2 bg-muted/50 border border-border"
              >
                <span className="font-medium mr-1">{item.name}:</span>
                <span className="font-mono tabular-nums text-foreground font-semibold">{item.count}</span>
                <span className="text-muted-foreground ml-1">({item.percent}%)</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

