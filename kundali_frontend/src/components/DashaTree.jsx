import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import './DashaTree.css';

/**
 * Calculates percentage of time elapsed in a period.
 */
function calcProgress(startStr, endStr) {
  const start = new Date(startStr).getTime();
  const end   = new Date(endStr).getTime();
  const now   = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

/**
 * Format ISO date string into readable DD MMM YYYY.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * DashaTree — Interactive Vimshottari Mahadasha & Antardasha hierarchical tree.
 *
 * Props:
 *   periods: List of Mahadasha dicts with nested 'antardashas' list.
 */
export default function DashaTree({ periods = [] }) {
  const { lang, t } = useLang();

  // Find index of currently active Mahadasha to expand by default
  const activeMahaIdx = periods.findIndex((p) => p.is_current);
  const [expandedIndices, setExpandedIndices] = useState(
    activeMahaIdx >= 0 ? [activeMahaIdx] : [0]
  );

  function toggleExpand(index) {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  if (!periods || periods.length === 0) return null;

  return (
    <div className="dasha-tree" role="region" aria-label="Vimshottari Dasha Hierarchy">
      {periods.map((maha, idx) => {
        const isExpanded = expandedIndices.includes(idx);
        const isMahaCurrent = maha.is_current;
        const progress = isMahaCurrent ? calcProgress(maha.start_date, maha.end_date) : 0;
        const translatedPlanet = planetName(maha.planet, lang);

        return (
          <div
            key={maha.planet + idx}
            className={`dasha-tree__maha-card${isMahaCurrent ? ' is-active' : ''}${isExpanded ? ' is-expanded' : ''}`}
          >
            {/* Mahadasha Header Row */}
            <div
              className="dasha-tree__maha-header"
              onClick={() => toggleExpand(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleExpand(idx)}
            >
              <div className="dasha-tree__maha-left">
                <span className="dasha-tree__maha-icon">🪐</span>
                <div>
                  <div className="dasha-tree__maha-title-row">
                    <h4 className="dasha-tree__maha-title">
                      {translatedPlanet} {t('dasha.mahadasha') || 'Mahadasha'}
                    </h4>
                    {isMahaCurrent && (
                      <span className="dasha-tree__badge dasha-tree__badge--active">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <p className="dasha-tree__dates mono">
                    {formatDate(maha.start_date)} &nbsp;→&nbsp; {formatDate(maha.end_date)}
                    <span className="dasha-tree__duration"> ({maha.dasha_years} yrs)</span>
                  </p>
                </div>
              </div>

              <div className="dasha-tree__maha-right">
                {isMahaCurrent && (
                  <div className="dasha-tree__progress-wrap">
                    <span className="dasha-tree__progress-label mono">{progress}% elapsed</span>
                    <div className="dasha-tree__progress-bar">
                      <div
                        className="dasha-tree__progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <span className="dasha-tree__chevron">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Antardasha Sub-period List */}
            {isExpanded && maha.antardashas && maha.antardashas.length > 0 && (
              <div className="dasha-tree__antardasha-wrap">
                <div className="dasha-tree__antardasha-header">
                  <span>Antardasha (Sub-Period)</span>
                  <span>Timeline</span>
                  <span>Duration</span>
                </div>
                <div className="dasha-tree__antardasha-list">
                  {maha.antardashas.map((antar, aIdx) => {
                    const isAntarCurrent = antar.is_current;
                    const translatedSubPlanet = planetName(antar.planet, lang);
                    const subProgress = isAntarCurrent
                      ? calcProgress(antar.start_date, antar.end_date)
                      : 0;

                    return (
                      <div
                        key={antar.planet + aIdx}
                        className={`dasha-tree__antar-row${isAntarCurrent ? ' is-active' : ''}`}
                      >
                        <div className="dasha-tree__antar-planet">
                          <span className="dasha-tree__antar-dot" />
                          <strong>
                            {translatedPlanet} – {translatedSubPlanet}
                          </strong>
                          {isAntarCurrent && (
                            <span className="dasha-tree__pulse-tag">CURRENT</span>
                          )}
                        </div>

                        <div className="dasha-tree__antar-dates mono">
                          {formatDate(antar.start_date)} &nbsp;→&nbsp; {formatDate(antar.end_date)}
                          {isAntarCurrent && (
                            <div className="dasha-tree__sub-progress-bar">
                              <div
                                className="dasha-tree__sub-progress-fill"
                                style={{ width: `${subProgress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="dasha-tree__antar-duration mono">
                          {antar.total_years >= 1
                            ? `${antar.total_years.toFixed(2)} yrs`
                            : `${Math.round(antar.total_years * 12)} mos`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
