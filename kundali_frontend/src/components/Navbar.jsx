import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="navbar-wrapper">
        <div className="navbar-container">
          {/* Brand */}
          <NavLink to="/" className="navbar-brand">
            <span className="brand-icon">✦</span>
            <span className="brand-text">{t('nav.brand')}</span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav-links">
            <NavLink to="/kundali"  className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>{t('nav.kundali')}</NavLink>
            <NavLink to="/match"    className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>{t('nav.match')}</NavLink>
            <NavLink to="/panchang" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>{t('nav.panchang')}</NavLink>
            <NavLink to="/profiles" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>{t('nav.profiles')}</NavLink>
            <NavLink to="/guide"    className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>📖 {t('nav.guide')}</NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item nav-item--admin${isActive ? ' is-active' : ''}`}
                title="Admin Control Panel"
              >
                🛡️ Admin
              </NavLink>
            )}
          </nav>

          {/* Action Cluster */}
          <div className="navbar-actions">
            {/* Wallet / Pricing Button */}
            <button
              type="button"
              className="action-btn action-btn--wallet"
              onClick={() => setShowWalletModal(true)}
              title="Astro Wallet & Question Plans"
            >
              🪙 <span className="btn-label-desktop">{lang === 'mr' ? 'प्लॅन्स' : lang === 'hi' ? 'प्लान्स' : 'Plans'}</span>
            </button>

            {/* Support Creator */}
            <button
              type="button"
              className="action-btn action-btn--support"
              onClick={() => setShowSupportModal(true)}
              title="Support the Creator"
            >
              ☕ <span className="btn-label-desktop">{lang === 'mr' ? 'सहकार्य' : lang === 'hi' ? 'सहयोग' : 'Support'}</span>
            </button>

            {/* Language Selector (Desktop) */}
            <div className="lang-switcher" role="group" aria-label="Language Selector">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-pill${lang === l.code ? ' is-active' : ''}`}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Auth Pill or Login Button */}
            {isLoggedIn ? (
              <div className="user-pill-container" title={user.email}>
                <span className="user-icon">👤</span>
                <span className="user-name">{user.email?.split('@')[0]}</span>
                <button
                  type="button"
                  className="user-pill-btn"
                  onClick={() => setShowSettingsModal(true)}
                  title="Account Settings / Change Password"
                >
                  ⚙️
                </button>
                <button
                  type="button"
                  className="user-pill-btn"
                  onClick={signOut}
                  title="Sign Out"
                >
                  🚪
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="action-btn action-btn--login">
                🔑 <span className="btn-label-desktop">{lang === 'mr' ? 'लॉग इन' : lang === 'hi' ? 'लॉग इन' : 'Sign In'}</span>
              </NavLink>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`hamburger-toggle${mobileMenuOpen ? ' is-open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <nav className="mobile-nav-links">
              <NavLink to="/kundali"  className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}>{t('nav.kundali')}</NavLink>
              <NavLink to="/match"    className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}>{t('nav.match')}</NavLink>
              <NavLink to="/panchang" className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}>{t('nav.panchang')}</NavLink>
              <NavLink to="/profiles" className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}>{t('nav.profiles')}</NavLink>
              <NavLink to="/guide"    className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}>📖 {t('nav.guide')}</NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `mobile-nav-item mobile-nav-item--admin${isActive ? ' is-active' : ''}`}>
                  🛡️ Admin Control Panel
                </NavLink>
              )}
            </nav>

            <div className="mobile-drawer-actions">
              <button
                type="button"
                className="action-btn action-btn--wallet mobile-action-btn"
                onClick={() => { setMobileMenuOpen(false); setShowWalletModal(true); }}
              >
                🪙 {lang === 'mr' ? 'प्लॅन्स आणि वॉलेट' : lang === 'hi' ? 'प्लान्स एवं वॉलेट' : 'Plans & Wallet'}
              </button>
              <button
                type="button"
                className="action-btn action-btn--support mobile-action-btn"
                onClick={() => { setMobileMenuOpen(false); setShowSupportModal(true); }}
              >
                ☕ {lang === 'mr' ? 'सहकार्य' : lang === 'hi' ? 'सहयोग' : 'Support Creator'}
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  className="action-btn mobile-action-btn"
                  onClick={() => { setMobileMenuOpen(false); setShowSettingsModal(true); }}
                >
                  ⚙️ {lang === 'mr' ? 'पासवर्ड बदला' : lang === 'hi' ? 'पासवर्ड बदलें' : 'Change Password'}
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
