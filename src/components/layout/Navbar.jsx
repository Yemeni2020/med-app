import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe, Stethoscope, Bookmark, LayoutDashboard, ChevronDown, LogIn, ShieldCheck, LogOut, Moon, Sun, FilePenLine, User } from 'lucide-react';
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
  const [accountOpen, setAccountOpen] = useState(false);
  const moreRef = useRef(null);
  const accountRef = useRef(null);
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
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج.' : 'Signed out.');
    setMobileOpen(false);
    setAccountOpen(false);
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
          <div className="flex items-center gap-1.5 shrink-0">
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

            <button
              onClick={toggleLang}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-transparent hover:border-border"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((open) => !open)}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all ${
                    accountOpen ? 'border-primary/30 bg-primary/5' : 'border-border/70 bg-background hover:bg-muted/50'
                  }`}
                >
                  <UserAvatar size="sm" linkTo={null} />
                  <span className="hidden xl:block max-w-28 truncate text-sm font-medium text-foreground">
                    {getDisplayName(user)}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 right-0 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl z-50"
                    >
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                        <UserAvatar size="sm" linkTo={null} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{getDisplayName(user)}</p>
                          <p className="text-xs capitalize text-muted-foreground">{user?.role || 'member'}</p>
                        </div>
                      </div>

                      <div className="my-2 border-t border-border/80" />

                      <DesktopAccountLink
                        to="/profile"
                        label={lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        active={isActive('/profile')}
                        onNavigate={() => setAccountOpen(false)}
                        icon={<User className="h-4 w-4" />}
                      />
                      <DesktopAccountLink
                        to="/dashboard"
                        label={t.nav.dashboard}
                        active={isActive('/dashboard')}
                        onNavigate={() => setAccountOpen(false)}
                        icon={<LayoutDashboard className="h-4 w-4" />}
                      />
                      <DesktopAccountLink
                        to="/saved"
                        label={t.nav.saved}
                        active={isActive('/saved')}
                        onNavigate={() => setAccountOpen(false)}
                        icon={<Bookmark className={`h-4 w-4 ${isActive('/saved') ? 'fill-primary' : ''}`} />}
                        badge={savedItems.length > 0 ? (savedItems.length > 99 ? '99+' : String(savedItems.length)) : null}
                      />

                      <div className="my-2 border-t border-border/80" />

                      {user?.role === 'admin' ? (
                        <DesktopAccountLink
                          to="/admin/knowledge-base"
                          label="Knowledge Base"
                          active={isActive('/admin/knowledge-base')}
                          onNavigate={() => setAccountOpen(false)}
                          icon={<ShieldCheck className="h-4 w-4" />}
                        />
                      ) : null}

                      <DesktopAccountLink
                        to="/doctor-dashboard"
                        label={t.nav.doctorDashboard}
                        active={isActive('/doctor-dashboard')}
                        onNavigate={() => setAccountOpen(false)}
                        icon={<FilePenLine className="h-4 w-4" />}
                      />

                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden md:inline-flex rounded-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </Link>
            )}

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
                      <Link to="/doctor-dashboard" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/doctor-dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <FilePenLine className="w-4 h-4" /> {t.nav.doctorDashboard}
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                      <LogIn className="w-4 h-4" /> {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
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

function DesktopAccountLink({ to, label, active, icon, badge = null, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground'}`}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
