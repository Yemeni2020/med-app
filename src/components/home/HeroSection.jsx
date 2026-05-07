import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            {t.common.peerReviewed}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4 sm:mb-6">
            {t.hero.title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-7 sm:mb-10 max-w-2xl">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link to="/articles">
              <Button size="lg" className="rounded-full px-6 sm:px-8 gap-2 text-sm sm:text-base h-11 sm:h-12">
                {isRTL ? (
                  <>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    {t.hero.cta}
                  </>
                ) : (
                  <>
                    {t.hero.cta}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </Link>
            <Link to="/health-tools">
              <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 text-sm sm:text-base h-11 sm:h-12">
                {t.hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-3 gap-3 sm:gap-6 mt-12 sm:mt-20"
        >
          {[
            { icon: BookOpen, value: '500+', label: t.home.stats.articlesPublished },
            { icon: Users, value: '120+', label: t.home.stats.expertContributors },
            { icon: Shield, value: '100%', label: t.home.stats.peerReviewed },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 bg-card/80 backdrop-blur-sm rounded-2xl p-3 sm:p-5 border border-border/50 text-center sm:text-left">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
