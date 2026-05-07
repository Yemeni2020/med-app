import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { listQASessions } from '@/lib/med-api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Video, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  upcoming: 'bg-primary/10 text-primary',
  live: 'bg-red-500 text-white animate-pulse',
  completed: 'bg-muted text-muted-foreground',
};

export default function ExpertQA() {
  const { t, lang } = useLanguage();

  const { data: dbSessions = [], isLoading } = useQuery({
    queryKey: ['qa-sessions'],
    queryFn: listQASessions,
  });

  // Static sample sessions shown when DB is empty
  const staticSessions = [
    { id: 's1', title: 'Managing Heart Failure in 2026: New Approaches', description: 'Join Dr. Thompson for a live discussion on the latest evidence for SGLT2 inhibitors, device therapy, and remote monitoring in heart failure management.', expert_name: 'Dr. James Thompson', expert_title: 'MD, FACC – Cardiology', specialty: 'Cardiology', status: 'upcoming', session_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 42 },
    { id: 's2', title: 'Immunotherapy Side Effects: What Patients Need to Know', description: 'Dr. Mitchell addresses common and rare immune-related adverse events from checkpoint inhibitors and how oncology teams manage them.', expert_name: 'Dr. Sarah Mitchell', expert_title: 'MD, PhD – Oncology', specialty: 'Oncology', status: 'upcoming', session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 28 },
    { id: 's3', title: 'Stroke Recovery: Setting Realistic Expectations', description: 'Dr. Rahman discusses neuroplasticity, timeline for recovery, and how to maximize rehabilitation outcomes after an ischemic event.', expert_name: 'Dr. Aisha Rahman', expert_title: 'MD, PhD – Neurology', specialty: 'Neurology', status: 'completed', session_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), recording_url: '#', questions_count: 67 },
    { id: 's4', title: 'Childhood Vaccines: Answering Parent Concerns', description: 'Dr. Chen tackles common vaccine hesitancy questions with compassion and evidence-based answers, from schedule timing to ingredient concerns.', expert_name: 'Dr. Michael Chen', expert_title: 'MD, FAAP – Pediatrics', specialty: 'Pediatrics', status: 'completed', session_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), recording_url: '#', questions_count: 94 },
    { id: 's5', title: 'Mental Health After the Pandemic: What\'s Changed?', description: 'Dr. Kim explores the lasting psychological effects of the pandemic and what new treatment strategies are proving most effective for depression and anxiety.', expert_name: 'Dr. Robert Kim', expert_title: 'MD, PhD – Psychiatry', specialty: 'Psychiatry', status: 'completed', session_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), recording_url: '#', questions_count: 110 },
  ];

  const sessions = dbSessions.length > 0 ? dbSessions : staticSessions;
  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const past = sessions.filter(s => s.status === 'completed');
  const live = sessions.filter(s => s.status === 'live');

  const SessionCard = ({ session, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge className={statusStyles[session.status]}>
              {session.status === 'live' && <span className="w-2 h-2 bg-white rounded-full mr-1.5 inline-block" />}
              {t.common[session.status]}
            </Badge>
            {session.recording_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={session.recording_url} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-serif font-bold mb-3">{lang === 'ar' && session.title_ar ? session.title_ar : session.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{lang === 'ar' && session.description_ar ? session.description_ar : session.description}</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {session.expert_avatar ? (
                <img src={session.expert_avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{session.expert_name?.[0]}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{session.expert_name}</p>
              <p className="text-xs text-muted-foreground">{session.expert_title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {session.session_date ? format(new Date(session.session_date), 'MMM d, yyyy') : '—'}
            </span>
            {session.specialty && (
              <Badge variant="secondary" className="text-xs">{lang === 'ar' && session.specialty_ar ? session.specialty_ar : session.specialty}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t.qa.title}</h1>
        <p className="text-muted-foreground">{t.qa.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-12">
          {live.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> {t.common.live}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {live.map((s, i) => <SessionCard key={s.id} session={s} index={i} />)}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t.common.upcoming}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((s, i) => <SessionCard key={s.id} session={s} index={i} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t.common.completed}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((s, i) => <SessionCard key={s.id} session={s} index={i} />)}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{t.common.noResults}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
