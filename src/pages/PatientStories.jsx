import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPatientStories } from '@/lib/local-data';
import { createPatientStory, listSubmittedStories } from '@/lib/local-store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Quote, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function PatientStories() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', story: '', condition: '', is_anonymous: false, display_name: '' });
  const queryClient = useQueryClient();

  const { data: dbStories = [], isLoading } = useQuery({
    queryKey: ['patient-stories'],
    queryFn: () => [...listSubmittedStories(), ...listPatientStories()],
  });

  const staticStories = [
    { id: 'st1', title: 'From Diagnosis to Remission: My Lymphoma Journey', condition: 'Hodgkin Lymphoma', story: 'When I was diagnosed at 34, I felt the ground disappear beneath me. Six rounds of ABVD chemotherapy later, I rang the bell. It\'s been three years and I\'m still in remission. The biggest lesson? Ask questions, advocate for yourself, and lean on your care team. They\'ve seen this before. You\'re not alone.', is_anonymous: false, display_name: 'Maria G.' },
    { id: 'st2', title: 'Living and Thriving with Type 1 Diabetes', condition: 'Type 1 Diabetes', story: 'I\'ve had T1D since I was 8. Now at 29, a CGM and insulin pump changed my life. I run marathons, travel freely, and no longer live in fear of my next blood sugar crash. Technology has given me my life back. To anyone newly diagnosed: this gets manageable. I promise.', is_anonymous: false, display_name: 'Daniel W.' },
    { id: 'st3', title: 'My Silent Struggle with Atrial Fibrillation', condition: 'Atrial Fibrillation', story: 'I ignored my racing heart for two years, thinking it was stress. A Holter monitor caught the AF. After catheter ablation, I\'ve been symptom-free for 18 months. Please listen to your body. Heart palpitations that come and go are worth investigating — it changed everything for me.', is_anonymous: true, display_name: 'Anonymous' },
    { id: 'st4', title: 'How I Recovered from a Major Stroke at 45', condition: 'Ischemic Stroke', story: 'I woke up one morning unable to speak or move my right arm. Months of intensive speech and physical therapy brought me back — not 100%, but close enough that I returned to teaching. Neuroplasticity is real. The brain can heal. Don\'t give up on recovery too soon.', is_anonymous: false, display_name: 'James R.' },
  ];

  const stories = dbStories.length > 0 ? dbStories : staticStories;

  const createMutation = useMutation({
    mutationFn: createPatientStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-stories'] });
      setOpen(false);
      setForm({ title: '', story: '', condition: '', is_anonymous: false, display_name: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t.stories.title}</h1>
          <p className="text-muted-foreground">{t.stories.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2"><Plus className="w-4 h-4" /> {t.stories.share}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">{t.stories.share}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t.patientStoriesForm.title}</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder={t.patientStoriesForm.titlePlaceholder} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>{t.patientStoriesForm.condition}</Label>
                <Input value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} placeholder={t.patientStoriesForm.conditionPlaceholder} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>{t.patientStoriesForm.story}</Label>
                <Textarea value={form.story} onChange={e => setForm({...form, story: e.target.value})} placeholder={t.patientStoriesForm.storyPlaceholder} className="rounded-xl min-h-[150px]" required />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_anonymous} onCheckedChange={v => setForm({...form, is_anonymous: v})} />
                  <Label>{t.patientStoriesForm.anonymous}</Label>
                </div>
              </div>
              {!form.is_anonymous && (
                <div className="space-y-2">
                  <Label>{t.patientStoriesForm.displayName}</Label>
                  <Input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} placeholder={t.patientStoriesForm.displayNamePlaceholder} className="rounded-xl" />
                </div>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={createMutation.isPending}>
                {t.common.submit}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-60 rounded-2xl" />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">{lang === 'ar' && story.condition_ar ? story.condition_ar : story.condition}</Badge>
                      <h3 className="text-lg font-serif font-bold">{lang === 'ar' && story.title_ar ? story.title_ar : story.title}</h3>
                    </div>
                    <Quote className="w-8 h-8 text-primary/20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">{lang === 'ar' && story.story_ar ? story.story_ar : story.story}</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">
                      {story.is_anonymous ? t.common.anonymous : (story.display_name || t.common.anonymous)}
                    </span>
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
