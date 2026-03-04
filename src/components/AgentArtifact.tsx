import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AgentArtifactProps {
  title: string;
  type: 'text' | 'code' | 'json' | 'list';
  content: any;
  icon?: React.ReactNode;
}

export function AgentArtifact({ title, type, content, icon }: AgentArtifactProps) {
  return (
    <Card className="h-full border-none bg-card/30 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          <CardTitle className="text-lg font-headline tracking-tight">{title}</CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-60">
          {type}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <ScrollArea className="h-full p-4">
          {type === 'code' && (
            <pre className="p-4 rounded-md bg-black/40 text-sm overflow-x-auto font-code leading-relaxed border border-white/5">
              <code>{content}</code>
            </pre>
          )}
          {type === 'text' && (
            <div className="space-y-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
          {type === 'list' && Array.isArray(content) && (
            <ul className="space-y-3">
              {content.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-muted-foreground leading-snug">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          )}
          {type === 'json' && (
            <pre className="p-4 rounded-md bg-black/40 text-sm font-code border border-white/5">
              <code>{JSON.stringify(content, null, 2)}</code>
            </pre>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}