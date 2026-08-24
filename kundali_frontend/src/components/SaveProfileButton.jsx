import { useState } from 'react';
import { saveProfile } from '../api/kundaliApi';
import GenderToggle from './GenderToggle';
import './SaveProfileButton.css';

/**
 * SaveProfileButton — shown after a Kundali is generated.
 * Uses GenderToggle (male/female) and allows setting a relationship tag
 * before saving birth details to the backend profile store.
 *
 * Props:
 *   person     {object}  — toApiPayload(person) output from BirthDetailsForm
 *   gender     {string}  — pre-selected gender from form ('male'|'female'|'')
 *   birthPlace {string}  — optional human-readable place label
 */
const TAG_OPTIONS = [
  { value: 'self',    label: 'Self'    },
  { value: 'family',  label: 'Family'  },
  { value: 'friend',  label: 'Friend'  },
  { value: 'partner', label: 'Partner' },
  { value: 'client',  label: 'Client'  },
];

export default function SaveProfileButton({ person, gender: propGender = '', birthPlace }) {
  const [step,    setStep]    = useState('idle');   // idle | picking | saving | done | error
  const [gender,  setGender]  = useState(propGender);
  const [tag,     setTag]     = useState('self');
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!gender) return;
    setStep('saving');
    try {
      await saveProfile(person, gender, birthPlace || null, tag);
      setStep('done');
      setMessage('Profile saved!');
    } catch {
      setStep('error');
      setMessage('Could not save. Try again.');
    }
  }

  if (step === 'done')  return <p className="save-profile__done">&#10003; {message}</p>;
  if (step === 'error') return (
    <p className="save-profile__error">
      &#10007; {message}{' '}
      <button onClick={() => setStep('idle')} className="save-profile__retry" type="button">Retry</button>
    </p>
  );

  return (
    <div className="save-profile">
      {step === 'idle' && (
        <button
          className="btn btn--ghost save-profile__trigger"
          onClick={() => setStep('picking')}
          type="button"
        >
          💾 Save to Profiles
        </button>
      )}

      {(step === 'picking' || step === 'saving') && (
        <div className="save-profile__picker">
          {/* Gender (pre-filled from form, still editable) */}
          <div className="save-profile__row">
            <span className="save-profile__label">Gender:</span>
            <GenderToggle value={gender} onChange={setGender} idPrefix="spb" />
          </div>

          {/* Relationship tag */}
          <div className="save-profile__row">
            <span className="save-profile__label">Tag:</span>
            <div className="save-profile__tags">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`save-profile__tag-btn${tag === t.value ? ' is-active' : ''}`}
                  onClick={() => setTag(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="save-profile__actions">
            <button
              type="button"
              className="btn btn--primary save-profile__confirm"
              onClick={handleSave}
              disabled={!gender || step === 'saving'}
            >
              {step === 'saving' ? 'Saving...' : 'Confirm Save'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setStep('idle')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
