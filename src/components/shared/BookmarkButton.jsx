import React from 'react';
import { Bookmark } from 'lucide-react';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BookmarkButton({ item, className = '', size = 'default' }) {
  const { isSaved, toggleSave } = useSavedArticles();
  const saved = isSaved(item.item_id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSave(item);
    toast(saved ? 'Removed from saved articles' : 'Saved to your reading list', {
      icon: saved ? '🗑️' : '🔖',
      duration: 2500,
    });
  };

  const sizeClasses = size === 'lg'
    ? 'w-9 h-9'
    : 'w-7 h-7';

  return (
    <button
      onClick={handleClick}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200',
        'hover:bg-primary/10 active:scale-95',
        saved ? 'text-primary' : 'text-muted-foreground hover:text-primary',
        sizeClasses,
        className
      )}
      title={saved ? 'Remove bookmark' : 'Bookmark this article'}
    >
      <Bookmark className={cn('transition-all', size === 'lg' ? 'w-5 h-5' : 'w-4 h-4', saved && 'fill-primary')} />
    </button>
  );
}