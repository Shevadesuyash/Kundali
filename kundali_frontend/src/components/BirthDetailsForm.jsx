import { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeSearch, searchProfilesTypeahead, updateProfile } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import GenderToggle from './GenderToggle';
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
 * Falls back to Asia/Kolkata if the country is India.
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
  gender: '',
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  lat: '',
  lon: '',
  timezone_str: 'Asia/Kolkata',
  place_label: '',
};

export function makeEmptyPerson() {
  return { ...emptyPerson };
}

/**
 * Controlled form for one person's birth details.
 * Now includes:
 *  - GenderToggle at the top
 *  - Typeahead profile name search with auto-fill
 *  - "Modified from Saved Profile" badge with Save/Keep options
 */
export default function BirthDetailsForm({
  label, value, onChange, idPrefix,
  showGender = true,      // show gender toggle (hide for legacy compact use)
  genderRequired = false, // mark gender as required
}) {
  const { t } = useLang();
  const [touched, setTouched] = useState({});

  // ── Place search state ────────────────────────────────────────────────
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const placeDebounceRef = useRef(null);
  const placeWrapperRef = useRef(null);

  // ── Profile typeahead state ────────────────────────────────────────────
  const [profileSuggestions, setProfileSuggestions] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchingProfiles, setSearchingProfiles] = useState(false);
  const profileDebounceRef = useRef(null);
  const nameWrapperRef = useRef(null);

  // ── Modified-from-saved badge state ──────────────────────────────────
  const [sourceProfileId, setSourceProfileId] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null); // copy of the saved profile data

  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  function update(field, raw) {
    // If we had a saved profile loaded and a birth field changed, mark modified
    if (sourceProfileId && savedSnapshot) {
      if (String(raw) !== String(savedSnapshot[field] ?? '')) {
        setIsModified(true);
      }
    }
    onChange({ ...value, [field]: raw });
  }

  function updateGender(gender) {
    if (sourceProfileId && savedSnapshot && gender !== savedSnapshot.gender) {
      setIsModified(true);
    }
    onChange({ ...value, gender });
  }

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  const id = (field) => `${idPrefix}-${field}`;

  // ── Profile auto-fill from typeahead selection ────────────────────────
  function handlePickProfile(profile) {
    const newValue = {
      ...value,
      name:         profile.name,
      gender:       profile.gender,
      year:         String(profile.year),
      month:        String(profile.month),
      day:          String(profile.day),
      hour:         String(profile.hour),
      minute:       String(profile.minute),
      lat:          String(parseFloat(profile.lat).toFixed(4)),
      lon:          String(parseFloat(profile.lon).toFixed(4)),
      timezone_str: profile.timezone_str,
      place_label:  profile.birth_place || '',
    };
    onChange(newValue);

    if (profile.birth_place) {
      setPlaceQuery(profile.birth_place);
      setSelectedPlace(profile.birth_place);
    }

    // Track source for modified-badge
    setSourceProfileId(profile.id);
    setSavedSnapshot({ ...newValue, gender: profile.gender });
    setIsModified(false);
    setSaveSuccessMessage('');

    setProfileSuggestions([]);
    setShowProfileDropdown(false);
  }

  // ── Save changes back to the saved profile ───────────────────────────
  async function handleSaveChanges() {
    if (!sourceProfileId) return;
    try {
      const effectiveGender = value.gender || savedSnapshot?.gender || 'male';
      await updateProfile(sourceProfileId, {
        name:         value.name,
        gender:       effectiveGender,
        year:         Number(value.year),
        month:        Number(value.month),
        day:          Number(value.day),
        hour:         Number(value.hour),
        minute:       Number(value.minute),
        lat:          Number(value.lat),
        lon:          Number(value.lon),
        timezone_str: value.timezone_str,
        birth_place:  value.place_label || placeQuery || null,
      });
      setSavedSnapshot({ ...value, gender: effectiveGender });
      setIsModified(false);
      setSaveSuccessMessage('✓ Profile updated successfully in database!');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }

  function handleKeepAsGuest() {
    setSourceProfileId(null);
    setIsModified(false);
    setSavedSnapshot(null);
    setSaveSuccessMessage('');
  }

  // ── Name field typeahead search (fresh reference, no stale closure) ──
  function handleNameInput(raw) {
    update('name', raw);
    if (profileDebounceRef.current) clearTimeout(profileDebounceRef.current);
    if (raw.trim().length < 2) {
      setProfileSuggestions([]);
      setShowProfileDropdown(false);
      return;
    }
    profileDebounceRef.current = setTimeout(async () => {
      setSearchingProfiles(true);
      try {
        const results = await searchProfilesTypeahead(raw.trim(), 6);
        setProfileSuggestions(results);
        setShowProfileDropdown(results.length > 0);
      } catch {
        setProfileSuggestions([]);
        setShowProfileDropdown(false);
      } finally {
        setSearchingProfiles(false);
      }
    }, 300);
  }

  // Collapse profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (nameWrapperRef.current && !nameWrapperRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Debounced place search (fresh reference, no stale closure) ───────
  function handlePlaceInput(query) {
    setPlaceQuery(query);
    setSelectedPlace('');
    update('place_label', query);
    if (placeDebounceRef.current) clearTimeout(placeDebounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    placeDebounceRef.current = setTimeout(async () => {
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
  }

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
      place_label: displayName,
    });

    if (sourceProfileId && savedSnapshot) {
      if (lat !== String(savedSnapshot.lat) || lon !== String(savedSnapshot.lon)) {
        setIsModified(true);
      }
    }
  }

  // Collapse place dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (placeWrapperRef.current && !placeWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <fieldset className="birth-form">
      <legend className="birth-form__legend">{label}</legend>

      {/* ── Gender Toggle ──────────────────────────────────────────── */}
      {showGender && (
        <div className="birth-form__row">
          <div className="birth-form__field birth-form__field--wide">
            <span className="birth-form__label-text">Gender</span>
            <GenderToggle
              value={value.gender}
              onChange={updateGender}
              required={genderRequired}
              idPrefix={idPrefix}
            />
          </div>
        </div>
      )}

      {/* ── Name field with typeahead profile search ───────────────── */}
      <div className="birth-form__row">
        <div
          className="birth-form__field birth-form__field--wide name-typeahead-wrap"
          ref={nameWrapperRef}
        >
          <label htmlFor={id('name')}>
            <span>{t('form.name')}</span>
            <div className="place-search__input-wrap">
              <input
                id={id('name')}
                type="text"
                value={value.name}
                placeholder={t('form.name.placeholder')}
                autoComplete="off"
                onChange={(e) => handleNameInput(e.target.value)}
                onBlur={() => markTouched('name')}
                onFocus={() => profileSuggestions.length > 0 && setShowProfileDropdown(true)}
                required
              />
              {searchingProfiles && (
                <span className="place-search__spinner" aria-label="Searching profiles…" />
              )}
              {sourceProfileId && !isModified && (
                <span className="place-search__ok" title="Loaded from saved profile">👤</span>
              )}
            </div>
          </label>

          {/* Profile typeahead dropdown */}
          {showProfileDropdown && profileSuggestions.length > 0 && (
            <ul className="place-search__dropdown profile-typeahead__dropdown" role="listbox" aria-label="Saved profiles">
              {profileSuggestions.map((profile) => {
                const d = String(profile.day).padStart(2, '0');
                const m = String(profile.month).padStart(2, '0');
                return (
                  <li
                    key={profile.id}
                    role="option"
                    className="place-search__option"
                    onMouseDown={() => handlePickProfile(profile)}
                  >
                    <span className="place-search__option-icon">
                      {profile.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span className="place-search__option-content">
                      <span className="place-search__option-primary">{profile.name}</span>
                      <span className="place-search__option-secondary">
                        {d}-{m}-{profile.year}
                        {profile.birth_place ? ` · ${profile.birth_place.split(',')[0]}` : ''}
                        {profile.lagna ? ` · ${profile.lagna.split(' ')[0]} Lagna` : ''}
                      </span>
                    </span>
                    <span className="place-search__option-coords">
                      {profile.gender === 'male' ? 'Male' : 'Female'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Modified from Saved Profile badge ─────────────────────── */}
      {sourceProfileId && isModified && (
        <div className="birth-form__modified-badge">
          <span className="modified-badge__text">📝 Modified from Saved Profile</span>
          <div className="modified-badge__actions">
            <button
              type="button"
              className="btn btn--ghost modified-badge__btn"
              onClick={handleSaveChanges}
            >
              Save Changes to Profile
            </button>
            <button
              type="button"
              className="btn btn--ghost modified-badge__btn modified-badge__btn--keep"
              onClick={handleKeepAsGuest}
            >
              Keep as One-Time Override
            </button>
          </div>
        </div>
      )}

      {saveSuccessMessage && (
        <div className="birth-form__success-badge">
          <span>{saveSuccessMessage}</span>
        </div>
      )}


      {/* ── Date of Birth ─────────────────────────────────────────── */}
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

      {/* ── Time of Birth ─────────────────────────────────────────── */}
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

      {/* ── Birthplace Search ─────────────────────────────────────── */}
      <div className="birth-form__row">
        <div className="place-search-wrap" ref={placeWrapperRef}>
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

          {/* Place dropdown */}
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

      {/* ── Coordinates (auto-filled or manual) ───────────────────── */}
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

      {/* ── Timezone ──────────────────────────────────────────────── */}
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
