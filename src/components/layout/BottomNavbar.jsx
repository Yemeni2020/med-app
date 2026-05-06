import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Bookmark, House, LayoutDashboard, Newspaper } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useSavedArticles } from '@/lib/SavedArticlesContext';

const navItems = [
  { to: '/', key: 'home', icon: House },
  { to: '/articles', key: 'articles', icon: Newspaper },
  { to: '/symptom-checker', key: 'symptomChecker', icon: Activity },
  { to: '/saved', key: 'saved', icon: Bookmark },
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
];

export default function BottomNavbar() {
  const { t } = useLanguage();
  const location = useLocation();
  const { savedItems } = useSavedArticles();

  const isActive = (path) => (
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="mx-auto max-w-md rounded-[28px] border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]">
        <div className="grid grid-cols-5 items-center gap-1 p-2">
          {navItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            const showBadge = item.key === 'saved' && savedItems.length > 0;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex h-[64px] items-center justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl transition-colors ${
                    active ? 'text-blue-700' : 'text-slate-500'
                  }`}
                >
                  {active ? (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute inset-0 rounded-2xl bg-blue-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}

                  <div className="relative z-10">
                    <Icon className={`h-[18px] w-[18px] ${active && item.key === 'saved' ? 'fill-blue-700' : ''}`} />
                    {showBadge ? (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                        {savedItems.length > 9 ? '9+' : savedItems.length}
                      </span>
                    ) : null}
                  </div>

                  <span className={`relative z-10 text-[11px] font-semibold leading-none ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                    {t.nav[item.key]}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
