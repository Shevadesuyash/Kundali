import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PartnerSlot from '../components/PartnerSlot';
import KundaliReport from '../components/KundaliReport';
import GunaMilanScorecard from '../components/GunaMilanScorecard';
import { LoadingState, ErrorState } from '../components/StatusStates';
import { getMatch, ApiError } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import { makeEmptyPerson, toApiPayload, isPersonComplete } from '../components/BirthDetailsForm';
import './FormPage.css';
import './MatchPage.css';

const STR = {
  en: {
    eyebrow: 'Kundali Milan',
    title: 'Check compatibility',
    intro: "Select saved profiles or enter birth details for both partners to get a full Ashtakoot Guna Milan (36-point) scorecard, plus combined Manglik Dosha verdict.",
    submit: 'Run Guna Milan',
    loading: 'Comparing two charts across eight kootas…',
    edit: '← Edit details',
    showCharts: 'Show individual charts',
    hideCharts: 'Hide individual charts',
    boy: 'Groom (Male)',
    girl: 'Bride (Female)',
    error: 'Something went wrong. Please try again.',
    swap: '⇅ Swap Partners',
  },
  mr: {
    eyebrow: 'कुंडली मिलन',
    title: 'सुसंगतता तपासा',
    intro: 'पूर्ण अष्टकूट गुण मिलन (३६-गुण) स्कोरकार्डसाठी दोन्ही जोडीदारांचे जन्म तपशील प्रविष्ट करा.',
    submit: 'गुण मिलन तपासा',
    loading: 'आठ कूटांमध्ये दोन कुंडल्यांची तुलना करत आहे…',
    edit: '← तपशील बदला',
    showCharts: 'वैयक्तिक कुंडल्या दाखवा',
    hideCharts: 'वैयक्तिक कुंडल्या लपवा',
    boy: 'वर (पुरुष)',
    girl: 'वधू (महिला)',
    error: 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',
    swap: '⇅ अदलाबदल करा',
  },
};

export default function MatchPage() {
  const { lang } = useLang();
  const c = STR[lang];

  const [searchParams] = useSearchParams();
  const initialPartner1Id = searchParams.get('partner1Id') ? Number(searchParams.get('partner1Id')) : null;
  const initialPartner2Id = searchParams.get('partner2Id') ? Number(searchParams.get('partner2Id')) : null;

  const [male, setMale]     = useState(makeEmptyPerson());
  const [female, setFemale] = useState(makeEmptyPerson());
  const [status, setStatus] = useState('form');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProfiles, setShowProfiles] = useState(false);

  const canSubmit = isPersonComplete(male) && isPersonComplete(female);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await getMatch(toApiPayload(male), toApiPayload(female));
      setResult(data);
      setStatus('result');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : c.error);
      setStatus('error');
    }
  }

  /** Swap all partner data between Male and Female slots. */
  function handleSwap() {
    const tmp = { ...male };
    setMale({ ...female });
    setFemale(tmp);
  }

  return (
    <main className="container form-page">
      <header className="form-page__header">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p className="form-page__intro">{c.intro}</p>
      </header>

      {status === 'form' && (
        <form onSubmit={handleSubmit} className="form-page__form match-form">
          <div className="match-form__grid">
            {/* Partner 1 — Male / Groom */}
            <PartnerSlot
              role="male"
              label={c.boy}
              value={male}
              onChange={setMale}
              idPrefix="male"
              initialProfileId={initialPartner1Id}
            />

            {/* Swap button */}
            <div className="match-form__swap-wrap">
              <button
                type="button"
                className="btn match-form__swap-btn"
                onClick={handleSwap}
                title="Swap partners"
              >
                {c.swap}
              </button>
            </div>

            {/* Partner 2 — Female / Bride */}
            <PartnerSlot
              role="female"
              label={c.girl}
              value={female}
              onChange={setFemale}
              idPrefix="female"
              initialProfileId={initialPartner2Id}
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={!canSubmit}>
            {c.submit}
          </button>
        </form>
      )}

      {status === 'loading' && <LoadingState message={c.loading} />}

      {status === 'error' && (
        <ErrorState message={errorMessage} onRetry={() => setStatus('form')} />
      )}

      {status === 'result' && result && (
        <div className="form-page__result">
          <button className="btn btn--ghost" onClick={() => setStatus('form')} type="button">
            {c.edit}
          </button>

          <div className="panel">
            <GunaMilanScorecard gunaMilan={result.guna_milan} manglikAnalysis={result.manglik_analysis} />
          </div>

          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setShowProfiles((v) => !v)}
            aria-expanded={showProfiles}
          >
            {showProfiles ? c.hideCharts : c.showCharts}
          </button>

          {showProfiles && (
            <div className="match-profiles">
              <div className="panel">
                <p className="eyebrow match-profiles__label">{c.boy}</p>
                <KundaliReport report={result.boy} compact />
              </div>
              <div className="panel">
                <p className="eyebrow match-profiles__label">{c.girl}</p>
                <KundaliReport report={result.girl} compact />
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
