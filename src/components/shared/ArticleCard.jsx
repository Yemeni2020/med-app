import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Shield } from 'lucide-react';
import BookmarkButton from '@/components/shared/BookmarkButton';

export default function ArticleCard({ article, variant = 'default' }) {
  const { t, lang } = useLanguage();
  const title = lang === 'ar' && article.title_ar ? article.title_ar : article.title;
  const excerpt = lang === 'ar' && article.excerpt_ar ? article.excerpt_ar : article.excerpt;

  const bookmarkItem = {
    item_id: article.id,
    item_type: 'article',
    title: article.title,
    excerpt: article.excerpt,
    cover_image: article.cover_image,
    category: article.category,
    author_name: article.author_name,
    read_time_minutes: article.read_time_minutes,
  };

  if (variant === 'featured') {
    return (
      <div className="group relative">
        <Link to={`/articles/${article.id}`} className="block">
          <div className="relative rounded-3xl overflow-hidden bg-card border border-border/50 hover:shadow-2xl transition-all duration-500">
            <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
              <img
                src={article.cover_image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200'}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <div className="flex gap-2 mb-3">
                {article.is_featured && (
                  <Badge className="bg-primary/90 text-primary-foreground">{t.common.featured}</Badge>
                )}
                {article.is_peer_reviewed && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" /> {t.common.peerReviewed}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {t.categories[article.category]}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 leading-tight">{title}</h2>
              <p className="text-white/80 line-clamp-2 mb-4 max-w-2xl">{excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="font-medium text-white">{article.author_name}</span>
                {article.author_title && <span>• {article.author_title}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.read_time_minutes || 5} {t.common.minRead}</span>
              </div>
            </div>
          </div>
        </Link>
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full">
          <BookmarkButton item={bookmarkItem} size="lg" className="text-white hover:text-white hover:bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative h-full">
      <Link to={`/articles/${article.id}`} className="block h-full">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={article.cover_image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">{t.categories[article.category]}</Badge>
              {article.is_peer_reviewed && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" /> {t.common.peerReviewed}
                </Badge>
              )}
            </div>
            <h3 className="font-serif font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{excerpt}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
              <span className="font-medium text-foreground">{article.author_name}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time_minutes || 5}{t.common.minRead}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow">
          <BookmarkButton item={bookmarkItem} />
        </div>
      </div>
    </div>
  );
}