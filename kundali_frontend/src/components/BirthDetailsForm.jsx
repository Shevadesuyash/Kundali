import { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeSearch } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import './BirthDetailsForm.css';
import './PlaceSearch.css';

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST, UTC+5:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4:00)' },
  { value: 'Asia/Karachi', label: 'Pakistan (UTC+5:00)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (UTC+6:00)' },
  { value: 'Asia/Kathmandu', label: 'Nepal (UTC+5:45)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'US Eastern (UTC-5:00/-4:00)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (UTC-8:00/-7:00)' },
  { value: 'Europe/London', label: 'UK (UTC+0:00/+1:00)' },
];

/**
 * Guesses a IANA timezone string from Nominatim's address object.
 * Falls back to Asia/Kolkata if the country is India and nothing more specific
 * can be determined. For most Indian users this is always correct.
 */
function guessTimezone(nominatimResult) {
  const cc = nominatimResult.address?.country_code?.toLowerCase();
  const tzMap = {
    in: 'Asia/Kolkata',
    pk: 'Asia/Karachi',
    bd: 'Asia/Dhaka',
    np: 'Asia/Kathmandu',
    ae: 'Asia/Dubai',
    gb: 'Europe/London',
    us: 'America/New_York',
    de: 'Europe/Berlin',
    fr: 'Europe/Paris',
    au: 'Australia/Sydney',
    cn: 'Asia/Shanghai',
    jp: 'Asia/Tokyo',
  };
  return tzMap[cc] || 'UTC';
}

/** Calls backend geocode endpoint (3-tier cached: memory -> SQLite -> Nominatim). */
function searchPlaces(query) {
  return geocodeSearch(query);
}

const emptyPerson = {
  name: '',
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  lat: '',
  lon: '',
  timezone_str: 'Asia/Kolkata',
};

export function makeEmptyPerson() {
  return { ...emptyPerson };
}

/**
 * Controlled form for one person's birth details.
 */
