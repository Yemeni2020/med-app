import React from 'react';
import { Link } from 'react-router-dom';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkX, Clock, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BookmarkButton from '@/components/shared/BookmarkButton';
import { useLanguage } from '@/lib/LanguageContext';

export default function SavedArticles() {
  const { t } = useLanguage();
  const { savedItems, loading } = useSavedArticles();
  const typeLabel = t.savedPage.itemTypes;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> {t.common.back}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-primary fill-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold">{t.savedPage.title}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t.savedPage.subtitle}</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <BookmarkX className="w-14 h-14 mx-auto mb-4 opacity-25" />
          <p className="text-xl font-semibold mb-2">{t.savedPage.emptyTitle}</p>
          <p className="text-sm mb-6">{t.savedPage.emptyDescription}</p>
          <Link to="/articles">
            <Button className="rounded-full gap-2">{t.savedPage.browseArticles}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedItems.map(item => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex gap-4 hover:shadow-md transition-all group"
            >
              {item.cover_image && (
                <Link to={item.item_type === 'article' ? `/articles/${item.item_id}` : `/${item.item_type === 'story' ? 'stories' : 'news'}`}>
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0"
                  />
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {typeLabel[item.item_type] || item.item_type}
                    </Badge>
                    {item.category && (
                      <Badge variant="outline" className="text-xs rounded-full capitalize">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <BookmarkButton
                    item={{ item_id: item.item_id, item_type: item.item_type, title: item.title, excerpt: item.excerpt, cover_image: item.cover_image, category: item.category, author_name: item.author_name, read_time_minutes: item.read_time_minutes }}
                    className="flex-shrink-0 -mt-0.5"
                  />
                </div>
                <Link to={item.item_type === 'article' ? `/articles/${item.item_id}` : `/${item.item_type === 'story' ? 'stories' : 'news'}`}>
                  <h3 className="font-serif font-bold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                </Link>
                {item.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {item.author_name && <span className="font-medium">{item.author_name}</span>}
                  {item.read_time_minutes && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.read_time_minutes} min read</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
