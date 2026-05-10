import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, Stethoscope, Bookmark, LayoutDashboard, ChevronDown, LogIn, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import UserAvatar from '@/components/profile/UserAvatar';

export default function Navbar() {
  const { lang, toggleLang, isRTL, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const { savedItems } = useSavedArticles();
  const primaryLinks = [
    { to: '/', label: t.nav.home },
    { to: '/articles', label: t.nav.articles },
    { to: '/news', label: t.nav.news },
    { to: '/symptom-checker', label: t.nav.symptomChecker },
  ];
  const moreLinks = [
    { to: '/health-tools', label: t.nav.healthTools },
    { to: '/stories', label: t.nav.stories },
    { to: '/qa', label: t.nav.qa },
    { to: '/guidelines', label: t.nav.guidelines },
    { to: '/doctors', label: t.nav.doctors },
  ];
  const allLinks = [...primaryLinks, ...moreLinks];

  const isActive = (path) => location.pathname === path;
  const isMoreActive = moreLinks.some((l) => isActive(l.to));

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج.' : 'Signed out.');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-card/90 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-base md:text-lg font-extrabold tracking-tight text-foreground">
              Med<span className="text-primary">Blog</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {primaryLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/10 rounded-lg -z-10" />
                )}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isMoreActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {t.nav.more}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[180px] z-50"
                  >
                    {moreLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive(link.to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isAuthenticated ? (
              <>
                <UserAvatar size="sm" linkTo="/profile" />

                {user?.role === 'admin' ? (
                  <Link
                    to="/admin/knowledge-base"
                    title="Knowledge Base"
                    className={`p-2 rounded-lg transition-all hover:bg-muted/60 ${isActive('/admin/knowledge-base') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <ShieldCheck className="w-[18px] h-[18px]" />
                  </Link>
                ) : null}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="hidden md:flex p-2 rounded-lg transition-all hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden md:inline-flex rounded-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-[18px] h-[18px]" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-[18px] h-[18px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Dashboard icon */}
            <Link
              to="/dashboard"
              title={t.nav.dashboard}
              className={`hidden md:flex p-2 rounded-lg transition-all hover:bg-muted/60 ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </Link>

            {/* Saved / Bookmark */}
            <Link
              to="/saved"
              title={t.nav.saved}
              className={`relative hidden md:flex p-2 rounded-lg transition-all hover:bg-muted/60 ${isActive('/saved') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Bookmark className={`w-[18px] h-[18px] ${isActive('/saved') ? 'fill-primary' : ''}`} />
              <AnimatePresence>
                {savedItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {savedItems.length > 9 ? '9+' : savedItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-transparent hover:border-border"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-0">
                {/* Mobile sheet header */}
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-base font-extrabold">Med<span className="text-primary">Blog</span></span>
                </div>

                <div className="flex flex-col gap-0.5 p-3 overflow-y-auto">
                  <div className="flex items-center gap-2 px-2 pb-3">
                    <button
                      onClick={toggleTheme}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                      onClick={toggleLang}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      {lang === 'en' ? 'عربي' : 'EN'}
                    </button>
                  </div>
                  {allLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.to)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2" />
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <UserAvatar size="sm" linkTo={null} /> {getDisplayName(user)}
                      </Link>
                      {user?.role === 'admin' ? (
                        <Link to="/admin/knowledge-base" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/knowledge-base') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                          <ShieldCheck className="w-4 h-4" /> Knowledge Base
                        </Link>
                      ) : null}
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                  )}
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                    <LayoutDashboard className="w-4 h-4" /> {t.nav.dashboard}
                  </Link>
                  <Link to="/saved" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/saved') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                    <Bookmark className="w-4 h-4" /> {t.nav.saved}
                    {savedItems.length > 0 && <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{savedItems.length}</span>}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

function getDisplayName(user) {
  if (!user?.name) return 'Profile';
  if (typeof user.name === 'string') return user.name;
  return user.name.en || user.name.ar || 'Profile';
}
