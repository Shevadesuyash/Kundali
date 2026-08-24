import { useState, useEffect } from 'react';
import BirthDetailsForm, { makeEmptyPerson } from './BirthDetailsForm';
import { getProfile, searchProfiles } from '../api/kundaliApi';
import './PartnerSlot.css';

const ROLE_CONFIG = {
  male:   { label: 'PARTNER 1 — GROOM',  icon: '♂', color: 'male'   },
  female: { label: 'PARTNER 2 — BRIDE',  icon: '♀', color: 'female' },
};

/**
 * PartnerSlot — dual-mode partner card for the Match page.
 *
 * Props:
 *   role:        'male' | 'female'
 *   label:       override label (optional)
 *   value:       person form state
 *   onChange:    (newValue) => void
 *   idPrefix:    string — for unique input IDs
 *   initialProfileId: number | null — pre-fill from URL param
 */
export default function PartnerSlot({
  role,
  label,
  value,
  onChange,
  idPrefix,
  initialProfileId = null,
}) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.male;
  const [mode, setMode] = useState('new');         // 'saved' | 'new'
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Load initial profile from URL param (e.g., /match?partner1Id=5)
  useEffect(() => {
    if (initialProfileId) {
      loadProfileById(initialProfileId);
    }
  }, [initialProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved profiles when switching to saved mode
  useEffect(() => {
    if (mode === 'saved' && savedProfiles.length === 0) {
      fetchSavedProfiles();
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSavedProfiles() {
    setLoadingProfiles(true);
    try {
      const data = await searchProfiles({ gender: role, perPage: 50 });
      setSavedProfiles(data.profiles || []);
    } catch {
      setSavedProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function loadProfileById(profileId) {
    try {
      const profile = await getProfile(profileId);
      fillFromProfile(profile);
      setMode('saved');
    } catch {
      // silently fail — form stays empty
    }
  }

  function fillFromProfile(profile) {
    setSelectedProfile(profile);
    onChange({
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
    });
  }

  function handleSelectProfile(e) {
    const profileId = Number(e.target.value);
    if (!profileId) {
      setSelectedProfile(null);
      onChange(makeEmptyPerson());
      return;
    }
    const profile = savedProfiles.find((p) => p.id === profileId);
    if (profile) {
      // We need full detail (hour/minute/lat/lon) — fetch by id
      loadProfileById(profileId);
    }
  }

  function handleOverride() {
    setMode('new');
    setSelectedProfile(null);
  }

  const d = selectedProfile ? String(selectedProfile.day).padStart(2, '0') : '';
  const m = selectedProfile ? String(selectedProfile.month).padStart(2, '0') : '';

  return (
    <div className={`partner-slot partner-slot--${cfg.color}`}>
      {/* Header */}
      <div className="partner-slot__header">
        <span className="partner-slot__icon">{cfg.icon}</span>
        <span className="partner-slot__title">{label || cfg.label}</span>
      </div>

      {/* Mode toggle */}
      <div className="partner-slot__mode-toggle">
        <button
          type="button"
          className={`partner-slot__mode-btn${mode === 'saved' ? ' is-active' : ''}`}
          onClick={() => setMode('saved')}
        >
          Select Saved Profile
        </button>
        <span className="partner-slot__mode-or">or</span>
        <button
          type="button"
          className={`partner-slot__mode-btn${mode === 'new' ? ' is-active' : ''}`}
          onClick={() => setMode('new')}
        >
          ○ Enter New Details
        </button>
      </div>

      {/* Saved profile selection */}
      {mode === 'saved' && (
        <div className="partner-slot__saved">
          {loadingProfiles ? (
            <p className="partner-slot__loading">Loading profiles…</p>
          ) : (
            <select
              className="partner-slot__select"
              value={selectedProfile?.id || ''}
              onChange={handleSelectProfile}
            >
              <option value="">— Choose a saved profile —</option>
              {savedProfiles.map((p) => {
                const pd = String(p.day).padStart(2, '0');
                const pm = String(p.month).padStart(2, '0');
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} · {pd}-{pm}-{p.year}
                    {p.birth_place ? ` · ${p.birth_place.split(',')[0]}` : ''}
                  </option>
                );
              })}
            </select>
          )}

          {/* Selected profile summary */}
          {selectedProfile && (
            <div className="partner-slot__selected-card">
              <div className="partner-slot__selected-info">
                <strong>{selectedProfile.name}</strong>
                <span className="mono">
                  {d}-{m}-{selectedProfile.year}
                  {selectedProfile.birth_place ? ` · ${selectedProfile.birth_place.split(',')[0]}` : ''}
                </span>
                {selectedProfile.lagna && (
                  <span className="partner-slot__badge">{selectedProfile.lagna.split(' ')[0]} Lagna</span>
                )}
              </div>
              <button
                type="button"
                className="btn btn--ghost partner-slot__override-btn"
                onClick={handleOverride}
              >
                ✏️ Override
              </button>
            </div>
          )}
        </div>
      )}

      {/* New entry form */}
      {mode === 'new' && (
        <BirthDetailsForm
          label=""
          value={value}
          onChange={onChange}
          idPrefix={idPrefix}
          showGender={false}
        />
      )}
    </div>
  );
}
