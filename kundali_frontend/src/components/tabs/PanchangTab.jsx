import React, { useState, useEffect } from 'react';
import { getPanchang } from '../../api/kundaliApi';
import { useLang } from '../../context/LanguageContext';
import { getChoghadiyaDesc } from '../../utils/astroTranslations';
import './tabs.css';

/**
 * PanchangTab — 6th tab inside Kundali report.
 * Computes and displays the Hindu Panchang on the exact date and location of birth.
 * Features a Short View / Full Details View toggle.
 */
export default function PanchangTab({ report }) {
  const { profile, moon_nakshatra, moon_pada } = report;
  const { lang, t } = useLang();
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
          <p>
            {lang === 'mr' ? '⏳ जन्माच्या वेळचा अचूक वैदिक पंचांग काढत आहे...' :
             lang === 'hi' ? '⏳ जन्म समय एवं स्थान के अनुसार वैदिक पंचांग गणना जारी है...' :
             lang === 'gu' ? '⏳ જન્મ સમય અનુસાર વૈદિક પંચાંગ ગણતરી ચાલુ છે...' :
             '⏳ Calculating Vedic Janma Panchang at birth time & place...'}
          </p>
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

  const shortViewText = lang === 'mr' ? '📋 संक्षिप्त पंचांग' : lang === 'hi' ? '📋 संक्षिप्त पंचांग' : lang === 'gu' ? '📋 સંક્ષિપ્ત પંચાંગ' : '📋 Short View';
  const fullViewText = lang === 'mr' ? '📜 संपूर्ण तपशील (मुहूर्त व चौघडिया)' : lang === 'hi' ? '📜 संपूर्ण विवरण (मुहूर्त एवं चौघड़िया)' : lang === 'gu' ? '📜 સંપૂર્ણ વિગત (મુહૂર્ત અને ચોઘડિયા)' : '📜 Full Details View';

  return (
    <div className="tab-panel" data-pdf-section="panchang">
      {/* Header and Toggle */}
      <div className="tab-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="tab-section__title">
            {lang === 'mr' ? 'जन्म पंचांग (५ प्रमुख अंगे)' :
             lang === 'hi' ? 'जन्म पंचांग (५ मुख्य अंग)' :
             lang === 'gu' ? 'જન્મ પંચાંગ (૫ મુખ્ય અંગો)' :
             'Janma Panchang (Birth Date Limbs)'}
          </p>
          <p className="tab-section__subtitle">
            {lang === 'mr' ? `तारीख: ${data.formatted_date} · स्थान: ${profile.birth_place || 'जन्म स्थान'}` :
             lang === 'hi' ? `दिनांक: ${data.formatted_date} · स्थान: ${profile.birth_place || 'जन्म स्थान'}` :
             lang === 'gu' ? `તારીખ: ${data.formatted_date} · સ્થળ: ${profile.birth_place || 'જન્મ સ્થળ'}` :
             `Astronomical Panchang calculated for ${data.formatted_date} at ${profile.birth_place || 'Birth Coordinates'}.`}
          </p>
        </div>

        <div className="inner-tabs">
          <button
            type="button"
            className={`inner-tab${viewMode === 'short' ? ' is-active' : ''}`}
            onClick={() => setViewMode('short')}
          >
            {shortViewText}
          </button>
          <button
            type="button"
            className={`inner-tab${viewMode === 'full' ? ' is-active' : ''}`}
            onClick={() => setViewMode('full')}
          >
            {fullViewText}
          </button>
        </div>
      </div>

      {/* 5 Limbs Cards */}
      <div className="tab-section">
        <div className="kundali-report__stats-grid">
          <div className="stat-card">
            <dt>{lang === 'mr' || lang === 'hi' ? '१. तिथी' : lang === 'gu' ? '૧. તિથિ' : '1. Tithi'}</dt>
            <dd className="stat-card__val">{data.five_limbs.tithi.name}</dd>
            <dd className="stat-card__sub">{data.five_limbs.tithi.paksha}</dd>
          </div>
          <div className="stat-card">
            <dt>{lang === 'mr' || lang === 'hi' ? '२. वार' : lang === 'gu' ? '૨. વાર' : '2. Vara'}</dt>
            <dd className="stat-card__val">
              {lang === 'mr' || lang === 'hi' || lang === 'gu' ? data.five_limbs.vara.sanskrit : data.five_limbs.vara.english}
            </dd>
            <dd className="stat-card__sub">
              {lang === 'mr' ? `स्वामी: ${data.five_limbs.vara.day_lord}` :
               lang === 'hi' ? `स्वामी: ${data.five_limbs.vara.day_lord}` :
               lang === 'gu' ? `સ્વામી: ${data.five_limbs.vara.day_lord}` :
               `Lord: ${data.five_limbs.vara.day_lord}`}
            </dd>
          </div>
          <div className="stat-card">
            <dt>{lang === 'mr' || lang === 'hi' ? '३. नक्षत्र' : lang === 'gu' ? '૩. નક્ષત્ર' : '3. Nakshatra'}</dt>
            <dd className="stat-card__val">{data.five_limbs.nakshatra.name}</dd>
            <dd className="stat-card__sub mono">
              {lang === 'mr' || lang === 'hi' ? `चरण / पाद ${data.five_limbs.nakshatra.pada}` :
               lang === 'gu' ? `પાદ ${data.five_limbs.nakshatra.pada}` :
               `Pada ${data.five_limbs.nakshatra.pada}`}
            </dd>
          </div>
          <div className="stat-card">
            <dt>{lang === 'mr' || lang === 'hi' ? '४. योग' : lang === 'gu' ? '૪. યોગ' : '4. Yoga'}</dt>
            <dd className="stat-card__val">{data.five_limbs.yoga.name}</dd>
            <dd className="stat-card__sub">{data.five_limbs.yoga.quality}</dd>
          </div>
          <div className="stat-card">
            <dt>{lang === 'mr' || lang === 'hi' ? '५. करण' : lang === 'gu' ? '૫. કરણ' : '5. Karana'}</dt>
            <dd className="stat-card__val">{data.five_limbs.karana.name}</dd>
            <dd className="stat-card__sub">
              {lang === 'mr' ? 'अर्धी तिथी' : lang === 'hi' ? 'अर्ध-तिथि' : lang === 'gu' ? 'અડધી તિથિ' : 'Half-Tithi'}
            </dd>
          </div>
        </div>
      </div>

      {/* Devotional Deity Banner */}
      <div className="tab-section">
        <div style={{ background: 'rgba(200, 114, 10, 0.06)', borderLeft: '4px solid var(--color-copper, #c8720a)', padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
          <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-copper-deep, #9c4b00)', fontSize: '1.05rem' }}>
            🕉️ {lang === 'mr' ? `जन्म वार आराध्य देवता: ${data.devotional_guidance.ruling_deity}` :
                lang === 'hi' ? `जन्म दिन आराध्य देव: ${data.devotional_guidance.ruling_deity}` :
                lang === 'gu' ? `જન્મ વાર આરાધ્ય દેવ: ${data.devotional_guidance.ruling_deity}` :
                `Birth Day Devotion: ${data.devotional_guidance.ruling_deity}`}
          </h4>
          <p style={{ margin: '0 0 0.5rem', fontStyle: 'italic', color: '#78350f', fontSize: '0.92rem' }}>
            {data.devotional_guidance.daily_mantra}
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-dim, #6b7280)' }}>
            <strong>{lang === 'mr' ? 'शुभ उपासना व उपाय:' : lang === 'hi' ? 'शुभ उपासना एवं उपाय:' : lang === 'gu' ? 'શુભ ઉપાસના:' : 'Recommended Practices:'}</strong>{' '}
            {data.devotional_guidance.recommended_rituals}
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
                <h4 style={{ margin: '0 0 0.75rem', color: '#15803d', fontSize: '0.95rem' }}>
                  ✦ {lang === 'mr' ? 'शुभ मुहूर्त' : lang === 'hi' ? 'शुभ मुहूर्त' : lang === 'gu' ? 'શુભ મુહૂર્ત' : 'Auspicious Muhurtas'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌅 {lang === 'mr' || lang === 'hi' ? 'सूर्योदय / सूर्यास्त:' : lang === 'gu' ? 'સૂર્યોદય / સૂર્યાસ્ત:' : 'Sunrise / Sunset:'}</span>
                    <strong className="mono">{data.sun_moon_timings.sunrise} – {data.sun_moon_timings.sunset}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🧘 {lang === 'mr' || lang === 'hi' ? 'ब्रह्म मुहूर्त:' : lang === 'gu' ? 'બ્રહ્મ મુહૂર્ત:' : 'Brahma Muhurta:'}</span>
                    <strong className="mono">{data.auspicious_timings.brahma_muhurta}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌟 {lang === 'mr' || lang === 'hi' ? 'अभिजित मुहूर्त:' : lang === 'gu' ? 'અભિજિત મુહૂર્ત:' : 'Abhijit Muhurta:'}</span>
                    <strong className="mono">{data.auspicious_timings.abhijit_muhurta}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-panel, #fff)', border: '1px solid var(--color-hairline, #e5e7eb)', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#b91c1c', fontSize: '0.95rem' }}>
                  ⚠️ {lang === 'mr' ? 'अशुभ काळ / वर्ज्य वेळ' : lang === 'hi' ? 'अशुभ समय / वर्जित काल' : lang === 'gu' ? 'અશુભ સમય / વર્જિત કાળ' : 'Inauspicious Periods'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🛑 {lang === 'mr' || lang === 'hi' ? 'राहु काळ:' : lang === 'gu' ? 'રાહુ કાળ:' : 'Rahu Kaal:'}</span>
                    <strong className="mono" style={{ color: '#b91c1c' }}>{data.inauspicious_timings.rahu_kaal}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏳ {lang === 'mr' || lang === 'hi' ? 'यमगंड काळ:' : lang === 'gu' ? 'યમગંડ કાળ:' : 'Yamaganda:'}</span>
                    <strong className="mono">{data.inauspicious_timings.yamaganda}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌘 {lang === 'mr' || lang === 'hi' ? 'गुलिक काळ:' : lang === 'gu' ? 'ગુલિક કાળ:' : 'Gulika Kaal:'}</span>
                    <strong className="mono">{data.inauspicious_timings.gulika_kaal}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daytime Choghadiya */}
          <div className="tab-section">
            <p className="tab-section__title">
              {lang === 'mr' ? 'जन्मतारखेचे दिवस चौघडिया चक्र' :
               lang === 'hi' ? 'जन्मतिथि का दिन चौघड़िया चक्र' :
               lang === 'gu' ? 'જન્મતારીખનું દિવસ ચોઘડિયું' :
               'Daytime Choghadiya on Birth Date'}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-panel-raised, #f9fafb)', textAlign: 'left', borderBottom: '1px solid var(--color-hairline, #e5e7eb)' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>#</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>{lang === 'mr' ? 'चौघडिया' : lang === 'hi' ? 'चौघड़िया' : lang === 'gu' ? 'ચોઘડિયું' : 'Choghadiya'}</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>{lang === 'mr' ? 'गुणधर्म / फळ' : lang === 'hi' ? 'गुणधर्म / फल' : lang === 'gu' ? 'ગુણધર્મ / ફળ' : 'Quality'}</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>{lang === 'mr' ? 'वेळ' : lang === 'hi' ? 'समय' : lang === 'gu' ? 'સમય' : 'Timing'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.choghadiya_day.map((slot) => (
                    <tr key={slot.slot_number} style={{ borderBottom: '1px solid var(--color-hairline, #f3f4f6)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }} className="mono">#{slot.slot_number}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}><strong>{slot.name}</strong> ({slot.label})</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{getChoghadiyaDesc(slot.name, slot.nature, lang)}</td>
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
