import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listNewsItems } from '@/lib/local-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Zap, Clock, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const newsCategoryColors = {
  breakthrough: 'bg-purple-100 text-purple-700',
  treatment: 'bg-green-100 text-green-700',
  regulatory: 'bg-blue-100 text-blue-700',
  research: 'bg-amber-100 text-amber-700',
  technology: 'bg-cyan-100 text-cyan-700',
  public_health: 'bg-rose-100 text-rose-700',
};

export default function MedicalNews() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const { data: dbNews = [], isLoading } = useQuery({
    queryKey: ['medical-news'],
    queryFn: listNewsItems,
  });

  const staticNews = [
    { id: 'n1', title: 'FDA Approves First-Ever CRISPR Gene Therapy for Sickle Cell Disease', summary: 'The FDA has granted full approval to Casgevy, the first CRISPR-based gene therapy, offering a potential cure for sickle cell disease and beta-thalassemia. The therapy works by editing patients\' own stem cells to produce functional hemoglobin.', source: 'FDA Press Release', category: 'breakthrough', is_breaking: true, cover_image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400', created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n2', title: 'GLP-1 Agonists Show Promise for Heart Failure Beyond Weight Loss', summary: 'New trial data presented at the American Heart Association shows semaglutide significantly reduces hospitalizations in heart failure patients with preserved ejection fraction, independent of weight reduction — opening a new indication for the blockbuster drug class.', source: 'New England Journal of Medicine', category: 'research', is_breaking: false, cover_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n3', title: 'WHO Declares New Mpox Variant a Public Health Emergency', summary: 'The World Health Organization has declared the clade Ib mpox strain a public health emergency of international concern as cases spread beyond Africa. Health authorities are urging accelerated vaccine distribution and surveillance strengthening in affected regions.', source: 'World Health Organization', category: 'public_health', is_breaking: true, cover_image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400', created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n4', title: 'AI Model Detects Early Alzheimer\'s 7 Years Before Symptoms Appear', summary: 'Researchers at MIT have developed a deep learning model that can identify biomarkers in routine brain scans predictive of Alzheimer\'s disease up to 7 years before clinical symptoms manifest, potentially enabling preventive interventions at a critical window.', source: 'Nature Medicine', category: 'technology', is_breaking: false, cover_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n5', title: 'EMA Approves Novel CAR-T Cell Therapy for Relapsed B-Cell Lymphoma', summary: 'The European Medicines Agency has approved a next-generation CAR-T cell therapy showing a 65% complete response rate in patients with relapsed or refractory large B-cell lymphoma who had failed two prior lines of therapy.', source: 'European Medicines Agency', category: 'regulatory', is_breaking: false, cover_image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400', created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'n6', title: 'mRNA Flu Vaccine Demonstrates 90% Efficacy in Phase 3 Trial', summary: 'Moderna\'s mRNA-based influenza vaccine has shown 90% efficacy against matched strains in a 26,000-participant Phase 3 trial — significantly outperforming traditional egg-based vaccines and setting the stage for a regulatory submission this year.', source: 'The Lancet', category: 'treatment', is_breaking: false, cover_image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400', created_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const news = dbNews.length > 0 ? dbNews : staticNews;

  const categories = ['all', 'breakthrough', 'treatment', 'regulatory', 'research', 'technology', 'public_health'];
  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t.news.title}</h1>
        <p className="text-muted-foreground">{t.news.subtitle}</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={filter === cat ? 'default' : 'secondary'}
            className="cursor-pointer px-4 py-1.5 text-sm rounded-full"
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? t.common.all : cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="hover:shadow-lg transition-all group">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {item.cover_image && (
                      <div className="sm:w-40 h-28 rounded-xl overflow-hidden shrink-0">
                        <img src={item.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {item.is_breaking && (
                          <Badge className="bg-red-500 text-white text-xs gap-1">
                            <Zap className="w-3 h-3" /> {t.common.breaking}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${newsCategoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
                          {item.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-serif font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium">{item.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(item.created_date), 'MMM d, yyyy')}
                        </span>
                        {item.source_url && (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="w-3 h-3" /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
