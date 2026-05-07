import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { listDoctors } from '@/lib/med-api';

const accentSets = [
  { color: 'from-purple-500/10 to-purple-500/5', badgeColor: 'bg-purple-100 text-purple-700' },
  { color: 'from-red-500/10 to-red-500/5', badgeColor: 'bg-red-100 text-red-700' },
  { color: 'from-blue-500/10 to-blue-500/5', badgeColor: 'bg-blue-100 text-blue-700' },
];

export default function DoctorsSpotlight() {
  const { t, isRTL } = useLanguage();
  const { data: doctors = [] } = useQuery({
    queryKey: ['home-doctors'],
    queryFn: listDoctors,
  });

  const localizedDoctors = doctors.slice(0, 3).map((doctor, index) => ({
    ...doctor,
    avatar: doctor.author_avatar,
    articles: doctor.articles_count || 0,
    badge: index === 0 ? t.home.doctors.featuredExpert : index === 1 ? t.home.doctors.topContributor : t.home.doctors.researchLead,
    color: accentSets[index % accentSets.length].color,
    badgeColor: accentSets[index % accentSets.length].badgeColor,
  }));

  if (!localizedDoctors.length) return null;

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{t.home.doctors.eyebrow}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">{t.home.doctors.title}</h2>
            <p className="text-muted-foreground mt-2 text-base">{t.home.doctors.subtitle}</p>
          </div>
          <Link to="/doctors">
            <Button variant="outline" className="rounded-full gap-2 shrink-0">
              {isRTL ? (
                <>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  {t.home.doctors.viewAll}
                </>
              ) : (
                <>
                  {t.home.doctors.viewAll}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localizedDoctors.map((doc, i) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link to={`/doctors?author=${encodeURIComponent(doc.name)}`} className="block group h-full">
                <div className={`h-full bg-gradient-to-br ${doc.color} border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-primary transition-colors">{doc.name}</h3>
                      <p className="text-muted-foreground text-sm">{doc.title}</p>
                    </div>
                  </div>

                  {/* Specialty */}
                  <Badge variant="secondary" className="rounded-full text-xs mb-4">{t.categories[doc.specialty] || doc.specialty}</Badge>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{doc.bio}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" /> {doc.articles} {t.home.doctors.articles}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                      {isRTL ? (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          {t.home.doctors.viewProfile}
                        </>
                      ) : (
                        <>
                          {t.home.doctors.viewProfile}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
