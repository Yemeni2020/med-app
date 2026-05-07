import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listArticles } from '@/lib/med-api';
import ArticleCard from '@/components/shared/ArticleCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedArticles() {
  const { t, isRTL } = useLanguage();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: () => listArticles(7),
  });

  const featured = articles.find(a => a.is_featured) || articles[0];
  const rest = articles.filter(a => a.id !== featured?.id).slice(0, 6);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <Skeleton className="h-64 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  if (!articles.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl md:text-3xl font-serif font-bold">{t.common.featured}</h2>
        <Link to="/articles">
          <Button variant="ghost" className="gap-2">
            {isRTL ? (
              <>
                <ArrowRight className="w-4 h-4 rotate-180" />
                {t.common.viewAll}
              </>
            ) : (
              <>
                {t.common.viewAll}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </Link>
      </div>

      {featured && (
        <div className="mb-8">
          <ArticleCard article={featured} variant="featured" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
