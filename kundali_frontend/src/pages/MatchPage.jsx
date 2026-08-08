import { useState } from 'react';
import BirthDetailsForm, { makeEmptyPerson, toApiPayload, isPersonComplete } from '../components/BirthDetailsForm';
import KundaliReport from '../components/KundaliReport';
import GunaMilanScorecard from '../components/GunaMilanScorecard';
import { LoadingState, ErrorState } from '../components/StatusStates';
import { getMatch, ApiError } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import './FormPage.css';
import './MatchPage.css';

const STR = {
  en: {
    eyebrow: 'Kundali Milan',
    title: 'Check compatibility',
    intro: "Enter both partners' exact birth details for a full Ashtakoot Guna Milan (36-point) scorecard, plus the combined Manglik Dosha verdict.",
    label1: "Boy's birth details",
    label2: "Girl's birth details",
    submit: 'Run Guna Milan',
    loading: 'Comparing two charts across eight kootas…',
    edit: '← Edit details',
    showCharts: 'Show individual charts',
    hideCharts: 'Hide individual charts',
    boy: 'Boy',
    girl: 'Girl',
    error: 'Something went wrong. Please try again.',
  },
  mr: {
    eyebrow: 'कुंडली मिलन',
    title: 'सुसंगतता तपासा',
    intro: 'पूर्ण अष्टकूट गुण मिलन (३६-गुण) स्कोरकार्ड आणि एकत्रित मंगळ दोष निर्णयासाठी दोन्ही जोडीदारांचे अचूक जन्म तपशील प्रविष्ट करा.',
    label1: 'मुलाचे जन्म तपशील',
    label2: 'मुलीचे जन्म तपशील',
    submit: 'गुण मिलन तपासा',
    loading: 'आठ कूटांमध्ये दोन कुंडल्यांची तुलना करत आहे…',
    edit: '← तपशील बदला',
    showCharts: 'वैयक्तिक कुंडल्या दाखवा',
    hideCharts: 'वैयक्तिक कुंडल्या लपवा',
    boy: 'मुलगा',
    girl: 'मुलगी',
    error: 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',
  },
};

export default function MatchPage() {
  const { lang } = useLang();
  const c = STR[lang];

  const [boy, setBoy] = useState(makeEmptyPerson());
  const [girl, setGirl] = useState(makeEmptyPerson());
  const [status, setStatus] = useState('form');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProfiles, setShowProfiles] = useState(false);

  const canSubmit = isPersonComplete(boy) && isPersonComplete(girl);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await getMatch(toApiPayload(boy), toApiPayload(girl));
      setResult(data);
      setStatus('result');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : c.error);
      setStatus('error');
    }
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
            <BirthDetailsForm label={c.label1} value={boy}  onChange={setBoy}  idPrefix="boy" />
            <BirthDetailsForm label={c.label2} value={girl} onChange={setGirl} idPrefix="girl" />
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
