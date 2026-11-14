'use client';

import React, { useMemo } from 'react';
import { EntitySpec, FieldSpec } from '@/types/dynamic-app';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  MoreVertical, 
  Calendar, 
  Tag, 
  Hash, 
  ChevronRight, 
  Layers 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanBoardProps {
  entity: EntitySpec;
  records: Array<Record<string, any>>;
  onStatusChange: (recordId: string, newStatus: string) => void;
  onRecordClick: (record: Record<string, any>) => void;
  onAddNewWithStatus?: (status: string) => void;
  onDeleteRecord?: (id: string) => void;
}

export function KanbanBoard({
  entity,
  records,
  onStatusChange,
  onRecordClick,
  onAddNewWithStatus,
  onDeleteRecord,
}: KanbanBoardProps) {
  // 1. Identify status/stage column field
  const statusField: FieldSpec | null = useMemo(() => {
    if (!entity?.fields?.length) return null;
    const priorityKeywords = ['status', 'stage', 'state', 'condition', 'priority'];
    for (const key of priorityKeywords) {
      const found = entity.fields.find(f => f.name.toLowerCase().includes(key));
      if (found) return found;
    }
    const selectField = entity.fields.find(f => f.type === 'select' || f.type === 'badge');
    if (selectField) return selectField;
    return null;
  }, [entity]);

  // 2. Determine column names
  const columns: string[] = useMemo(() => {
    if (statusField?.options && statusField.options.length > 0) {
      return statusField.options;
    }
    // Extract unique values from records if present
    if (statusField && records.length > 0) {
      const unique = Array.from(new Set(records.map(r => String(r[statusField.name] || ''))))
        .filter(Boolean);
      if (unique.length > 0) return unique;
    }
    return ['Open', 'In Progress', 'Resolved'];
  }, [statusField, records]);

  // 3. Find primary title & secondary label fields
  const titleField = useMemo(() => {
    return entity.fields.find(f => 
      f.name.toLowerCase().includes('title') || 
      f.name.toLowerCase().includes('name') || 
      f.name.toLowerCase().includes('subject')
    ) || entity.fields[0];
  }, [entity]);

  const tagField = useMemo(() => {
    return entity.fields.find(f => 
      f !== titleField && 
      f !== statusField && 
      (f.type === 'badge' || f.type === 'select' || f.name.toLowerCase().includes('category') || f.name.toLowerCase().includes('priority'))
    );
  }, [entity, titleField, statusField]);

  // Group records by column
  const groupedRecords = useMemo(() => {
    const map: Record<string, Array<Record<string, any>>> = {};
    columns.forEach(col => {
      map[col] = [];
    });

    records.forEach(r => {
      const colVal = statusField ? String(r[statusField.name] || '') : '';
      const matchedCol = columns.find(c => c.toLowerCase() === colVal.toLowerCase()) || columns[0];
      if (!map[matchedCol]) {
        map[matchedCol] = [];
      }
      map[matchedCol].push(r);
    });

    return map;
  }, [columns, statusField, records]);

  const handleMoveColumn = (e: React.MouseEvent, recordId: string, currentColumn: string, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const currentIndex = columns.indexOf(currentColumn);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < columns.length) {
      onStatusChange(recordId, columns[targetIndex]);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[760px] items-start">
        {columns.map((column, colIdx) => {
          const colRecords = groupedRecords[column] || [];
          return (
            <div 
              key={column} 
              className="flex-1 min-w-[260px] max-w-[340px] bg-muted/30 border border-border rounded-xl flex flex-col max-h-[750px] shadow-xs"
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-border bg-card/60 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-xs font-semibold text-foreground tracking-tight">
                    {column}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-medium">
                    {colRecords.length}
                  </span>
                </div>

                {onAddNewWithStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddNewWithStatus(column)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    title={`Add new ${entity.name} in ${column}`}
                  >
                    <Plus size={13} />
                  </Button>
                )}
              </div>

              {/* Cards Container */}
              <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                {colRecords.length > 0 ? (
                  colRecords.map(record => {
                    const primaryTitle = titleField ? String(record[titleField.name] || record.id) : record.id;
                    const tagVal = tagField ? record[tagField.name] : null;

                    return (
                      <Card
                        key={record.id}
                        onClick={() => onRecordClick(record)}
                        className="bg-card border-border hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group rounded-lg"
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Card Top: ID & Tag */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {record.id}
                            </span>
                            {tagVal && (
                              <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                                {tagVal}
                              </Badge>
                            )}
                          </div>

                          {/* Card Title */}
                          <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {primaryTitle}
                          </p>

                          {/* Secondary attributes preview */}
                          <div className="space-y-1 text-[11px] text-muted-foreground">
                            {entity.fields
                              .filter(f => f !== titleField && f !== statusField && f !== tagField)
                              .slice(0, 2)
                              .map(f => {
                                const val = record[f.name];
                                if (!val) return null;
                                return (
                                  <div key={f.name} className="truncate flex items-center justify-between gap-1 text-[10px]">
                                    <span className="opacity-70">{f.label}:</span>
                                    <span className="font-medium text-foreground">{String(val)}</span>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Card Bottom: Quick Transition buttons */}
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {colIdx > 0 && (
                                <button
                                  onClick={(e) => handleMoveColumn(e, record.id, column, 'prev')}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] flex items-center gap-0.5"
                                  title={`Move to ${columns[colIdx - 1]}`}
                                >
                                  <ArrowLeft size={11} /> {columns[colIdx - 1]}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {colIdx < columns.length - 1 && (
                                <button
                                  onClick={(e) => handleMoveColumn(e, record.id, column, 'next')}
                                  className="p-1 rounded text-primary hover:bg-primary/10 text-[10px] font-medium flex items-center gap-0.5"
                                  title={`Move to ${columns[colIdx + 1]}`}
                                >
                                  {columns[colIdx + 1]} <ArrowRight size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="py-8 px-4 text-center border border-dashed border-border/80 rounded-lg">
                    <p className="text-[11px] text-muted-foreground italic">
                      No records in this stage
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

