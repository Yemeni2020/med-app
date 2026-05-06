import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, BookOpen, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_COPY = {
  en: {
    viewGuideline: 'View Guideline',
    organizationNames: {
      WHO: 'World Health Organization',
      CDC: 'Centers for Disease Control',
      AHA: 'American Heart Association',
      NICE: 'National Institute for Health and Care Excellence',
    },
  },
  ar: {
    viewGuideline: 'عرض الإرشاد',
    organizationNames: {
      WHO: 'منظمة الصحة العالمية',
      CDC: 'مراكز السيطرة على الأمراض',
      AHA: 'جمعية القلب الأمريكية',
      NICE: 'المعهد الوطني للتميز الصحي والرعاية',
    },
  },
};

const guidelines = [
  { org: 'WHO', name: 'World Health Organization', items: [
    { title: 'COVID-19 Clinical Management', title_ar: 'التدبير السريري لكوفيد-19', url: 'https://www.who.int/publications/i/item/WHO-2019-nCoV-clinical-2021-2', tags: ['respiratory', 'infectious disease', 'COVID-19'], tags_ar: ['تنفسي', 'أمراض معدية', 'كوفيد-19'] },
    { title: 'Hypertension Management Guidelines', title_ar: 'إرشادات تدبير ارتفاع ضغط الدم', url: 'https://www.who.int/publications/i/item/9789240033986', tags: ['cardiology', 'hypertension', 'chronic disease'], tags_ar: ['أمراض القلب', 'ارتفاع الضغط', 'مرض مزمن'] },
    { title: 'Mental Health Gap Action Programme', title_ar: 'برنامج سد فجوة الصحة النفسية', url: 'https://www.who.int/publications/i/item/9789241549790', tags: ['psychiatry', 'mental health', 'depression'], tags_ar: ['الطب النفسي', 'الصحة النفسية', 'الاكتئاب'] },
    { title: 'Diabetes Prevention & Management', title_ar: 'الوقاية من السكري وتدبيره', url: 'https://www.who.int/health-topics/diabetes', tags: ['endocrinology', 'diabetes', 'chronic disease'], tags_ar: ['الغدد الصماء', 'السكري', 'مرض مزمن'] },
    { title: 'Antimicrobial Resistance Guidelines', title_ar: 'إرشادات مقاومة مضادات الميكروبات', url: 'https://www.who.int/health-topics/antimicrobial-resistance', tags: ['infectious disease', 'antibiotics', 'AMR'], tags_ar: ['أمراض معدية', 'مضادات حيوية', 'مقاومة الميكروبات'] },
  ]},
  { org: 'CDC', name: 'Centers for Disease Control', items: [
    { title: 'Immunization Schedules', title_ar: 'جداول التحصين', url: 'https://www.cdc.gov/vaccines/schedules/', tags: ['pediatrics', 'vaccination', 'preventive'], tags_ar: ['طب الأطفال', 'التطعيم', 'وقائي'] },
    { title: 'Antibiotic Prescribing Guidelines', title_ar: 'إرشادات وصف المضادات الحيوية', url: 'https://www.cdc.gov/antibiotic-use/', tags: ['antibiotics', 'infectious disease', 'prescribing'], tags_ar: ['مضادات حيوية', 'أمراض معدية', 'وصف الدواء'] },
    { title: 'Cancer Screening Guidelines', title_ar: 'إرشادات فحوصات السرطان', url: 'https://www.cdc.gov/cancer/dcpc/prevention/', tags: ['oncology', 'screening', 'preventive'], tags_ar: ['الأورام', 'الفحص المبكر', 'وقائي'] },
    { title: 'Heart Disease Prevention', title_ar: 'الوقاية من أمراض القلب', url: 'https://www.cdc.gov/heartdisease/', tags: ['cardiology', 'prevention', 'lifestyle'], tags_ar: ['أمراض القلب', 'وقاية', 'نمط الحياة'] },
  ]},
  { org: 'AHA', name: 'American Heart Association', items: [
    { title: 'CPR & Emergency Cardiovascular Care', title_ar: 'الإنعاش القلبي والرعاية القلبية الطارئة', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines', tags: ['emergency', 'CPR', 'cardiology'], tags_ar: ['طوارئ', 'إنعاش قلبي', 'أمراض القلب'] },
    { title: 'Heart Failure Management', title_ar: 'تدبير فشل القلب', url: 'https://www.heart.org/en/health-topics/heart-failure', tags: ['cardiology', 'heart failure', 'treatment'], tags_ar: ['أمراض القلب', 'فشل القلب', 'علاج'] },
    { title: 'Stroke Treatment Protocols', title_ar: 'بروتوكولات علاج السكتة الدماغية', url: 'https://www.heart.org/en/health-topics/stroke', tags: ['neurology', 'stroke', 'emergency'], tags_ar: ['الأعصاب', 'سكتة دماغية', 'طوارئ'] },
  ]},
  { org: 'NICE', name: 'National Institute for Health and Care Excellence', items: [
    { title: 'Depression in Adults Treatment', title_ar: 'علاج الاكتئاب لدى البالغين', url: 'https://www.nice.org.uk/guidance/ng222', tags: ['psychiatry', 'depression', 'mental health'], tags_ar: ['الطب النفسي', 'الاكتئاب', 'الصحة النفسية'] },
    { title: 'Type 2 Diabetes Management', title_ar: 'تدبير السكري من النوع الثاني', url: 'https://www.nice.org.uk/guidance/ng28', tags: ['endocrinology', 'diabetes', 'treatment'], tags_ar: ['الغدد الصماء', 'السكري', 'علاج'] },
    { title: 'Chronic Pain Management', title_ar: 'تدبير الألم المزمن', url: 'https://www.nice.org.uk/guidance/ng193', tags: ['pain management', 'chronic', 'treatment'], tags_ar: ['تدبير الألم', 'مزمن', 'علاج'] },
  ]},
];

export default function Guidelines() {
  const { t, lang } = useLanguage();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const [search, setSearch] = useState('');

  const filteredGuidelines = guidelines.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !search ||
      (lang === 'ar' && item.title_ar ? item.title_ar : item.title).toLowerCase().includes(search.toLowerCase()) ||
      (lang === 'ar' && item.tags_ar ? item.tags_ar : item.tags).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(group => group.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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
            onChange={e => setSearch(e.target.value)}
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
                <p className="text-sm text-muted-foreground">{copy.organizationNames[group.org] || group.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item, ii) => (
                <Card key={ii} className="hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">{lang === 'ar' && item.title_ar ? item.title_ar : item.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(lang === 'ar' && item.tags_ar ? item.tags_ar : item.tags).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full">{tag}</Badge>
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
