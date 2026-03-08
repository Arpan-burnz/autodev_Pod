'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard, Check, Download, FileCode, Folder, ChevronRight, Eye, Code } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AgentArtifactProps {
  title: string;
  type: 'text' | 'code' | 'json' | 'list' | 'image';
  content: any;
  icon?: React.ReactNode;
}

export function AgentArtifact({ title, type, content, icon }: AgentArtifactProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  // Multi-file handling for code types
  const isMultiFile = type === 'code' && content?.files && Array.isArray(content.files);
  const currentCode = isMultiFile 
    ? content.files[selectedFileIndex]?.content || '' 
    : typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  
  const currentFileName = isMultiFile 
    ? content.files[selectedFileIndex]?.fileName || 'file.ts'
    : title.includes('.') ? title : 'source.ts';

  const handleCopy = () => {
    let textToCopy = '';
    if (type === 'list') {
      textToCopy = Array.isArray(content) ? content.join('\n') : JSON.stringify(content);
    } else if (isMultiFile) {
      textToCopy = currentCode;
    } else if (typeof content === 'string') {
      textToCopy = content;
    } else {
      textToCopy = JSON.stringify(content, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({ title: "COPIED", description: "Artifact content copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let textToDownload = currentCode;
    let fileName = currentFileName;
    let extension = fileName.split('.').pop() || 'txt';

    if (type === 'image') {
      const link = document.createElement('a');
      link.href = content;
      link.download = `${title.toLowerCase().replace(/ /g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "DOWNLOAD_COMPLETE", description: `${fileName} saved successfully.` });
  };

  return (
    <Card className="h-full border border-border bg-card rounded-none overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="shrink-0 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 px-6 bg-background/50">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary opacity-50">{icon}</span>}
          <div className="flex flex-col">
            <CardTitle className="text-[9px] font-headline font-bold uppercase tracking-[0.4em] leading-none text-foreground/70">{title}</CardTitle>
            {isMultiFile && (
              <span className="text-[7px] font-bold text-foreground/20 uppercase tracking-widest mt-1">
                {content.files.length} ASSETS_GENERATED
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {type === 'code' && (
            <div className="flex border border-border rounded-none mr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-7 px-3 text-[8px] font-bold uppercase tracking-wider rounded-none",
                  viewMode === 'preview' ? "bg-primary text-primary-foreground" : "text-foreground/40"
                )}
                onClick={() => setViewMode('preview')}
              >
                PREVIEW
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-7 px-3 text-[8px] font-bold uppercase tracking-wider rounded-none",
                  viewMode === 'raw' ? "bg-primary text-primary-foreground" : "text-foreground/40"
                )}
                onClick={() => setViewMode('raw')}
              >
                RAW
              </Button>
            </div>
          )}
          {type !== 'image' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-none hover:bg-foreground/5 border border-transparent hover:border-border"
              onClick={handleCopy}
            >
              {copied ? <Check size={14} className="text-primary" /> : <Clipboard size={14} className="text-foreground/30" />}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none hover:bg-foreground/5 border border-transparent hover:border-border"
            onClick={handleDownload}
          >
            <Download size={14} className="text-foreground/30" />
          </Button>
          <Badge variant="outline" className="text-[7px] uppercase tracking-[0.2em] rounded-none border-border bg-card text-foreground/40 font-bold ml-1">
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {isMultiFile ? (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 border-r border-border bg-muted/30 flex flex-col shrink-0">
              <div className="p-3 border-b border-border bg-background/50 flex items-center gap-2">
                <Folder size={10} className="text-foreground/30" />
                <span className="text-[8px] font-bold tracking-widest text-foreground/40 uppercase">Filesystem</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {content.files.map((file: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={cn(
                        "w-full text-left p-2 flex items-center gap-2 transition-all group",
                        selectedFileIndex === idx 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-foreground/5 text-foreground/60"
                      )}
                    >
                      <FileCode size={10} className={cn(selectedFileIndex === idx ? "text-primary-foreground" : "text-foreground/20")} />
                      <span className="text-[9px] font-bold truncate tracking-tight uppercase">{file.fileName}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold tracking-widest text-foreground/20 uppercase">Editing:</span>
                  <span className="text-[8px] font-code font-bold text-primary">{currentFileName}</span>
                </div>
              </div>
              <ScrollArea className="flex-1 bg-background">
                <pre className="p-6 text-[11px] font-code leading-relaxed selection:bg-primary selection:text-primary-foreground">
                  <code className="text-foreground/80 whitespace-pre-wrap">{currentCode}</code>
                </pre>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6">
              {type === 'image' && content && (
                <div className="relative aspect-video w-full border border-border bg-background overflow-hidden group shadow-inner">
                  <Image 
                    src={content} 
                    alt={title} 
                    fill 
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint="technical diagram"
                  />
                </div>
              )}
              {type === 'code' && (
                <pre className="p-5 bg-background text-[11px] overflow-x-auto font-code leading-relaxed border border-border selection:bg-primary selection:text-primary-foreground shadow-inner">
                  <code className="text-foreground/80 whitespace-pre-wrap">{currentCode}</code>
                </pre>
              )}
              {type === 'text' && (
                <div className="space-y-4 text-foreground/60 text-[11px] tracking-wide leading-relaxed font-medium uppercase whitespace-pre-wrap">
                  {content}
                </div>
              )}
              {type === 'list' && Array.isArray(content) && (
                <div className="space-y-2">
                  {content.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border border-border bg-background/30 hover:bg-background transition-colors group">
                      <span className="text-[9px] font-code font-bold opacity-10 group-hover:opacity-30 transition-opacity">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <p className="text-[11px] text-foreground/70 leading-relaxed tracking-wide font-medium uppercase">
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {type === 'json' && (
                <pre className="p-5 bg-background text-[11px] font-code border border-border overflow-x-auto shadow-inner">
                  <code className="text-foreground/80">{JSON.stringify(content, null, 2)}</code>
                </pre>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
