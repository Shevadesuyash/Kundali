import React from 'react';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import { planetName, signName } from '../../utils/i18n';
import './KPTab.css';
import './tabs.css';

/**
 * KPTab — Krishnamurti Paddhati (KP System) analysis panel.
 * Displays:
 * 1. Ruling Planets (RP) at chart time
 * 2. 12 Placidus Cusps with Sign Lord, Star Lord, Sub Lord & Sub-Sub Lord
 * 3. 9 Planets KP Table & Placidus House Occupancy
 * 4. 4-Fold House Significators
 * 5. Interactive Beginner & Astrologer Guide
 */
export default function KPTab({ report }) {
  const { kp } = report;
  const { lang, t } = useLang();

  if (!kp) {
    return (
      <div className="tab-panel" data-pdf-section="kp-system">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-dim)' }}>
          <p>{lang === 'mr' ? 'या कुंडलीसाठी केपी पद्धती गणना उपलब्ध नाही.' : lang === 'hi' ? 'इस कुंडली के लिए केपी गणना उपलब्ध नहीं है।' : lang === 'gu' ? 'આ કુંડળી માટે કેપી ગણતરી ઉપલબ્ધ નથી.' : 'KP System calculations not available for this chart.'}</p>
        </div>
      </div>
    );
  }

  const { cusps = [], planets = [], ruling_planets = {}, significators = [] } = kp;

  const guideTitle = lang === 'mr' ? 'केपी पद्धती (KP System) व सब लॉर्ड कसे समजून घ्यावे?' :
                     lang === 'hi' ? 'केपी पद्धति (KP System) और सब लॉर्ड को कैसे समझें?' :
                     lang === 'gu' ? 'કેપી પદ્ધતિ (KP System) અને સબ લોર્ડ કેવી રીતે સમજવું?' :
                     'How to Read Krishnamurti Paddhati (KP System) & Sub Lords';

  const rpTitle = lang === 'mr' ? 'केपी रूलिंग प्लॅनेट्स (RP — मार्गदर्शक ग्रह)' :
                  lang === 'hi' ? 'केपी रूलिंग प्लैनेट्स (RP — मार्गदर्शक ग्रह)' :
                  lang === 'gu' ? 'કેપી રૂલિંગ પ્લેનેટ્સ (RP — માર્ગદર્શક ગ્રહ)' :
                  'KP Ruling Planets (RP)';

  return (
    <div className="tab-panel kp-tab" data-pdf-section="kp-system">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="kp-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. प्लॅसिडस भाव संधि (Placidus Cusps)' : lang === 'hi' ? '१. प्लैसिडस भाव संधि (Placidus Cusps)' : lang === 'gu' ? '૧. પ્લેસિડસ ભાવ સંધિ' : '1. Placidus House Cusps'}</h5>
            <p>
              {lang === 'mr' ? 'केपी पद्धतीत प्रत्येक भावाची अचूक सुरुवात अंश-कला (Degrees) नुसार काढली जाते. यामुळे ग्रहाचा अचूक कार्यात्मक भाव स्पष्ट होतो.' :
               lang === 'hi' ? 'केपी पद्धति में प्रत्येक भाव की शुरुआत सटीक डिग्री अनुसार होती है, जिससे ग्रह के वास्तविक कार्यात्मक भाव का पता चलता है।' :
               lang === 'gu' ? 'કેપી પદ્ધતિમાં દરેક ભાવની શરૂઆત ચોક્કસ ડિગ્રી મુજબ થાય છે.' :
               'Calculates unequal house boundaries with mathematical precision rather than standard 30-degree signs.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. सब लॉर्ड (Sub Lord — उपस्वामी)' : lang === 'hi' ? '२. सब लॉर्ड (Sub Lord — उपस्वामी)' : lang === 'gu' ? '૨. સબ લોર્ડ (ઉપસ્વામી)' : '2. KP Sub Lord Concept'}</h5>
            <p>
              {lang === 'mr' ? 'ग्रहाचा नक्षत्र स्वामी (Star Lord) फळाचा प्रकार ठरवतो, तर सब लॉर्ड (Sub Lord) ते कार्य यशस्वी होणार की नाही हे अंतिम ठरवतो.' :
               lang === 'hi' ? 'ग्रह का नक्षत्र स्वामी परिणाम का विषय बताता है, जबकि सब लॉर्ड (Sub Lord) यह तय करता है कि कार्य सिद्ध होगा या नहीं।' :
               lang === 'gu' ? 'ગ્રહનો નક્ષત્ર સ્વામી વિષય દર્શાવે છે, જ્યારે સબ લોર્ડ કાર્યની સફળતા કે નિષ્ફળતા નક્કી કરે છે.' :
               'Star Lord indicates the nature of the event; the Sub Lord delivers the final Yes/No verdict.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. रूलिंग प्लॅनेट्स (Ruling Planets - RP)' : lang === 'hi' ? '३. रूलिंग प्लैनेट्स (Ruling Planets - RP)' : lang === 'gu' ? '૩. રૂલિંગ પ્લેનેટ્સ (RP)' : '3. Ruling Planets (RP)'}</h5>
            <p>
              {lang === 'mr' ? 'कुंडली काढण्याच्या क्षणी चालू असणारे लग्न स्वामी, नक्षत्र स्वामी, चंद्र राशी स्वामी आणि वार स्वामी.' :
               lang === 'hi' ? 'चार्ट समय के लग्न स्वामी, नक्षत्र स्वामी, चंद्र राशि स्वामी और दिन स्वामी।' :
               lang === 'gu' ? 'કુંડળી સમયે સક્રિય લગ્ન, નક્ષત્ર, ચંદ્ર રાશિ અને વાર સ્વામી.' :
               'Instantaneous cosmic time rulers (Lagna & Moon Sign/Star Lords, Day Lord) used for precise event timing.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* 1. Ruling Planets (RP) Card */}
      <section className="kp-rp-card">
        <h4 className="kp-rp-title">
          <span>👑</span> {rpTitle}
        </h4>
        <div className="kp-rp-grid">
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'लग्न राशी स्वामी' : lang === 'hi' ? 'लग्न राशि स्वामी' : lang === 'gu' ? 'લગ્ન રાશિ સ્વામી' : 'Lagna Sign Lord'}</span>
            <span className="kp-rp-val">{planetName(ruling_planets.lagna_sign_lord, lang) || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'लग्न नक्षत्र स्वामी' : lang === 'hi' ? 'लग्न नक्षत्र स्वामी' : lang === 'gu' ? 'લગ્ન નક્ષત્ર સ્વામી' : 'Lagna Star Lord'}</span>
            <span className="kp-rp-val">{planetName(ruling_planets.lagna_star_lord, lang) || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'लग्न सब लॉर्ड' : lang === 'hi' ? 'लग्न सब लॉर्ड' : lang === 'gu' ? 'લગ્ન સબ લોર્ડ' : 'Lagna Sub Lord'}</span>
            <span className="kp-rp-val" style={{ color: 'var(--color-copper, #c8720a)' }}>
              {planetName(ruling_planets.lagna_sub_lord, lang) || '—'}
            </span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'चंद्र राशी स्वामी' : lang === 'hi' ? 'चंद्र राशि स्वामी' : lang === 'gu' ? 'ચંદ્ર રાશિ સ્વામી' : 'Moon Sign Lord'}</span>
            <span className="kp-rp-val">{planetName(ruling_planets.moon_sign_lord, lang) || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'चंद्र नक्षत्र स्वामी' : lang === 'hi' ? 'चंद्र नक्षत्र स्वामी' : lang === 'gu' ? 'ચંદ્ર નક્ષત્ર સ્વામી' : 'Moon Star Lord'}</span>
            <span className="kp-rp-val">{planetName(ruling_planets.moon_star_lord, lang) || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'चंद्र सब लॉर्ड' : lang === 'hi' ? 'चंद्र सब लॉर्ड' : lang === 'gu' ? 'ચંદ્ર સબ લોર્ડ' : 'Moon Sub Lord'}</span>
            <span className="kp-rp-val" style={{ color: 'var(--color-copper, #c8720a)' }}>
              {planetName(ruling_planets.moon_sub_lord, lang) || '—'}
            </span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">{lang === 'mr' ? 'वार स्वामी' : lang === 'hi' ? 'वार स्वामी' : lang === 'gu' ? 'વાર સ્વામી' : 'Day Lord (Vara)'}</span>
            <span className="kp-rp-val">{planetName(ruling_planets.day_lord, lang) || '—'}</span>
          </div>
        </div>
      </section>

      {/* 2. 12 Placidus Cusps Table */}
      <section className="kp-section">
        <h4 className="kp-section__title">
          {lang === 'mr' ? '१२ प्लॅसिडस भाव संधि आणि स्वामी' : lang === 'hi' ? '१२ प्लैसिडस भाव संधि एवं स्वामी' : lang === 'gu' ? '૧૨ પ્લેસિડસ ભાવ સંધિ અને સ્વામી' : '12 Placidus House Cusps & Lords'}
        </h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>{lang === 'mr' ? 'भाव' : lang === 'hi' ? 'भाव' : lang === 'gu' ? 'ભાવ' : 'Cusp'}</th>
                <th>{lang === 'mr' ? 'अंश विस्तार' : lang === 'hi' ? 'अंश विस्तार' : lang === 'gu' ? 'અંશ વિસ્તાર' : 'Degree / Cusp Span'}</th>
                <th>{lang === 'mr' ? 'राशी' : lang === 'hi' ? 'राशि' : lang === 'gu' ? 'રાશિ' : 'Sign'}</th>
                <th>{lang === 'mr' ? 'राशी स्वामी' : lang === 'hi' ? 'राशि स्वामी' : lang === 'gu' ? 'રાશિ સ્વામી' : 'Sign Lord'}</th>
                <th>{lang === 'mr' ? 'नक्षत्र स्वामी' : lang === 'hi' ? 'नक्षत्र स्वामी' : lang === 'gu' ? 'નક્ષત્ર સ્વામી' : 'Star Lord'}</th>
                <th className="highlight-col">{lang === 'mr' ? 'सब लॉर्ड' : lang === 'hi' ? 'सब लॉर्ड' : lang === 'gu' ? 'સબ લોર્ડ' : 'Sub Lord'}</th>
                <th>{lang === 'mr' ? 'सब-सब' : lang === 'hi' ? 'सब-सब' : lang === 'gu' ? 'સબ-સબ' : 'Sub-Sub'}</th>
              </tr>
            </thead>
            <tbody>
              {cusps.map((c) => (
                <tr key={c.house}>
                  <td className="mono">H{c.house}</td>
                  <td className="mono">{c.degree_str}</td>
                  <td>{signName(c.sign, lang)}</td>
                  <td>{planetName(c.sign_lord, lang)}</td>
                  <td>{planetName(c.star_lord, lang)}</td>
                  <td className="highlight-col font-bold" style={{ color: 'var(--color-copper, #c8720a)' }}>
                    {planetName(c.sub_lord, lang)}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-text-dim)' }}>{planetName(c.sub_sub_lord, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 9 Planets KP Table */}
      <section className="kp-section">
        <h4 className="kp-section__title">
          {lang === 'mr' ? 'ग्रहांची केपी स्थिती व भाव व्याप्ती' : lang === 'hi' ? 'ग्रहों की केपी स्थिति एवं भाव व्याप्ति' : lang === 'gu' ? 'ગ્રહોની કેપી સ્થિતિ અને ભાવ વ્યાપ્તિ' : 'Planetary KP Positions & Placidus House Occupancy'}
        </h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>{lang === 'mr' ? 'ग्रह' : lang === 'hi' ? 'ग्रह' : lang === 'gu' ? 'ગ્રહ' : 'Planet'}</th>
                <th>{lang === 'mr' ? 'प्लॅसिडस भाव' : lang === 'hi' ? 'प्लैसिडस भाव' : lang === 'gu' ? 'પ્લેસિડસ ભાવ' : 'Placidus House'}</th>
                <th>{lang === 'mr' ? 'राशी' : lang === 'hi' ? 'राशि' : lang === 'gu' ? 'રાશિ' : 'Sign'}</th>
                <th>{lang === 'mr' ? 'रेखांश' : lang === 'hi' ? 'रेखांश' : lang === 'gu' ? 'રેખાંશ' : 'Longitude'}</th>
                <th>{lang === 'mr' ? 'राशी स्वामी' : lang === 'hi' ? 'राशि स्वामी' : lang === 'gu' ? 'રાશિ સ્વામી' : 'Sign Lord'}</th>
                <th>{lang === 'mr' ? 'नक्षत्र स्वामी' : lang === 'hi' ? 'नक्षत्र स्वामी' : lang === 'gu' ? 'નક્ષત્ર સ્વામી' : 'Star Lord'}</th>
                <th className="highlight-col">{lang === 'mr' ? 'सब लॉर्ड' : lang === 'hi' ? 'सब लॉर्ड' : lang === 'gu' ? 'સબ લોર્ડ' : 'Sub Lord'}</th>
                <th>{lang === 'mr' ? 'सब-सब' : lang === 'hi' ? 'सब-सब' : lang === 'gu' ? 'સબ-સબ' : 'Sub-Sub'}</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p) => (
                <tr key={p.planet}>
                  <td>
                    <strong>{planetName(p.planet, lang)}</strong> {(p.is_retrograde || p.retrograde) && <span style={{ color: '#b91c1c' }}>({lang === 'mr' ? 'व' : 'R'})</span>}
                  </td>
                  <td className="mono">{lang === 'mr' ? `भाव ${p.placidus_house || p.house}` : lang === 'hi' ? `भाव ${p.placidus_house || p.house}` : lang === 'gu' ? `${p.placidus_house || p.house}મો ભાવ` : `House ${p.placidus_house || p.house}`}</td>
                  <td>{signName(p.sign, lang)}</td>
                  <td className="mono">{p.degree_str}</td>
                  <td>{planetName(p.sign_lord, lang)}</td>
                  <td>{planetName(p.star_lord, lang)}</td>
                  <td className="highlight-col font-bold" style={{ color: 'var(--color-copper, #c8720a)' }}>
                    {planetName(p.sub_lord, lang)}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-text-dim)' }}>{planetName(p.sub_sub_lord, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 4-Fold House Significators */}
      <section className="kp-section">
        <h4 className="kp-section__title">
          {lang === 'mr' ? '४-स्तरीय भाव कारकत्व (४-Fold Significators)' : lang === 'hi' ? '४-स्तरीय भाव कारकत्व (४-Fold Significators)' : lang === 'gu' ? '૪-સ્તરીય ભાવ કારકત્વ' : '4-Fold House Significators'}
        </h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>{lang === 'mr' ? 'भाव' : lang === 'hi' ? 'भाव' : lang === 'gu' ? 'ભાવ' : 'House'}</th>
                <th>{lang === 'mr' ? 'स्तर १ (भावस्थाच्या नक्षत्रात)' : lang === 'hi' ? 'स्तर १ (भावस्थ के नक्षत्र में)' : lang === 'gu' ? 'સ્તર ૧ (નક્ષત્રમાં)' : 'Level 1 (In Star of Occupant)'}</th>
                <th>{lang === 'mr' ? 'स्तर २ (भावात स्थित)' : lang === 'hi' ? 'स्तर २ (भाव में स्थित)' : lang === 'gu' ? 'સ્તર ૨ (સ્થિત ગ્રહ)' : 'Level 2 (House Occupant)'}</th>
                <th>{lang === 'mr' ? 'स्तर ३ (भावेशाच्या नक्षत्रात)' : lang === 'hi' ? 'स्तर ३ (भावेश के नक्षत्र में)' : lang === 'gu' ? 'સ્તર ૩ (ભાવેશના નક્ષત્રમાં)' : 'Level 3 (In Star of Cusp Lord)'}</th>
                <th>{lang === 'mr' ? 'स्तर ४ (भावेश स्वामी)' : lang === 'hi' ? 'स्तर ४ (भावेश स्वामी)' : lang === 'gu' ? 'સ્તર ૪ (ભાવેશ)' : 'Level 4 (Cusp Lord)'}</th>
              </tr>
            </thead>
            <tbody>
              {significators.map((s) => {
                const l1 = s.level_1_star_of_occupant || s.level_1 || [];
                const l2 = s.level_2_occupant || s.level_2 || [];
                const l3 = s.level_3_star_of_lord || s.level_3 || [];
                const l4 = s.level_4_lord || s.level_4 || [];

                const formatSignif = (val) => {
                  if (Array.isArray(val)) return val.length ? val.map((p) => planetName(p, lang)).join(', ') : '—';
                  return val ? planetName(val, lang) : '—';
                };

                return (
                  <tr key={s.house}>
                    <td className="mono">H{s.house}</td>
                    <td>{formatSignif(l1)}</td>
                    <td>{formatSignif(l2)}</td>
                    <td>{formatSignif(l3)}</td>
                    <td><strong>{formatSignif(l4)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
