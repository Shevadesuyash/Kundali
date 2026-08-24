import ManglikBadge from '../ManglikBadge';
import YogaList from '../YogaList';
import './tabs.css';

/**
 * DoshasTab — Comprehensive Doshas analysis including Mangal Dosha (Papa Samyam),
 * Kaal Sarp, Guru Chandal, Pitra Dosha, and Kemadruma.
 */
export default function DoshasTab({ report }) {
  const { manglik_dosha, yogas } = report;

  return (
    <div className="tab-panel">
      {/* ── 1. Mangal Dosha & Papa Samyam ────────────────────────────── */}
      <div className="tab-section">
        <p className="tab-section__title">Mangal (Kuja) Dosha &amp; Papa Samyam</p>
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

      {/* ── 2. Other Classical Doshas & Karmic Influences ──────────────── */}
      <div className="tab-section">
        <p className="tab-section__title">Special Doshas &amp; Planetary Afflictions</p>
        <YogaList yogas={yogas} filterType="malefic" />
      </div>
    </div>
  );
}
