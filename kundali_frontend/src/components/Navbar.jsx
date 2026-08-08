import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Navbar.css';

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

          {/* Language Toggle */}
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={`lang-btn${lang === 'en' ? ' is-active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn${lang === 'mr' ? ' is-active' : ''}`}
              onClick={() => setLang('mr')}
              aria-pressed={lang === 'mr'}
            >
              मराठी
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
