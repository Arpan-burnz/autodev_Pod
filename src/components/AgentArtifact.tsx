import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface AgentArtifactProps {
  title: string;
  type: 'text' | 'code' | 'json' | 'list' | 'image';
  content: any;
  icon?: React.ReactNode;
}

export function AgentArtifact({ title, type, content, icon }: AgentArtifactProps) {
  return (
    <Card className="h-full border border-border bg-card rounded-none overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="shrink-0 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 px-6 bg-background/50">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary opacity-50">{icon}</span>}
          <CardTitle className="text-[9px] font-headline font-bold uppercase tracking-[0.4em] leading-none text-foreground/70">{title}</CardTitle>
        </div>
        <Badge variant="outline" className="text-[7px] uppercase tracking-[0.2em] rounded-none border-border bg-card text-foreground/40 font-bold">
          {type}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <void className="h-full">
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
                <code className="text-foreground/80 whitespace-pre-wrap">{content}</code>
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
        </void>
      </CardContent>
    </Card>
  );
}