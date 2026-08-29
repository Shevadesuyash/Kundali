import React from 'react';
import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import {
  getGemCategory,
  getGemPurpose,
  getGemMetal,
  getGemFinger,
  getGemDayTime,
  getGemContraindication,
  getGemSafetyRule,
  getPrimaryGemName,
  getGemSubstitutes,
  getGemRudraksha,
} from '../utils/astroTranslations';
import './GemstonePanel.css';

/**
 * GemstonePanel — Displays personalized Life Stone, Fortune Stone,
 * Intellect Stone, Career Stone, metal/finger specifications, and Rudraksha guidance.
 */
export default function GemstonePanel({ data, recommendations: propRecs }) {
  const { lang } = useLang();
  if (!data && !propRecs) return null;

  const recommendations = data?.recommendations || propRecs || (Array.isArray(data) ? data : []);
  const general_safety = data?.general_safety || [];

  const titleText =
    lang === 'mr' ? 'रत्न व रुद्राक्ष शिफारसी' :
    lang === 'hi' ? 'रत्न एवं रुद्राक्ष परामर्श' :
    lang === 'gu' ? 'રત્ન અને રુદ્રાક્ષ માર્ગદર્શન' :
    'Gemstone & Rudraksha Recommendations';

  const subtitleText =
    lang === 'mr' ? 'लग्नेश, पंचमेश, भाग्येश आणि दशमेश यांच्या बळावर आधारित शास्त्रोक्त रत्न सल्ला.' :
    lang === 'hi' ? 'लग्नेश, पंचमेश, नवमेश एवं दशमेश के बल पर आधारित शास्त्रीय रत्न परामर्श।' :
    lang === 'gu' ? 'લગ્નેશ, પંચમેશ, ભાગ્યેશ અને દશમેશ પર આધારિત રત્ન સલાહ.' :
    'Based on your Lagna lord, 5th, 9th, and 10th functional house rulers with safety contraindications.';

  const metalLabel = lang === 'mr' ? 'योग्य धातू' : lang === 'hi' ? 'उपयुक्त धातु' : lang === 'gu' ? 'યોગ્ય ધાતુ' : 'Ideal Metal';
  const fingerLabel = lang === 'mr' ? 'बोट' : lang === 'hi' ? 'अंगुली' : lang === 'gu' ? 'આંગળી' : 'Finger';
  const weightLabel = lang === 'mr' ? 'वजन (कॅरट)' : lang === 'hi' ? 'वजन (कैरेट)' : lang === 'gu' ? 'વજન (કેરેટ)' : 'Weight';
  const wearingDayLabel = lang === 'mr' ? 'धारण वार/वेळ' : lang === 'hi' ? 'धारण दिन/समय' : lang === 'gu' ? 'ધારણ વાર/સમય' : 'Wearing Day';
  const alternateLabel = lang === 'mr' ? 'पर्यायी उप-रत्न:' : lang === 'hi' ? 'वैकल्पिक उप-रत्न:' : lang === 'gu' ? 'વૈકલ્પિક રત્ન:' : 'Alternate Stone:';
  const rudrakshaLabel = lang === 'mr' ? '📿 उपयुक्त रुद्राक्ष:' : lang === 'hi' ? '📿 अनुशंसित रुद्राक्ष:' : lang === 'gu' ? '📿 ભલામણ કરેલ રુદ્રાક્ષ:' : '📿 Recommended Rudraksha:';
  const mantraTitle = lang === 'mr' ? 'अभिमंत्रित प्राण-प्रतिष्ठा मंत्र' : lang === 'hi' ? 'प्राण-प्रतिष्ठा बीज मंत्र' : lang === 'gu' ? 'અભિમંત્રિત પ્રાણ-પ્રતિષ્ઠા મંત્ર' : 'Energizing Mantra';
  const safetyTitle = lang === 'mr' ? 'शास्त्रोक्त रत्न नियम व प्राण-प्रतिष्ठा विधी' : lang === 'hi' ? 'शास्त्रोक्त रत्न नियम एवं प्राण-प्रतिष्ठा विधि' : lang === 'gu' ? 'શાસ્ત્રોક્ત રત્ન નિયમો અને પ્રાણ-પ્રતિષ્ઠા વિધિ' : 'Classical Gemstone Rules & Prana Pratishtha';

  return (
    <section className="gemstone-panel" data-pdf-section="gemstones">
      <div className="gemstone-panel__title-wrap">
        <h3 className="gemstone-panel__title">
          <span>💎</span> {titleText}
        </h3>
        <p className="gemstone-panel__subtitle">{subtitleText}</p>
      </div>

      <div className="gemstones-grid">
        {recommendations.map((gem, idx) => (
          <div
            key={idx}
            className={`gemstone-card ${!gem.is_safe ? 'gemstone-card--caution' : ''}`}
          >
            <div className="gemstone-card__header">
              <div>
                <p className="gemstone-card__category">{getGemCategory(gem.category, lang)}</p>
                <h4 className="gemstone-card__gem-name">{getPrimaryGemName(gem.primary_gemstone, lang)}</h4>
                <p className="gemstone-card__purpose">{getGemPurpose(gem.purpose, lang)}</p>
              </div>
              <span className="gemstone-card__planet-pill">
                {planetName(gem.ruling_planet, lang)}
              </span>
            </div>

            {/* Contraindications if any */}
            {!gem.is_safe && gem.contraindications?.length > 0 && (
              <div className="gemstone-card__warning">
                <span>⚠️</span>
                <div>
                  <strong>{lang === 'mr' ? 'सावधगिरी:' : lang === 'hi' ? 'सावधानी:' : lang === 'gu' ? 'સાવચેતી:' : 'Precaution:'}</strong>{' '}
                  {gem.contraindications.map((c) => getGemContraindication(c, lang)).join(' ')}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="gemstone-card__specs">
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">{metalLabel}</span>
                <span className="gemstone-spec__val">{getGemMetal(gem.metal, lang)}</span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">{fingerLabel}</span>
                <span className="gemstone-spec__val">{getGemFinger(gem.finger, lang)}</span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">{weightLabel}</span>
                <span className="gemstone-spec__val">
                  {String(gem.carats).replace(/carats?/i, '').trim()} {lang === 'mr' || lang === 'hi' || lang === 'gu' ? 'कॅरट' : 'Carats'}
                </span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">{wearingDayLabel}</span>
                <span className="gemstone-spec__val">{getGemDayTime(gem.day_time || gem.wearing_day, lang)}</span>
              </div>
            </div>

            {/* Alternate Stones */}
            {(gem.substitute_gemstone || gem.substitute_gemstones) && (
              <div className="gemstone-card__substitutes">
                <span className="gemstone-substitutes-label">{alternateLabel}</span>
                <span className="gemstone-substitutes-val">{getGemSubstitutes(gem.substitute_gemstone || gem.substitute_gemstones, lang)}</span>
              </div>
            )}

            {/* Rudraksha Alternative */}
            {(gem.rudraksha || gem.rudraksha_recommendation) && (
              <div className="gemstone-card__rudraksha">
                <span className="gemstone-rudraksha-label">{rudrakshaLabel}</span>
                <span className="gemstone-rudraksha-val">{getGemRudraksha(gem.rudraksha || gem.rudraksha_recommendation, lang)}</span>
              </div>
            )}

            {/* Energization Mantra */}
            {gem.mantra && (
              <div className="gemstone-card__mantra">
                <span className="gemstone-mantra-label">{mantraTitle}</span>
                <p className="gemstone-mantra-text mono">{gem.mantra}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* General Safety Advisory */}
      {general_safety.length > 0 && (
        <div className="gemstone-safety-banner">
          <h4 className="gemstone-safety-title">
            <span>🛡️</span> {safetyTitle}
          </h4>
          <ul className="gemstone-safety-list">
            {general_safety.map((rule, idx) => (
              <li key={idx}>{getGemSafetyRule(rule, lang)}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
