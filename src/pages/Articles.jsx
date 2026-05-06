import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listArticles } from '@/lib/local-data';
import ArticleCard from '@/components/shared/ArticleCard';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
  all: '🔬',
  cardiology: '❤️',
  neurology: '🧠',
  oncology: '🎗️',
  pediatrics: '👶',
  dermatology: '🩺',
  orthopedics: '🦴',
  psychiatry: '💬',
  general_medicine: '💊',
  surgery: '🏥',
  infectious_diseases: '🦠',
};

export default function Articles() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => listArticles(50),
  });

  const localizedArticles = useMemo(() => articles.map((article) => ({
    ...article,
    displayTitle: lang === 'ar' && article.title_ar ? article.title_ar : article.title,
    displayExcerpt: lang === 'ar' && article.excerpt_ar ? article.excerpt_ar : article.excerpt,
  })), [articles, lang]);

  const filtered = localizedArticles.filter(a => {
    const query = search.toLowerCase();
    const matchSearch = !search
      || a.displayTitle?.toLowerCase().includes(query)
      || a.displayExcerpt?.toLowerCase().includes(query)
      || a.author_name?.toLowerCase().includes(query)
      || a.tags?.some((tag) => String(tag).toLowerCase().includes(query));
    const matchCategory = activeCategory === 'all' || a.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const categories = useMemo(() => ['all', ...Array.from(new Set(localizedArticles.map((article) => article.category).filter(Boolean)))], [localizedArticles]);

  useEffect(() => {
    if (!urlCategory) return;
    setActiveCategory(categories.includes(urlCategory) ? urlCategory : 'all');
  }, [urlCategory, categories]);

  useEffect(() => {
    if (activeCategory !== 'all' && !categories.includes(activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header + Search */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{t.articlesPage.library}</p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">{t.nav.articles}</h1>

        {/* Search bar */}
        <div className="relative max-w-xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10" />
          <div className="flex items-center bg-card border border-border rounded-2xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary/50 transition-all duration-200 overflow-hidden h-14 px-4 gap-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`${t.common.search} ${t.articlesPage.searchSuffix}`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => setSearch('')}
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {search && (
            <p className="text-xs text-muted-foreground mt-2 ml-1">
              {filtered.length} {filtered.length === 1 ? t.articlesPage.resultFor : t.articlesPage.resultsFor} "<span className="text-foreground font-medium">{search}</span>"
            </p>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t.articlesPage.filterBySpecialty}</p>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap
                ${activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/50'
                }`}
            >
              <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>
              {cat === 'all' ? t.common.all : t.categories[cat]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium">{t.common.noResults}</p>
          <p className="text-sm mt-1">{t.articlesPage.tryDifferentKeyword}</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(article => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
