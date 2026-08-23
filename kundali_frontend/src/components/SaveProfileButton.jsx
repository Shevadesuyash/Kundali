import { useState } from 'react';
import { saveProfile } from '../api/kundaliApi';
import './SaveProfileButton.css';

/**
 * SaveProfileButton — shown after a Kundali is generated.
 * Asks for gender then saves birth details to the backend profile store.
 *
 * Props:
 *   person     {object}  — toApiPayload(person) output from BirthDetailsForm
 *   birthPlace {string}  — optional human-readable place label
 */
export default function SaveProfileButton({ person, birthPlace }) {
  const [step,    setStep]    = useState('idle');   // idle | picking | saving | done | error
  const [gender,  setGender]  = useState('');
  const [message, setMessage] = useState('');

  async function handleSave() {
    if (!gender) return;
    setStep('saving');
    try {
      await saveProfile(person, gender, birthPlace || null);
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
          Save to Profiles
        </button>
      )}

      {(step === 'picking' || step === 'saving') && (
        <div className="save-profile__picker">
          <span className="save-profile__label">Save as:</span>
          {['boy', 'girl', 'other'].map((g) => (
            <button
              key={g}
              type="button"
              className={`save-profile__gender-btn${gender === g ? ' is-active' : ''}`}
              onClick={() => setGender(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
          <button
            type="button"
            className="btn btn--primary save-profile__confirm"
            onClick={handleSave}
            disabled={!gender || step === 'saving'}
          >
            {step === 'saving' ? 'Saving...' : 'Confirm'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setStep('idle')}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
