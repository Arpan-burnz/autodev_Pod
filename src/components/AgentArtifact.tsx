'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard, Check, Download, FileCode, ChevronRight } from 'lucide-react';
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

  const handleCopy = () => {
    let textToCopy = '';
    if (type === 'code' && content?.files) {
      textToCopy = content.files.map((f: any) => `// --- FILE: ${f.fileName} ---\n${f.content}`).join('\n\n');
    } else if (type === 'list') {
      textToCopy = Array.isArray(content) ? content.join('\n') : JSON.stringify(content);
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
    let textToDownload = '';
    let fileName = `${title.toLowerCase().replace(/ /g, '-')}.txt`;

    if (type === 'code' && content?.files) {
      textToDownload = content.files.map((f: any) => `// --- FILE: ${f.fileName} ---\n${f.content}`).join('\n\n');
      fileName = 'source-code.ts';
    } else if (typeof content === 'string') {
      textToDownload = content;
    } else {
      textToDownload = JSON.stringify(content, null, 2);
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

  const isMultiFile = type === 'code' && content?.files && Array.isArray(content.files);

  return (
    <Card className="h-full border border-border bg-card rounded-none overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="shrink-0 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 px-6 bg-background/50">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary opacity-50">{icon}</span>}
          <div className="flex flex-col">
            <CardTitle className="text-[9px] font-headline font-bold uppercase tracking-[0.4em] leading-none text-foreground/70">{title}</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none hover:bg-foreground/5 border border-transparent hover:border-border"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-primary" /> : <Clipboard size={14} className="text-foreground/30" />}
          </Button>
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
          <div className="flex-1 flex overflow-hidden h-full">
            {/* File Sidebar */}
            <div className="w-64 border-r border-border bg-muted/20 flex flex-col h-full">
              <div className="p-3 border-b border-border bg-background/50">
                <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/30">FILE_EXPLORER</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {content.files.map((file: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-[10px] font-code font-bold uppercase tracking-wider transition-all rounded-none text-left",
                        selectedFileIndex === idx 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-foreground/50 hover:bg-foreground/5"
                      )}
                    >
                      <FileCode size={12} className={selectedFileIndex === idx ? "text-primary-foreground" : "text-primary/40"} />
                      <span className="truncate">{file.fileName}</span>
                      {selectedFileIndex === idx && <ChevronRight size={10} className="ml-auto opacity-50" />}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background h-full">
              <div className="p-3 border-b border-border bg-muted/50 flex items-center justify-between">
                <span className="text-[9px] font-code font-bold uppercase tracking-[0.2em] text-foreground/60">
                  {content.files[selectedFileIndex]?.fileName}
                </span>
                <span className="text-[7px] font-bold text-foreground/20 uppercase">READ_ONLY</span>
              </div>
              <ScrollArea className="flex-1 h-full">
                <pre className="p-8 text-[11px] font-code leading-relaxed selection:bg-primary selection:text-primary-foreground overflow-auto w-full min-h-full">
                  <code className="text-foreground/80 block whitespace-pre">
                    {content.files[selectedFileIndex]?.content}
                  </code>
                </pre>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 h-full">
            <div className="p-8 h-full w-full">
              {type === 'code' ? (
                <pre className="p-6 bg-background text-[11px] overflow-auto font-code leading-relaxed border border-border selection:bg-primary selection:text-primary-foreground shadow-inner w-full min-h-full">
                  <code className="text-foreground/80 block whitespace-pre">
                    {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                  </code>
                </pre>
              ) : type === 'list' && Array.isArray(content) ? (
                <div className="space-y-3 w-full">
                  {content.map((item, idx) => (
                    <div key={idx} className="flex gap-6 p-5 border border-border bg-background/30 hover:bg-background transition-colors group">
                      <span className="text-[10px] font-code font-bold opacity-10 group-hover:opacity-30 transition-opacity">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <p className="text-[11px] text-foreground/70 leading-relaxed tracking-widest font-medium uppercase">
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : type === 'text' ? (
                <div className="space-y-5 text-foreground/60 text-[11px] tracking-widest leading-loose font-medium uppercase whitespace-pre-wrap w-full">
                  {content}
                </div>
              ) : (
                <pre className="p-6 bg-background text-[11px] font-code border border-border overflow-x-auto shadow-inner w-full">
                  <code className="text-foreground/80 whitespace-pre">{JSON.stringify(content, null, 2)}</code>
                </pre>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
