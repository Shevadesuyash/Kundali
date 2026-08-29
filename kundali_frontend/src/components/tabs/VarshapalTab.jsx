import React, { useState, useEffect } from 'react';
import { getVarshapal } from '../../api/kundaliApi';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import { planetName, signName } from '../../utils/i18n';
import { getMunthaInterpretation } from '../../utils/astroTranslations';
import './VarshapalTab.css';
import './tabs.css';

/**
 * VarshapalTab — Tajika Annual Solar Return chart & Mudda Dasha timeline.
 */
export default function VarshapalTab({ report }) {
  const { profile } = report;
  const { lang, t } = useLang();
  const currentYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const personPayload = report.person || report.raw_person || {
    name: profile?.name || '',
    year: parseInt(profile?.year, 10),
    month: parseInt(profile?.month, 10),
    day: parseInt(profile?.day, 10),
    hour: parseInt(profile?.hour, 10),
    minute: parseInt(profile?.minute, 10),
    lat: parseFloat(profile?.lat),
    lon: parseFloat(profile?.lon),
    timezone_str: profile?.timezone_str || 'Asia/Kolkata',
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getVarshapal(personPayload, targetYear)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to calculate Varshapal chart');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetYear, personPayload.year, personPayload.lat, personPayload.lon]);

  const yearOptions = [
    currentYear - 2, currentYear - 1, currentYear,
    currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4,
  ];

  const guideTitle = lang === 'mr' ? 'ताजिक वर्षफळ, मुंथा व मुद्द दशा कशी समजून घ्यावी?' :
                     lang === 'hi' ? 'ताजिक वर्षफल, मुंथा और मुद्धा दशा को कैसे समझें?' :
                     lang === 'gu' ? 'તાજિક વર્ષફળ, મુંથા અને મુદ્દા દશા કેવી રીતે સમજવું?' :
                     'How to Read Tajika Varshapal, Muntha & Mudda Dasha';

  const sectionTitle =
    lang === 'mr' ? 'ताजिक वर्षफळ (वार्षिक सौर प्रवेश)' :
    lang === 'hi' ? 'ताजिक वर्षफल (वार्षिक सौर प्रवेश)' :
    lang === 'gu' ? 'તાજિક વર્ષફળ (વાર્ષિક સૌર પ્રવેશ)' :
    'Tajika Varshapal (Annual Solar Return)';

  const praveshLabel =
    lang === 'mr' ? 'वर्ष प्रवेश (अचूक सौर परत वेळ)' :
    lang === 'hi' ? 'वर्ष प्रवेश (सटीक सौर वापसी काल)' :
    lang === 'gu' ? 'વર્ષ પ્રવેશ (ચોક્કસ સૌર સમય)' :
    'Varsha Pravesh (Exact Return)';

  const varshaLagnaLabel =
    lang === 'mr' ? 'वार्षिक लग्न (वर्ष लग्न)' :
    lang === 'hi' ? 'वार्षिक लग्न (वर्ष लग्न)' :
    lang === 'gu' ? 'વાર્ષિક લગ્ન (વર્ષ લગ્ન)' :
    'Annual Ascendant (Varsha Lagna)';

  const munthaLabel =
    lang === 'mr' ? `मुंथा प्रगती (${targetYear})` :
    lang === 'hi' ? `मुंथा प्रगति (${targetYear})` :
    lang === 'gu' ? `મુંથા પ્રગતિ (${targetYear})` :
    `Muntha Progression (${targetYear})`;

  const muddaTitle =
    lang === 'mr' ? 'वार्षिक मुद्द दशा कालचक्र (३६० दिवस)' :
    lang === 'hi' ? 'वार्षिक मुद्धा दशा चक्र (३६० दिन)' :
    lang === 'gu' ? 'વાર્ષિક મુદ્દા દશા સમયરેખા (૩૬૦ દિવસ)' :
    'Annual Mudda Dasha Timeline (360-Day Cycle)';

  return (
    <div className="tab-panel varshapal-tab" data-pdf-section="varshapal">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="varshapal-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. सौर परत (Solar Return)' : lang === 'hi' ? '१. सौर वापसी (Solar Return)' : lang === 'gu' ? '૧. સૌર વાપસી' : '1. Solar Return Moment'}</h5>
            <p>
              {lang === 'mr' ? 'सूर्य जन्मवेळच्या अचूक अंशावर दरवर्षी परत येतो त्या क्षणाची कुंडली म्हणजे वर्षफळ.' :
               lang === 'hi' ? 'सूर्य के जन्म कालीन सटीक अंश पर पुनः लौटने के क्षण का चार्ट वर्षफल कहलाता है।' :
               lang === 'gu' ? 'સૂર્ય જન્મ સમયના ચોક્કસ અંશ પર પરત આવે તે ક્ષણનું ચાર્ટ વર્ષફળ છે.' :
               'Calculates the exact second the Sun returns to its precise natal longitude for the selected year.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. मुंथा (Muntha)' : lang === 'hi' ? '२. मुंथा (Muntha)' : lang === 'gu' ? '૨. મુંથા (Muntha)' : '2. Muntha Progression'}</h5>
            <p>
              {lang === 'mr' ? 'दरवर्षी १ घर पुढे सरकणारा संवेदनशील बिंदू. १, ५, ९, १०, ११ भावात असल्यास वर्ष अत्यंत शुभ ठरते; ६, ८, १२ भावात काळजी हवी.' :
               lang === 'hi' ? 'प्रतिवर्ष एक भाव आगे बढ़ने वाला संवेदनशील बिंदु। १, ५, ९, १०, ११ भाव में उत्तम; ६, ८, १२ भाव में सावधानी आवश्यक।' :
               lang === 'gu' ? 'દર વર્ષે એક ભાવ આગળ વધતો બિંદુ. ૧, ૫, ૯, ૧૦, ૧૧ માં ઉત્તમ પરિણામ આપે છે.' :
               'Progresses one house per completed year. Houses 1, 5, 9, 10, 11 are auspicious; 6, 8, 12 require caution.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. मुद्द दशा (Mudda Dasha)' : lang === 'hi' ? '३. मुद्धा दशा (Mudda Dasha)' : lang === 'gu' ? '૩. મુદ્દા દશા' : '3. Mudda Dasha'}</h5>
            <p>
              {lang === 'mr' ? '३६० दिवसांचे वार्षिक दशा चक्र. वर्षातील प्रत्येक महिन्याचे फलित आणि महत्त्वाचे प्रसंग दर्शवते.' :
               lang === 'hi' ? '३६० दिन का वार्षिक दशा चक्र, जो वर्ष के प्रत्येक माह के फलित को स्पष्ट करता है।' :
               lang === 'gu' ? '૩૬૦ દિવસનું વાર્ષિક દશા ચક્ર, જે વર્ષના દરેક મહિનાનું ફળ દર્શાવે છે.' :
               '360-day annual cycle dividing the year into proportional planetary periods.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* Header and Year Picker */}
      <div className="varshapal-header-wrap">
        <div>
          <p className="tab-section__title">{sectionTitle}</p>
          <p className="tab-section__subtitle">
            {lang === 'mr' ? `वर्ष ${targetYear} साठी सौर प्रवेश काल (वय: ${targetYear - personPayload.year} वर्षे).` :
             lang === 'hi' ? `वर्ष ${targetYear} हेतु सौर प्रवेश काल (आयु: ${targetYear - personPayload.year} वर्ष)।` :
             lang === 'gu' ? `વર્ષ ${targetYear} માટે સૌર પ્રવેશ કાળ (ઉંમર: ${targetYear - personPayload.year} વર્ષ).` :
             `Solar Return analysis for year ${targetYear} (Age: ${targetYear - personPayload.year} years).`}
          </p>
        </div>

        <div className="varshapal-year-selector">
          <label htmlFor="varsha-year-select">
            {lang === 'mr' ? 'वर्ष निवडा:' : lang === 'hi' ? 'वर्ष चुनें:' : lang === 'gu' ? 'વર્ષ પસંદ કરો:' : 'Select Year:'}
          </label>
          <div className="varshapal-year-chips">
            {yearOptions.map((y) => (
              <button
                key={y}
                type="button"
                className={`varshapal-chip${y === targetYear ? ' is-active' : ''}`}
                onClick={() => setTargetYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-copper, #c8720a)' }}>
          <p>
            {lang === 'mr' ? `⏳ वर्ष ${targetYear} चे ताजिक वर्षफळ काढत आहे...` :
             lang === 'hi' ? `⏳ वर्ष ${targetYear} का ताजिक वर्षफल तैयार हो रहा है...` :
             lang === 'gu' ? `⏳ વર્ષ ${targetYear} નું તાજિક વર્ષફળ બની રહ્યું છે...` :
             `⏳ Calculating Tajika Varshapal for ${targetYear}...`}
          </p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Key Indicators Cards */}
          <div className="varshapal-hero-cards">
            <div className="varshapal-hero-card varshapal-hero-card--pravesh">
              <span className="varshapal-card-label">{praveshLabel}</span>
              <h4 className="varshapal-card-val">{data.varsha_pravesh_ist}</h4>
              <span className="varshapal-card-sub">
                {varshaLagnaLabel}: <strong>{signName(data.varsha_lagna.sign, lang)}</strong> ({lang === 'mr' ? 'स्वामी:' : lang === 'hi' ? 'स्वामी:' : lang === 'gu' ? 'સ્વામી:' : 'Ruled by'} {planetName(data.varsha_lagna.sign_lord, lang)})
              </span>
            </div>

            <div className={`varshapal-hero-card ${data.muntha.is_auspicious ? 'varshapal-hero-card--muntha' : 'varshapal-hero-card--muntha-challenging'}`}>
              <span className="varshapal-card-label">{munthaLabel}</span>
              <h4 className="varshapal-card-val">
                {signName(data.muntha.sign, lang)} ({lang === 'mr' ? 'भाव' : lang === 'hi' ? 'भाव' : lang === 'gu' ? 'ભાવ' : 'House'} {data.muntha.house})
              </h4>
              <span className="varshapal-card-sub">
                {getMunthaInterpretation(data.muntha.house, data.muntha.interpretation, lang)}
              </span>
            </div>
          </div>

          {/* Mudda Dasha Annual Timeline */}
          <div className="tab-section">
            <p className="tab-section__title">{muddaTitle}</p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>{lang === 'mr' ? 'दशा स्वामी ग्रह' : lang === 'hi' ? 'दशा स्वामी ग्रह' : lang === 'gu' ? 'દશા સ્વામી ગ્રહ' : 'Planet'}</th>
                    <th>{lang === 'mr' ? 'कालावधी (दिवस)' : lang === 'hi' ? 'अवधि (दिन)' : lang === 'gu' ? 'સમયગાળો (દિવસ)' : 'Duration'}</th>
                    <th>{lang === 'mr' ? 'प्रारंभ तारीख' : lang === 'hi' ? 'प्रारंभ तिथि' : lang === 'gu' ? 'શરૂઆત તારીખ' : 'Start Date'}</th>
                    <th>{lang === 'mr' ? 'समाप्ती तारीख' : lang === 'hi' ? 'समाप्ति तिथि' : lang === 'gu' ? 'સમાપ્તિ તારીખ' : 'End Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mudda_dasha.map((m) => (
                    <tr key={m.planet}>
                      <td><strong>{planetName(m.planet, lang)}</strong></td>
                      <td>{m.duration_days} {lang === 'mr' ? 'दिवस' : lang === 'hi' ? 'दिन' : lang === 'gu' ? 'દિવસ' : 'Days'}</td>
                      <td className="mono">{m.start_date}</td>
                      <td className="mono">{m.end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Annual Planetary Positions Table */}
          <div className="tab-section">
            <p className="tab-section__title">
              {lang === 'mr' ? 'वार्षिक वर्षफळ कुंडलीतील ग्रह स्थिती' :
               lang === 'hi' ? 'वार्षिक वर्षफल कुंडली में ग्रह स्थिति' :
               lang === 'gu' ? 'વાર્ષિક વર્ષફળ કુંડળીમાં ગ્રહ સ્થિતિ' :
               'Planets in Varshapal Chart'}
            </p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>{lang === 'mr' ? 'ग्रह' : lang === 'hi' ? 'ग्रह' : lang === 'gu' ? 'ગ્રહ' : 'Planet'}</th>
                    <th>{lang === 'mr' ? 'राशी' : lang === 'hi' ? 'राशि' : lang === 'gu' ? 'રાશિ' : 'Sign'}</th>
                    <th>{lang === 'mr' ? 'अंश' : lang === 'hi' ? 'अंश' : lang === 'gu' ? 'અંશ' : 'Longitude'}</th>
                    <th>{lang === 'mr' ? 'वर्ष लग्नापासून भाव' : lang === 'hi' ? 'वर्ष लग्न से भाव' : lang === 'gu' ? 'વર્ષ લગ્નથી ભાવ' : 'House from Varsha Lagna'}</th>
                    <th>{lang === 'mr' ? 'गती' : lang === 'hi' ? 'गति' : lang === 'gu' ? 'ગતિ' : 'Motion'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p) => (
                    <tr key={p.planet}>
                      <td><strong>{planetName(p.planet, lang)}</strong></td>
                      <td>{signName(p.sign, lang)}</td>
                      <td className="mono">{p.longitude}°</td>
                      <td className="mono">
                        <strong>
                          {lang === 'mr' ? `भाव ${p.house}` : lang === 'hi' ? `भाव ${p.house}` : lang === 'gu' ? `${p.house}મો ભાવ` : `House ${p.house}`}
                        </strong>
                      </td>
                      <td>
                        {p.retrograde
                          ? (lang === 'mr' || lang === 'hi' ? '℞ वक्री' : lang === 'gu' ? '℞ વક્રી' : '℞ Vakri')
                          : (lang === 'mr' || lang === 'hi' ? 'मार्गी' : lang === 'gu' ? 'માર્ગી' : 'Direct')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
