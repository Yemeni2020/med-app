import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { listGuidelines } from '@/lib/med-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, BookOpen, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import PageSeo from '@/components/seo/PageSeo';

const PAGE_COPY = {
  en: {
    viewGuideline: 'View Guideline',
  },
  ar: {
    viewGuideline: 'عرض الإرشاد',
  },
};

export default function Guidelines() {
  const { t, lang } = useLanguage();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const [search, setSearch] = useState('');
  const { data: guidelines = [] } = useQuery({
    queryKey: ['med-guidelines'],
    queryFn: listGuidelines,
  });

  const filteredGuidelines = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const groups = guidelines.reduce((accumulator, item) => {
      const key = item.org;
      const existing = accumulator.get(key) || {
        org: item.org,
        name: lang === 'ar' ? item.name_ar || item.name : item.name,
        items: [],
      };

      const title = lang === 'ar' ? item.title_ar || item.title : item.title;
      const tags = lang === 'ar' ? item.tags_ar || item.tags || [] : item.tags || [];
      if (!normalized || title.toLowerCase().includes(normalized) || tags.some((tag) => tag.toLowerCase().includes(normalized))) {
        existing.items.push({
          ...item,
          title,
          tags,
        });
      }

      accumulator.set(key, existing);
      return accumulator;
    }, new Map());

    return [...groups.values()].filter((group) => group.items.length > 0);
  }, [guidelines, lang, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageSeo page="guidelines" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold">{t.guidelines.title}</h1>
        </div>
        <p className="text-muted-foreground mb-6">{t.guidelines.subtitle}</p>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.guidelines.searchPlaceholder}
            className="pl-11 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-10">
        {filteredGuidelines.map((group, gi) => (
          <motion.div
            key={group.org}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{group.org}</h2>
                <p className="text-sm text-muted-foreground">{group.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item) => (
                <Card key={`${item.org}-${item.id}`} className="hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={`${item.id}-${tag}`} variant="secondary" className="text-xs rounded-full">{tag}</Badge>
                      ))}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {copy.viewGuideline}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}

        {filteredGuidelines.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{t.common.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
