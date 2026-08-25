import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';
import { getSadeSatiBadge } from '../utils/astrology';
import './ProfileCard.css';

/**
 * ProfileCard — Rich dashboard card for a saved birth profile.
 *
 * Props:
 *   profile:        ProfileSummary object
 *   onPickPartner1: (profile) => void
 *   onPickPartner2: (profile) => void
 *   onDelete:       (profileId) => void
 *   onBulkMatch:    (profile) => void
 *   isPartner1Picked: boolean
 *   isPartner2Picked: boolean
 */
export default function ProfileCard({
  profile,
  onPickPartner1,
  onPickPartner2,
  onDelete,
  onBulkMatch,
  isPartner1Picked = false,
  isPartner2Picked = false,
}) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const d   = String(profile.day).padStart(2, '0');
  const m   = String(profile.month).padStart(2, '0');
  const dob = `${d}-${m}-${profile.year}`;
  const isMale = profile.gender === 'male';

  const sadeSati = profile.moon_sign ? getSadeSatiBadge(profile.moon_sign) : null;

  function handleViewKundali() {
    navigate(`/kundali?profileId=${profile.id}`);
  }

  function handleDeleteClick(e) {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(profile.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
    }
  }

  return (
    <div className={`profile-card profile-card--${profile.gender}${isPartner1Picked || isPartner2Picked ? ' profile-card--picked' : ''}`}>
      {/* Top row: Gender indicator, Name, Tag & Delete */}
      <div className="profile-card__header">
        <div className="profile-card__identity">
          <span className={`profile-card__gender-icon profile-card__gender-icon--${profile.gender}`}>
            {isMale ? '♂' : '♀'}
          </span>
          <div>
            <h3 className="profile-card__name">{profile.name}</h3>
            <p className="profile-card__dob mono">
              📅 {dob}
              {profile.birth_place && (
                <span className="profile-card__place"> · 🌐 {profile.birth_place.split(',')[0]}</span>
              )}
            </p>
          </div>
        </div>

        <div className="profile-card__top-right">
          <TagBadge tag={profile.tag || 'self'} />
          <button
            type="button"
            className={`profile-card__delete-btn${confirmDelete ? ' is-confirming' : ''}`}
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete profile'}
            aria-label="Delete profile"
          >
            {confirmDelete ? 'Confirm 🗑️' : '✕'}
          </button>
        </div>
      </div>

      {/* Astro summary pills */}
      <div className="profile-card__astro-grid">
        {profile.lagna && (
          <div className="profile-astro-pill">
            <span className="profile-astro-pill__label">Lagna</span>
            <span className="profile-astro-pill__val">{profile.lagna.split(' ')[0]}</span>
          </div>
        )}
        {profile.moon_sign && (
          <div className="profile-astro-pill">
            <span className="profile-astro-pill__label">Rāśi</span>
            <span className="profile-astro-pill__val">{profile.moon_sign.split(' ')[0]}</span>
          </div>
        )}
        {profile.nakshatra && (
          <div className="profile-astro-pill">
            <span className="profile-astro-pill__label">Nakshatra</span>
            <span className="profile-astro-pill__val">{profile.nakshatra}</span>
          </div>
        )}
        {profile.active_dasha && (
          <div className="profile-astro-pill profile-astro-pill--dasha">
            <span className="profile-astro-pill__label">Dasha</span>
            <span className="profile-astro-pill__val">{profile.active_dasha}</span>
          </div>
        )}
        <div className={`profile-astro-pill profile-astro-pill--${profile.is_manglik ? 'manglik' : 'clear'}`}>
          <span className="profile-astro-pill__label">Dosha</span>
          <span className="profile-astro-pill__val">{profile.is_manglik ? 'Manglik' : 'Clear'}</span>
        </div>
        {sadeSati && (
          <div className={`profile-astro-pill profile-astro-pill--${sadeSati.type}`}>
            <span className="profile-astro-pill__label">Transit</span>
            <span className="profile-astro-pill__val">{sadeSati.label}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="profile-card__actions">
        <button
          type="button"
          className="btn btn--primary profile-card__view-btn"
          onClick={handleViewKundali}
        >
          📜 Kundali
        </button>

        {onBulkMatch && (
          <button
            type="button"
            className="btn btn--ghost profile-card__bulk-btn"
            onClick={() => onBulkMatch(profile)}
            title="Match this profile against all saved opposite-gender candidates"
          >
            ⚡ Match All
          </button>
        )}

        {isMale ? (
          <button
            type="button"
            className={`btn btn--ghost profile-card__match-btn${isPartner1Picked ? ' is-picked' : ''}`}
            onClick={() => onPickPartner1(profile)}
          >
            {isPartner1Picked ? '✓ Groom' : '♂ Pick Groom'}
          </button>
        ) : (
          <button
            type="button"
            className={`btn btn--ghost profile-card__match-btn${isPartner2Picked ? ' is-picked' : ''}`}
            onClick={() => onPickPartner2(profile)}
          >
            {isPartner2Picked ? '✓ Bride' : '♀ Pick Bride'}
          </button>
        )}
      </div>
    </div>
  );
}

