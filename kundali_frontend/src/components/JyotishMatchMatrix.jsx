import React from 'react';
import './JyotishMatchMatrix.css';

const PLANET_KEYS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/**
 * Computes mutual house distance between two sign indices (0-11)
 * Returns { distance1, distance2, label, quality }
 */
function getMutualSambandha(boySignIdx, girlSignIdx) {
  if (boySignIdx === undefined || girlSignIdx === undefined) return { label: '—', quality: 'neutral' };

  const dist1 = (girlSignIdx - boySignIdx + 12) % 12 + 1;
  const dist2 = (boySignIdx - girlSignIdx + 12) % 12 + 1;
  const pairStr = `${dist1}-${dist2}`;

  if (dist1 === 1) return { label: '1-1 (Sama Rashi)', quality: 'auspicious', desc: 'Identical sign placement' };
  if (dist1 === 7) return { label: '1-7 (Saptama Axis)', quality: 'auspicious', desc: 'Polar complementary harmony' };
  if (dist1 === 5 || dist1 === 9) return { label: `${pairStr} (Navapanchama)`, quality: 'auspicious', desc: 'Dharma and spiritual luck' };
  if (dist1 === 3 || dist1 === 11) return { label: `${pairStr} (Labha-Sahaja)`, quality: 'auspicious', desc: 'Friendly enterprise and cooperation' };
  if (dist1 === 4 || dist1 === 10) return { label: `${pairStr} (Kendra)`, quality: 'neutral', desc: 'Dynamic action and balance' };
  if (dist1 === 6 || dist1 === 8) return { label: `${pairStr} (Shadashtaka)`, quality: 'caution', desc: 'Karmic friction or ego difference' };
  if (dist1 === 2 || dist1 === 12) return { label: `${pairStr} (Dwirdwadashta)`, quality: 'caution', desc: 'Expenditure / detachment axis' };

  return { label: pairStr, quality: 'neutral', desc: 'Neutral relationship' };
}

/**
 * JyotishMatchMatrix — Professional Astrological Breakdown Component.
 * Compares planetary placements, mutual house axes (Sambandha), and Papa Samyam balance.
 */
export default function JyotishMatchMatrix({ boy, girl, papaSamyam }) {
  if (!boy || !girl) return null;

  const boyPlanets = boy.planets || {};
  const girlPlanets = girl.planets || {};

  return (
    <section className="jyotish-matrix-panel" data-pdf-section="jyotish-deep-dive">
      <div className="jyotish-matrix-header">
        <h3 className="jyotish-matrix-title">
          <span>🔮</span> Jyotish Astrologer's Technical Comparative Analysis
        </h3>
        <span className="jyotish-matrix-badge">Parashari Sambandha</span>
      </div>

      {/* 1. Papa Samyam Malefic Absorption Balance Card */}
      {papaSamyam && (
        <div className="papa-balance-card">
          <div className="papa-balance-stat">
            <span className="papa-balance-label">Groom Papa Points</span>
            <span className="papa-balance-val">{papaSamyam.male_score?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="papa-balance-stat">
            <span className="papa-balance-label">Bride Papa Points</span>
            <span className="papa-balance-val">{papaSamyam.female_score?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="papa-balance-stat">
            <span className="papa-balance-label">Differential Balance</span>
            <span className="papa-balance-val" style={{ color: papaSamyam.difference >= 0 ? '#166534' : '#b91c1c' }}>
              {papaSamyam.difference > 0 ? `+${papaSamyam.difference.toFixed(2)}` : papaSamyam.difference.toFixed(2)}
            </span>
          </div>
          <p className="papa-balance-note">
            <strong>Classical Parashari Rule:</strong> {papaSamyam.interpretation || 'Papa Samyam evaluates malefic energy absorption balance across Lagna, Moon, and Venus charts.'}
          </p>
        </div>
      )}

      {/* 2. Side-by-Side Planetary Placements & Mutual Distance Table */}
      <div className="guide-table-wrapper">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Planet / Point</th>
              <th>Groom (Male) Placement</th>
              <th>Bride (Female) Placement</th>
              <th>Mutual House Axis (Sambandha)</th>
            </tr>
          </thead>
          <tbody>
            {/* Ascendant / Lagna */}
            <tr>
              <td><strong>Ascendant (Lagna)</strong></td>
              <td>
                <strong>{boy.ascendant?.sign}</strong> ({boy.ascendant?.degree_str})<br />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                  {boy.ascendant?.nakshatra} (P{boy.ascendant?.pada})
                </span>
              </td>
              <td>
                <strong>{girl.ascendant?.sign}</strong> ({girl.ascendant?.degree_str})<br />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                  {girl.ascendant?.nakshatra} (P{girl.ascendant?.pada})
                </span>
              </td>
              <td>
                {(() => {
                  const s = getMutualSambandha(boy.ascendant?.sign_index, girl.ascendant?.sign_index);
                  return (
                    <div>
                      <span className={`sambandha-badge check sambandha-badge--${s.quality}`}>{s.label}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}>{s.desc}</div>
                    </div>
                  );
                })()}
              </td>
            </tr>

            {/* 9 Planets */}
            {PLANET_KEYS.map((pName) => {
              const bp = boyPlanets[pName];
              const gp = girlPlanets[pName];
              if (!bp || !gp) return null;

              const sambandha = getMutualSambandha(bp.sign_index, gp.sign_index);

              return (
                <tr key={pName}>
                  <td><strong>{pName}</strong></td>
                  <td>
                    {bp.sign} in H{bp.house_from_lagna} ({bp.degree_str})
                    {bp.retrograde && <sup style={{ color: '#b91c1c', fontWeight: 'bold' }}> ℞</sup>}
                    <br />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                      {bp.nakshatra} (P{bp.pada}) · {bp.dignity}
                    </span>
                  </td>
                  <td>
                    {gp.sign} in H{gp.house_from_lagna} ({gp.degree_str})
                    {gp.retrograde && <sup style={{ color: '#b91c1c', fontWeight: 'bold' }}> ℞</sup>}
                    <br />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                      {gp.nakshatra} (P{gp.pada}) · {gp.dignity}
                    </span>
                  </td>
                  <td>
                    <span className={`sambandha-badge sambandha-badge--${sambandha.quality}`}>
                      {sambandha.label}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}>
                      {sambandha.desc}
                    </div>
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
