import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ title = 'Loading...', description = '', className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-8 text-center ${className}`}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
