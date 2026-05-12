import React from 'react';

export default function EmptyState({ title, description, className = '' }) {
  return (
    <div className={`rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center ${className}`}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
