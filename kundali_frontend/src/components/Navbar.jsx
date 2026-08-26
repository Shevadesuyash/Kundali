import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Navbar.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export default function Navbar() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__brand-mark">✦</span>
          <span>{t('nav.brand')}</span>
        </NavLink>
        <nav className="navbar__links">
          <NavLink to="/kundali" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            {t('nav.kundali')}
          </NavLink>
          <NavLink to="/match" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            {t('nav.match')}
          </NavLink>
          <NavLink to="/panchang" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            {t('nav.panchang')}
          </NavLink>
          <NavLink to="/profiles" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            {t('nav.profiles')}
          </NavLink>
          <NavLink to="/guide" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            📖 {t('nav.guide')}
          </NavLink>

          {/* Clean Native Vedic Multi-Language Selector */}
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
  );
}
