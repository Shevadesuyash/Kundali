import { useState } from 'react';
import BirthDetailsForm, { makeEmptyPerson, toApiPayload, isPersonComplete } from '../components/BirthDetailsForm';
import KundaliReport from '../components/KundaliReport';
import SaveProfileButton from '../components/SaveProfileButton';
import { LoadingState, ErrorState } from '../components/StatusStates';
import { getKundali, ApiError } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import './FormPage.css';

const STR = {
  en: {
    eyebrow: 'Individual report',
    title: 'Generate a Kundali',
    intro: "Enter one person's exact birth details to see their Ascendant, planetary positions, D1/D9 charts, Varna/Gana/Nadi classification, and Manglik Dosha status.",
    formLabel: 'Birth details',
    submit: 'Generate Kundali',
    loading: 'Charting planetary positions…',
    edit: '← Edit details',
    error: 'Something went wrong. Please try again.',
  },
  mr: {
    eyebrow: 'वैयक्तिक अहवाल',
    title: 'कुंडली काढा',
    intro: 'एका व्यक्तीचे अचूक जन्म तपशील प्रविष्ट करा — लग्न, ग्रहांची स्थिती, D1/D9 कुंडल्या, वर्ण/गण/नाडी वर्गीकरण आणि मंगळ दोष स्थिती पाहण्यासाठी.',
    formLabel: 'जन्म तपशील',
    submit: 'कुंडली काढा',
    loading: 'ग्रहांची स्थिती मोजत आहे…',
    edit: '← तपशील बदला',
    error: 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',
  },
};

export default function KundaliPage() {
  const { lang } = useLang();
  const c = STR[lang];

  const [person, setPerson] = useState(makeEmptyPerson());
  const [status, setStatus] = useState('form');
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const data = await getKundali(toApiPayload(person));
      setReport(data);
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
        <form onSubmit={handleSubmit} className="form-page__form">
          <BirthDetailsForm label={c.formLabel} value={person} onChange={setPerson} idPrefix="k" />
          <button type="submit" className="btn btn--primary btn--full" disabled={!isPersonComplete(person)}>
            {c.submit}
          </button>
        </form>
      )}

      {status === 'loading' && <LoadingState message={c.loading} />}

      {status === 'error' && (
        <ErrorState message={errorMessage} onRetry={() => setStatus('form')} />
      )}

      {status === 'result' && report && (
        <div className="form-page__result">
          <button className="btn btn--ghost" onClick={() => setStatus('form')} type="button">
            {c.edit}
          </button>
          <div className="panel">
            <KundaliReport report={report} />
            <SaveProfileButton
              person={toApiPayload(person)}
              birthPlace={person.place_label}
            />
          </div>
        </div>
      )}
    </main>
  );
}
