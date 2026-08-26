import React, { useEffect, useState } from 'react';
import './GoogleTranslate.css';

const POPULAR_LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

/**
 * GoogleTranslate — Integrates Google Translate Element Widget
 * to provide 100% full-site automatic translation across all pages,
 * tabs, charts, guides, and AI readings without codebase or database bloat.
 */
export default function GoogleTranslate() {
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    // Read existing cookie if set
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/i);
    if (match && match[1]) {
      setActiveLang(match[1]);
    }

    // Define the global Google Translate init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,mr,hi,gu,bn,ta,te,kn,pa,ml,sa,or,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (langCode) => {
    setActiveLang(langCode);

    // Set Google Translate cookie
    const cookieVal = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;

    // Trigger select change in Google combo if available
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="google-translate-wrapper">
      {/* Quick Access Language Pills */}
      <div className="gt-lang-pills" role="group" aria-label="Select Language">
        {POPULAR_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`gt-lang-btn${activeLang === lang.code ? ' is-active' : ''}`}
            onClick={() => changeLanguage(lang.code)}
            title={`Translate whole site to ${lang.label}`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Google Translate dropdown anchor */}
      <div id="google_translate_element" title="More languages via Google Translate"></div>
    </div>
  );
}
