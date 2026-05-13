import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createViewHistory, getArticle, likeArticle, listArticles, shareArticle, unlikeArticle } from '@/lib/med-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Eye, Shield, Heart, Share2, User } from 'lucide-react';
import BookmarkButton from '@/components/shared/BookmarkButton';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import ReviewSection from '@/components/reviews/ReviewSection';
import RatingSummary from '@/components/reviews/RatingSummary';
import Seo from '@/components/seo/Seo';

export default function ArticleDetail() {
  const { t, lang, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { id: articleId } = useParams();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticle(articleId),
    enabled: !!articleId,
  });

  const { data: allArticles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: () => listArticles(20),
  });

  const relatedArticles = allArticles
    .filter(a => a.id !== articleId && a.category === article?.category)
    .slice(0, 3);

  const recentArticles = allArticles
    .filter(a => a.id !== articleId)
    .slice(0, 4);

  const updateArticleCaches = (engagement) => {
    queryClient.setQueryData(['article', articleId], (current) => current ? ({
      ...current,
      likes_count: engagement.likes_count,
      shares_count: engagement.shares_count,
      viewer_has_liked: engagement.viewer_has_liked,
    }) : current);

    queryClient.setQueryData(['articles'], (current) => Array.isArray(current)
      ? current.map((item) => String(item.id) === String(articleId)
        ? {
            ...item,
            likes_count: engagement.likes_count,
            shares_count: engagement.shares_count,
            viewer_has_liked: engagement.viewer_has_liked,
          }
        : item)
      : current);
  };

  const likeMutation = useMutation({
    mutationFn: () => article?.viewer_has_liked ? unlikeArticle(article.id) : likeArticle(article.id),
    onSuccess: (engagement) => {
      updateArticleCaches(engagement);
      toast.success(
        engagement.viewer_has_liked
          ? (lang === 'ar' ? 'تم تسجيل الإعجاب.' : 'Article liked.')
          : (lang === 'ar' ? 'تمت إزالة الإعجاب.' : 'Like removed.')
      );
    },
    onError: (error) => {
      toast.error(error.message || (lang === 'ar' ? 'تعذر تحديث الإعجاب.' : 'Unable to update like.'));
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const url = window.location.href;
      const title = article?.title_ar && lang === 'ar' ? article.title_ar : article?.title;

      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error(lang === 'ar' ? 'المشاركة غير مدعومة في هذا المتصفح.' : 'Sharing is not supported in this browser.');
      }

      return shareArticle(article.id);
    },
    onSuccess: (engagement) => {
      updateArticleCaches(engagement);
      toast.success(lang === 'ar' ? 'تمت مشاركة الرابط.' : 'Link shared.');
    },
    onError: (error) => {
      toast.error(error.message || (lang === 'ar' ? 'تعذر مشاركة الرابط.' : 'Unable to share this article.'));
    },
  });

  useEffect(() => {
    if (!article || !isAuthenticated) return;

    createViewHistory({
      article_id: String(article.id),
      title: lang === 'ar' && article.title_ar ? article.title_ar : article.title,
      cover_image: article.cover_image || '',
      category: article.category,
      author_name: article.author_name,
      read_time_minutes: article.read_time_minutes || 5,
    }).catch(() => {});
  }, [article, isAuthenticated, lang]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="aspect-[16/9] rounded-2xl mb-8" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div><Skeleton className="h-64 rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Link to="/articles">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t.common.back}
          </Button>
        </Link>
      </div>
    );
  }

  const title = lang === 'ar' && article.title_ar ? article.title_ar : article.title;
  const content = lang === 'ar' && article.content_ar ? article.content_ar : article.content;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Seo
        title={article.meta_title}
        description={article.meta_description}
        canonicalUrl={article.canonical_url}
        keywords={article.meta_keywords}
        robots={article.robots}
        openGraph={article.open_graph}
        twitter={article.twitter_card}
        jsonLd={article.json_ld}
      />
      <Link to="/articles">
        <Button variant="ghost" className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t.common.back}
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        {/* Main Content */}
        <article>
          {/* Category badges */}
          <div className="flex gap-2 flex-wrap mb-5">
            <Badge className="rounded-full px-3">{t.categories[article.category]}</Badge>
            {article.is_peer_reviewed && (
              <Badge variant="outline" className="rounded-full px-3 gap-1">
                <Shield className="w-3 h-3" /> {t.common.peerReviewed}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-serif font-bold leading-[1.2] tracking-tight mb-6">
            {title}
          </h1>

          {/* Author + Meta */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <Link to={article.doctor_id ? `/doctors/${article.doctor_id}` : `/doctors?author=${encodeURIComponent(article.author_name)}`}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                {article.author_avatar ? (
                  <img src={article.author_avatar} alt={article.author_avatar_alt || article.author_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-lg">{article.author_name?.[0]}</span>
                )}
              </div>
            </Link>
            <div>
              <Link to={article.doctor_id ? `/doctors/${article.doctor_id}` : `/doctors?author=${encodeURIComponent(article.author_name)}`} className="font-semibold hover:text-primary transition-colors">
                {article.author_name}
              </Link>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                {article.author_title && <span>{article.author_title}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.read_time_minutes || 5} {t.common.minRead}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views_count?.toLocaleString() || 0}</span>
                <RatingSummary averageRating={article.average_rating} reviewCount={article.review_count} />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="rounded-2xl overflow-hidden mb-10 shadow-md">
              <img src={article.cover_image} alt={article.cover_image_alt || title} className="w-full aspect-[16/9] object-cover" />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-[1.85] prose-p:text-foreground/85 prose-p:mb-5
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold prose-strong:text-foreground
            prose-ul:pl-6 prose-li:my-1.5 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-12 pt-8 border-t border-border">
            <Button
              variant="outline"
              className={`gap-2 rounded-full ${article.viewer_has_liked ? 'border-red-200 bg-red-50 text-red-600' : ''}`}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className="w-4 h-4 text-red-400" /> {article.likes_count || 0} {t.articleDetail.likes}
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => shareMutation.mutate()}
              disabled={shareMutation.isPending}
            >
              <Share2 className="w-4 h-4" /> {t.articleDetail.share}
            </Button>
            <BookmarkButton
              size="lg"
              item={{ item_id: article.id, item_type: 'article', title: article.title, excerpt: article.excerpt, cover_image: article.cover_image, category: article.category, author_name: article.author_name, read_time_minutes: article.read_time_minutes }}
              className="border border-input rounded-full px-3 h-9 gap-1.5 text-sm font-medium hover:bg-accent"
            />
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-6">
              {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="rounded-full text-xs px-3 py-1">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="mt-12 p-6 rounded-2xl bg-accent/40 border border-border flex gap-4 items-start">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt={article.author_avatar_alt || article.author_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl">{article.author_name?.[0]}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.articleDetail.writtenBy}</p>
              <p className="font-semibold text-lg">{article.author_name}</p>
              {article.author_title && <p className="text-muted-foreground text-sm mt-0.5">{article.author_title}</p>}
              <Link to={article.doctor_id ? `/doctors/${article.doctor_id}` : `/doctors?author=${encodeURIComponent(article.author_name)}`}>
                <Button variant="link" className="px-0 mt-1 h-auto text-primary text-sm gap-1">
                  <User className="w-3.5 h-3.5" /> {t.articleDetail.viewProfile}
                </Button>
              </Link>
            </div>
          </div>

          <ReviewSection
            reviewableType="article"
            reviewableId={article.id}
            summary={{ average_rating: article.average_rating, review_count: article.review_count }}
            onSummaryChange={(nextSummary) => {
              queryClient.setQueryData(['article', articleId], (current) => current ? ({ ...current, ...nextSummary }) : current);
            }}
          />
        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-serif font-bold text-lg mb-4">{t.articleDetail.relatedArticles}</h3>
              <div className="space-y-4">
                {relatedArticles.map(a => {
                  const t2 = lang === 'ar' && a.title_ar ? a.title_ar : a.title;
                  return (
                    <Link key={a.id} to={`/articles/${a.id}`} className="flex gap-3 group">
                      {a.cover_image && (
                        <img src={a.cover_image} alt={a.cover_image_alt || t2} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{t2}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {a.read_time_minutes || 5} min</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Articles */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-serif font-bold text-lg mb-4">{t.articleDetail.recentArticles}</h3>
            <div className="space-y-4">
              {recentArticles.map(a => {
                const t2 = lang === 'ar' && a.title_ar ? a.title_ar : a.title;
                return (
                  <Link key={a.id} to={`/articles/${a.id}`} className="flex gap-3 group">
                    {a.cover_image && (
                      <img src={a.cover_image} alt={a.cover_image_alt || t2} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{t2}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.author_name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link to="/articles">
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary gap-2">
                {isRTL ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    {t.articleDetail.viewAllArticles}
                  </>
                ) : (
                  <>
                    {t.articleDetail.viewAllArticles}
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </Button>
            </Link>
          </div>

          {/* Categories */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-serif font-bold text-lg mb-4">{t.articleDetail.browseByCategory}</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t.categories).map(([key, label]) => (
                <Link key={key} to={`/articles?category=${key}`}>
                  <Badge variant={key === article.category ? 'default' : 'secondary'} className="cursor-pointer rounded-full text-xs px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors">
                    {label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
