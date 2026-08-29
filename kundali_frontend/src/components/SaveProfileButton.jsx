import React, { useState, useEffect } from 'react';
import { saveProfile } from '../api/kundaliApi';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import GenderToggle from './GenderToggle';
import './SaveProfileButton.css';

const TAG_OPTIONS = [
  { value: 'self',    label: 'Self'    },
  { value: 'family',  label: 'Family'  },
  { value: 'friend',  label: 'Friend'  },
  { value: 'partner', label: 'Partner' },
  { value: 'client',  label: 'Client'  },
];

export default function SaveProfileButton({ person, gender: propGender = '', birthPlace }) {
  const [step, setStep] = useState('idle');
  const [gender, setGender] = useState(propGender);
  const [tag, setTag] = useState('self');
  const [message, setMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, isLoggedIn } = useAuth();
  const { lang } = useLang();

  useEffect(() => {
    if (propGender) {
      setGender(propGender);
    }
  }, [propGender]);

  function handleTrigger() {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setStep('picking');
  }

  async function handleSave() {
    const finalGender = gender || propGender;
    if (!finalGender) return;
    setStep('saving');
    try {
      await saveProfile(person, finalGender, birthPlace || null, tag, user?.id || null);
      setStep('done');
      setMessage(lang === 'mr' ? 'प्रोफाइल सुरक्षित सेव्ह झाली!' : 'Profile saved to cloud successfully!');
    } catch {
      setStep('error');
      setMessage(lang === 'mr' ? 'सेव्ह करता आले नाही. पुन्हा प्रयत्न करा.' : 'Could not save. Try again.');
    }
  }

  if (step === 'done') return <p className="save-profile__done">&#10003; {message}</p>;
  if (step === 'error') return (
    <p className="save-profile__error">
      &#10007; {message}{' '}
      <button onClick={() => setStep('idle')} className="save-profile__retry" type="button">Retry</button>
    </p>
  );

  const effectiveGender = gender || propGender;

  return (
    <>
      <div className="save-profile">
        {step === 'idle' && (
          <button
            className="btn btn--ghost save-profile__trigger"
            onClick={handleTrigger}
            type="button"
          >
            💾 {isLoggedIn ? (lang === 'mr' ? 'प्रोफाइल्समध्ये सेव्ह करा' : 'Save to Cloud Profiles') : (lang === 'mr' ? 'प्रोफाइल सेव्ह (लॉग इन)' : 'Save to Profiles (Sign In)')}
          </button>
        )}

        {(step === 'picking' || step === 'saving') && (
          <div className="save-profile__picker">
            <div className="save-profile__row">
              <span className="save-profile__label">Gender:</span>
              {effectiveGender ? (
                <div className="save-profile__gender-display">
                  <span className={`gender-badge gender-badge--${effectiveGender}`}>
                    {effectiveGender === 'male' ? '♂ Male' : '♀ Female'}
                  </span>
                  <button
                    type="button"
                    className="btn btn--ghost save-profile__change-gender"
                    onClick={() => setGender(effectiveGender === 'male' ? 'female' : 'male')}
                  >
                    Switch to {effectiveGender === 'male' ? 'Female' : 'Male'}
                  </button>
                </div>
              ) : (
                <GenderToggle value={gender} onChange={setGender} idPrefix="spb" />
              )}
            </div>

            <div className="save-profile__row">
              <span className="save-profile__label">Save as Tag:</span>
              <div className="save-profile__tags">
                {TAG_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`tag-chip${tag === t.value ? ' is-active' : ''}`}
                    onClick={() => setTag(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="save-profile__actions">
              <button
                className="btn btn--primary"
                onClick={handleSave}
                disabled={step === 'saving'}
                type="button"
              >
                {step === 'saving' ? (lang === 'mr' ? 'सेव्ह करत आहे...' : 'Saving...') : (lang === 'mr' ? 'नक्की सेव्ह करा' : 'Confirm Save')}
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setStep('idle')}
                type="button"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        promptMessage={lang === 'mr' ? 'क्लाउडमध्ये अमर्यादित प्रोफाइल्स सेव्ह आणि सिंक करण्यासाठी कृपया लॉग इन करा.' : 'Sign in to save, organize, and sync unlimited horoscopes in the cloud across all your devices.'}
      />
    </>
  );
}
