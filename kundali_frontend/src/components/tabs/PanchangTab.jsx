import React, { useState, useEffect } from 'react';
import { getPanchang } from '../../api/kundaliApi';
import './tabs.css';

/**
 * PanchangTab — 6th tab inside Kundali report.
 * Computes and displays the Hindu Panchang on the exact date and location of birth.
 * Features a Short View / Full Details View toggle.
 */
export default function PanchangTab({ report }) {
  const { profile, moon_nakshatra, moon_pada } = report;
  const [viewMode, setViewMode] = useState('short'); // 'short' or 'full'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const birthDateStr = `${profile.year}-${String(profile.month).padStart(2, '0')}-${String(profile.day).padStart(2, '0')}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getPanchang({
      date: birthDateStr,
      lat: parseFloat(profile.lat) || 18.5204,
      lon: parseFloat(profile.lon) || 73.8567,
      tz: profile.timezone_str || 'Asia/Kolkata',
    })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to calculate birth Panchang');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [birthDateStr, profile.lat, profile.lon, profile.timezone_str]);

  if (loading) {
    return (
      <div className="tab-panel" data-pdf-section="panchang">
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-copper, #c8720a)' }}>
          <p>⏳ Calculating Vedic Janma Panchang at birth time &amp; place...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="tab-panel" data-pdf-section="panchang">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>⚠️ {error || 'Panchang details unavailable'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel" data-pdf-section="panchang">
      {/* Header and Toggle */}
      <div className="tab-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="tab-section__title">Janma Panchang (Birth Date Limbs)</p>
          <p className="tab-section__subtitle">
            Astronomical Panchang calculated for <strong>{data.formatted_date}</strong> at {profile.birth_place || 'Birth Coordinates'}.
          </p>
        </div>

        <div className="inner-tabs">
          <button
            type="button"
            className={`inner-tab${viewMode === 'short' ? ' is-active' : ''}`}
            onClick={() => setViewMode('short')}
          >
            📋 Short View
          </button>
          <button
            type="button"
            className={`inner-tab${viewMode === 'full' ? ' is-active' : ''}`}
            onClick={() => setViewMode('full')}
          >
            📜 Full Details View
          </button>
        </div>
      </div>

      {/* 5 Limbs Cards */}
      <div className="tab-section">
        <div className="kundali-report__stats-grid">
          <div className="stat-card">
            <dt>1. Tithi</dt>
            <dd className="stat-card__val">{data.five_limbs.tithi.name}</dd>
            <dd className="stat-card__sub">{data.five_limbs.tithi.paksha}</dd>
          </div>
          <div className="stat-card">
            <dt>2. Vara</dt>
            <dd className="stat-card__val">{data.five_limbs.vara.english}</dd>
            <dd className="stat-card__sub">{data.five_limbs.vara.sanskrit} ({data.five_limbs.vara.day_lord})</dd>
          </div>
          <div className="stat-card">
            <dt>3. Nakshatra</dt>
            <dd className="stat-card__val">{data.five_limbs.nakshatra.name}</dd>
            <dd className="stat-card__sub mono">Pada {data.five_limbs.nakshatra.pada}</dd>
          </div>
          <div className="stat-card">
            <dt>4. Yoga</dt>
            <dd className="stat-card__val">{data.five_limbs.yoga.name}</dd>
            <dd className="stat-card__sub">{data.five_limbs.yoga.quality}</dd>
          </div>
          <div className="stat-card">
            <dt>5. Karana</dt>
            <dd className="stat-card__val">{data.five_limbs.karana.name}</dd>
            <dd className="stat-card__sub">Half-Tithi</dd>
          </div>
        </div>
      </div>

      {/* Devotional Deity Banner */}
      <div className="tab-section">
        <div style={{ background: 'rgba(200, 114, 10, 0.06)', borderLeft: '4px solid var(--color-copper, #c8720a)', padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
          <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-copper-deep, #9c4b00)', fontSize: '1.05rem' }}>
            🕉️ Birth Day Devotion: {data.devotional_guidance.ruling_deity}
          </h4>
          <p style={{ margin: '0 0 0.5rem', fontStyle: 'italic', color: '#78350f', fontSize: '0.92rem' }}>
            {data.devotional_guidance.daily_mantra}
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-dim, #6b7280)' }}>
            <strong>Recommended Practices:</strong> {data.devotional_guidance.recommended_rituals}
          </p>
        </div>
      </div>

      {/* Full Details Section (Muhurtas & Choghadiya) */}
      {viewMode === 'full' && (
        <>
          {/* Muhurtas Grid */}
          <div className="tab-section">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--color-bg-panel, #fff)', border: '1px solid var(--color-hairline, #e5e7eb)', borderLeft: '4px solid #16a34a', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#15803d', fontSize: '0.95rem' }}>✦ Auspicious Muhurtas</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌅 Sunrise / Sunset:</span>
                    <strong className="mono">{data.sun_moon_timings.sunrise} – {data.sun_moon_timings.sunset}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🧘 Brahma Muhurta:</span>
                    <strong className="mono">{data.auspicious_timings.brahma_muhurta}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌟 Abhijit Muhurta:</span>
                    <strong className="mono">{data.auspicious_timings.abhijit_muhurta}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-panel, #fff)', border: '1px solid var(--color-hairline, #e5e7eb)', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#b91c1c', fontSize: '0.95rem' }}>⚠️ Inauspicious Periods</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🛑 Rahu Kaal:</span>
                    <strong className="mono" style={{ color: '#b91c1c' }}>{data.inauspicious_timings.rahu_kaal}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏳ Yamaganda:</span>
                    <strong className="mono">{data.inauspicious_timings.yamaganda}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌘 Gulika Kaal:</span>
                    <strong className="mono">{data.inauspicious_timings.gulika_kaal}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daytime Choghadiya */}
          <div className="tab-section">
            <p className="tab-section__title">Daytime Choghadiya on Birth Date</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-panel-raised, #f9fafb)', textAlign: 'left', borderBottom: '1px solid var(--color-hairline, #e5e7eb)' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Slot</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Choghadiya</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Quality</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {data.choghadiya_day.map((slot) => (
                    <tr key={slot.slot_number} style={{ borderBottom: '1px solid var(--color-hairline, #f3f4f6)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }} className="mono">#{slot.slot_number}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}><strong>{slot.name}</strong> ({slot.label})</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{slot.nature}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }} className="mono">{slot.start_time} – {slot.end_time}</td>
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
