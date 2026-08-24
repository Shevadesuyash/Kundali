import ManglikBadge from '../ManglikBadge';
import './tabs.css';

/**
 * DoshasTab — Full Mangal Dosha card + Kaal Sarp / Pitra Dosha placeholders.
 */
export default function DoshasTab({ report }) {
  const { manglik_dosha, planets } = report;

  // Kaal Sarp check: all planets between Rahu and Ketu
  const hasKaalSarp = checkKaalSarp(planets);

  return (
    <div className="tab-panel">
      {/* Mangal Dosha — Full card */}
      <div className="tab-section">
        <p className="tab-section__title">Mangal (Kuja) Dosha</p>
        <p className="tab-section__subtitle">
          Evaluated from Lagna, Moon, and Venus using standard Parashari houses (1, 4, 7, 8, 12).
        </p>
        <ManglikBadge manglik={manglik_dosha} />

        {/* Papa Samyam score breakdown */}
        <div className="dosha-papa-table">
          <p className="dosha-papa-table__title">Papa Samyam Score Breakdown</p>
          <p className="dosha-papa-table__note">
            Total = S_Lagna + (0.75 × S_Moon) + (0.50 × S_Venus)
          </p>
          <div className="dosha-papa-row">
            <span>From Lagna</span>
            <span>Mars H{manglik_dosha.mars_house_lagna} &nbsp;
              {manglik_dosha.manglik_from_lagna ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.lagna ?? 0}</span>
          </div>
          <div className="dosha-papa-row">
            <span>From Moon</span>
            <span>Mars H{manglik_dosha.mars_house_moon} &nbsp;
              {manglik_dosha.manglik_from_moon ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.moon ?? 0} × 0.75 = {((manglik_dosha.papa_breakdown?.moon ?? 0) * 0.75).toFixed(2)}</span>
          </div>
          <div className="dosha-papa-row">
            <span>From Venus</span>
            <span>Mars H{manglik_dosha.mars_house_venus} &nbsp;
              {manglik_dosha.manglik_from_venus ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.venus ?? 0} × 0.50 = {((manglik_dosha.papa_breakdown?.venus ?? 0) * 0.50).toFixed(2)}</span>
          </div>
          <div className="dosha-papa-row dosha-papa-row--total">
            <span>Total Papa Samyam</span>
            <span></span>
            <span className="mono">{manglik_dosha.papa_points}</span>
          </div>
        </div>
      </div>

      {/* Kaal Sarp Dosha */}
      <div className="tab-section">
        <p className="tab-section__title">Kaal Sarp Dosha</p>
        <div className={`dosha-status-card ${hasKaalSarp ? 'dosha-status-card--warn' : 'dosha-status-card--clear'}`}>
          <span className="dosha-status-card__icon">{hasKaalSarp ? '🐍' : '✅'}</span>
          <div>
            <strong>{hasKaalSarp ? 'Kaal Sarp Dosha Present' : 'No Kaal Sarp Dosha'}</strong>
            <p className="dosha-status-card__note">
              {hasKaalSarp
                ? 'All seven planets fall between Rahu and Ketu, forming Kaal Sarp Yoga.'
                : 'Planets are distributed on both sides of the Rahu–Ketu axis.'}
            </p>
          </div>
        </div>
      </div>

      {/* Pitra Dosha — Phase 4 placeholder */}
      <div className="tab-section">
        <p className="tab-section__title">Pitra Dosha</p>
        <div className="tab-coming-soon">
          <span>🌗</span>
          <p>Full Pitra Dosha analysis (Sun-Rahu conjunction, 9th house afflictions) — coming in Phase 4</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Checks whether all 7 classical planets fall on one side of the Rahu-Ketu axis.
 * Classic definition: all planets between Rahu and Ketu in the zodiac (not the nodes themselves).
 */
function checkKaalSarp(planets) {
  if (!planets) return false;
  const CLASSICAL = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const rahu = planets['Rahu'];
  const ketu = planets['Ketu'];
  if (!rahu || !ketu) return false;

  const rahuLon = rahu.longitude;
  const ketuLon = ketu.longitude;

  // Check if all planets lie in the arc from Rahu to Ketu (going forward, 0-360)
  function inArc(lon, from, to) {
    const normalised = ((lon - from) + 360) % 360;
    const arcLen     = ((to   - from) + 360) % 360;
    return normalised > 0 && normalised < arcLen;
  }

  const allInForward  = CLASSICAL.every(p => inArc(planets[p].longitude, rahuLon, ketuLon));
  const allInBackward = CLASSICAL.every(p => inArc(planets[p].longitude, ketuLon, rahuLon));
  return allInForward || allInBackward;
}
