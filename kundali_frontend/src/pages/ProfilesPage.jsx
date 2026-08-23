import { useState, useEffect, useCallback } from 'react';
import { searchProfiles, matchSaved, ApiError } from '../api/kundaliApi';
import GunaMilanScorecard from '../components/GunaMilanScorecard';
import { LoadingState, ErrorState } from '../components/StatusStates';
import './ProfilesPage.css';

const GENDER_TABS = [
  { value: '',     label: 'All'  },
  { value: 'boy',  label: 'Boy'  },
  { value: 'girl', label: 'Girl' },
];

function ManglikPill({ active }) {
  return active
    ? <span className="profile-pill profile-pill--manglik">Manglik</span>
    : <span className="profile-pill profile-pill--clear">Clear</span>;
}

function ProfileCard({ profile, onPickBoy, onPickGirl, pickedBoyId, pickedGirlId }) {
  const d   = String(profile.day).padStart(2, '0');
  const m   = String(profile.month).padStart(2, '0');
  const dob = `${d}-${m}-${profile.year}`;

  const isBoyPicked  = pickedBoyId  === profile.id;
  const isGirlPicked = pickedGirlId === profile.id;

  return (
    <div className={`profile-card${isBoyPicked || isGirlPicked ? ' profile-card--picked' : ''}`}>
      <div className="profile-card__top">
        <span className={`profile-card__dot gender-dot--${profile.gender}`} />
        <div className="profile-card__info">
          <p className="profile-card__name">{profile.name}</p>
          <p className="profile-card__dob mono">{dob}</p>
          {profile.birth_place && <p className="profile-card__place">{profile.birth_place}</p>}
        </div>
        <ManglikPill active={profile.is_manglik} />
      </div>

      {(profile.moon_sign || profile.nakshatra) && (
        <div className="profile-card__astro">
          {profile.moon_sign  && <span className="profile-card__tag">{profile.moon_sign.split(' ')[0]}</span>}
          {profile.nakshatra  && <span className="profile-card__tag">{profile.nakshatra}</span>}
        </div>
      )}

      <div className="profile-card__actions">
        <button
          type="button"
          className={`btn btn--ghost profile-card__btn${isBoyPicked ? ' is-picked' : ''}`}
          onClick={() => onPickBoy(profile)}
        >
          {isBoyPicked ? 'Boy picked' : 'Pick as Boy'}
        </button>
        <button
          type="button"
          className={`btn btn--ghost profile-card__btn${isGirlPicked ? ' is-picked' : ''}`}
          onClick={() => onPickGirl(profile)}
        >
          {isGirlPicked ? 'Girl picked' : 'Pick as Girl'}
        </button>
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  const [query,    setQuery]    = useState('');
  const [gender,   setGender]   = useState('');
  const [profiles, setProfiles] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [pickedBoy,  setPickedBoy]  = useState(null);
  const [pickedGirl, setPickedGirl] = useState(null);

  const [matchStatus, setMatchStatus] = useState('idle'); // idle | loading | result | error
  const [matchResult, setMatchResult] = useState(null);
  const [matchError,  setMatchError]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchProfiles({ q: query, gender });
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
    } catch {
      setError('Could not load profiles.');
    } finally {
      setLoading(false);
    }
  }, [query, gender]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleMatch() {
    if (!pickedBoy || !pickedGirl) return;
    setMatchStatus('loading');
    setMatchError('');
    try {
      const result = await matchSaved(pickedBoy.id, pickedGirl.id);
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

  function pickBoy(profile) {
    setPickedBoy(profile);
    clearMatch();
  }

  function pickGirl(profile) {
    setPickedGirl(profile);
    clearMatch();
  }

  return (
    <main className="container profiles-page">
      <header className="profiles-page__header">
        <p className="eyebrow">Saved Profiles</p>
        <h1>Profile Registry</h1>
        <p className="profiles-page__intro">
          Pick a Boy and a Girl profile, then run Guna Milan instantly — no re-entry needed.
        </p>
      </header>

      {/* Search + filter */}
      <div className="profiles-page__controls">
        <input
          className="profiles-page__search"
          type="search"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
      </div>

      {/* Match bar — shown when at least one is picked */}
      {(pickedBoy || pickedGirl) && (
        <div className="profiles-page__match-bar">
          <div className="match-bar__slot">
            <span className="match-bar__label">Boy:</span>
            <span className="match-bar__name">
              {pickedBoy ? pickedBoy.name : <em>not picked</em>}
            </span>
            {pickedBoy && (
              <button type="button" className="match-bar__clear" onClick={() => { setPickedBoy(null); clearMatch(); }}>
                x
              </button>
            )}
          </div>
          <span className="match-bar__vs">vs</span>
          <div className="match-bar__slot">
            <span className="match-bar__label">Girl:</span>
            <span className="match-bar__name">
              {pickedGirl ? pickedGirl.name : <em>not picked</em>}
            </span>
            {pickedGirl && (
              <button type="button" className="match-bar__clear" onClick={() => { setPickedGirl(null); clearMatch(); }}>
                x
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!pickedBoy || !pickedGirl || matchStatus === 'loading'}
            onClick={handleMatch}
          >
            {matchStatus === 'loading' ? 'Matching...' : 'Run Guna Milan'}
          </button>
          {(matchStatus === 'result' || matchStatus === 'error') && (
            <button type="button" className="btn btn--ghost" onClick={clearMatch}>
              Clear result
            </button>
          )}
        </div>
      )}

      {/* Match result */}
      {matchStatus === 'result' && matchResult && (
        <div className="panel profiles-page__result">
          <GunaMilanScorecard
            gunaMilan={matchResult.guna_milan}
            manglikAnalysis={matchResult.manglik_analysis}
          />
        </div>
      )}
      {matchStatus === 'error' && (
        <p className="profiles-page__match-error">{matchError}</p>
      )}

      {/* Count */}
      <p className="profiles-page__count mono">{total} profile{total !== 1 ? 's' : ''} found</p>

      {loading && <LoadingState message="Loading profiles..." />}
      {error   && <ErrorState  message={error} onRetry={load} />}

      {!loading && !error && profiles.length === 0 && (
        <p className="profiles-page__empty">
          No profiles saved yet. Generate a Kundali and click &ldquo;Save to Profiles&rdquo;.
        </p>
      )}

      {!loading && !error && profiles.length > 0 && (
        <div className="profiles-grid">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              pickedBoyId={pickedBoy?.id}
              pickedGirlId={pickedGirl?.id}
              onPickBoy={pickBoy}
              onPickGirl={pickGirl}
            />
          ))}
        </div>
      )}
    </main>
  );
}
