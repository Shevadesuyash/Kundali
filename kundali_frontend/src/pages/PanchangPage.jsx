import React, { useState, useEffect, useRef } from 'react';
import { getPanchang, geocodeSearch } from '../api/kundaliApi';
import { LoadingState, ErrorState } from '../components/StatusStates';
import './PanchangPage.css';

const PRESET_CITIES = [
  { name: 'Pune', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
];

/**
 * PanchangPage — Standalone Daily Hindu Panchang & Muhurta page.
 * Displays the 5 Limbs, Auspicious & Inauspicious timings, Choghadiya slots,
 * Daily Devotional Deity & Vedic Mantra with dynamic date and location search.
 */
export default function PanchangPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentCity, setCurrentCity] = useState(PRESET_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load Panchang data whenever date or city coordinates change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const latVal = parseFloat(currentCity.lat) || 18.5204;
    const lonVal = parseFloat(currentCity.lon) || 73.8567;
    const tzVal = currentCity.tz || 'Asia/Kolkata';

    getPanchang({
      date: selectedDate,
      lat: latVal,
      lon: lonVal,
      tz: tzVal,
    })
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
  }, [selectedDate, currentCity]);

  // Geocoding search debouncer
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await geocodeSearch(q.trim());
        setSearchResults(results || []);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectLocation = (loc) => {
    const rawDisplayName = loc.display_name || loc.name || 'Selected City';
    const cityName = rawDisplayName.split(',')[0].trim();
    const latNum = parseFloat(loc.lat) || 18.5204;
    const lonNum = parseFloat(loc.lon) || 73.8567;
    const tzStr = loc.timezone_str || 'Asia/Kolkata';

    setCurrentCity({
      name: cityName,
      lat: latNum,
      lon: lonNum,
      tz: tzStr,
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const displayLat = typeof currentCity.lat === 'number' ? currentCity.lat : parseFloat(currentCity.lat) || 0;
  const displayLon = typeof currentCity.lon === 'number' ? currentCity.lon : parseFloat(currentCity.lon) || 0;

  return (
    <main className="container panchang-page">
      {/* Header & Date / Location Controls */}
      <header className="panchang-page__header">
        <div className="panchang-page__title-wrap">
          <p className="eyebrow">Dainik Vedic Panchang</p>
          <h1 className="panchang-page__title">Daily Hindu Panchang</h1>
          {data && (
            <p className="panchang-page__date-display">
              📅 {data.formatted_date} · 📍 <strong>{currentCity.name}</strong> ({displayLat.toFixed(2)}°N, {displayLon.toFixed(2)}°E)
            </p>
          )}
        </div>

        <div className="panchang-page__controls">
          <div className="panchang-date-picker">
            <span>📅 Date:</span>
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

      {/* Location Selector Bar */}
      <section className="panchang-location-bar">
        <div className="panchang-location-search-wrap" ref={dropdownRef}>
          <span className="panchang-loc-icon">📍</span>
          <input
            type="text"
            className="panchang-loc-input"
            placeholder="Search any city or village (e.g. Nagpur, Nashik, Jaipur, London)..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {isSearching && <span className="panchang-loc-spinner">⏳</span>}

          {showDropdown && searchResults.length > 0 && (
            <ul className="panchang-loc-dropdown">
              {searchResults.map((loc, idx) => (
                <li
                  key={idx}
                  className="panchang-loc-option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectLocation(loc);
                  }}
                >
                  <strong>{(loc.display_name || '').split(',')[0]}</strong>
                  <span className="panchang-loc-sub">{loc.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Preset City Chips */}
        <div className="panchang-city-presets">
          <span className="panchang-presets-label">Popular:</span>
          {PRESET_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`panchang-city-chip${currentCity.name === c.name ? ' is-active' : ''}`}
              onClick={() => setCurrentCity(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Loading / Error States */}
      {loading && <LoadingState message={`Calculating astronomical Panchang coordinates for ${currentCity.name}...`} />}
      {error && <ErrorState message={error} onRetry={() => setSelectedDate(selectedDate)} />}

      {/* Main Content */}
      {!loading && !error && data && data.five_limbs && (
        <>
          {/* 1. Devotional Deity & Daily Mantra Banner */}
          {data.devotional_guidance && (
            <section className="panchang-deity-card">
              <div className="panchang-deity-header">
                <h2 className="panchang-deity-title">
                  <span>🕉️</span> Daily Devotion — {data.devotional_guidance.ruling_deity} ({data.five_limbs.vara?.english} / {data.five_limbs.vara?.sanskrit})
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
          )}

          {/* 2. Five Limbs (Panch-Anga) Hero Grid */}
          <section className="panchang-limbs-grid">
            {/* Tithi */}
            <div className="limb-card">
              <span className="limb-card__label">1. Tithi (Lunar Day)</span>
              <h3 className="limb-card__val">{data.five_limbs.tithi?.name}</h3>
              <span className="limb-card__sub">{data.five_limbs.tithi?.paksha}</span>
            </div>

            {/* Vara */}
            <div className="limb-card">
              <span className="limb-card__label">2. Vara (Weekday)</span>
              <h3 className="limb-card__val">{data.five_limbs.vara?.english}</h3>
              <span className="limb-card__sub">{data.five_limbs.vara?.sanskrit} · Ruled by {data.five_limbs.vara?.day_lord}</span>
            </div>

            {/* Nakshatra */}
            <div className="limb-card">
              <span className="limb-card__label">3. Nakshatra (Constellation)</span>
              <h3 className="limb-card__val">{data.five_limbs.nakshatra?.name}</h3>
              <span className="limb-card__sub">Pada {data.five_limbs.nakshatra?.pada}</span>
            </div>

            {/* Yoga */}
            <div className="limb-card">
              <span className="limb-card__label">4. Yoga (Solar-Lunar Alignment)</span>
              <h3 className="limb-card__val">{data.five_limbs.yoga?.name}</h3>
              <span className="limb-card__sub">{data.five_limbs.yoga?.quality} — {data.five_limbs.yoga?.description}</span>
            </div>

            {/* Karana */}
            <div className="limb-card">
              <span className="limb-card__label">5. Karana (Half-Tithi)</span>
              <h3 className="limb-card__val">{data.five_limbs.karana?.name}</h3>
              <span className="limb-card__sub">Current Half-Tithi</span>
            </div>
          </section>

          {/* 3. Auspicious & Inauspicious Muhurtas */}
          {data.sun_moon_timings && data.auspicious_timings && data.inauspicious_timings && (
            <section className="panchang-muhurtas-grid">
              {/* Auspicious */}
              <div className="muhurta-box muhurta-box--auspicious">
                <h3 className="muhurta-box__title">
                  <span>✦</span> Auspicious Muhurtas ({currentCity.name})
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
                  <span>⚠️</span> Inauspicious Timings ({currentCity.name})
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
          )}

          {/* 4. Daytime Choghadiya Table */}
          {data.choghadiya_day && data.choghadiya_day.length > 0 && (
            <section className="choghadiya-section">
              <h3 className="choghadiya-title">
                <span>⏱️</span> Daytime Choghadiya Muhurtas for {currentCity.name}
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
          )}
        </>
      )}
    </main>
  );
}
