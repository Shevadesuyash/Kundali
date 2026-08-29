import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLang } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import KundaliPage from './pages/KundaliPage';
import MatchPage from './pages/MatchPage';
import ProfilesPage from './pages/ProfilesPage';
import PanchangPage from './pages/PanchangPage';
import GuidePage from './pages/GuidePage';

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
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/kundali"  element={<KundaliPage />} />
          <Route path="/match"    element={<MatchPage />} />
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/guide"    element={<GuidePage />} />
        </Routes>
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
