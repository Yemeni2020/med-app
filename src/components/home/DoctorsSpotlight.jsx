import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

const featuredDoctors = [
  {
    name: 'Dr. Sarah Mitchell',
    title: 'MD, PhD',
    specialty: 'Oncology',
    bio: 'Leading researcher in immunotherapy and personalized cancer treatments at Harvard Medical School with over 15 years of clinical experience.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    articles: 12,
    badge: 'Featured Expert',
    color: 'from-purple-500/10 to-purple-500/5',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Dr. James Thompson',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    bio: 'Board-certified cardiologist specializing in interventional procedures and heart failure management. Former Chief of Cardiology at Johns Hopkins.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    articles: 9,
    badge: 'Top Contributor',
    color: 'from-red-500/10 to-red-500/5',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    name: 'Dr. Aisha Rahman',
    title: 'MD, PhD',
    specialty: 'Neurology',
    bio: 'Neurologist and neuroscientist exploring cutting-edge stroke rehabilitation techniques and neuroplasticity at Stanford Neuroscience Institute.',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face',
    articles: 8,
    badge: 'Research Lead',
    color: 'from-blue-500/10 to-blue-500/5',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
];

export default function DoctorsSpotlight() {
  const { t } = useLanguage();
  const localizedDoctors = featuredDoctors.map((doctor) => ({
    ...doctor,
    badge: doctor.badge === 'Featured Expert'
      ? t.home.doctors.featuredExpert
      : doctor.badge === 'Top Contributor'
        ? t.home.doctors.topContributor
        : t.home.doctors.researchLead,
  }));

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
              {t.home.doctors.viewAll} <ArrowRight className="w-4 h-4" />
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
                  <Badge variant="secondary" className="rounded-full text-xs mb-4">{doc.specialty}</Badge>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{doc.bio}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" /> {doc.articles} {t.home.doctors.articles}
                    </span>
                    <span className="text-xs text-primary font-medium group-hover:underline">{t.home.doctors.viewProfile} →</span>
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
