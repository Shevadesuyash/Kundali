import React, { useState, useEffect } from 'react';
import { getVarshapal } from '../../api/kundaliApi';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import './VarshapalTab.css';
import './tabs.css';

/**
 * VarshapalTab — Tajika Annual Solar Return chart & Mudda Dasha panel.
 * Allows selecting target year, displays Varsha Pravesh, Varsha Lagna,
 * Muntha sign progression, annual Mudda Dasha timeline, and beginner guide.
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
  }, [targetYear]);

  const yearOptions = [
    currentYear - 2, currentYear - 1, currentYear,
    currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4,
  ];

  const guideTitle = lang === 'mr' ? 'ताजिक वर्षफळ, मुंथा व मुद्द दशा कशी समजून घ्यावी?' :
                     lang === 'hi' ? 'ताजिक वर्षफल, मुंथा और मुद्धा दशा को कैसे समझें?' :
                     lang === 'gu' ? 'તાજિક વર્ષફળ, મુંથા અને મુદ્દા દશા કેવી રીતે સમજવું?' :
                     'How to Read Tajika Varshapal, Muntha & Mudda Dasha';

  return (
    <div className="tab-panel varshapal-tab" data-pdf-section="varshapal">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="varshapal-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. वर्ष प्रवेश (Solar Return)' : lang === 'hi' ? '१. वर्ष प्रवेश (Solar Return)' : lang === 'gu' ? '૧. વર્ષ પ્રવેશ' : '1. Varsha Pravesh'}</h5>
            <p>
              {lang === 'mr' ? 'गोचर सूर्य जन्मकालीन सूर्याच्या अचूक अंशावर ज्या क्षणी परत येतो, तो त्या वर्षाचा वार्षिक जन्मक्षण मानला जातो.' :
               lang === 'hi' ? 'गोचर सूर्य जिस क्षण जन्मकालीन सूर्य के सटीक अंश पर आता है, वह उस वर्ष का वार्षिक प्रवेश काल होता है।' :
               lang === 'gu' ? 'ગોચર સૂર્ય જન્મ સમયના સૂર્યના અંશ પર આવે તે ક્ષણે વાર્ષિક કુંડળી બને છે.' :
               'The exact astronomical second transit Sun returns to your natal Sun longitude.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. मुंथा प्रगती (Muntha)' : lang === 'hi' ? '२. मुंथा प्रगति (Muntha)' : lang === 'gu' ? '૨. મુંથા પ્રગતિ' : '2. Muntha Progression'}</h5>
            <p>
              {lang === 'mr' ? 'मुंथा दरवर्षी १ राशी पुढे सरकते. मुंथा ९, १०, ११ भावात असल्यास यश, पदोन्नती व धनलाभाचे वर्ष ठरते; ६, ८, १२ भावात असल्यास आरोग्याची काळजी घ्यावी.' :
               lang === 'hi' ? 'मुंथा प्रतिवर्ष १ राशि आगे बढ़ती है। ९, १०, ११ भाव में मुंथा भाग्यवर्धक और पदोन्नति देती है; ६, ८, १२ में सावधानी रखें।' :
               lang === 'gu' ? 'મુંથા દર વર્ષે ૧ રાશિ આગળ વધે છે. ૯, ૧૦, ૧૧ ભાવમાં તે સફળતા અને ધનલાભ આપે છે.' :
               'Advances 1 sign/year. In houses 9, 10, 11 brings promotion & triumph; in houses 6, 8, 12 calls for health caution.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. मुद्द दशा (Mudda Dasha)' : lang === 'hi' ? '३. मुद्धा दशा (Mudda Dasha)' : lang === 'gu' ? '૩. મુદ્દા દશા' : '3. Mudda Dasha'}</h5>
            <p>
              {lang === 'mr' ? '३६० दिवसांची वार्षिक ताजिक दशा. त्या वर्षातील प्रत्येक महिन्याचे स्वतंत्र आर्थिक व कौटुंबिक फळ दाखवते.' :
               lang === 'hi' ? '३६० दिन का वार्षिक चक्र जो उस वर्ष के प्रत्येक माह के करियर व वित्तीय परिणाम स्पष्ट करता है।' :
               lang === 'gu' ? '૩૬૦ દિવસનું વાર્ષિક ચક્ર જે વર્ષના દરેક મહિનાનું પરિણામ દર્શાવે છે.' :
               '360-day annual planetary timeline revealing month-by-month financial, career, and personal milestones.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* Year Selection Controls */}
      <div className="tab-section varshapal-controls">
        <div>
          <p className="tab-section__title">Tajika Varshapal (Annual Solar Return)</p>
          <p className="tab-section__subtitle">
            Exact astronomical moment transit Sun returns to natal longitude for Year {targetYear} (Age {data?.age ?? (targetYear - personPayload.year)}).
          </p>
        </div>

        <div className="varshapal-year-pills">
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dim)' }}>Select Year:</span>
          {yearOptions.map((yr) => (
            <button
              key={yr}
              type="button"
              className={`year-pill${targetYear === yr ? ' is-active' : ''}`}
              onClick={() => setTargetYear(yr)}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-copper, #c8720a)' }}>
          <p>⏳ Computing high-precision Solar Return &amp; Muntha progression...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Hero Cards: Pravesh Time, Varsha Lagna, Muntha */}
          <div className="varshapal-hero-grid">
            <div className="varshapal-hero-card varshapal-hero-card--pravesh">
              <span className="varshapal-card-label">Varsha Pravesh (Exact Return)</span>
              <h4 className="varshapal-card-val">{data.varsha_pravesh_ist}</h4>
              <span className="varshapal-card-sub">
                Annual Ascendant (Varsha Lagna): <strong>{data.varsha_lagna.sign}</strong> (Ruled by {data.varsha_lagna.sign_lord})
              </span>
            </div>

            <div className={`varshapal-hero-card ${data.muntha.is_auspicious ? 'varshapal-hero-card--muntha' : 'varshapal-hero-card--muntha-challenging'}`}>
              <span className="varshapal-card-label">Muntha Progression ({targetYear})</span>
              <h4 className="varshapal-card-val">
                {data.muntha.sign} (House {data.muntha.house})
              </h4>
              <span className="varshapal-card-sub">
                {data.muntha.interpretation}
              </span>
            </div>
          </div>

          {/* Mudda Dasha Annual Timeline */}
          <div className="tab-section">
            <p className="tab-section__title">Annual Mudda Dasha Timeline (360-Day Cycle)</p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Duration</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mudda_dasha.map((m) => (
                    <tr key={m.planet}>
                      <td><strong>{m.planet}</strong></td>
                      <td>{m.duration_days} Days</td>
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
            <p className="tab-section__title">Planets in Varshapal Chart</p>
            <div className="mudda-table-wrap">
              <table className="mudda-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Sign</th>
                    <th>Longitude</th>
                    <th>House from Varsha Lagna</th>
                    <th>Motion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planets.map((p) => (
                    <tr key={p.planet}>
                      <td><strong>{p.planet}</strong></td>
                      <td>{p.sign}</td>
                      <td className="mono">{p.longitude}°</td>
                      <td className="mono"><strong>House {p.house}</strong></td>
                      <td>{p.retrograde ? '℞ Vakri' : 'Direct'}</td>
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
