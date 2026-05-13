import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;
        const icon = (
          <Star
            className={`${sizes[size]} transition-colors ${
              active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        );

        if (!interactive) {
          return <span key={value}>{icon}</span>;
        }

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className="rounded-md p-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={`Set rating to ${value}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
