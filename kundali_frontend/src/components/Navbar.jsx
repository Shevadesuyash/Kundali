import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SupportDeveloper from './SupportDeveloper';
import './Navbar.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const { user, isLoggedIn, signOut } = useAuth();
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
  const isAdmin = isLoggedIn && user && (
    user.id === 'local_test_user_1' ||
    (ADMIN_EMAIL && user.email === ADMIN_EMAIL) ||
    user.email === 'test@test.test'
  );
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          <NavLink to="/" className="navbar__brand">
            <span className="navbar__brand-mark">✦</span>
            <span>{t('nav.brand')}</span>
          </NavLink>
          <nav className="navbar__links">
            <NavLink to="/kundali"  className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.kundali')}</NavLink>
            <NavLink to="/match"    className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.match')}</NavLink>
            <NavLink to="/panchang" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.panchang')}</NavLink>
            <NavLink to="/profiles" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.profiles')}</NavLink>
            <NavLink to="/guide"    className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>📖 {t('nav.guide')}</NavLink>

            {/* 🛡️ Admin link — visible only to admin user */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}
                style={{ color: '#c8720a', fontWeight: '700' }}
                title="Admin Panel"
              >
                🛡️ Admin
              </NavLink>
            )}

            {/* ☕ Support Developer */}
            <button
              type="button"
              className="navbar__dev-btn"
              onClick={() => setShowSupportModal(true)}
              title="Support the Creator"
            >
              ☕ {lang === 'mr' ? 'सहकार्य' : 'Support'}
            </button>

            {/* 👤 Auth: User pill when logged in, Sign In link when guest */}
            {isLoggedIn ? (
              <div className="navbar__user-pill" title={user.email}>
                <span className="user-avatar">👤</span>
                <span className="user-email">{user.email?.split('@')[0]}</span>
                <button type="button" className="btn-signout" onClick={signOut} title="Sign Out">
                  🚪
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="navbar__login-btn">
                🔑 {lang === 'mr' ? 'लॉग इन' : 'Sign In'}
              </NavLink>
            )}

            {/* 🌐 Language selector */}
            <div className="lang-toggle" role="group" aria-label="Language">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-btn${lang === l.code ? ' is-active' : ''}`}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Support Developer Modal */}
      {showSupportModal && (
        <div className="auth-modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="auth-modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <SupportDeveloper onClose={() => setShowSupportModal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
