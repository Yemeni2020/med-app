import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { saveNewsletterSubscription } from '@/lib/med-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const newsletter = appPublicSettings?.newsletter || {};
  const resolve = appPublicSettings?.resolve;
  const badge = resolve ? resolve(newsletter.badge, lang, t.newsletter.badge) : t.newsletter.badge;
  const title = resolve ? resolve(newsletter.title, lang, t.newsletter.title) : t.newsletter.title;
  const subtitle = resolve ? resolve(newsletter.subtitle, lang, t.newsletter.subtitle) : t.newsletter.subtitle;
  const placeholder = resolve ? resolve(newsletter.placeholder, lang, t.newsletter.placeholder) : t.newsletter.placeholder;
  const cta = resolve ? resolve(newsletter.cta, lang, t.common.subscribe) : t.common.subscribe;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await saveNewsletterSubscription({ email, language: lang });
      setSubscribed(true);
      toast.success(t.newsletter.success, {
        description: t.newsletter.description,
        duration: 4000,
      });
    } catch (error) {
      toast.error(error.message || 'Unable to subscribe right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{title}</h2>
          <p className="text-white/80 text-lg mb-8">{subtitle}</p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-3 text-white text-lg">
              <CheckCircle className="w-6 h-6" />
              {t.newsletter.success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={placeholder}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl"
              />
              <Button type="submit" disabled={loading} className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-xl font-semibold">
                <Mail className="w-4 h-4 mr-2" />
                {cta}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
