'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard, Check, Download, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AgentArtifactProps {
  title: string;
  type: 'text' | 'code' | 'json' | 'list' | 'image';
  content: any;
  icon?: React.ReactNode;
}

export function AgentArtifact({ title, type, content, icon }: AgentArtifactProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

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
        <ScrollArea className="flex-1">
          <div className="p-6">
            {type === 'code' && content?.files && Array.isArray(content.files) ? (
              <div className="space-y-10">
                {content.files.map((file: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border">
                      <FileCode size={12} className="text-primary" />
                      <span className="text-[9px] font-code font-bold uppercase tracking-widest text-foreground/60">{file.fileName}</span>
                    </div>
                    <pre className="p-5 bg-background text-[11px] overflow-x-auto font-code leading-relaxed border border-border selection:bg-primary selection:text-primary-foreground shadow-inner">
                      <code className="text-foreground/80 whitespace-pre-wrap">{file.content}</code>
                    </pre>
                    {idx < content.files.length - 1 && <Separator className="opacity-20" />}
                  </div>
                ))}
              </div>
            ) : type === 'code' ? (
              <pre className="p-5 bg-background text-[11px] overflow-x-auto font-code leading-relaxed border border-border selection:bg-primary selection:text-primary-foreground shadow-inner">
                <code className="text-foreground/80 whitespace-pre-wrap">{typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</code>
              </pre>
            ) : type === 'list' && Array.isArray(content) ? (
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
            ) : type === 'text' ? (
              <div className="space-y-4 text-foreground/60 text-[11px] tracking-wide leading-relaxed font-medium uppercase whitespace-pre-wrap">
                {content}
              </div>
            ) : (
              <pre className="p-5 bg-background text-[11px] font-code border border-border overflow-x-auto shadow-inner">
                <code className="text-foreground/80">{JSON.stringify(content, null, 2)}</code>
              </pre>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
