import React from 'react';
import './TransitTracker.css';

/**
 * TransitTracker — Displays real-time planetary Gochara (transits),
 * Sade Sati phase detection, Dhaiya alerts, and Jupiter transit status.
 *
 * Props:
 *   data:    current_transits object from backend
 *   compact: boolean (true = small badge for ProfileCard, false = full section)
 */
export default function TransitTracker({ data, compact = false }) {
  if (!data) return null;

  const {
    transits = [],
    sade_sati = {},
    dhaiya = {},
    jupiter_gochara = {},
    as_of_ist = '',
  } = data;

  // -------------------------------------------------------------------------
  // Compact Mode (for ProfileCard or header pills)
  // -------------------------------------------------------------------------
  if (compact) {
    if (sade_sati.active) {
      return (
        <span
          className="sade-sati-pill sade-sati-pill--active"
          title={`${sade_sati.phase_label}: Saturn in ${sade_sati.saturn_sign}`}
        >
          🔴 Sade Sati · {sade_sati.phase_label}
        </span>
      );
    }
    if (dhaiya.active) {
      return (
        <span
          className="sade-sati-pill sade-sati-pill--active"
          title={`Small Panoti: Saturn in House ${dhaiya.house} from Moon`}
        >
          🟠 Dhaiya (H{dhaiya.house})
        </span>
      );
    }
    return (
      <span className="sade-sati-pill sade-sati-pill--inactive" title="No active Sade Sati or Dhaiya">
        ✅ Transits Clear
      </span>
    );
  }

  // -------------------------------------------------------------------------
  // Full Detailed Mode (for OverviewTab)
  // -------------------------------------------------------------------------
  return (
    <section className="transit-tracker" data-pdf-section="transits">
      <div className="transit-tracker__header">
        <h3 className="transit-tracker__title">
          <span>🪐</span> Real-Time Gochara & Sade Sati Tracker
        </h3>
        {as_of_ist && (
          <span className="transit-tracker__timestamp mono">
            🕒 As of {as_of_ist}
          </span>
        )}
      </div>

      {/* Primary Status Banners */}
      <div className="transit-banners-grid">
        {/* Saturn / Sade Sati Banner */}
        <div
          className={`transit-banner ${
            sade_sati.active
              ? 'transit-banner--sade-sati-active'
              : 'transit-banner--sade-sati-inactive'
          }`}
        >
          <span className="transit-banner__badge">
            {sade_sati.active ? '🔴 SADE SATI ACTIVE' : '✅ NO SADE SATI'}
          </span>
          <h4 className="transit-banner__heading">
            {sade_sati.active
              ? `${sade_sati.phase_label} (Phase ${sade_sati.phase}/3)`
              : 'Saturn Transit Clear'}
          </h4>
          <p className="transit-banner__desc">
            {sade_sati.description}
            {dhaiya.active && ` | ${dhaiya.description}`}
          </p>
        </div>

        {/* Jupiter Gochara Banner */}
        <div
          className={`transit-banner ${
            jupiter_gochara.favorable
              ? 'transit-banner--jupiter-favorable'
              : 'transit-banner--jupiter-neutral'
          }`}
        >
          <span className="transit-banner__badge">
            {jupiter_gochara.favorable
              ? '✦ AUSPICIOUS GURU TRANSIT'
              : 'GURU GOCHARA'}
          </span>
          <h4 className="transit-banner__heading">
            Jupiter in House {jupiter_gochara.house_from_moon} from Moon
          </h4>
          <p className="transit-banner__desc">
            {jupiter_gochara.description}
          </p>
        </div>
      </div>

      {/* 9 Graha Live Transits Table */}
      <div className="transit-table-wrapper">
        <table className="transit-table">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Current Sign</th>
              <th>Longitude</th>
              <th>From Moon</th>
              <th>From Lagna</th>
              <th>Motion</th>
            </tr>
          </thead>
          <tbody>
            {transits.map((item) => {
              const isSaturn = item.planet === 'Saturn';
              const isJupiter = item.planet === 'Jupiter';
              const rowClass = isSaturn
                ? 'transit-table tr--highlight-saturn'
                : isJupiter
                ? 'transit-table tr--highlight-jupiter'
                : '';

              return (
                <tr key={item.planet} className={rowClass}>
                  <td>
                    <strong>{item.planet}</strong>
                  </td>
                  <td>{item.sign}</td>
                  <td className="mono">{item.degree_in_sign}°</td>
                  <td>
                    House {item.house_from_moon}
                    {isSaturn && sade_sati.active && ' ⚠️'}
                    {isJupiter && jupiter_gochara.favorable && ' ✦'}
                  </td>
                  <td>House {item.house_from_lagna}</td>
                  <td>
                    {item.retrograde ? (
                      <span className="retrograde-badge" title="Retrograde (Vakri)">
                        ℞ Vakri
                      </span>
                    ) : (
                      'Direct'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
