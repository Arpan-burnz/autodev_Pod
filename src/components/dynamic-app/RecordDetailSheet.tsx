'use client';

import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EntitySpec, FieldSpec } from '@/types/dynamic-app';
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  Mail, 
  Hash, 
  FileText, 
  Tag, 
  Clock, 
  CheckCircle2, 
  ArrowRightCircle, 
  Layers,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecordDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record<string, any> | null;
  entity: EntitySpec;
  onEdit: (record: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (recordId: string, newStatus: string) => void;
}

export function RecordDetailSheet({
  isOpen,
  onClose,
  record,
  entity,
  onEdit,
  onDelete,
  onStatusChange,
}: RecordDetailSheetProps) {
  const { toast } = useToast();

  if (!record) return null;

  // Find primary display title
  const titleField = entity.fields.find(f => 
    f.name.toLowerCase().includes('title') || 
    f.name.toLowerCase().includes('name') || 
    f.name.toLowerCase().includes('subject')
  ) || entity.fields[0];

  const primaryTitle = titleField ? String(record[titleField.name] || record.id) : record.id;

  // Find status field
  const statusField = entity.fields.find(f => 
    f.name.toLowerCase().includes('status') || 
    f.name.toLowerCase().includes('stage') ||
    f.name.toLowerCase().includes('state')
  );

  const currentStatus = statusField ? record[statusField.name] : null;

  // Get status options for quick transition
  const statusOptions = statusField?.options || [];

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(String(record.id));
      toast({
        title: "Copied to clipboard",
        description: `Record ID ${record.id} copied.`,
      });
    }
  };

  const getFieldIcon = (field: FieldSpec) => {
    switch (field.type) {
      case 'date': return <Calendar size={13} className="text-muted-foreground" />;
      case 'email': return <Mail size={13} className="text-muted-foreground" />;
      case 'number': return <Hash size={13} className="text-muted-foreground" />;
      case 'textarea': return <FileText size={13} className="text-muted-foreground" />;
      case 'badge':
      case 'select': return <Tag size={13} className="text-muted-foreground" />;
      default: return <Layers size={13} className="text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md md:max-w-lg p-0 flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="font-mono text-[10px] py-0 px-2 cursor-pointer hover:bg-muted" onClick={handleCopyId}>
                ID: {record.id} <Copy size={10} className="ml-1 opacity-70" />
              </Badge>
              {currentStatus && (
                <Badge variant="default" className="text-[10px] capitalize font-medium">
                  {currentStatus}
                </Badge>
              )}
            </div>

            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-base font-semibold tracking-tight text-foreground leading-snug">
                {primaryTitle}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {entity.name} Record Details & Attributes
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Quick Status Workflow Changer */}
          {statusField && statusOptions.length > 0 && onStatusChange && (
            <div className="px-6 py-3.5 bg-card border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightCircle size={12} className="text-primary" /> Workflow Stage
                </span>
                <span className="text-[11px] text-muted-foreground">Click to transition:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map(option => {
                  const isCurrent = option === currentStatus;
                  return (
                    <button
                      key={option}
                      onClick={() => !isCurrent && onStatusChange(record.id, option)}
                      disabled={isCurrent}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fields List */}
          <div className="p-6 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Record Properties
            </div>

            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
              {entity.fields.map(field => {
                const val = record[field.name];
                return (
                  <div key={field.name} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-muted/10 transition-colors">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      {getFieldIcon(field)}
                      {field.label}
                    </span>

                    <div className="font-medium text-foreground text-left sm:text-right">
                      {field.type === 'badge' ? (
                        <Badge variant="secondary" className="text-[10px] font-normal py-0">
                          {val || '-'}
                        </Badge>
                      ) : field.type === 'email' && val ? (
                        <a 
                          href={`mailto:${val}`} 
                          className="text-primary hover:underline flex items-center gap-1 sm:justify-end"
                        >
                          {val} <ExternalLink size={10} />
                        </a>
                      ) : field.type === 'number' && val !== undefined ? (
                        <span className="font-mono tabular-nums">{Number(val).toLocaleString()}</span>
                      ) : field.type === 'textarea' ? (
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap mt-1 sm:mt-0 font-normal">
                          {val || '-'}
                        </p>
                      ) : (
                        <span>{String(val ?? '-')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(record.id);
            }}
            className="h-8 text-xs gap-1.5"
          >
            <Trash2 size={13} /> Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="h-8 text-xs gap-1.5 font-medium"
            >
              <Edit2 size={13} /> Edit Record
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
