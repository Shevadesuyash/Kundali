import { useState } from 'react';
import PlanetTable from '../PlanetTable';
import ChartGrid from '../ChartGrid';
import AshtakvargaGrid from '../AshtakvargaGrid';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import './tabs.css';

/**
 * PlanetsTab — planetary positions table + D1/D9/Rashi chart selector + Ashtakvarga (SAV & on-demand BAV).
 * Includes an interactive beginner & astrologer guide.
 */
export default function PlanetsTab({ report }) {
  const { planets, charts, ashtakvarga_sav, profile } = report;
  const [activeChart, setActiveChart] = useState('d1');
  const { lang, t } = useLang();

  const CHART_TABS = [
    { id: 'd1',    label: t('report.chart.d1')    },
    { id: 'd9',    label: t('report.chart.d9')    },
    ...(charts?.rashi_moon_chart ? [{ id: 'rashi', label: t('report.chart.rashi') }] : []),
    { id: 'all',   label: t('report.chart.all')   },
  ];

  const personPayload = report.person || report.raw_person || {
    name:         profile?.name || '',
    year:         parseInt(profile?.year, 10),
    month:        parseInt(profile?.month, 10),
    day:          parseInt(profile?.day, 10),
    hour:         parseInt(profile?.hour, 10),
    minute:       parseInt(profile?.minute, 10),
    lat:          parseFloat(profile?.lat),
    lon:          parseFloat(profile?.lon),
    timezone_str: profile?.timezone_str || 'Asia/Kolkata',
  };

  const guideTitle = lang === 'mr' ? 'ग्रह, अवस्था आणि अष्टकवर्ग कसे समजून घ्यावे?' :
                     lang === 'hi' ? 'ग्रह, अवस्था और अष्टकवर्ग को कैसे समझें?' :
                     lang === 'gu' ? 'ગ્રહ, અવસ્થા અને અષ્ટકવર્ગ કેવી રીતે સમજવું?' :
                     'How to Read Planetary Positions, Dignities & Ashtakvarga';

  return (
    <div className="tab-panel">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="planets-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. ग्रहांची अवस्था (Dignity)' : lang === 'hi' ? '१. ग्रह की अवस्था' : lang === 'gu' ? '૧. ગ્રહની અવસ્થા' : '1. Planetary Dignity'}</h5>
            <p>
              {lang === 'mr' ? 'उच्च (Exalted) ग्रह १००% शुभ फळ देतो. स्वराशी (Own Sign) स्थिर बल देतो. नीच (Debilitated) ग्रह दुर्बल असतो आणि उपाय आवश्यक असतात.' :
               lang === 'hi' ? 'उच्च (Exalted) ग्रह १००% शुभ फल देता है। स्वराशि ग्रह स्थिरता देता है। नीच (Debilitated) ग्रह कमजोर होता है और उपाय मांगता है।' :
               lang === 'gu' ? 'ઉચ્ચ ગ્રહ ૧૦૦% શુભ ફળ આપે છે. સ્વરાશિ સ્થિરતા આપે છે. નીચ ગ્રહ નબળો હોય છે અને ઉપાય જરૂરી બને છે.' :
               'Exalted (Ucha) planets have maximum strength. Own Sign brings steady results. Debilitated (Neecha) planets require conscious remedies.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. वक्री ग्रह (Retrograde)' : lang === 'hi' ? '२. वक्री ग्रह' : lang === 'gu' ? '૨. વક્રી ગ્રહ' : '2. Retrograde (Vakri)'}</h5>
            <p>
              {lang === 'mr' ? 'वक्री (R) ग्रह पृथ्वीच्या जवळ भासतो. तो त्या ग्रहाच्या अंतर्गत गुणधर्मांना अधिक तीव्र व कर्मप्रधान बनवतो.' :
               lang === 'hi' ? 'वक्री (R) ग्रह पृथ्वी के निकट प्रतीत होता है। यह उस ग्रह के आंतरिक व कार्मिक प्रभाव को अत्यधिक तीव्र करता है।' :
               lang === 'gu' ? 'વક્રી (R) ગ્રહ પૃથ્વીની નજીક લાગે છે અને કાર્મિક પ્રભાવને વધુ તીવ્ર બનાવે છે.' :
               'Retrograde planets exert an internalized, karmic intensity in life decisions related to their governed houses.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. नक्षत्र पाद (Pada)' : lang === 'hi' ? '३. नक्षत्र चरण (Pada)' : lang === 'gu' ? '૩. નક્ષત્ર પાદ' : '3. Nakshatra Pada'}</h5>
            <p>
              {lang === 'mr' ? 'प्रत्येक नक्षत्राचे ४ पाद (३°२०′) असतात. पादवरून D9 नवांश कुंडलीतील ग्रहाचे अंतिम स्थान व सूक्ष्म स्वभाव ठरतो.' :
               lang === 'hi' ? 'प्रत्येक नक्षत्र के ४ चरण होते हैं। चरण से ही D9 नवांश में ग्रह की स्थिति और सूक्ष्म स्वभाव निश्चित होता है।' :
               lang === 'gu' ? 'દરેક નક્ષત્રના ૪ પાદ હોય છે, જેના આધારે D9 નવાંશ કુંડળીમાં ગ્રહનું સૂક્ષ્મ સ્થાન નક્કી થાય છે.' :
               'Each Nakshatra has 4 Padas (3°20\' each) determining D9 Navamsha soul placement.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '४. अष्टकवर्ग गुण (SAV)' : lang === 'hi' ? '४. अष्टकवर्ग रेखांक (SAV)' : lang === 'gu' ? '૪. અષ્ટકવર્ગ ગુણ' : '4. Ashtakvarga (SAV)'}</h5>
            <p>
              {lang === 'mr' ? '२८ गुण सरासरी मानले जातात. ३०+ गुण असणारे भाव अत्यंत बलवान व समृद्ध असतात; २५ पेक्षा कमी असणाऱ्या भावात विशेष काळजी हवी.' :
               lang === 'hi' ? '२८ अंक सामान्य माना जाता है। ३०+ अंक वाले भाव शक्तिशाली और फलदायी होते हैं; २५ से कम वाले भावों में सावधानी आवश्यक है।' :
               lang === 'gu' ? '૨૮ ગુણ સામાન્ય માનવામાં આવે છે. ૩૦+ ગુણવાળા ભાવો શક્તિશાળી હોય છે; ૨૫ થી ઓછા ગુણમાં કાળજી જરૂરી છે.' :
               '28 is the benchmark score. Houses with 30+ points prosper easily; houses below 25 points require conscious effort.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* 1. Planet positions table */}
      <div className="tab-section" data-pdf-section="planet-positions">
        <p className="tab-section__title">{t('report.planets.title')}</p>
        <PlanetTable planets={planets} />
      </div>

      {/* 2. Chart selector */}
      {charts && (
        <div className="tab-section" data-pdf-section="charts-grid">
          <div className="inner-tabs">
            {CHART_TABS.map((ct) => (
              <button
                key={ct.id}
                type="button"
                className={`inner-tab${activeChart === ct.id ? ' is-active' : ''}`}
                onClick={() => setActiveChart(ct.id)}
              >
                {ct.label}
              </button>
            ))}
          </div>

          <div className="chart-wrapper">
            {activeChart === 'd1' && charts.D1_lagna && (
              <ChartGrid houses={charts.D1_lagna} title={lang === 'mr' ? 'D1 लग्न कुंडली' : lang === 'hi' ? 'D1 लग्न कुंडली' : lang === 'gu' ? 'D1 લગ્ન કુંડળી' : 'D1 Rāśi (Lagna)'} ascendantSignIndex={report.ascendant?.sign_index} />
            )}
            {activeChart === 'd9' && charts.D9_navamsha && (
              <ChartGrid houses={charts.D9_navamsha} title={lang === 'mr' ? 'D9 नवांश कुंडली' : lang === 'hi' ? 'D9 नवांश कुंडली' : lang === 'gu' ? 'D9 નવાંશ કુંડળી' : 'D9 Navamsha'} ascendantSignIndex={report.d9_ascendant_sign_index ?? report.ascendant?.sign_index} />
            )}
            {activeChart === 'rashi' && charts.rashi_moon_chart && (
              <ChartGrid houses={charts.rashi_moon_chart} title={lang === 'mr' ? 'चंद्र राशी कुंडली' : lang === 'hi' ? 'चंद्र राशि कुंडली' : lang === 'gu' ? 'ચંદ્ર રાશિ કુંડળી' : 'Rashi (Moon)'} ascendantSignIndex={report.moon_sign_index ?? report._technical_profile?.moon_sign_index ?? report.planets?.Moon?.sign_index} />
            )}
            {activeChart === 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {charts.D1_lagna && (
                  <ChartGrid houses={charts.D1_lagna} title={lang === 'mr' ? 'D1 लग्न कुंडली' : lang === 'hi' ? 'D1 लग्न कुंडली' : lang === 'gu' ? 'D1 લગ્ન કુંડળી' : 'D1 Rāśi (Lagna)'} ascendantSignIndex={report.ascendant?.sign_index} />
                )}
                {charts.D9_navamsha && (
                  <ChartGrid houses={charts.D9_navamsha} title={lang === 'mr' ? 'D9 नवांश कुंडली' : lang === 'hi' ? 'D9 नवांश कुंडली' : lang === 'gu' ? 'D9 નવાંશ કુંડળી' : 'D9 Navamsha'} ascendantSignIndex={report.d9_ascendant_sign_index ?? report.ascendant?.sign_index} />
                )}
                {charts.rashi_moon_chart && (
                  <ChartGrid houses={charts.rashi_moon_chart} title={lang === 'mr' ? 'चंद्र राशी कुंडली' : lang === 'hi' ? 'चंद्र राशि कुंडली' : lang === 'gu' ? 'ચંદ્ર રાશિ કુંડળી' : 'Rashi (Moon)'} ascendantSignIndex={report.moon_sign_index ?? report._technical_profile?.moon_sign_index ?? report.planets?.Moon?.sign_index} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ashtakvarga */}
      <div className="tab-section" data-pdf-section="ashtakvarga">
        <AshtakvargaGrid sav={ashtakvarga_sav} personPayload={personPayload} />
      </div>
    </div>
  );
}
