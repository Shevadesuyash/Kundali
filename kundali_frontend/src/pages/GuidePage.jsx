import React from 'react';
import './GuidePage.css';

/**
 * GuidePage — Comprehensive Vedic Astrology Knowledge Center & Reference.
 * Helps beginner and intermediate users understand planets, houses, Ashtakvarga,
 * Dasha systems, Guna Milan matchmaking, and classical Doshas.
 */
export default function GuidePage() {
  return (
    <main className="container guide-page">
      {/* Header */}
      <header className="guide-header">
        <p className="eyebrow">Jyotish Vidya Knowledge Center</p>
        <h1 className="guide-title">Vedic Astrology Reference Guide</h1>
        <p className="guide-intro">
          A structured guide to understanding how planetary positions, 12 Bhavas (houses),
          Ashtakvarga scores, Vimshottari Dashas, and Guna Milan matchmaking are computed and interpreted.
        </p>
      </header>

      {/* Anchor Navigation Bar */}
      <nav className="guide-nav-bar" aria-label="Guide topics">
        <a href="#houses" className="guide-nav-link">1. The 12 Bhavas (Houses)</a>
        <a href="#planets" className="guide-nav-link">2. The 9 Grahas (Planets)</a>
        <a href="#ashtakvarga" className="guide-nav-link">3. Ashtakvarga &amp; SAV Points</a>
        <a href="#dashas" className="guide-nav-link">4. Vimshottari Dasha System</a>
        <a href="#matchmaking" className="guide-nav-link">5. Ashtakoot Guna Milan</a>
        <a href="#doshas" className="guide-nav-link">6. Doshas &amp; Remedies</a>
        <a href="#kp" className="guide-nav-link">7. KP System &amp; Varshapal</a>
      </nav>

      {/* Section 1: The 12 Houses */}
      <section id="houses" className="guide-section">
        <div className="guide-section-header">
          <h2 className="guide-section-title">
            <span>🏠</span> 1. The 12 Bhavas (Houses of Destiny)
          </h2>
          <span className="guide-section-badge">Foundations</span>
        </div>
        <p className="guide-text">
          In Vedic astrology (Parashari system), your Kundali is divided into 12 Bhavas (houses) beginning from your <strong>Ascendant (Lagna)</strong>, which is the exact zodiac constellation rising on the eastern horizon at your birth moment.
        </p>
        <div className="guide-table-wrapper">
          <table className="guide-table">
            <thead>
              <tr>
                <th>House</th>
                <th>Sanskrit Name</th>
                <th>Classification</th>
                <th>Key Life Domains &amp; Significations</th>
                <th>Karaka (Significator)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1st House</strong></td>
                <td>Tanu Bhava (Lagna)</td>
                <td>Kendra &amp; Trikona</td>
                <td>Self, physical vitality, appearance, character, head, life direction</td>
                <td>Sun (Surya)</td>
              </tr>
              <tr>
                <td><strong>2nd House</strong></td>
                <td>Dhana Bhava</td>
                <td>Maraka / Wealth</td>
                <td>Accumulated wealth, family lineage, speech, eyes, eating habits</td>
                <td>Jupiter (Guru)</td>
              </tr>
              <tr>
                <td><strong>3rd House</strong></td>
                <td>Sahaja Bhava</td>
                <td>Upachaya</td>
                <td>Younger siblings, courage, enterprise, short travels, hands/arms</td>
                <td>Mars (Mangal)</td>
              </tr>
              <tr>
                <td><strong>4th House</strong></td>
                <td>Sukha Bhava</td>
                <td>Kendra (Heart)</td>
                <td>Mother, home, real estate, vehicles, inner peace, formal education</td>
                <td>Moon (Chandra)</td>
              </tr>
              <tr>
                <td><strong>5th House</strong></td>
                <td>Putra Bhava</td>
                <td>Trikona (Dharma)</td>
                <td>Children, intellect, creativity, speculative gains, Purva Punya (past karmas)</td>
                <td>Jupiter (Guru)</td>
              </tr>
              <tr>
                <td><strong>6th House</strong></td>
                <td>Ripu/Roga Bhava</td>
                <td>Dusthana / Upachaya</td>
                <td>Daily work, enemies, diseases, debts, litigation, service, immunity</td>
                <td>Mars &amp; Saturn</td>
              </tr>
              <tr>
                <td><strong>7th House</strong></td>
                <td>Jaya Bhava</td>
                <td>Kendra &amp; Maraka</td>
                <td>Spouse, marriage, business partnerships, public relations, foreign trade</td>
                <td>Venus (Shukra)</td>
              </tr>
              <tr>
                <td><strong>8th House</strong></td>
                <td>Ayur Bhava</td>
                <td>Dusthana (Moksha)</td>
                <td>Longevity, transformation, occult, unexpected inheritance, hidden matters</td>
                <td>Saturn (Shani)</td>
              </tr>
              <tr>
                <td><strong>9th House</strong></td>
                <td>Bhagya Bhava</td>
                <td>Trikona (Fortune)</td>
                <td>Father, guru, higher wisdom, dharma, pilgrimage, destiny and luck</td>
                <td>Jupiter &amp; Sun</td>
              </tr>
              <tr>
                <td><strong>10th House</strong></td>
                <td>Karma Bhava</td>
                <td>Kendra (Peak)</td>
                <td>Career, profession, social status, leadership, fame, government honors</td>
                <td>Sun, Merc, Jup, Sat</td>
              </tr>
              <tr>
                <td><strong>11th House</strong></td>
                <td>Labha Bhava</td>
                <td>Upachaya (Gains)</td>
                <td>Financial gains, fulfillment of desires, elder siblings, social networks</td>
                <td>Jupiter (Guru)</td>
              </tr>
              <tr>
                <td><strong>12th House</strong></td>
                <td>Vyaya Bhava</td>
                <td>Dusthana (Moksha)</td>
                <td>Expenditures, foreign residence, spiritual liberation (Moksha), sleep, dreams</td>
                <td>Saturn &amp; Ketu</td>
              </tr>
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
