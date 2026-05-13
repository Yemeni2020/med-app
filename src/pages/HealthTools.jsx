import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import BMICalculator from '@/components/tools/BMICalculator';
import RiskAssessment from '@/components/tools/RiskAssessment';
import { Activity } from 'lucide-react';
import PageSeo from '@/components/seo/PageSeo';

export default function HealthTools() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const resolve = appPublicSettings?.resolve;
  const subtitle = resolve
    ? resolve(appPublicSettings?.healthTools?.subtitle, lang, t.healthTools.subtitle)
    : t.healthTools.subtitle;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageSeo page="health-tools" />
      <div className="flex items-center gap-3 mb-2">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-3xl md:text-4xl font-serif font-bold">{t.nav.healthTools}</h1>
      </div>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        {subtitle}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BMICalculator />
        <RiskAssessment />
      </div>
    </div>
  );
}
