import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';
import Footer from './Footer';
import MedicalAssistant from './MedicalAssistant';
import { useLanguage } from '@/lib/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const INITIAL_LOAD_MS = 900;
const ROUTE_LOAD_MS = 450;

function PageSkeleton({ label }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-10 w-72 max-w-full rounded-xl" />
        <Skeleton className="h-5 w-[32rem] max-w-full rounded-xl" />
      </div>

      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-10 w-28 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-7 w-5/6 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AppLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);
  const timeoutRef = useRef(null);
  const firstLoadRef = useRef(true);
  const assistantEnabled = import.meta.env.VITE_DISABLE_MEDICAL_ASSISTANT !== 'true';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setPageLoading(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setPageLoading(false);
      firstLoadRef.current = false;
    }, firstLoadRef.current ? INITIAL_LOAD_MS : ROUTE_LOAD_MS);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">
        {pageLoading ? <PageSkeleton label={t.common.loading} /> : <Outlet />}
      </main>
      <Footer />
      <BottomNavbar />
      {assistantEnabled ? <MedicalAssistant /> : null}
      
    </div>
  );
}
