import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { SavedArticlesProvider } from '@/lib/SavedArticlesContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { UserProfileProvider } from '@/lib/UserProfileContext';
import { CookieConsentProvider } from '@/lib/CookieConsentContext';
import AppLayout from '@/components/layout/AppLayout';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import ConsentTrackers from '@/components/layout/ConsentTrackers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserTourProvider } from '@/components/tour/UserTourProvider';

import Home from '@/pages/Home';
import Articles from '@/pages/Articles';
import ArticleDetail from '@/pages/ArticleDetail';
import HealthTools from '@/pages/HealthTools';
import PatientStories from '@/pages/PatientStories';
import ExpertQA from '@/pages/ExpertQA';
import MedicalNews from '@/pages/MedicalNews';
import Guidelines from '@/pages/Guidelines';
import Doctors from '@/pages/Doctors';
import DoctorDetail from '@/pages/DoctorDetail';
import LegalPage from '@/pages/LegalPage';
import SavedArticles from '@/pages/SavedArticles';
import SymptomChecker from '@/pages/SymptomChecker';
import HealthDashboard from '@/pages/HealthDashboard';
import HealthInsights from '@/pages/HealthInsights';
import AdminKnowledgeBase from '@/pages/AdminKnowledgeBase';
import AdminReviews from '@/pages/AdminReviews';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserProfile from '@/pages/UserProfile';
import DoctorDashboard from '@/pages/DoctorDashboard';
import PatientStoryDetail from '@/pages/PatientStoryDetail';

const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
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
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/stories/:id" element={<PatientStoryDetail />} />
        <Route path="/policy" element={<LegalPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/saved" element={<SavedArticles />} />
          <Route path="/dashboard" element={<HealthDashboard />} />
          <Route path="/health-insights" element={<HealthInsights />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ThemeProvider>
          <UserProfileProvider>
            <LanguageProvider>
              <CookieConsentProvider>
                <SavedArticlesProvider>
                  <Router>
                    <UserTourProvider>
                      <AuthenticatedApp />
                    </UserTourProvider>
                  </Router>
                </SavedArticlesProvider>
                <ConsentTrackers />
                <CookieConsentBanner />
              </CookieConsentProvider>
            </LanguageProvider>
          </UserProfileProvider>
          <Toaster />
          <Sonner richColors position="bottom-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
