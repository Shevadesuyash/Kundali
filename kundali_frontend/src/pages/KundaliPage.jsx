import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BirthDetailsForm, { makeEmptyPerson, toApiPayload, isPersonComplete } from '../components/BirthDetailsForm';
import KundaliReport from '../components/KundaliReport';
import SaveProfileButton from '../components/SaveProfileButton';
import { LoadingState, ErrorState } from '../components/StatusStates';
import { getKundali, getProfile, ApiError } from '../api/kundaliApi';
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
  hi: {
    eyebrow: 'व्यक्तिगत विवरण',
    title: 'कुंडली बनाएं',
    intro: 'एक व्यक्ति का सटीक जन्म विवरण दर्ज करें — लग्न, ग्रह स्थिति, D1/D9 कुंडलियां, वर्ण/गण/नाड़ी वर्गीकरण और मांगलिक दोष स्थिति देखने के लिए।',
    formLabel: 'जन्म विवरण',
    submit: 'कुंडली बनाएं',
    loading: 'ग्रह स्थिति की गणना हो रही है…',
    edit: '← विवरण बदलें',
    error: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
  },
  gu: {
    eyebrow: 'વ્યક્તિગત અહેવાલ',
    title: 'કુંડળી બનાવો',
    intro: 'વ્યક્તિની ચોક્કસ જન્મ વિગતો દાખલ કરો — લગ્ન, ગ્રહ સ્થિતિ, D1/D9 કુંડળી, વર્ણ/ગણ/નાડી અને માંગલિક સ્થિતિ જોવા માટે.',
    formLabel: 'જન્મ વિગતો',
    submit: 'કુંડળી બનાવો',
    loading: 'ગ્રહ સ્થિતિની ગણતરી થઈ રહી છે…',
    edit: '← વિગતો બદલો',
    error: 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
  },
};

export default function KundaliPage() {
  const { lang } = useLang();
  const c = STR[lang] || STR.en;

  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('profileId') ? Number(searchParams.get('profileId')) : null;

  const [person, setPerson] = useState(makeEmptyPerson());
  const [placeLabel, setPlaceLabel] = useState('');
  const [status, setStatus] = useState('form');
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // If ?profileId= is in the URL, auto-fill and auto-submit on mount
  useEffect(() => {
    if (!profileId) return;
    (async () => {
      try {
        const profile = await getProfile(profileId);
        const filled = {
          name:         profile.name,
          gender:       profile.gender,
          year:         String(profile.year),
          month:        String(profile.month),
          day:          String(profile.day),
          hour:         String(profile.hour),
          minute:       String(profile.minute),
          lat:          String(parseFloat(profile.lat).toFixed(4)),
          lon:          String(parseFloat(profile.lon).toFixed(4)),
          timezone_str: profile.timezone_str,
          place_label:  profile.birth_place || '',
        };
        setPerson(filled);
        setPlaceLabel(profile.birth_place || '');
        // Auto-submit
        await submitKundali(filled, profile.birth_place);
      } catch {
        // silently fail — show empty form
      }
    })();
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitKundali(personData, birthPlace) {
    setStatus('loading');
    setErrorMessage('');
    try {
      const payload = toApiPayload(personData);
      const data = await getKundali(payload);
      // Attach birth_place and gender for display in the report header
      data.birth_place = birthPlace || personData.place_label || '';
      data.gender = personData.gender || '';
      data.raw_person = payload;
      setReport(data);
      setStatus('result');


    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : c.error);
      setStatus('error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitKundali(person, person.place_label);
  }

  function handlePersonChange(newPerson) {
    setPerson(newPerson);
    if (newPerson.place_label) setPlaceLabel(newPerson.place_label);
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
          <BirthDetailsForm
            label={c.formLabel}
            value={person}
            onChange={handlePersonChange}
            idPrefix="k"
            showGender
          />
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
              gender={person.gender}
              birthPlace={person.place_label || placeLabel}
            />
          </div>
        </div>
      )}
    </main>
  );
}
