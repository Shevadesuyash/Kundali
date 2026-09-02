import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SupportDeveloper from './SupportDeveloper';
import UserSettingsModal from './UserSettingsModal';
import WalletModal from './WalletModal';
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

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kundali.app';
  const isAdmin = isLoggedIn && user && (
    user.id === 'local_test_user_1' ||
    user.id === '425a7447-6bdb-4461-9d39-dda0fd4ed58f' ||
    user.email === 'admin@kundali.app' ||
    user.email === 'test@test.test' ||
    (ADMIN_EMAIL && user.email === ADMIN_EMAIL) ||
    user.app_metadata?.role === 'super_admin' ||
    user.app_metadata?.role === 'admin'
  );

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          {/* Brand */}
          <NavLink to="/" className="navbar__brand">
            <span className="navbar__brand-mark">✦</span>
            <span>{t('nav.brand')}</span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="navbar__links">
            <NavLink to="/kundali"  className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.kundali')}</NavLink>
            <NavLink to="/match"    className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.match')}</NavLink>
            <NavLink to="/panchang" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.panchang')}</NavLink>
            <NavLink to="/profiles" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>{t('nav.profiles')}</NavLink>
            <NavLink to="/guide"    className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>📖 {t('nav.guide')}</NavLink>

            {/* 🛡️ Admin Panel Link */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `navbar__link navbar__link--admin${isActive ? ' is-active' : ''}`}
                title="Admin Control Panel"
              >
                🛡️ Admin
              </NavLink>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="navbar__actions">
            {/* 🪙 Plans Button */}
            <button
              type="button"
              className="navbar__dev-btn navbar__plan-btn"
              onClick={() => setShowWalletModal(true)}
              title="Astro Wallet & Plans"
            >
              🪙 <span className="btn-text-desktop">{lang === 'mr' ? 'प्लॅन्स' : lang === 'hi' ? 'प्लान्स' : 'Plans'}</span>
            </button>

            {/* ☕ Support Button */}
            <button
              type="button"
              className="navbar__dev-btn"
              onClick={() => setShowSupportModal(true)}
              title="Support the Creator"
            >
              ☕ <span className="btn-text-desktop">{lang === 'mr' ? 'सहकार्य' : 'Support'}</span>
            </button>

            {/* 👤 Auth Pill or Sign In */}
            {isLoggedIn ? (
              <div className="navbar__user-pill" title={user.email}>
                <span className="user-avatar">👤</span>
                <span className="user-email">{user.email?.split('@')[0]}</span>
                <button
                  type="button"
                  className="btn-signout"
                  onClick={() => setShowSettingsModal(true)}
                  title="Account Settings / Change Password"
                >
                  ⚙️
                </button>
                <button
                  type="button"
                  className="btn-signout"
                  onClick={signOut}
                  title="Sign Out"
                >
                  🚪
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="navbar__link navbar__login-btn">
                🔑 <span>{lang === 'mr' ? 'लॉग इन' : lang === 'hi' ? 'लॉग इन' : 'Sign In'}</span>
              </NavLink>
            )}

            {/* 🌐 Language Switcher */}
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

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`navbar__hamburger${mobileMenuOpen ? ' is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="navbar__mobile-drawer">
            <nav className="navbar__mobile-nav">
              <NavLink to="/kundali"  onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link${isActive ? ' is-active' : ''}`}>{t('nav.kundali')}</NavLink>
              <NavLink to="/match"    onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link${isActive ? ' is-active' : ''}`}>{t('nav.match')}</NavLink>
              <NavLink to="/panchang" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link${isActive ? ' is-active' : ''}`}>{t('nav.panchang')}</NavLink>
              <NavLink to="/profiles" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link${isActive ? ' is-active' : ''}`}>{t('nav.profiles')}</NavLink>
              <NavLink to="/guide"    onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link${isActive ? ' is-active' : ''}`}>📖 {t('nav.guide')}</NavLink>

              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `navbar__mobile-link navbar__mobile-link--admin${isActive ? ' is-active' : ''}`}>
                  🛡️ Admin Panel
                </NavLink>
              )}
            </nav>

            <div className="navbar__mobile-actions">
              <button
                type="button"
                className="navbar__dev-btn navbar__plan-btn"
                onClick={() => { setMobileMenuOpen(false); setShowWalletModal(true); }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🪙 {lang === 'mr' ? 'प्लॅन्स आणि वॉलेट' : lang === 'hi' ? 'प्लान्स एवं वॉलेट' : 'Plans & Wallet'}
              </button>
              <button
                type="button"
                className="navbar__dev-btn"
                onClick={() => { setMobileMenuOpen(false); setShowSupportModal(true); }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                ☕ {lang === 'mr' ? 'सहकार्य' : 'Support Developer'}
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  className="navbar__dev-btn"
                  onClick={() => { setMobileMenuOpen(false); setShowSettingsModal(true); }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  ⚙️ {lang === 'mr' ? 'पासवर्ड बदला' : 'Change Password'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Support Developer Modal */}
      {showSupportModal && (
        <div className="auth-modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="auth-modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <SupportDeveloper onClose={() => setShowSupportModal(false)} />
          </div>
        </div>
      )}

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Wallet & Plans Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}