export default function BirthDetailsForm({ label, value, onChange, idPrefix }) {
  const { t } = useLang();
  const [touched, setTouched] = useState({});
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  function update(field, raw) {
    onChange({ ...value, [field]: raw });
  }

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  const id = (field) => `${idPrefix}-${field}`;

  // Debounced place search
  const handlePlaceInput = useCallback((query) => {
    setPlaceQuery(query);
    setSelectedPlace('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  // Pick a place from the dropdown
  function handlePickPlace(place) {
    const lat = parseFloat(place.lat).toFixed(4);
    const lon = parseFloat(place.lon).toFixed(4);
    const tz = guessTimezone(place);
    const displayName = place.display_name.split(',').slice(0, 3).join(', ');

    setSelectedPlace(displayName);
    setPlaceQuery(displayName);
    setShowDropdown(false);
    setSuggestions([]);

    onChange({
      ...value,
      lat,
      lon,
      timezone_str: tz,
    });
  }

  // Collapse dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <fieldset className="birth-form">
      <legend className="birth-form__legend">{label}</legend>

      <div className="birth-form__row">
        <label className="birth-form__field birth-form__field--wide" htmlFor={id('name')}>
          <span>{t('form.name')}</span>
          <input
            id={id('name')}
            type="text"
            value={value.name}
            placeholder={t('form.name.placeholder')}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => markTouched('name')}
            required
          />
        </label>
      </div>

      <div className="birth-form__row">
        <span className="birth-form__group-label">{t('form.dob')}</span>
        <div className="birth-form__group">
          <label className="birth-form__field birth-form__field--sm" htmlFor={id('day')}>
            <span>{t('form.day')}</span>
            <input id={id('day')} type="number" min={1} max={31} value={value.day}
              onChange={(e) => update('day', e.target.value)} onBlur={() => markTouched('day')} required />
          </label>
          <label className="birth-form__field birth-form__field--sm" htmlFor={id('month')}>
            <span>{t('form.month')}</span>
            <input id={id('month')} type="number" min={1} max={12} value={value.month}
              onChange={(e) => update('month', e.target.value)} onBlur={() => markTouched('month')} required />
          </label>
          <label className="birth-form__field birth-form__field--sm" htmlFor={id('year')}>
            <span>{t('form.year')}</span>
            <input id={id('year')} type="number" min={1900} max={2100} value={value.year}
              onChange={(e) => update('year', e.target.value)} onBlur={() => markTouched('year')} required />
          </label>
        </div>
      </div>

      <div className="birth-form__row">
        <span className="birth-form__group-label">{t('form.tob')}</span>
        <div className="birth-form__group">
          <label className="birth-form__field birth-form__field--sm" htmlFor={id('hour')}>
            <span>{t('form.hour')}</span>
            <input id={id('hour')} type="number" min={0} max={23} value={value.hour}
              onChange={(e) => update('hour', e.target.value)} onBlur={() => markTouched('hour')} required />
          </label>
          <label className="birth-form__field birth-form__field--sm" htmlFor={id('minute')}>
            <span>{t('form.minute')}</span>
            <input id={id('minute')} type="number" min={0} max={59} value={value.minute}
              onChange={(e) => update('minute', e.target.value)} onBlur={() => markTouched('minute')} required />
          </label>
        </div>
      </div>

      {/* ── Birthplace Search ────────────────────────────────── */}
      <div className="birth-form__row">
        <div className="place-search-wrap" ref={wrapperRef}>
          <label className="birth-form__field birth-form__field--wide" htmlFor={id('place')}>
            <span className="place-search__label">
              {t('form.birthplace')}
              <span className="place-search__hint">{t('form.birthplace.hint')}</span>
            </span>
            <div className="place-search__input-wrap">
              <span className="place-search__icon">📍</span>
              <input
                id={id('place')}
                type="text"
                className="place-search__input"
                value={placeQuery}
                placeholder={t('form.birthplace.placeholder')}
                autoComplete="off"
                onChange={(e) => handlePlaceInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              />
              {searching && <span className="place-search__spinner" aria-label="Searching…" />}
              {selectedPlace && !searching && (
                <span className="place-search__ok" title="Coordinates filled">✓</span>
              )}
            </div>
          </label>

          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul className="place-search__dropdown" role="listbox" aria-label="Place suggestions">
              {suggestions.map((place) => {
                const parts = place.display_name.split(',');
                const primary = parts.slice(0, 2).join(',').trim();
                const secondary = parts.slice(2, 5).join(',').trim();
                return (
                  <li
                    key={place.place_id}
                    role="option"
                    className="place-search__option"
                    onMouseDown={() => handlePickPlace(place)}
                  >
                    <span className="place-search__option-icon">
                      {place.type === 'city' || place.type === 'town' ? '🏙️' : '📌'}
                    </span>
                    <span className="place-search__option-content">
                      <span className="place-search__option-primary">{primary}</span>
                      {secondary && (
                        <span className="place-search__option-secondary">{secondary}</span>
                      )}
                    </span>
                    <span className="place-search__option-coords">
                      {parseFloat(place.lat).toFixed(2)}°, {parseFloat(place.lon).toFixed(2)}°
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Coordinates (auto-filled or manual) ─────────────── */}
      <div className="birth-form__row">
        <span className="birth-form__group-label">
          {t('form.coords')}
          {selectedPlace && (
            <span className="coords-source-badge">{t('form.autofilled')}</span>
          )}
        </span>
        <div className="birth-form__group">
          <label className="birth-form__field" htmlFor={id('lat')}>
            <span>{t('form.lat')}</span>
            <input
              id={id('lat')}
              type="number"
              step="0.0001"
              min={-90}
              max={90}
              value={value.lat}
              placeholder="e.g. 18.5204"
              onChange={(e) => { update('lat', e.target.value); setSelectedPlace(''); }}
              onBlur={() => markTouched('lat')}
              required
              className={selectedPlace ? 'input--autofilled' : ''}
            />
          </label>
          <label className="birth-form__field" htmlFor={id('lon')}>
            <span>{t('form.lon')}</span>
            <input
              id={id('lon')}
              type="number"
              step="0.0001"
              min={-180}
              max={180}
              value={value.lon}
              placeholder="e.g. 73.8567"
              onChange={(e) => { update('lon', e.target.value); setSelectedPlace(''); }}
              onBlur={() => markTouched('lon')}
              required
              className={selectedPlace ? 'input--autofilled' : ''}
            />
          </label>
        </div>
      </div>

      <div className="birth-form__row">
        <label className="birth-form__field birth-form__field--wide" htmlFor={id('tz')}>
          <span>{t('form.tz')}</span>
          <select id={id('tz')} value={value.timezone_str} onChange={(e) => update('timezone_str', e.target.value)}>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

/** Converts form-state strings into the number-typed payload the API expects. */
export function toApiPayload(person) {
  return {
    name: person.name.trim(),
    year: Number(person.year),
    month: Number(person.month),
    day: Number(person.day),
    hour: Number(person.hour),
    minute: Number(person.minute),
    lat: Number(person.lat),
    lon: Number(person.lon),
    timezone_str: person.timezone_str,
  };
}

export function isPersonComplete(person) {
  return ['name', 'year', 'month', 'day', 'hour', 'minute', 'lat', 'lon'].every(
    (f) => person[f] !== '' && person[f] !== null && person[f] !== undefined
  );
}
