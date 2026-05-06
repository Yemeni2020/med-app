import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { SavedArticlesProvider } from '@/lib/SavedArticlesContext';
import AppLayout from '@/components/layout/AppLayout';

import Home from '@/pages/Home';
import Articles from '@/pages/Articles';
import ArticleDetail from '@/pages/ArticleDetail';
import HealthTools from '@/pages/HealthTools';
import PatientStories from '@/pages/PatientStories';
import ExpertQA from '@/pages/ExpertQA';
import MedicalNews from '@/pages/MedicalNews';
import Guidelines from '@/pages/Guidelines';
import Doctors from '@/pages/Doctors';
import SavedArticles from '@/pages/SavedArticles';
import SymptomChecker from '@/pages/SymptomChecker';
import HealthDashboard from '@/pages/HealthDashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/health-tools" element={<HealthTools />} />
        <Route path="/stories" element={<PatientStories />} />
        <Route path="/qa" element={<ExpertQA />} />
        <Route path="/news" element={<MedicalNews />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/saved" element={<SavedArticles />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/dashboard" element={<HealthDashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
        <SavedArticlesProvider>
        <Router>
            <AuthenticatedApp />
          </Router>
          </SavedArticlesProvider>
          <Toaster />
          <Sonner richColors position="bottom-right" />
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App