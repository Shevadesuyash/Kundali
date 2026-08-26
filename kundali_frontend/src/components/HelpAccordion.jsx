import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import './HelpAccordion.css';

/**
 * HelpAccordion — Expandable beginner-friendly guide card embedded at the top
 * of each tab or section. Explains what the metrics mean, how they are computed,
 * and how both beginners and astrologers can interpret them.
 */
export default function HelpAccordion({ id, title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { lang, t } = useLang();

  const toggleLabel = isOpen ? (
    lang === 'mr' ? '▲ मार्गदर्शन लपवा' :
    lang === 'hi' ? '▲ मार्गदर्शन छिपाएं' :
    lang === 'gu' ? '▲ માર્ગદર્શન છુપાવો' : '▲ Hide Beginner Guide'
  ) : (
    lang === 'mr' ? '▼ हे कसे समजून घ्यावे? (सविस्तर माहिती)' :
    lang === 'hi' ? '▼ इसे कैसे समझें? (विस्तृत जानकारी)' :
    lang === 'gu' ? '▼ આ કેવી રીતે સમજવું? (વિગતવાર માહિતી)' : '▼ How to read this? (Beginner & Astrologer Guide)'
  );

  return (
    <div className={`help-accordion ${isOpen ? 'is-open' : ''}`} data-help-id={id}>
      <div className="help-accordion__header" onClick={() => setIsOpen(!isOpen)}>
        <div className="help-accordion__title-wrap">
          <span className="help-accordion__icon">💡</span>
          <h4 className="help-accordion__title">{title}</h4>
        </div>
        <button
          type="button"
          className="help-accordion__toggle-btn"
          aria-expanded={isOpen}
        >
          {toggleLabel}
        </button>
      </div>

      {isOpen && (
        <div className="help-accordion__body">
          {children}
        </div>
      )}
    </div>
  );
}
