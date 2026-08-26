import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PartnerSlot from '../components/PartnerSlot';
import KundaliReport from '../components/KundaliReport';
import GunaMilanScorecard from '../components/GunaMilanScorecard';
import ExportPDFButton from '../components/ExportPDFButton';
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
    aiTitle: 'Vedic AI Compatibility Reading',
    aiNotice: 'Opt-in AI analysis based on 36-point Guna Milan and Papa Samyam differential.',
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
    aiTitle: 'वैदिक एआय सुसंगतता अहवाल',
    aiNotice: '३६-गुण मिलन आणि पाप साम्य फरकावर आधारित एआय विश्लेषण.',
  },
  hi: {
    eyebrow: 'कुंडली मिलान',
    title: 'विवाह सुसंगतता जांचें',
    intro: 'पूर्ण अष्टकूट गुण मिलान (३६ गुण) और मांगलिक दोष विश्लेषण हेतु दोनों के जन्म विवरण दर्ज करें।',
    submit: 'गुण मिलान करें',
    loading: 'आठ कूटों में दोनों कुंडलियों का मिलान हो रहा है…',
    edit: '← विवरण बदलें',
    showCharts: 'व्यक्तिगत कुंडलियां देखें',
    hideCharts: 'व्यक्तिगत कुंडलियां छिपाएं',
    boy: 'वर (पुरुष)',
    girl: 'वधू (स्त्री)',
    error: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    swap: '⇅ अदला-बदली करें',
    aiTitle: 'वैदिक एआई मिलान विश्लेषण',
    aiNotice: '३६-गुण मिलान और पाप साम्य संतुलन पर आधारित विश्लेषण।',
  },
  gu: {
    eyebrow: 'કુંડળી મેળવણ',
    title: 'વિવાહ સુસંગતતા ચકાસો',
    intro: 'સંપૂર્ણ અષ્ટકૂટ ગુણ મિલન (૩૬ ગુણ) અને માંગલિક વિશ્લેષણ માટે બંનેની જન્મ વિગતો દાખલ કરો.',
    submit: 'ગુણ મિલન ચકાસો',
    loading: 'બંને કુંડળીઓનું વિશ્લેષણ થઈ રહ્યું છે…',
    edit: '← વિગતો બદલો',
    showCharts: 'વ્યક્તિગત કુંડળીઓ જુઓ',
    hideCharts: 'વ્યક્તિગત કુંડળીઓ છુપાવો',
    boy: 'વર (પુરુષ)',
    girl: 'કન્યા (સ્ત્રી)',
    error: 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
    swap: '⇅ અદલાબદલી કરો',
    aiTitle: 'વૈદિક એઆઈ સુસંગતતા અહેવાલ',
    aiNotice: '૩૬ ગુણ મિલન અને પાપ સામ્ય સંતુલન પર આધારિત વિશ્લેષણ.',
  },
};

export default function MatchPage() {
  const { lang } = useLang();
  const c = STR[lang] || STR.en;

  const [searchParams] = useSearchParams();
  const initialPartner1Id = searchParams.get('partner1Id') ? Number(searchParams.get('partner1Id')) : null;
  const initialPartner2Id = searchParams.get('partner2Id') ? Number(searchParams.get('partner2Id')) : null;

  const [male, setMale]     = useState(makeEmptyPerson());
  const [female, setFemale] = useState(makeEmptyPerson());
  const [status, setStatus] = useState('form');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showProfiles, setShowProfiles] = useState(false);
  const matchReportRef = useRef(null);

  const canSubmit = isPersonComplete(male) && isPersonComplete(female);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await getMatch(toApiPayload(male), toApiPayload(female), true);
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
        <div className="form-page__result" ref={matchReportRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <button className="btn btn--ghost" onClick={() => setStatus('form')} type="button">
              {c.edit}
            </button>

            <ExportPDFButton
              reportRef={matchReportRef}
              personName={`${male.name || 'Groom'}_and_${female.name || 'Bride'}_Match`}
            />
          </div>

          {/* Guna Milan Scorecard */}
          <div className="panel" data-pdf-section="guna-milan">
            <GunaMilanScorecard gunaMilan={result.guna_milan} manglikAnalysis={result.manglik_analysis} />
          </div>

          {/* Optional Gemini AI Compatibility Narrative Reading */}
          {result.ai_reading && (
            <div className="panel" data-pdf-section="ai-reading" style={{ marginTop: '1.5rem', background: '#fffdfa', borderLeft: '4px solid var(--color-copper, #c8720a)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-copper-deep, #9c4b00)', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
                ✨ {c.aiTitle}
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--color-text, #1f2937)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {result.ai_reading}
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setShowProfiles((v) => !v)}
              aria-expanded={showProfiles}
            >
              {showProfiles ? c.hideCharts : c.showCharts}
            </button>
          </div>

          {showProfiles && (
            <div className="match-profiles" style={{ marginTop: '1.5rem' }}>
              <div className="panel" data-pdf-section="groom-chart">
                <p className="eyebrow match-profiles__label">{c.boy}</p>
                <KundaliReport report={result.boy} compact />
              </div>
              <div className="panel" data-pdf-section="bride-chart">
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
