import React from 'react';
import { useLang } from '../context/LanguageContext';
import { GUIDE_CONTENT } from '../utils/guideTranslations';
import './GuidePage.css';

/**
 * GuidePage — Comprehensive Vedic Astrology Knowledge Center & Reference.
 * Provides 100% localized reference guides in English, Marathi, Hindi, and Gujarati.
 */
export default function GuidePage() {
  const { lang } = useLang();
  const h = GUIDE_CONTENT.header;
  const n = GUIDE_CONTENT.nav;

  return (
    <main className="container guide-page">
      {/* Header */}
      <header className="guide-header">
        <p className="eyebrow">{h.eyebrow[lang] || h.eyebrow.en}</p>
        <h1 className="guide-title">{h.title[lang] || h.title.en}</h1>
        <p className="guide-intro">{h.intro[lang] || h.intro.en}</p>
      </header>

      {/* Anchor Navigation Bar */}
      <nav className="guide-nav-bar" aria-label="Guide topics">
        <a href="#houses" className="guide-nav-link">{n.houses[lang] || n.houses.en}</a>
        <a href="#planets" className="guide-nav-link">{n.planets[lang] || n.planets.en}</a>
        <a href="#ashtakvarga" className="guide-nav-link">{n.ashtakvarga[lang] || n.ashtakvarga.en}</a>
        <a href="#dashas" className="guide-nav-link">{n.dashas[lang] || n.dashas.en}</a>
        <a href="#matchmaking" className="guide-nav-link">{n.matchmaking[lang] || n.matchmaking.en}</a>
        <a href="#doshas" className="guide-nav-link">{n.doshas[lang] || n.doshas.en}</a>
      </nav>

      {/* Section 1: The 12 Houses */}
      <section id="houses" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>🏠</span> {n.houses[lang] || n.houses.en}
          </h2>
          <span className="guide-section-badge">{lang === 'mr' ? 'मूलभूत पाया' : lang === 'hi' ? 'मूल आधार' : lang === 'gu' ? 'મૂળ આધાર' : 'Foundations'}</span>
        </div>
        <p className="guide-text">
          {lang === 'mr' ? 'वैदिक ज्योतिष शास्त्रानुसार (पाराशरी पद्धत) जन्मकुंडली १२ भावात (स्थानांत) विभागलेली असते. पूर्व क्षितिजावर जन्मसमयी उदित होणारी राशी म्हणजेच आपले लग्न (१ ला भाव) होय.' :
           lang === 'hi' ? 'वैदिक ज्योतिष (पाराशरी प्रणाली) के अनुसार जन्म कुंडली १२ भावों (स्थानों) में विभाजित होती है। जन्म के समय पूर्वी क्षितिज पर उदित राशि को लग्न (प्रथम भाव) कहा जाता है।' :
           lang === 'gu' ? 'વૈદિક જ્યોતિષ મુજબ જન્મકુંડળી ૧૨ ભાવોમાં વિભાજિત હોય છે. જન્મ સમયે પૂર્વ ક્ષિતિજ પર ઉદિત રાશિને લગ્ન કહે છે.' :
           'In Vedic astrology (Parashari system), your Kundali is divided into 12 Bhavas (houses) beginning from your Ascendant (Lagna), which is the exact zodiac constellation rising on the eastern horizon at your birth moment.'}
        </p>
        <div className="guide-table-wrapper">
          <table className="guide-table">
            <thead>
              <tr>
                <th>{lang === 'mr' ? 'भाव' : lang === 'hi' ? 'भाव' : lang === 'gu' ? 'ભાવ' : 'House'}</th>
                <th>{lang === 'mr' ? 'संस्कृत नाव' : lang === 'hi' ? 'संस्कृत नाम' : lang === 'gu' ? 'સંસ્કૃત નામ' : 'Sanskrit Name'}</th>
                <th>{lang === 'mr' ? 'प्रकार / वर्गीकरण' : lang === 'hi' ? 'वर्गीकरण' : lang === 'gu' ? 'વર્ગીકરણ' : 'Classification'}</th>
                <th>{lang === 'mr' ? 'मुख्य कारकत्व व जीवन क्षेत्र' : lang === 'hi' ? 'मुख्य कारकत्व एवं जीवन क्षेत्र' : lang === 'gu' ? 'મુખ્ય કારકત્વ અને ક્ષેત્ર' : 'Key Life Domains & Significations'}</th>
                <th>{lang === 'mr' ? 'कारक ग्रह' : lang === 'hi' ? 'कारक ग्रह' : lang === 'gu' ? 'કારક ગ્રહ' : 'Karaka (Significator)'}</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_CONTENT.houses.map((house) => (
                <tr key={house.num}>
                  <td><strong>{lang === 'mr' ? `${house.num} ला भाव` : lang === 'hi' ? `${house.num}वां भाव` : lang === 'gu' ? `${house.num}મો ભાવ` : `${house.num} House`}</strong></td>
                  <td>{house.sanskrit[lang] || house.sanskrit.en}</td>
                  <td>{house.type[lang] || house.type.en}</td>
                  <td>{house.significations[lang] || house.significations.en}</td>
                  <td>{house.karaka[lang] || house.karaka.en}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: The 9 Grahas */}
      <section id="planets" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>🪐</span> 2. The 9 Grahas (Planetary Forces)
          </h2>
          <span className="guide-section-badge">Planetary Forces</span>
        </div>
        <p className="guide-text">
          Vedic astrology utilizes the <strong>Navagrahas</strong> (7 physical celestial bodies + 2 lunar shadow nodes Rahu and Ketu). Every planet possesses natural inclinations (Benefic or Malefic) and specific exaltation/debilitation points.
        </p>
        <div className="guide-table-wrapper">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Planet (Graha)</th>
                <th>Nature</th>
                <th>Rulership Signs</th>
                <th>Exalted In (Ucha)</th>
                <th>Debilitated In (Neecha)</th>
                <th>Core Significance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sun (Surya)</strong></td>
                <td>Mild Malefic (Krupa)</td>
                <td>Leo</td>
                <td>Aries (10°)</td>
                <td>Libra (10°)</td>
                <td>Soul (Atma), authority, leadership, father, vitality</td>
              </tr>
              <tr>
                <td><strong>Moon (Chandra)</strong></td>
                <td>Benefic (when waxing)</td>
                <td>Cancer</td>
                <td>Taurus (3°)</td>
                <td>Scorpio (3°)</td>
                <td>Mind (Manas), emotions, mother, peace, intuition</td>
              </tr>
              <tr>
                <td><strong>Mars (Mangal)</strong></td>
                <td>Natural Malefic</td>
                <td>Aries, Scorpio</td>
                <td>Capricorn (28°)</td>
                <td>Cancer (28°)</td>
                <td>Energy, courage, brothers, property, technical skill</td>
              </tr>
              <tr>
                <td><strong>Mercury (Budha)</strong></td>
                <td>Benefic (adaptable)</td>
                <td>Gemini, Virgo</td>
                <td>Virgo (15°)</td>
                <td>Pisces (15°)</td>
                <td>Intellect, communication, trade, logic, analytics</td>
              </tr>
              <tr>
                <td><strong>Jupiter (Guru)</strong></td>
                <td>Greatest Benefic</td>
                <td>Sagittarius, Pisces</td>
                <td>Cancer (5°)</td>
                <td>Capricorn (5°)</td>
                <td>Wisdom, dharma, wealth, children, spirituality</td>
              </tr>
              <tr>
                <td><strong>Venus (Shukra)</strong></td>
                <td>Natural Benefic</td>
                <td>Taurus, Libra</td>
                <td>Pisces (27°)</td>
                <td>Virgo (27°)</td>
                <td>Love, beauty, arts, vehicles, marriage, luxury</td>
              </tr>
              <tr>
                <td><strong>Saturn (Shani)</strong></td>
                <td>Natural Malefic</td>
                <td>Capricorn, Aquarius</td>
                <td>Libra (20°)</td>
                <td>Aries (20°)</td>
                <td>Karma, discipline, longevity, delays, perseverance</td>
              </tr>
              <tr>
                <td><strong>Rahu (North Node)</strong></td>
                <td>Shadow Malefic</td>
                <td>Co-rules Aquarius</td>
                <td>Taurus / Gemini</td>
                <td>Scorpio / Sagittarius</td>
                <td>Unconventional paths, ambition, illusion, tech</td>
              </tr>
              <tr>
                <td><strong>Ketu (South Node)</strong></td>
                <td>Shadow Malefic</td>
                <td>Co-rules Scorpio</td>
                <td>Scorpio / Sagittarius</td>
                <td>Taurus / Gemini</td>
                <td>Moksha, detachment, occult knowledge, mastery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Ashtakvarga */}
      <section id="ashtakvarga" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>📊</span> 3. Ashtakvarga (SAV &amp; BAV Bindu Scores)
          </h2>
          <span className="guide-section-badge">Objective Strength</span>
        </div>
        <p className="guide-text">
          Ashtakvarga (Eight-fold Division from <em>Brihat Parashara Hora Shastra</em>) is an objective mathematical system evaluating planetary transit support across all 12 signs.
        </p>
        <div className="guide-highlight-box">
          <h4>⚡ How to Interpret Sarvashtakvarga (SAV) Points:</h4>
          <p>
            • <strong>≥ 28 Bindus (Strong / Auspicious):</strong> The house receives strong cosmic backing. Transits through this sign yield positive results, financial growth, and success.<br />
            • <strong>25 – 27 Bindus (Average):</strong> Balanced support requiring moderate effort.<br />
            • <strong>&lt; 25 Bindus (Weak / Sensitive):</strong> Indicates areas of life where transits can bring friction or delays; requires conscious awareness and patience.
          </p>
        </div>
      </section>

      {/* Section 4: Vimshottari Dasha */}
      <section id="dashas" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>⏳</span> 4. Vimshottari Dasha (Planetary Operating Cycles)
          </h2>
          <span className="guide-section-badge">Life Timing</span>
        </div>
        <p className="guide-text">
          The 120-year Vimshottari Dasha system maps the unfolding of your life chapters based on your birth Moon Nakshatra. Each Mahadasha is subdivided into 9 Antardashas (sub-periods), determining which planetary archetypes are active.
        </p>
        <div className="guide-table-wrapper">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Mahadasha Planet</th>
                <th>Duration (Years)</th>
                <th>Key Themes &amp; Manifestations</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Ketu</td><td>7 Years</td><td>Introspection, spiritual growth, detachment, unexpected turning points</td></tr>
              <tr><td>Venus (Shukra)</td><td>20 Years</td><td>Artistic pursuits, relationships, luxury, material comfort, marriage</td></tr>
              <tr><td>Sun (Surya)</td><td>6 Years</td><td>Career visibility, authority, self-expression, fatherly connections</td></tr>
              <tr><td>Moon (Chandra)</td><td>10 Years</td><td>Emotional fulfillment, domestic growth, public interaction, creativity</td></tr>
              <tr><td>Mars (Mangal)</td><td>7 Years</td><td>Ambition, property acquisition, physical drive, bold initiatives</td></tr>
              <tr><td>Rahu</td><td>18 Years</td><td>Rapid expansion, unconventional growth, foreign connections, tech</td></tr>
              <tr><td>Jupiter (Guru)</td><td>16 Years</td><td>Wisdom, children, higher learning, financial abundance, dharma</td></tr>
              <tr><td>Saturn (Shani)</td><td>19 Years</td><td>Deep discipline, hard work, structural foundations, maturity</td></tr>
              <tr><td>Mercury (Budha)</td><td>17 Years</td><td>Commerce, analytical breakthroughs, communication, networking</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Matchmaking */}
      <section id="matchmaking" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>💍</span> 5. Ashtakoot Guna Milan (36-Point Compatibility)
          </h2>
          <span className="guide-section-badge">Relationship Harmony</span>
        </div>
        <p className="guide-text">
          Ashtakoot evaluates 8 psychological and physiological dimensions of compatibility between the Bride and Groom's birth Moon Nakshatras out of 36 points:
        </p>
        <div className="guide-table-wrapper">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Koota</th>
                <th>Points</th>
                <th>Dimension Evaluated</th>
                <th>Astrological Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1. Varna</td><td>1 Pt</td><td>Spiritual / Ego alignment</td><td>Mutual respect and spiritual harmony</td></tr>
              <tr><td>2. Vashya</td><td>2 Pts</td><td>Mutual attraction &amp; influence</td><td>Power balance and natural affinity</td></tr>
              <tr><td>3. Tara</td><td>3 Pts</td><td>Destiny &amp; Fortune</td><td>Health, longevity, and mutual auspiciousness</td></tr>
              <tr><td>4. Yoni</td><td>4 Pts</td><td>Physical &amp; Sexual harmony</td><td>Biological and psychological compatibility</td></tr>
              <tr><td>5. Graha Maitri</td><td>5 Pts</td><td>Mental &amp; Intellectual friendship</td><td>Moon sign lords relationship; communication ease</td></tr>
              <tr><td>6. Gana</td><td>6 Pts</td><td>Temperament &amp; Lifestyle</td><td>Deva (divine), Manushya (human), Rakshasa (fiery)</td></tr>
              <tr><td>7. Bhakoot</td><td>7 Pts</td><td>Emotional &amp; Financial prosperity</td><td>Moon distance relationship (avoiding 6-8 or 2-12)</td></tr>
              <tr><td>8. Nadi</td><td>8 Pts</td><td>Genetic &amp; Physiological compatibility</td><td>Vata, Pitta, Kapha lineage; hereditary wellness</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Doshas */}
      <section id="doshas" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>🛡️</span> 6. Classical Doshas, Sade Sati &amp; Remedies
          </h2>
          <span className="guide-section-badge">Mitigation &amp; Balance</span>
        </div>
        <div className="guide-text">
          <p>
            • <strong>Manglik Dosha (Parashari):</strong> Evaluated when Mars occupies houses 1, 4, 7, 8, or 12 from Lagna, Moon, or Venus. It signifies high passionate energy requiring mutual balance.<br />
            • <strong>Saturn Sade Sati:</strong> The 7.5-year cycle when Saturn transits the 12th, 1st, and 2nd houses from the natal Moon. It is a transformative phase teaching discipline and maturity.<br />
            • <strong>Kaal Sarp Yoga:</strong> Occurs when all 7 planets are placed between Rahu and Ketu, creating focused intensity in specific life areas.
          </p>
        </div>
      </section>
    </main>
  );
}
