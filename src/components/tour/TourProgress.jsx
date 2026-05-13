import React from 'react';

export default function TourProgress({ current, total, label }) {
  if (!total) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min((current / total) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
