import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProfiles, deleteProfile, matchSaved, ApiError } from '../api/kundaliApi';
import ProfileCard from '../components/ProfileCard';
import GunaMilanScorecard from '../components/GunaMilanScorecard';
import { LoadingState, ErrorState } from '../components/StatusStates';
import './ProfilesPage.css';

const GENDER_TABS = [
  { value: '',       label: 'All'    },
  { value: 'male',   label: '♂ Male' },
  { value: 'female', label: '♀ Female' },
];

const TAG_FILTERS = [
  { value: '',        label: 'All Tags' },
  { value: 'self',    label: 'Self'     },
  { value: 'family',  label: 'Family'   },
  { value: 'friend',  label: 'Friend'   },
  { value: 'partner', label: 'Partner'  },
  { value: 'client',  label: 'Client'   },
];

export default function ProfilesPage() {
  const navigate = useNavigate();

  const [query,      setQuery]      = useState('');
  const [gender,     setGender]     = useState('');
  const [tag,        setTag]        = useState('');
  const [profiles,   setProfiles]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [maleCount,  setMaleCount]  = useState(0);
  const [femaleCount,setFemaleCount]= useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Match tray state
  const [showMatchTray,  setShowMatchTray]  = useState(false);
  const [partner1,       setPartner1]       = useState(null);
  const [partner2,       setPartner2]       = useState(null);
  const [matchStatus,    setMatchStatus]    = useState('idle');
  const [matchResult,    setMatchResult]    = useState(null);
  const [matchError,     setMatchError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchProfiles({ q: query, gender, tag });
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
      setMaleCount(data.male_count ?? 0);
      setFemaleCount(data.female_count ?? 0);
    } catch {
      setError('Could not load profiles.');
    } finally {
      setLoading(false);
    }
  }, [query, gender, tag]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // ── Delete a profile ────────────────────────────────────────────────────
  async function handleDelete(profileId) {
    try {
      await deleteProfile(profileId);
      // Remove from local list immediately
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      setTotal((prev) => prev - 1);
      // Clear any match picks referencing deleted profile
      if (partner1?.id === profileId) setPartner1(null);
      if (partner2?.id === profileId) setPartner2(null);
    } catch {
      alert('Failed to delete profile. Please try again.');
    }
  }

  // ── Guna Milan quick-match ─────────────────────────────────────────────
  async function handleMatch() {
    if (!partner1 || !partner2) return;
    setMatchStatus('loading');
    setMatchError('');
    try {
      const result = await matchSaved(partner1.id, partner2.id);
      setMatchResult(result);
      setMatchStatus('result');
    } catch (err) {
      setMatchError(err instanceof ApiError ? err.message : 'Match failed. Please try again.');
      setMatchStatus('error');
    }
  }

  function clearMatch() {
    setMatchStatus('idle');
    setMatchResult(null);
    setMatchError('');
  }

  // When a male card picks as partner1 / female as partner2
  function handlePickPartner1(profile) {
    setPartner1(profile);
    setShowMatchTray(true);
    clearMatch();
  }

  function handlePickPartner2(profile) {
    setPartner2(profile);
    setShowMatchTray(true);
    clearMatch();
  }

  return (
    <main className="container profiles-page">
      {/* ── Header & Stats Bar ─────────────────────────────────────────── */}
      <header className="profiles-page__header">
        <p className="eyebrow">Profile Registry</p>
        <div className="profiles-page__title-row">
          <h1>Saved Profiles</h1>
          <button
            type="button"
            className="btn btn--primary profiles-page__add-btn"
            onClick={() => navigate('/kundali')}
          >
            + Add New Profile
          </button>
        </div>

        {/* Stats bar */}
        <div className="profiles-page__stats">
          <div className="stat-pill">
            <span className="stat-pill__num">{total}</span>
            <span className="stat-pill__label">Total</span>
          </div>
          <div className="stat-pill stat-pill--male">
            <span className="stat-pill__num">{maleCount}</span>
            <span className="stat-pill__label">♂ Male</span>
          </div>
          <div className="stat-pill stat-pill--female">
            <span className="stat-pill__num">{femaleCount}</span>
            <span className="stat-pill__label">♀ Female</span>
          </div>
          {showMatchTray && (
            <button
              type="button"
              className="btn btn--ghost profiles-page__match-toggle"
              onClick={() => { setShowMatchTray(false); clearMatch(); }}
            >
              ✕ Close Match Tray
            </button>
          )}
          {!showMatchTray && (partner1 || partner2) && (
            <button
              type="button"
              className="btn btn--ghost profiles-page__match-toggle"
              onClick={() => setShowMatchTray(true)}
            >
              💞 Open Match Tray
            </button>
          )}
        </div>
      </header>

      {/* ── Match Tray ─────────────────────────────────────────────────── */}
      {showMatchTray && (
        <div className="profiles-page__match-tray">
          <p className="match-tray__title">Guna Milan Comparison</p>
          <div className="match-tray__slots">
            {/* Groom slot */}
            <div className="match-tray__slot match-tray__slot--male">
              <span className="match-tray__role">♂ Groom</span>
              {partner1 ? (
                <div className="match-tray__picked">
                  <span className="match-tray__name">{partner1.name}</span>
                  <button
                    type="button"
                    className="match-tray__clear"
                    onClick={() => { setPartner1(null); clearMatch(); }}
                  >✕</button>
                  <button
                    type="button"
                    className="btn btn--ghost match-tray__open-match"
                    onClick={() => navigate(`/match?partner1Id=${partner1.id}${partner2 ? `&partner2Id=${partner2.id}` : ''}`)}
                  >Open in Match ↗</button>
                </div>
              ) : (
                <span className="match-tray__empty">Pick a male profile below</span>
              )}
            </div>

            <span className="match-tray__vs">vs</span>

            {/* Bride slot */}
            <div className="match-tray__slot match-tray__slot--female">
              <span className="match-tray__role">♀ Bride</span>
              {partner2 ? (
                <div className="match-tray__picked">
                  <span className="match-tray__name">{partner2.name}</span>
                  <button
                    type="button"
                    className="match-tray__clear"
                    onClick={() => { setPartner2(null); clearMatch(); }}
                  >✕</button>
                </div>
              ) : (
                <span className="match-tray__empty">Pick a female profile below</span>
              )}
            </div>

            {/* Run button */}
            <button
              type="button"
              className="btn btn--primary match-tray__run-btn"
              disabled={!partner1 || !partner2 || matchStatus === 'loading'}
              onClick={handleMatch}
            >
              {matchStatus === 'loading' ? 'Matching...' : '⚖️ Run Guna Milan'}
            </button>
          </div>

          {matchStatus === 'result' && matchResult && (
            <div className="panel match-tray__result">
              <GunaMilanScorecard
                gunaMilan={matchResult.guna_milan}
                manglikAnalysis={matchResult.manglik_analysis}
              />
            </div>
          )}
          {matchStatus === 'error' && (
            <p className="match-tray__error">{matchError}</p>
          )}
        </div>
      )}

      {/* ── Search + Filter Bar ────────────────────────────────────────── */}
      <div className="profiles-page__controls">
        <input
          className="profiles-page__search"
          type="search"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Gender tabs */}
        <div className="profiles-page__tabs">
          {GENDER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`profile-tab${gender === tab.value ? ' is-active' : ''}`}
              onClick={() => setGender(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tag filter chips */}
        <div className="profiles-page__tag-filters">
          {TAG_FILTERS.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`tag-filter-btn${tag === t.value ? ' is-active' : ''}`}
              onClick={() => setTag(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count ─────────────────────────────────────────────────────── */}
      <p className="profiles-page__count mono">
        {total} profile{total !== 1 ? 's' : ''}
        {gender && ` · ${gender}`}
        {tag && ` · ${tag}`}
      </p>

      {/* ── Status States ─────────────────────────────────────────────── */}
      {loading && <LoadingState message="Loading profiles..." />}
      {error   && <ErrorState  message={error} onRetry={load} />}

      {!loading && !error && profiles.length === 0 && (
        <div className="profiles-page__empty">
          <span style={{ fontSize: '2.5rem' }}>🪐</span>
          <p>No profiles found.</p>
          <p style={{ fontSize: '0.88rem', opacity: 0.7 }}>
            Generate a Kundali and click &ldquo;Save to Profiles&rdquo; to get started.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/kundali')}
            style={{ marginTop: '16px' }}
          >
            + Create First Profile
          </button>
        </div>
      )}

      {/* ── Profile Cards Grid ─────────────────────────────────────────── */}
      {!loading && !error && profiles.length > 0 && (
        <div className="profiles-grid">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onPickPartner1={handlePickPartner1}
              onPickPartner2={handlePickPartner2}
              onDelete={handleDelete}
              isPartner1Picked={partner1?.id === p.id}
              isPartner2Picked={partner2?.id === p.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}
