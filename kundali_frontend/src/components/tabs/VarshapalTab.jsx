import React, { useState, useEffect } from 'react';
import { getVarshapal } from '../../api/kundaliApi';
import './VarshapalTab.css';
import './tabs.css';

/**
 * VarshapalTab — Tajika Annual Solar Return chart & Mudda Dasha panel.
 * Allows selecting target year, displays Varsha Pravesh, Varsha Lagna,
 * Muntha sign progression, and annual Mudda Dasha timeline.
 */
export default function VarshapalTab({ report }) {
  const { profile } = report;
  const currentYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const personPayload = report.person || report.raw_person || {
    name: profile?.name || '',
    year: parseInt(profile?.year, 10),
    month: parseInt(profile?.month, 10),
    day: parseInt(profile?.day, 10),
    hour: parseInt(profile?.hour, 10),
    minute: parseInt(profile?.minute, 10),
    lat: parseFloat(profile?.lat),
    lon: parseFloat(profile?.lon),
    timezone_str: profile?.timezone_str || 'Asia/Kolkata',
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getVarshapal(personPayload, targetYear)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to calculate Varshapal chart');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetYear]);

  const yearOptions = [
    currentYear - 2, currentYear - 1, currentYear,
    currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4,
  ];

  return (
    <div className="tab-panel varshapal-tab" data-pdf-section="varshapal">
      {/* Year Selection Controls */}
      <div className="tab-section varshapal-controls">
        <div>
          <p className="tab-section__title">Tajika Varshapal (Annual Solar Return)</p>
          <p className="tab-section__subtitle">
            Exact astronomical moment transit Sun returns to natal longitude for Year {targetYear} (Age {data?.age ?? (targetYear - personPayload.year)}).
          </p>
        </div>

        <div className="varshapal-year-pills">
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dim)' }}>Select Year:</span>
          {yearOptions.map((yr) => (
            <button
              key={yr}
              type="button"
              className={`year-pill${targetYear === yr ? ' is-active' : ''}`}
              onClick={() => setTargetYear(yr)}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-copper, #c8720a)' }}>
          <p>⏳ Computing high-precision Solar Return &amp; Muntha progression...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Hero Cards: Pravesh Time, Varsha Lagna, Muntha */}
          <div className="varshapal-hero-grid">
            <div className="varshapal-hero-card varshapal-hero-card--pravesh">
              <span className="varshapal-card-label">Varsha Pravesh (Exact Return)</span>
              <h4 className="varshapal-card-val">{data.varsha_pravesh_ist}</h4>
              <span className="varshapal-card-sub">
                Annual Ascendant (Varsha Lagna): <strong>{data.varsha_lagna.sign}</strong> (Ruled by {data.varsha_lagna.sign_lord})
              </span>
            </div>

            <div className={`varshapal-hero-card ${data.muntha.is_auspicious ? 'varshapal-hero-card--muntha' : 'varshapal-hero-card--muntha-challenging'}`}>
              <span className="varshapal-card-label">Muntha Progression ({targetYear})</span>
              <h4 className="varshapal-card-val">
                {data.muntha.sign} (House {data.muntha.house})
              </h4>
              <span className="varshapal-card-sub">
                {data.muntha.interpretation}
              </span>
            </div>
          </div>

          {/* Mudda Dasha Annual Timeline */}
          <div className="tab-section">
            <p className="tab-section__title">Annual Mudda Dasha Timeline (360-Day Cycle)</p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Duration</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mudda_dasha.map((m) => (
                    <tr key={m.planet}>
                      <td><strong>{m.planet}</strong></td>
                      <td>{m.duration_days} Days</td>
                      <td className="mono">{m.start_date}</td>
                      <td className="mono">{m.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Annual Planetary Positions Table */}
          <div className="tab-section">
            <p className="tab-section__title">Planets in Varshapal Chart</p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Sign</th>
                    <th>Longitude</th>
                    <th>House from Varsha Lagna</th>
                    <th>Motion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p) => (
                    <tr key={p.planet}>
                      <td><strong>{p.planet}</strong></td>
                      <td>{p.sign}</td>
                      <td className="mono">{p.longitude}°</td>
                      <td className="mono"><strong>House {p.house}</strong></td>
                      <td>{p.retrograde ? '℞ Vakri' : 'Direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
