import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listArticles, listDoctors } from '@/lib/med-api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Eye, Search, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_COPY = {
  en: {
    noDoctorYet: 'No doctor articles are available yet.',
    searchDoctorsPlaceholder: 'Search by doctor name, specialty, or title...',
    institutions: {
      'Harvard Medical School': 'Harvard Medical School',
      'Johns Hopkins Hospital': 'Johns Hopkins Hospital',
      'Stanford University': 'Stanford University',
      "UCSF Benioff Children's Hospital": "UCSF Benioff Children's Hospital",
      'Mayo Clinic': 'Mayo Clinic',
      'UCSF Weill Institute': 'UCSF Weill Institute',
    },
    bios: {
      'Dr. Sarah Mitchell': 'Dr. Sarah Mitchell is a leading oncologist and researcher at Harvard Medical School with over 15 years of clinical and translational research experience. She specializes in immunotherapy for lung and breast cancers, having co-authored more than 60 peer-reviewed publications. She is a member of the American Society of Clinical Oncology and serves on the editorial board of the Journal of Clinical Oncology.',
      'Dr. James Thompson': 'Dr. James Thompson is a board-certified interventional cardiologist and former Chief of Cardiology at Johns Hopkins Hospital. With expertise in heart failure, arrhythmia management, and catheter-based interventions, he has trained over 200 cardiology fellows and published landmark studies on DOAC therapy and AF ablation outcomes.',
      'Dr. Aisha Rahman': 'Dr. Aisha Rahman is a neurologist and neuroscientist at Stanford University Neuroscience Institute, focusing on stroke rehabilitation and neuroplasticity. She pioneered research on brain-computer interface-assisted recovery and has received multiple NIH grants for her work on neural circuit reorganization post-stroke.',
      'Dr. Michael Chen': "Dr. Michael Chen is a pediatric infectious disease specialist and vaccine researcher at UCSF Benioff Children's Hospital. He has been instrumental in designing childhood immunization catch-up protocols and advises the CDC's Advisory Committee on Immunization Practices (ACIP). He is a passionate advocate for vaccine equity worldwide.",
      'Dr. Elena Vasquez': 'Dr. Elena Vasquez is a board-certified dermatologist and clinical researcher at Mayo Clinic specializing in inflammatory skin diseases, including psoriasis, eczema, and autoimmune dermatoses. She leads clinical trials for emerging biologic therapies and has been recognized by the American Academy of Dermatology for excellence in clinical research.',
      'Dr. Robert Kim': 'Dr. Robert Kim is a psychiatrist and clinical researcher at UCSF Weill Institute for Neurosciences. He specializes in treatment-resistant depression and has conducted landmark trials on ketamine and psilocybin-assisted therapies. He is a vocal advocate for expanding mental health access and reducing stigma in underserved communities.',
    },
  },
  ar: {
    noDoctorYet: 'لا توجد مقالات للأطباء في الوقت الحالي.',
    searchDoctorsPlaceholder: 'ابحث باسم الطبيب أو التخصص أو المسمى...',
    institutions: {
      'Harvard Medical School': 'كلية الطب بجامعة هارفارد',
      'Johns Hopkins Hospital': 'مستشفى جونز هوبكنز',
      'Stanford University': 'جامعة ستانفورد',
      "UCSF Benioff Children's Hospital": 'مستشفى UCSF بينيوف للأطفال',
      'Mayo Clinic': 'مايو كلينك',
      'UCSF Weill Institute': 'معهد UCSF وايل',
    },
    bios: {
      'Dr. Sarah Mitchell': 'الدكتورة سارة ميتشل طبيبة أورام وباحثة بارزة في كلية الطب بجامعة هارفارد، ولديها أكثر من 15 عامًا من الخبرة السريرية والبحثية التطبيقية. تتخصص في العلاج المناعي لسرطانات الرئة والثدي، وشاركت في تأليف أكثر من 60 بحثًا محكمًا. وهي عضو في الجمعية الأمريكية لعلم الأورام السريري وتشارك في هيئة تحرير مجلة Journal of Clinical Oncology.',
      'Dr. James Thompson': 'الدكتور جيمس طومسون طبيب قلب تدخلي معتمد ورئيس سابق لقسم القلب في مستشفى جونز هوبكنز. يملك خبرة في فشل القلب واضطرابات النظم والتداخلات القلبية بالقسطرة، وقد درّب أكثر من 200 زميل في أمراض القلب ونشر دراسات بارزة حول مضادات التخثر واستئصال الرجفان الأذيني.',
      'Dr. Aisha Rahman': 'الدكتورة عائشة رحمن طبيبة أعصاب وعالمة أعصاب في معهد ستانفورد لعلوم الأعصاب، وتركز على إعادة التأهيل بعد السكتة والمرونة العصبية. قادت أبحاثًا رائدة في التعافي المدعوم بواجهات الدماغ الحاسوبية، وحصلت على منح متعددة من المعاهد الوطنية للصحة لدراساتها حول إعادة تنظيم الدوائر العصبية بعد السكتة.',
      'Dr. Michael Chen': 'الدكتور مايكل تشين اختصاصي أمراض معدية للأطفال وباحث في اللقاحات في مستشفى UCSF بينيوف للأطفال. كان له دور أساسي في تصميم بروتوكولات استدراك لقاحات الأطفال، ويقدّم المشورة للجنة الاستشارية لممارسات التحصين التابعة لمركز CDC. وهو مناصر قوي للعدالة في اللقاحات حول العالم.',
      'Dr. Elena Vasquez': 'الدكتورة إلينا فاسكيز طبيبة جلدية معتمدة وباحثة سريرية في مايو كلينك، متخصصة في الأمراض الجلدية الالتهابية مثل الصدفية والأكزيما والأمراض الجلدية المناعية الذاتية. تقود تجارب سريرية لعلاجات بيولوجية ناشئة، وحصلت على تقدير من الأكاديمية الأمريكية للأمراض الجلدية لتميزها في البحث السريري.',
      'Dr. Robert Kim': 'الدكتور روبرت كيم طبيب نفسي وباحث سريري في معهد UCSF وايل لعلوم الأعصاب. يتخصص في الاكتئاب المقاوم للعلاج، وأجرى تجارب بارزة على الكيتامين والعلاجات المساعدة بالسيلوسايبن. كما يدعو إلى توسيع الوصول إلى خدمات الصحة النفسية وتقليل الوصمة في المجتمعات المحرومة.',
    },
  },
};

