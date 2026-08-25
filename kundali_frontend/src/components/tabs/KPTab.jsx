import React from 'react';
import './KPTab.css';
import './tabs.css';

/**
 * KPTab — Krishnamurti Paddhati (KP System) analysis panel.
 * Displays:
 * 1. Ruling Planets (RP) at chart time
 * 2. 12 Placidus Cusps with Sign Lord, Star Lord, Sub Lord & Sub-Sub Lord
 * 3. 9 Planets KP Table & Placidus House Occupancy
 * 4. 4-Fold House Significators
 */
export default function KPTab({ report }) {
  const { kp } = report;

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

  return (
    <div className="tab-panel kp-tab" data-pdf-section="kp-system">
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
        </div>
      </section>

      {/* 2. 12 Placidus Cuspal Table */}
      <section className="tab-section">
        <p className="tab-section__title">KP 12 Placidus House Cusps</p>
        <p className="tab-section__subtitle">
          Exact cuspal degrees with Sign Lord, Star (Nakshatra) Lord, Sub Lord, and Sub-Sub Lord.
        </p>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>Cusp #</th>
                <th>Degree</th>
                <th>Sign</th>
                <th>Sign Lord</th>
                <th>Nakshatra</th>
                <th>Star Lord</th>
                <th>Sub Lord (KP)</th>
                <th>Sub-Sub Lord</th>
              </tr>
            </thead>
            <tbody>
              {cusps.map((c) => (
                <tr key={c.house}>
                  <td className="mono">
                    <strong>House {c.house}</strong>
                  </td>
                  <td className="mono">{c.degree_str}</td>
                  <td>{c.sign}</td>
                  <td>{c.sign_lord}</td>
                  <td>{c.nakshatra}</td>
                  <td>{c.star_lord}</td>
                  <td className="kp-sublord-cell">{c.sub_lord}</td>
                  <td style={{ color: 'var(--color-text-dim)' }}>{c.sub_sub_lord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 9 Planets KP Table */}
      <section className="tab-section">
        <p className="tab-section__title">KP Planetary Positions &amp; Placidus Occupancy</p>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>Degree</th>
                <th>Sign</th>
                <th>Sign Lord</th>
                <th>Star Lord</th>
                <th>Sub Lord (KP)</th>
                <th>Sub-Sub Lord</th>
                <th>Placidus House</th>
                <th>Motion</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p) => (
                <tr key={p.planet}>
                  <td>
                    <strong>{p.planet}</strong>
                  </td>
                  <td className="mono">{p.degree_str}</td>
                  <td>{p.sign}</td>
                  <td>{p.sign_lord}</td>
                  <td>{p.star_lord}</td>
                  <td className="kp-sublord-cell">{p.sub_lord}</td>
                  <td style={{ color: 'var(--color-text-dim)' }}>{p.sub_sub_lord}</td>
                  <td className="mono">
                    <strong>House {p.house}</strong>
                  </td>
                  <td>{p.is_retrograde ? '℞ Vakri' : 'Direct'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 4-Fold Significators Table */}
      <section className="tab-section">
        <p className="tab-section__title">4-Fold House Significators</p>
        <p className="tab-section__subtitle">
          Level 1: Star of Occupant (Strongest) · Level 2: Occupant · Level 3: Star of Lord · Level 4: House Lord
        </p>
        <div className="kp-table-wrapper">
          <table className="kp-table">
            <thead>
              <tr>
                <th>House</th>
                <th>Level 1 (Star of Occupant)</th>
                <th>Level 2 (Occupant)</th>
                <th>Level 3 (Star of Lord)</th>
                <th>Level 4 (House Lord)</th>
              </tr>
            </thead>
            <tbody>
              {significators.map((s) => (
                <tr key={s.house}>
                  <td className="mono">
                    <strong>H{s.house}</strong>
                  </td>
                  <td>
                    {s.level_1_star_of_occupant.length > 0
                      ? s.level_1_star_of_occupant.map((p) => (
                          <span key={p} className="kp-sig-pill">{p}</span>
                        ))
                      : '—'}
                  </td>
                  <td>
                    {s.level_2_occupant.length > 0
                      ? s.level_2_occupant.map((p) => (
                          <span key={p} className="kp-sig-pill">{p}</span>
                        ))
                      : '—'}
                  </td>
                  <td>
                    {s.level_3_star_of_lord.length > 0
                      ? s.level_3_star_of_lord.map((p) => (
                          <span key={p} className="kp-sig-pill">{p}</span>
                        ))
                      : '—'}
                  </td>
                  <td>
                    {s.level_4_lord.length > 0
                      ? s.level_4_lord.map((p) => (
                          <span key={p} className="kp-sig-pill">{p}</span>
                        ))
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
