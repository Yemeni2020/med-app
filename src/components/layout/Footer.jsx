import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { saveNewsletterSubscription } from '@/lib/med-api';
import { Stethoscope, Mail, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Footer() {
  const { t, lang } = useLanguage();
  const { appPublicSettings } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const footer = appPublicSettings?.footer || {};
  const resolve = appPublicSettings?.resolve;
  const aboutText = resolve ? resolve(footer.aboutText, lang, t.footer.aboutText) : t.footer.aboutText;
  const contactEmail = footer.contactEmail || 'contact@medblog.com';

  const handleSubscribe = async (e) => {
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
    <footer className="bg-foreground text-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-background">
              Med<span className="text-primary">Blog</span>
            </span>
          </div>
            <p className="text-sm leading-relaxed opacity-70">{aboutText}</p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t.footer.quickLinks}</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/articles', label: t.nav.articles },
                { to: '/health-tools', label: t.nav.healthTools },
                { to: '/stories', label: t.nav.stories },
                { to: '/qa', label: t.nav.qa },
              ].map(link => (
                <Link key={link.to} to={link.to} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t.footer.categories}</h4>
            <div className="flex flex-col gap-2.5">
              {['cardiology', 'neurology', 'oncology', 'pediatrics'].map(cat => (
                <Link key={cat} to={`/articles?category=${cat}`} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                  {t.categories[cat]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t.footer.connect}</h4>
            <div className="flex items-center gap-2 text-sm opacity-70 mb-5">
              <Mail className="w-4 h-4" />
              <span>{contactEmail}</span>
            </div>
            <p className="text-sm font-semibold text-background mb-3">{t.newsletter.stayUpdated}</p>
            {subscribed ? (
              <p className="text-sm text-primary font-medium">✓ {t.newsletter.subscribed}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40 h-9 text-sm rounded-lg"
                />
                <Button type="submit" disabled={loading} size="sm" className="h-9 px-3 rounded-lg bg-primary hover:bg-primary/90 shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8">
          <p className="text-xs opacity-50 mb-2">{t.footer.disclaimer}</p>
          <p className="text-xs opacity-50">© 2026 MedBlog. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
