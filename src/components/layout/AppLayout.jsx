import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import MedicalAssistant from './MedicalAssistant';
import { useLanguage } from '@/lib/LanguageContext';

const INITIAL_LOAD_MS = 900;
const ROUTE_LOAD_MS = 450;

function PageLoadingOverlay({ visible, label }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-white/82 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-14 w-14">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-slate-200"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              />
            </div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function AppLayout() {
  const { t } = useLanguage();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);
  const timeoutRef = useRef(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
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
      <PageLoadingOverlay visible={pageLoading} label={t.common.loading} />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MedicalAssistant />
    </div>
  );
}
