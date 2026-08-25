import { useState } from 'react';
import { getAshtakvarga } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import './AshtakvargaGrid.css';

const SIGN_NAMES_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const PLANETS_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Returns color category based on classical SAV thresholds:
 * >= 28: Favorable (Green)
 * 25-27: Neutral (Amber)
 * < 25:  Challenging (Red)
 */
function getSavScoreClass(score) {
  if (score >= 28) return 'sav-score--high';
  if (score >= 25) return 'sav-score--mid';
  return 'sav-score--low';
}

/**
 * AshtakvargaGrid — Displays Sarvashtakvarga (SAV) and on-demand Bhinnashtakvarga (BAV).
 *
 * Props:
 *   savData: { sav_by_house: number[], sav_by_sign: number[], sav_total: number }
 *   personPayload: toApiPayload(person) for lazy-fetching full BAV
 */
export default function AshtakvargaGrid({ savData, personPayload }) {
  const { lang } = useLang();

  const [bavData, setBavData] = useState(null);
  const [loadingBav, setLoadingBav] = useState(false);
  const [bavExpanded, setBavExpanded] = useState(false);
  const [bavError, setBavError] = useState('');
  const [selectedPlanet, setSelectedPlanet] = useState('Sun');

  if (!savData || !savData.sav_by_house) return null;

  async function handleToggleBav() {
    if (bavExpanded) {
      setBavExpanded(false);
      return;
    }

    if (bavData) {
      setBavExpanded(true);
      return;
    }

    setLoadingBav(true);
    setBavError('');
    try {
      const data = await getAshtakvarga(personPayload);
      setBavData(data);
      setBavExpanded(true);
    } catch (err) {
      console.error('Failed to fetch Ashtakvarga:', err);
      setBavError(err?.message || 'Failed to load Ashtakvarga details.');
    } finally {
      setLoadingBav(false);
    }
  }


  return (
    <div className="ashtakvarga-section">
      {/* ── SAV Summary Header ───────────────────────────────────────── */}
      <div className="ashtakvarga-header">
        <div>
          <h4 className="ashtakvarga-title">Sarvashtakvarga (SAV) — House Strength Profile</h4>
          <p className="ashtakvarga-subtitle">
            Total Benefic Points: <strong>{savData.sav_total || 337}</strong> across 12 houses.
            Scores ≥ 28 indicate auspicious strength; &lt; 25 indicates houses requiring conscious effort.
          </p>
        </div>
      </div>

      {/* ── 12-House SAV Scorecard Grid ──────────────────────────────── */}
      <div className="sav-house-grid">
        {savData.sav_by_house.map((score, hIdx) => {
          const houseNum = hIdx + 1;
          const scoreClass = getSavScoreClass(score);

          return (
            <div key={houseNum} className={`sav-house-cell ${scoreClass}`}>
              <span className="sav-house-cell__num">{lang === 'mr' ? `भाव ${houseNum}` : `H${houseNum}`}</span>
              <span className="sav-house-cell__score mono">{score}</span>
              <span className="sav-house-cell__status">
                {score >= 28 ? 'Strong' : score >= 25 ? 'Avg' : 'Low'}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Lazy Load BAV Button ──────────────────────────────────────── */}
      <div className="ashtakvarga-actions">
        <button
          type="button"
          className="btn btn--ghost ashtakvarga-bav-toggle"
          onClick={handleToggleBav}
          disabled={loadingBav}
        >
          {loadingBav ? (
            'Computing 7-Planet Ashtakvarga...'
          ) : bavExpanded ? (
            '▲ Hide Detailed Bhinnashtakvarga (BAV)'
          ) : (
            '▾ Load Full Ashtakvarga (7-Planet BAV Tables)'
          )}
        </button>
        {bavError && (
          <p className="ashtakvarga-bav-error">⚠ {bavError}</p>
        )}
      </div>


      {/* ── Full BAV Interactive Matrix Viewer (On-demand) ────────────── */}
      {bavExpanded && bavData && (
        <div className="bav-viewer panel">
          <div className="bav-viewer__header">
            <h5 className="bav-viewer__title">Bhinnashtakvarga (Individual Planetary Bindus)</h5>
            <div className="bav-planet-tabs">
              {PLANETS_ORDER.map((pName) => (
                <button
                  key={pName}
                  type="button"
                  className={`bav-planet-tab${selectedPlanet === pName ? ' is-active' : ''}`}
                  onClick={() => setSelectedPlanet(pName)}
                >
                  {planetName(pName, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Planet BAV Matrix */}
          {bavData.bav && bavData.bav[selectedPlanet] && (
            <div className="bav-matrix-wrap">
              <div className="bav-matrix-summary">
                <span className="bav-matrix-total-badge">
                  Total Bindus for {planetName(selectedPlanet, lang)}: <strong>{bavData.bav[selectedPlanet].total_bindus}</strong>
                </span>
              </div>

              <div className="bav-table-overflow">
                <table className="bav-table">
                  <thead>
                    <tr>
                      <th>Ref Graha</th>
                      {SIGN_NAMES_ABBR.map((s, idx) => (
                        <th key={s} className="mono">{s} ({idx + 1})</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bavData.bav[selectedPlanet].matrix).map(([refName, row]) => (
                      <tr key={refName}>
                        <td className="bav-table__ref-name">{refName === 'Lagna' ? 'Lagna' : planetName(refName, lang)}</td>
                        {row.map((val, colIdx) => (
                          <td
                            key={colIdx}
                            className={`mono bav-table__cell${val === 1 ? ' bav-table__cell--1' : ''}`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bav-table__total-row">
                      <td><strong>Total</strong></td>
                      {bavData.bav[selectedPlanet].sign_totals.map((total, idx) => (
                        <td key={idx} className="mono">
                          <strong>{total}</strong>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
