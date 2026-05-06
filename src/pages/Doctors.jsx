import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listArticles } from '@/lib/local-data';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Eye, Search, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function DoctorCard({ doctor, articles, onSelect }) {
  const { t } = useLanguage();
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
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

function DoctorProfile({ doctor, articles, onBack }) {
  const { t, lang } = useLanguage();
  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes_count || 0), 0);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> {t.doctors.backToAll}
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
            {doctor.institution && <p className="text-primary text-sm font-medium mb-3">{doctor.institution}</p>}
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
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const authorParam = params.get('author');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles-doctors'],
    queryFn: () => listArticles(100),
  });

  // Static bios keyed by doctor name
  const doctorBios = {
    'Dr. Sarah Mitchell': {
      bio: 'Dr. Sarah Mitchell is a leading oncologist and researcher at Harvard Medical School with over 15 years of clinical and translational research experience. She specializes in immunotherapy for lung and breast cancers, having co-authored more than 60 peer-reviewed publications. She is a member of the American Society of Clinical Oncology and serves on the editorial board of the Journal of Clinical Oncology.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      institution: 'Harvard Medical School',
    },
    'Dr. James Thompson': {
      bio: 'Dr. James Thompson is a board-certified interventional cardiologist and former Chief of Cardiology at Johns Hopkins Hospital. With expertise in heart failure, arrhythmia management, and catheter-based interventions, he has trained over 200 cardiology fellows and published landmark studies on DOAC therapy and AF ablation outcomes.',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      institution: 'Johns Hopkins Hospital',
    },
    'Dr. Aisha Rahman': {
      bio: 'Dr. Aisha Rahman is a neurologist and neuroscientist at Stanford University Neuroscience Institute, focusing on stroke rehabilitation and neuroplasticity. She pioneered research on brain-computer interface-assisted recovery and has received multiple NIH grants for her work on neural circuit reorganization post-stroke.',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face',
      institution: 'Stanford University',
    },
    'Dr. Michael Chen': {
      bio: 'Dr. Michael Chen is a pediatric infectious disease specialist and vaccine researcher at UCSF Benioff Children\'s Hospital. He has been instrumental in designing childhood immunization catch-up protocols and advises the CDC\'s Advisory Committee on Immunization Practices (ACIP). He is a passionate advocate for vaccine equity worldwide.',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
      institution: 'UCSF Benioff Children\'s Hospital',
    },
    'Dr. Elena Vasquez': {
      bio: 'Dr. Elena Vasquez is a board-certified dermatologist and clinical researcher at Mayo Clinic specializing in inflammatory skin diseases, including psoriasis, eczema, and autoimmune dermatoses. She leads clinical trials for emerging biologic therapies and has been recognized by the American Academy of Dermatology for excellence in clinical research.',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face',
      institution: 'Mayo Clinic',
    },
    'Dr. Robert Kim': {
      bio: 'Dr. Robert Kim is a psychiatrist and clinical researcher at UCSF Weill Institute for Neurosciences. He specializes in treatment-resistant depression and has conducted landmark trials on ketamine and psilocybin-assisted therapies. He is a vocal advocate for expanding mental health access and reducing stigma in underserved communities.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
      institution: 'UCSF Weill Institute',
    },
  };

  // Group articles by author
  const doctors = useMemo(() => {
    const map = {};
    articles.forEach(a => {
      if (!a.author_name) return;
      if (!map[a.author_name]) {
        const extra = doctorBios[a.author_name] || {};
        map[a.author_name] = {
          name: a.author_name,
          title: a.author_title,
          specialty: a.category,
          author_avatar: extra.avatar || a.author_avatar,
          bio: extra.bio || null,
          institution: extra.institution || null,
        };
      }
    });
    return Object.values(map);
  }, [articles]);

  // Auto-select from URL param
  useEffect(() => {
    if (authorParam && doctors.length > 0) {
      const found = doctors.find(d => d.name === decodeURIComponent(authorParam));
      if (found) setSelectedDoctor(found);
    }
  }, [authorParam, doctors]);

  const filteredDoctors = doctors.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.title?.toLowerCase().includes(search.toLowerCase()) || d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

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
            placeholder={t.common.searchByName}
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
          <p className="text-lg">{t.common.noResults}</p>
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
