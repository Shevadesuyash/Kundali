import React from 'react';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
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
          <p>KP System calculations not available for this chart.</p>
        </div>
      </div>
    );
  }

  const { cusps = [], planets = [], ruling_planets = {}, significators = [] } = kp;

  const guideTitle = lang === 'mr' ? 'केपी पद्धती (KP System) व सब लॉर्ड कसे समजून घ्यावे?' :
                     lang === 'hi' ? 'केपी पद्धति (KP System) और सब लॉर्ड को कैसे समझें?' :
                     lang === 'gu' ? 'કેપી પદ્ધતિ (KP System) અને સબ લોર્ડ કેવી રીતે સમજવું?' :
                     'How to Read Krishnamurti Paddhati (KP System) & Sub Lords';

  return (
    <div className="tab-panel kp-tab" data-pdf-section="kp-system">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="kp-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. प्लॅसिडस भाव संधि (Placidus Cusps)' : lang === 'hi' ? '१. प्लैसिडस भाव संधि (Placidus Cusps)' : lang === 'gu' ? '૧. પ્લેસિડસ ભાવ સંધિ' : '1. Placidus House Cusps'}</h5>
            <p>
              {lang === 'mr' ? 'केपी पद्धतीत प्रत्येक भावाची अचूक सुरुवात अंश-कला (Degrees) नुसार काढली जाते. यामुळे एकच ग्रह दोन भावांवर प्रभाव टाकू शकतो.' :
               lang === 'hi' ? 'केपी पद्धति में प्रत्येक भाव की शुरुआत सटीक डिग्री अनुसार होती है, जिससे ग्रह के वास्तविक कार्यात्मक भाव का पता चलता है।' :
               lang === 'gu' ? 'કેપી પદ્ધતિમાં દરેક ભાવની શરૂઆત ચોક્કસ ડિગ્રી મુજબ થાય છે, જે ચોક્કસ ફળકથન આપે છે.' :
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
              {lang === 'mr' ? 'कुंडली काढण्याच्या क्षणी चालू असणारे लग्न स्वामी, नक्षत्र स्वामी, चंद्र राशी स्वामी आणि वार स्वामी. हे तात्कालिक प्रश्न सोडवण्यात अचूक असतात.' :
               lang === 'hi' ? 'चार्ट समय के लग्न स्वामी, नक्षत्र स्वामी, चंद्र राशि स्वामी और दिन स्वामी। यह तात्कालिक घटनाओं के फलित में अचूक होते हैं।' :
               lang === 'gu' ? 'કુંડળી સમયે સક્રિય લગ્ન, નક્ષત્ર, ચંદ્ર રાશિ અને વાર સ્વામી, જે સચોટ માર્ગદર્શન આપે છે.' :
               'Instantaneous cosmic time rulers (Lagna & Moon Sign/Star Lords, Day Lord) used for precise event timing.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* 1. Ruling Planets (RP) Card */}
      <section className="kp-rp-card">
        <h4 className="kp-rp-title">
          <span>👑</span> KP Ruling Planets (RP)
        </h4>
        <div className="kp-rp-grid">
          <div className="kp-rp-item">
            <span className="kp-rp-label">Lagna Sign Lord</span>
            <span className="kp-rp-val">{ruling_planets.lagna_sign_lord || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Lagna Star Lord</span>
            <span className="kp-rp-val">{ruling_planets.lagna_star_lord || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Lagna Sub Lord</span>
            <span className="kp-rp-val" style={{ color: 'var(--color-copper, #c8720a)' }}>
              {ruling_planets.lagna_sub_lord || '—'}
            </span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Moon Sign Lord</span>
            <span className="kp-rp-val">{ruling_planets.moon_sign_lord || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Moon Star Lord</span>
            <span className="kp-rp-val">{ruling_planets.moon_star_lord || '—'}</span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Moon Sub Lord</span>
            <span className="kp-rp-val" style={{ color: 'var(--color-copper, #c8720a)' }}>
              {ruling_planets.moon_sub_lord || '—'}
            </span>
          </div>
          <div className="kp-rp-item">
            <span className="kp-rp-label">Day Lord (Vara)</span>
            <span className="kp-rp-val">{ruling_planets.day_lord || '—'}</span>
          </div>
        </div>
      </section>

      {/* 2. 12 Placidus Cusps Table */}
      <section className="kp-section">
        <h4 className="kp-section__title">12 Placidus House Cusps &amp; Lords</h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>Cusp</th>
                <th>Degree / Cusp Span</th>
                <th>Sign</th>
                <th>Sign Lord</th>
                <th>Star Lord</th>
                <th className="highlight-col">Sub Lord</th>
                <th>Sub-Sub</th>
              </tr>
            </thead>
            <tbody>
              {cusps.map((c) => (
                <tr key={c.house}>
                  <td className="mono">H{c.house}</td>
                  <td className="mono">{c.degree_str}</td>
                  <td>{c.sign}</td>
                  <td>{c.sign_lord}</td>
                  <td>{c.star_lord}</td>
                  <td className="highlight-col font-bold" style={{ color: 'var(--color-copper, #c8720a)' }}>
                    {c.sub_lord}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-text-dim)' }}>{c.sub_sub_lord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 9 Planets KP Table */}
      <section className="kp-section">
        <h4 className="kp-section__title">Planetary KP Positions &amp; Placidus House Occupancy</h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>Placidus House</th>
                <th>Sign</th>
                <th>Longitude</th>
                <th>Sign Lord</th>
                <th>Star Lord</th>
                <th className="highlight-col">Sub Lord</th>
                <th>Sub-Sub</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p) => (
                <tr key={p.planet}>
                  <td>
                    <strong>{p.planet}</strong> {(p.is_retrograde || p.retrograde) && <span style={{ color: '#b91c1c' }}>(R)</span>}
                  </td>
                  <td className="mono">House {p.placidus_house || p.house}</td>
                  <td>{p.sign}</td>
                  <td className="mono">{p.degree_str}</td>
                  <td>{p.sign_lord}</td>
                  <td>{p.star_lord}</td>
                  <td className="highlight-col font-bold" style={{ color: 'var(--color-copper, #c8720a)' }}>
                    {p.sub_lord}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-text-dim)' }}>{p.sub_sub_lord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 4-Fold House Significators */}
      <section className="kp-section">
        <h4 className="kp-section__title">4-Fold House Significators</h4>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>House</th>
                <th>Level 1 (In Star of Occupant)</th>
                <th>Level 2 (House Occupant)</th>
                <th>Level 3 (In Star of Cusp Lord)</th>
                <th>Level 4 (Cusp Lord)</th>
              </tr>
            </thead>
            <tbody>
              {significators.map((s) => {
                const l1 = s.level_1_star_of_occupant || s.level_1 || [];
                const l2 = s.level_2_occupant || s.level_2 || [];
                const l3 = s.level_3_star_of_lord || s.level_3 || [];
                const l4 = s.level_4_lord || s.level_4 || [];

                const formatSignif = (val) => {
                  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
                  return val || '—';
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
