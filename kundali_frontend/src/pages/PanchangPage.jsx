import React, { useState, useEffect } from 'react';
import { getPanchang } from '../api/kundaliApi';
import { LoadingState, ErrorState } from '../components/StatusStates';
import './PanchangPage.css';

/**
 * PanchangPage — Standalone Daily Hindu Panchang & Muhurta page.
 * Displays the 5 Limbs, Auspicious & Inauspicious timings, Choghadiya slots,
 * and Daily Devotional Deity & Vedic Mantra.
 */
export default function PanchangPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getPanchang({ date: selectedDate })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load Panchang');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  return (
    <main className="container panchang-page">
      {/* Header & Date Controls */}
      <header className="panchang-page__header">
        <div className="panchang-page__title-wrap">
          <p className="eyebrow">Dainik Vedic Panchang</p>
          <h1 className="panchang-page__title">Daily Hindu Panchang</h1>
          {data && (
            <p className="panchang-page__date-display">
              📅 {data.formatted_date} · 📍 Pune, India (IST)
            </p>
          )}
        </div>

        <div className="panchang-page__controls">
          <div className="panchang-date-picker">
            <span>📅 Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {selectedDate !== todayStr && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>
          )}
        </div>
      </header>

      {/* Loading / Error States */}
      {loading && <LoadingState message="Calculating astronomical Panchang coordinates..." />}
      {error && <ErrorState message={error} onRetry={() => setSelectedDate(selectedDate)} />}

      {/* Main Content */}
      {!loading && !error && data && (
        <>
          {/* 1. Devotional Deity & Daily Mantra Banner */}
          <section className="panchang-deity-card">
            <div className="panchang-deity-header">
              <h2 className="panchang-deity-title">
                <span>🕉️</span> Daily Devotion — {data.devotional_guidance.ruling_deity} ({data.five_limbs.vara.english} / {data.five_limbs.vara.sanskrit})
              </h2>
            </div>
            <div className="panchang-mantra-box">
              <p className="panchang-mantra-text">
                {data.devotional_guidance.daily_mantra}
              </p>
            </div>
            <p className="panchang-rituals-text">
              <strong>Recommended Spiritual Rituals:</strong> {data.devotional_guidance.recommended_rituals}
            </p>
          </section>

          {/* 2. Five Limbs (Panch-Anga) Hero Grid */}
          <section className="panchang-limbs-grid">
            {/* Tithi */}
            <div className="limb-card">
              <span className="limb-card__label">1. Tithi (Lunar Day)</span>
              <h3 className="limb-card__val">{data.five_limbs.tithi.name}</h3>
              <span className="limb-card__sub">{data.five_limbs.tithi.paksha}</span>
            </div>

            {/* Vara */}
            <div className="limb-card">
              <span className="limb-card__label">2. Vara (Weekday)</span>
              <h3 className="limb-card__val">{data.five_limbs.vara.english}</h3>
              <span className="limb-card__sub">{data.five_limbs.vara.sanskrit} · Ruled by {data.five_limbs.vara.day_lord}</span>
            </div>

            {/* Nakshatra */}
            <div className="limb-card">
              <span className="limb-card__label">3. Nakshatra (Constellation)</span>
              <h3 className="limb-card__val">{data.five_limbs.nakshatra.name}</h3>
              <span className="limb-card__sub">Pada {data.five_limbs.nakshatra.pada}</span>
            </div>

            {/* Yoga */}
            <div className="limb-card">
              <span className="limb-card__label">4. Yoga (Solar-Lunar Alignment)</span>
              <h3 className="limb-card__val">{data.five_limbs.yoga.name}</h3>
              <span className="limb-card__sub">{data.five_limbs.yoga.quality} — {data.five_limbs.yoga.description}</span>
            </div>

            {/* Karana */}
            <div className="limb-card">
              <span className="limb-card__label">5. Karana (Half-Tithi)</span>
              <h3 className="limb-card__val">{data.five_limbs.karana.name}</h3>
              <span className="limb-card__sub">Current Half-Tithi</span>
            </div>
          </section>

          {/* 3. Auspicious & Inauspicious Muhurtas */}
          <section className="panchang-muhurtas-grid">
            {/* Auspicious */}
            <div className="muhurta-box muhurta-box--auspicious">
              <h3 className="muhurta-box__title">
                <span>✦</span> Auspicious Muhurtas (Shubha Kaal)
              </h3>
              <div className="muhurta-list">
                <div className="muhurta-item">
                  <span className="muhurta-item__label">🌅 Sunrise / Sunset</span>
                  <span className="muhurta-item__time mono">{data.sun_moon_timings.sunrise} – {data.sun_moon_timings.sunset}</span>
                </div>
                <div className="muhurta-item">
                  <span className="muhurta-item__label">🧘 Brahma Muhurta</span>
                  <span className="muhurta-item__time mono">{data.auspicious_timings.brahma_muhurta}</span>
                </div>
                <div className="muhurta-item">
                  <span className="muhurta-item__label">🌟 Abhijit Muhurta</span>
                  <span className="muhurta-item__time mono">{data.auspicious_timings.abhijit_muhurta}</span>
                </div>
              </div>
            </div>

            {/* Inauspicious */}
            <div className="muhurta-box muhurta-box--inauspicious">
              <h3 className="muhurta-box__title">
                <span>⚠️</span> Inauspicious Timings (Ashubha Kaal)
              </h3>
              <div className="muhurta-list">
                <div className="muhurta-item">
                  <span className="muhurta-item__label">🛑 Rahu Kaal</span>
                  <span className="muhurta-item__time mono" style={{ color: '#b91c1c' }}>{data.inauspicious_timings.rahu_kaal}</span>
                </div>
                <div className="muhurta-item">
                  <span className="muhurta-item__label">⏳ Yamaganda</span>
                  <span className="muhurta-item__time mono">{data.inauspicious_timings.yamaganda}</span>
                </div>
                <div className="muhurta-item">
                  <span className="muhurta-item__label">🌘 Gulika Kaal</span>
                  <span className="muhurta-item__time mono">{data.inauspicious_timings.gulika_kaal}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Daytime Choghadiya Table */}
          <section className="choghadiya-section">
            <h3 className="choghadiya-title">
              <span>⏱️</span> Daytime Choghadiya (Day Muhurta Timings)
            </h3>
            <div className="choghadiya-table-wrapper">
              <table className="choghadiya-table">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Choghadiya</th>
                    <th>Quality</th>
                    <th>Timing (From – To)</th>
                    <th>Recommended Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {data.choghadiya_day.map((slot) => (
                    <tr key={slot.slot_number}>
                      <td className="mono">#{slot.slot_number}</td>
                      <td>
                        <strong>{slot.name}</strong> ({slot.label})
                      </td>
                      <td>
                        <span className={`choghadiya-badge choghadiya-badge--${slot.nature}`}>
                          {slot.nature} ({slot.type})
                        </span>
                      </td>
                      <td className="mono">{slot.start_time} – {slot.end_time}</td>
                      <td style={{ color: 'var(--color-text-dim)' }}>{slot.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
