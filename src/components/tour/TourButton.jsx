import React from 'react';
import { Compass } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useUserTour } from '@/hooks/useUserTour';
import { cn } from '@/lib/utils';

export default function TourButton({ className = '', onClick = null }) {
  const { lang } = useLanguage();
  const { startTour, currentRole, isRunning } = useUserTour();

  const label = lang === 'ar' ? 'ابدأ الجولة' : 'Start Tour';

  const handleClick = () => {
    startTour(currentRole, { force: true });
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRunning}
      data-tour="tour-button"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70',
        className
      )}
    >
      <Compass className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
