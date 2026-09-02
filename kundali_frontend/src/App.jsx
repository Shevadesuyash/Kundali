import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLang } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// ── Route-level code splitting (ISSUE-014) ──────────────────────────────────
// Each page is lazily loaded — only the current route's JS is downloaded.
// This breaks the 1.54 MB monolithic bundle into smaller per-route chunks.
const HomePage        = lazy(() => import('./pages/HomePage'));
const KundaliPage     = lazy(() => import('./pages/KundaliPage'));
const MatchPage       = lazy(() => import('./pages/MatchPage'));
const PanchangPage    = lazy(() => import('./pages/PanchangPage'));
const ProfilesPage    = lazy(() => import('./pages/ProfilesPage'));
const GuidePage       = lazy(() => import('./pages/GuidePage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));

/** Minimal loading indicator shown while lazy chunks are being fetched. */
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', color: 'var(--color-copper, #c8720a)', fontSize: '1.5rem',
    }}>
      🪐 Loading…
    </div>
  );
}

function AppFooter() {
  const { t } = useLang();
  return (
    <footer className="app-footer">
      <div className="container">
        <p>{t('footer.note')}</p>
      </div>
    </footer>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/kundali"      element={<KundaliPage />} />
            <Route path="/match"        element={<MatchPage />} />
            <Route path="/panchang"     element={<PanchangPage />} />
            <Route path="/profiles"     element={<ProfilesPage />} />
            <Route path="/guide"        element={<GuidePage />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/admin"        element={<AdminPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <AppFooter />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
  );
}