function DoctorCard({ doctor, articles, onSelect }) {
  const { t, isRTL } = useLanguage();
  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => onSelect(doctor)}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
          {doctor.author_avatar ? (
            <img src={doctor.author_avatar} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            doctor.name?.[0]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif font-bold text-xl leading-tight">{doctor.name}</h2>
          {doctor.title && <p className="text-muted-foreground text-sm mt-0.5">{doctor.title}</p>}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="secondary" className="rounded-full text-xs capitalize">{doctor.specialty?.replace('_', ' ')}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {articles.length} {t.home.doctors.articles}
            </span>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1 ${isRTL ? 'rotate-180' : ''}`} />
      </div>
    </div>
  );
}

function DoctorProfile({ doctor, articles, onBack }) {
  const { t, lang, isRTL } = useLanguage();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes_count || 0), 0);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm font-medium">
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        {t.doctors.backToAll}
      </button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
            {doctor.author_avatar ? (
              <img src={doctor.author_avatar} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              doctor.name?.[0]
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-serif font-bold text-3xl mb-1">{doctor.name}</h1>
            {doctor.title && <p className="text-muted-foreground text-base mb-1">{doctor.title}</p>}
            {doctor.institution && <p className="text-primary text-sm font-medium mb-3">{copy.institutions[doctor.institution] || doctor.institution}</p>}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="rounded-full capitalize">{doctor.specialty?.replace('_', ' ')}</Badge>
            </div>
            {doctor.bio && <p className="text-foreground/80 leading-relaxed">{doctor.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{articles.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.doctors.articlesPublished}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.doctors.totalViews}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalLikes.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.doctors.totalLikes}</p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <h2 className="font-serif font-bold text-2xl mb-5">{t.doctors.publishedArticles}</h2>
      <div className="space-y-4">
        {articles.map(article => {
          const title = lang === 'ar' && article.title_ar ? article.title_ar : article.title;
          const excerpt = lang === 'ar' && article.excerpt_ar ? article.excerpt_ar : article.excerpt;
          return (
            <Link key={article.id} to={`/articles/${article.id}`} className="block group">
              <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex gap-4">
                  {article.cover_image && (
                    <img src={article.cover_image} alt={title} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="rounded-full text-xs">{t.categories[article.category]}</Badge>
                      {article.is_peer_reviewed && <Badge variant="outline" className="rounded-full text-xs">{t.common.peerReviewed}</Badge>}
                    </div>
                    <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{excerpt}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.read_time_minutes || 5} {t.common.minRead}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(article.views_count || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Doctors() {
  const { t, lang } = useLanguage();
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchParams] = useSearchParams();
  const authorParam = searchParams.get('author');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: listDoctors,
  });
  const { data: articles = [] } = useQuery({
    queryKey: ['doctor-articles'],
    queryFn: () => listArticles(100),
  });

  // Static bios keyed by doctor name
  const doctorBios = {
    'Dr. Sarah Mitchell': {
      bio: copy.bios['Dr. Sarah Mitchell'],
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      institution: 'Harvard Medical School',
    },
    'Dr. James Thompson': {
      bio: copy.bios['Dr. James Thompson'],
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      institution: 'Johns Hopkins Hospital',
    },
    'Dr. Aisha Rahman': {
      bio: copy.bios['Dr. Aisha Rahman'],
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face',
      institution: 'Stanford University',
    },
    'Dr. Michael Chen': {
      bio: copy.bios['Dr. Michael Chen'],
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
      institution: 'UCSF Benioff Children\'s Hospital',
    },
    'Dr. Elena Vasquez': {
      bio: copy.bios['Dr. Elena Vasquez'],
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face',
      institution: 'Mayo Clinic',
    },
    'Dr. Robert Kim': {
      bio: copy.bios['Dr. Robert Kim'],
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
      institution: 'UCSF Weill Institute',
    },
  };

  // Group articles by author
  const mappedDoctors = useMemo(() => doctors.map((doctor) => {
    const extra = doctorBios[doctor.name] || {};
    return {
      ...doctor,
      title: doctor.title || null,
      specialty: doctor.specialty,
      author_avatar: extra.avatar || doctor.author_avatar,
      bio: extra.bio || doctor.bio || null,
      institution: extra.institution || doctor.institution || null,
      articles_count: doctor.articles_count || 0,
    };
  }), [doctors, copy]);

  // Auto-select from URL param
  useEffect(() => {
    if (authorParam && mappedDoctors.length > 0) {
      const found = mappedDoctors.find(d => d.name === decodeURIComponent(authorParam));
      if (found) setSelectedDoctor(found);
    }
  }, [authorParam, mappedDoctors]);

  const filteredDoctors = mappedDoctors.filter(d => {
    const query = search.toLowerCase();
    return !search
      || d.name.toLowerCase().includes(query)
      || d.title?.toLowerCase().includes(query)
      || d.specialty?.toLowerCase().includes(query)
      || t.categories[d.specialty]?.toLowerCase().includes(query);
  });

  const getDoctorArticles = (doctor) => articles.filter(a => a.author_name === doctor.name);

  if (selectedDoctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <DoctorProfile
          doctor={selectedDoctor}
          articles={getDoctorArticles(selectedDoctor)}
          onBack={() => setSelectedDoctor(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t.doctors.title}</h1>
        <p className="text-muted-foreground text-lg mb-6">{t.doctors.subtitle}</p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={copy.searchDoctorsPlaceholder}
            className="pl-11 h-12 rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">{copy.noDoctorYet}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map(doctor => (
            <DoctorCard
              key={doctor.name}
              doctor={doctor}
              articles={getDoctorArticles(doctor)}
              onSelect={setSelectedDoctor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
