'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle, FileCode, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onDocumentChange: (content: string, fileName?: string) => void;
  documentContent: string;
  documentName?: string;
  disabled?: boolean;
}

export function DocumentUploader({
  onDocumentChange,
  documentContent,
  documentName,
  disabled = false,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      onDocumentChange(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onDocumentChange('', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const lineCount = documentContent ? documentContent.split('\n').length : 0;
  const charCount = documentContent.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground/80 flex items-center gap-2">
          <FileText size={14} className="text-foreground/50" />
          Supporting document <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded font-medium transition-colors",
              activeMode === 'upload' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('paste')}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded font-medium transition-colors",
              activeMode === 'paste' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Paste document
          </button>
        </div>
      </div>

      {documentContent ? (
        <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0 text-foreground/70">
              <FileCode size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {documentName || 'Pasted document content'}
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {lineCount} lines • {(charCount / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle size={13} /> Loaded
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <X size={14} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : activeMode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            "border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors bg-card hover:bg-muted/20",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv,.yaml,.yml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <UploadCloud size={20} className="text-muted-foreground" />
            <p className="text-xs text-foreground font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-[11px] text-muted-foreground">
              PRD, schema, CSV, or requirements (.txt, .md, .json, .csv)
            </p>
          </div>
        </div>
      ) : (
        <textarea
          placeholder="Paste PRD text, specification, schema, or CSV data here..."
          value={documentContent}
          onChange={(e) => onDocumentChange(e.target.value, undefined)}
          disabled={disabled}
          rows={4}
          className="w-full text-xs font-mono p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground leading-relaxed"
        />
      )}
    </div>
  );
}

