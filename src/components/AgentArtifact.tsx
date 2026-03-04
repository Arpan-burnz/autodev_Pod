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
    <Card className="h-full border border-white/10 bg-white/[0.02] rounded-none overflow-hidden">
      <CardHeader className="pb-4 border-b border-white/10 flex flex-row items-center justify-between space-y-0 px-6">
        <div className="flex items-center gap-3">
          {icon && <span className="text-white opacity-40">{icon}</span>}
          <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest leading-none">{title}</CardTitle>
        </div>
        <Badge variant="outline" className="text-[8px] uppercase tracking-[0.2em] rounded-none border-white/20 bg-transparent text-white/60">
          {type}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <ScrollArea className="h-full p-6">
          {type === 'code' && (
            <pre className="p-5 bg-white/[0.03] text-xs overflow-x-auto font-code leading-relaxed border border-white/5 selection:bg-white selection:text-black">
              <code className="text-white/80">{content}</code>
            </pre>
          )}
          {type === 'text' && (
            <div className="space-y-4 text-white/60 text-xs tracking-wide leading-relaxed font-medium uppercase">
              {content}
            </div>
          )}
          {type === 'list' && Array.isArray(content) && (
            <div className="space-y-4">
              {content.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] font-code font-bold opacity-20">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/60 leading-tight tracking-wide font-medium uppercase">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </p>
                </div>
              ))}
            </div>
          )}
          {type === 'json' && (
            <pre className="p-5 bg-white/[0.03] text-xs font-code border border-white/5">
              <code className="text-white/80">{JSON.stringify(content, null, 2)}</code>
            </pre>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}