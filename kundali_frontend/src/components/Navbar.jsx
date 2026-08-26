import React from 'react';
import { NavLink } from 'react-router-dom';
import GoogleTranslate from './GoogleTranslate';
import { useLang } from '../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const { t } = useLang();

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
            Panchang
          </NavLink>
          <NavLink to="/profiles" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            Profiles
          </NavLink>
          <NavLink to="/guide" className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
            📖 Guide
          </NavLink>

          {/* Full-Site Real-Time Google Translation Bar */}
          <GoogleTranslate />
        </nav>
      </div>
    </header>
  );
}
