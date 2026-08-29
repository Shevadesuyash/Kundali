import React from 'react';
import { useLang } from '../context/LanguageContext';
import { planetName, signName } from '../utils/i18n';
import './TransitTracker.css';

/**
 * TransitTracker — Displays real-time planetary Gochara (transits),
 * Sade Sati phase detection, Dhaiya alerts, and Jupiter transit status.
 */
export default function TransitTracker({ data, compact = false }) {
  const { lang } = useLang();
  if (!data) return null;

  const {
    transits = [],
    sade_sati = {},
    dhaiya = {},
    jupiter_gochara = {},
    as_of_ist = '',
  } = data;

  const localizePhase = (label) => {
    if (!label) return '';
    if (label.includes('Setting')) return lang === 'mr' ? 'उतरती साडेसाती' : lang === 'hi' ? 'उतरती साढ़ेसाती' : lang === 'gu' ? 'ઉતરતી સાડાસાતી' : label;
    if (label.includes('Rising')) return lang === 'mr' ? 'चढती साडेसाती' : lang === 'hi' ? 'चढ़ती साढ़ेसाती' : lang === 'gu' ? 'ચઢતી સાડાસાતી' : label;
    if (label.includes('Peak')) return lang === 'mr' ? 'मध्य साडेसाती' : lang === 'hi' ? 'मध्य साढ़ेसाती' : lang === 'gu' ? 'મધ્ય સાડાસાતી' : label;
    return label;
  };

  const localizeDesc = (desc) => {
    if (!desc || lang === 'en') return desc;
    if (desc.includes('Saturn is in the 2nd from your Moon')) {
      return lang === 'mr' ? 'शनी आपल्या चंद्रापासून दुसऱ्या भावात आहे — साडेसाती संपण्याच्या मार्गावर आहे. आर्थिक निर्णय आणि संवादात काळजी घ्या. मुख्य मानसिक दबाव आता निवळत आहे.' :
             lang === 'hi' ? 'शनि आपके चंद्र से द्वितीय भाव में है — साढ़ेसाती अंतिम चरण में है। आर्थिक एवं पारिवारिक मामलों में सतर्कता रखें। मुख्य मानसिक दबाव कम हो रहा है।' :
             lang === 'gu' ? 'શનિ તમારા ચંદ્રથી બીજા ભાવમાં છે — સાડાસાતી સમાપ્તિ તરફ છે. આર્થિક અને પારિવારિક બાબતોમાં કાળજી રાખો.' : desc;
    }
    if (desc.includes('Saturn is in the 12th from your Moon')) {
      return lang === 'mr' ? 'शनी आपल्या चंद्रापासून १२ व्या भावात आहे — साडेसातीचा प्रथम टप्पा. नियोजनबद्ध खर्च व मानसिक एकाग्रता ठेवा.' :
             lang === 'hi' ? 'शनि आपके चंद्र से १२वें भाव में है — साढ़ेसाती का प्रथम चरण। विवेकपूर्ण व्यय एवं धैर्य बनाए रखें।' :
             lang === 'gu' ? 'શનિ તમારા ચંદ્રથી ૧૨મા ભાવમાં છે — સાડાસાતીનો પ્રથમ તબક્કો.' : desc;
    }
    if (desc.includes('Saturn is over your Moon')) {
      return lang === 'mr' ? 'शनी जन्म चंद्रावरून भ्रमण करत आहे — साडेसातीचा मध्य टप्पा (कठीण काळ). संयम, नियमित ध्यान व शनी आराधना करावी.' :
             lang === 'hi' ? 'शनि जन्म चंद्र पर गोचर कर रहा है — साढ़ेसाती का मध्य शिखर चरण। संयम, ध्यान एवं शनि शांति पाठ करें।' :
             lang === 'gu' ? 'શનિ જન્મ ચંદ્ર પર ગોચર કરી રહ્યો છે — સાડાસાતીનો મધ્ય તબક્કો. સંયમ અને શાંતિ જરૂરી છે.' : desc;
    }
    if (desc.includes('Jupiter in 6th from Moon') || desc.includes('Jupiter in House 6')) {
      return lang === 'mr' ? 'गुरू चंद्रापासून ६ व्या भावात — स्पर्धा व कष्टांमधून प्रगती, आरोग्याची काळजी घेणे योग्य.' :
             lang === 'hi' ? 'गुरु चंद्र से छठे भाव में — परिश्रम व प्रतिस्पर्धा से लाभ, स्वास्थ्य का ध्यान रखें।' :
             lang === 'gu' ? 'ગુરુ ચંદ્રથી ૬ઠ્ઠા ભાવમાં — પરિશ્રમથી સફળતા, સ્વાસ્થ્ય સંભાળવું.' : desc;
    }
    if (desc.includes('favorable') || desc.includes('auspicious')) {
      return lang === 'mr' ? 'गुरू गोचर अत्यंत शुभ व अनुकूल — कार्यसिद्धी, ज्ञान वृद्धी आणि भाग्योदय.' :
             lang === 'hi' ? 'गुरु गोचर अत्यंत शुभ एवं अनुकूल — कार्यसिद्धि, ज्ञान वृद्धि और भाग्योदय।' :
             lang === 'gu' ? 'ગુરુ ગોચર અત્યંત શુભ અને અનુકૂળ — કાર્યસિદ્ધિ અને ભાગ્યોદય.' : desc;
    }
    return desc;
  };

  // -------------------------------------------------------------------------
  // Compact Mode (for ProfileCard or header pills)
  // -------------------------------------------------------------------------
  if (compact) {
    if (sade_sati.active) {
      return (
        <span
          className="sade-sati-pill sade-sati-pill--active"
          title={`${localizePhase(sade_sati.phase_label)}: Saturn in ${sade_sati.saturn_sign}`}
        >
          🔴 {lang === 'mr' ? 'साडेसाती' : lang === 'hi' ? 'साढ़ेसाती' : lang === 'gu' ? 'સાડાસાતી' : 'Sade Sati'} · {localizePhase(sade_sati.phase_label)}
        </span>
      );
    }
    if (dhaiya.active) {
      return (
        <span
          className="sade-sati-pill sade-sati-pill--active"
          title={`Small Panoti: Saturn in House ${dhaiya.house} from Moon`}
        >
          🟠 {lang === 'mr' ? 'शनि अडीचकी (ढिय्या)' : lang === 'hi' ? 'शनि ढैय्या' : lang === 'gu' ? 'શનિ ઢૈય્યા' : 'Dhaiya'} (H{dhaiya.house})
        </span>
      );
    }
    return (
      <span className="sade-sati-pill sade-sati-pill--inactive" title="No active Sade Sati or Dhaiya">
        ✅ {lang === 'mr' ? 'गोचर अनुकूल' : lang === 'hi' ? 'गोचर अनुकूल' : lang === 'gu' ? 'ગોચર અનુકૂળ' : 'Transits Clear'}
      </span>
    );
  }

  // -------------------------------------------------------------------------
  // Full Detailed Mode (for OverviewTab)
  // -------------------------------------------------------------------------
  const sectionTitle =
    lang === 'mr' ? 'प्रत्यक्ष ग्रह गोचर आणि साडेसाती ट्रॅकर' :
    lang === 'hi' ? 'प्रत्यक्ष ग्रह गोचर एवं साढ़ेसाती ट्रैकर' :
    lang === 'gu' ? 'પ્રત્યક્ષ ગ્રહ ગોચર અને સાડાસાતી ટ્રેકર' :
    'Real-Time Gochara & Sade Sati Tracker';

  const asOfText =
    lang === 'mr' ? `🕒 सद्यस्थिती: ${as_of_ist}` :
    lang === 'hi' ? `🕒 स्थिति: ${as_of_ist}` :
    lang === 'gu' ? `🕒 સ્થિતિ: ${as_of_ist}` :
    `🕒 As of ${as_of_ist}`;

  return (
    <section className="transit-tracker" data-pdf-section="transits">
      <div className="transit-tracker__header">
        <h3 className="transit-tracker__title">
          <span>🪐</span> {sectionTitle}
        </h3>
        {as_of_ist && (
          <span className="transit-tracker__timestamp mono">
            {asOfText}
          </span>
        )}
      </div>

      {/* Primary Status Banners */}
      <div className="transit-banners-grid">
        {/* Saturn / Sade Sati Banner */}
        <div
          className={`transit-banner ${
            sade_sati.active
              ? 'transit-banner--sade-sati-active'
              : 'transit-banner--sade-sati-inactive'
          }`}
        >
          <span className="transit-banner__badge">
            {sade_sati.active
              ? (lang === 'mr' ? '🔴 साडेसाती सुरू' : lang === 'hi' ? '🔴 साढ़ेसाती सक्रिय' : lang === 'gu' ? '🔴 સાડાસાતી સક્રિય' : '🔴 SADE SATI ACTIVE')
              : (lang === 'mr' ? '✅ साडेसाती नाही' : lang === 'hi' ? '✅ साढ़ेसाती मुक्त' : lang === 'gu' ? '✅ સાડાસાતી નથી' : '✅ NO SADE SATI')}
          </span>
          <h4 className="transit-banner__heading">
            {sade_sati.active
              ? `${localizePhase(sade_sati.phase_label)} (${lang === 'mr' ? 'टप्पा' : lang === 'hi' ? 'चरण' : lang === 'gu' ? 'તબક્કો' : 'Phase'} ${sade_sati.phase}/3)`
              : (lang === 'mr' ? 'शनी गोचर अनुकूल' : lang === 'hi' ? 'शनि गोचर अनुकूल' : lang === 'gu' ? 'શનિ ગોચર અનુકૂળ' : 'Saturn Transit Clear')}
          </h4>
          <p className="transit-banner__desc">
            {localizeDesc(sade_sati.description)}
            {dhaiya.active && ` | ${localizeDesc(dhaiya.description)}`}
          </p>
        </div>

        {/* Jupiter Gochara Banner */}
        <div
          className={`transit-banner ${
            jupiter_gochara.favorable
              ? 'transit-banner--jupiter-favorable'
              : 'transit-banner--jupiter-neutral'
          }`}
        >
          <span className="transit-banner__badge">
            {jupiter_gochara.favorable
              ? (lang === 'mr' ? '✦ शुभ गुरू गोचर' : lang === 'hi' ? '✦ शुभ गुरु गोचर' : lang === 'gu' ? '✦ શુભ ગુરુ ગોચર' : '✦ AUSPICIOUS GURU TRANSIT')
              : (lang === 'mr' ? 'गुरू गोचर' : lang === 'hi' ? 'गुरु गोचर' : lang === 'gu' ? 'ગુરુ ગોચર' : 'GURU GOCHARA')}
          </span>
          <h4 className="transit-banner__heading">
            {lang === 'mr' ? `गुरू चंद्रापासून ${jupiter_gochara.house_from_moon} व्या भावात` :
             lang === 'hi' ? `गुरु चंद्र से ${jupiter_gochara.house_from_moon}वें भाव में` :
             lang === 'gu' ? `ગુરુ ચંદ્રથી ${jupiter_gochara.house_from_moon}મા ભાવમાં` :
             `Jupiter in House ${jupiter_gochara.house_from_moon} from Moon`}
          </h4>
          <p className="transit-banner__desc">
            {localizeDesc(jupiter_gochara.description)}
          </p>
        </div>
      </div>

      {/* 9 Graha Live Transits Table */}
      <div className="transit-table-wrapper">
        <table className="transit-table">
          <thead>
            <tr>
              <th>{lang === 'mr' ? 'ग्रह' : lang === 'hi' ? 'ग्रह' : lang === 'gu' ? 'ગ્રહ' : 'Planet'}</th>
              <th>{lang === 'mr' ? 'वर्तमान राशी' : lang === 'hi' ? 'वर्तमान राशि' : lang === 'gu' ? 'વર્તમાન રાશિ' : 'Current Sign'}</th>
              <th>{lang === 'mr' ? 'अंश' : lang === 'hi' ? 'अंश' : lang === 'gu' ? 'અંશ' : 'Longitude'}</th>
              <th>{lang === 'mr' ? 'चंद्रापासून' : lang === 'hi' ? 'चंद्र से' : lang === 'gu' ? 'ચંદ્રથી' : 'From Moon'}</th>
              <th>{lang === 'mr' ? 'लग्नापासून' : lang === 'hi' ? 'लग्न से' : lang === 'gu' ? 'લગ્નથી' : 'From Lagna'}</th>
              <th>{lang === 'mr' ? 'गती' : lang === 'hi' ? 'गति' : lang === 'gu' ? 'ગતિ' : 'Motion'}</th>
            </tr>
          </thead>
          <tbody>
            {transits.map((item) => {
              const isSaturn = item.planet === 'Saturn';
              const isJupiter = item.planet === 'Jupiter';
              const rowClass = isSaturn
                ? 'transit-table tr--highlight-saturn'
                : isJupiter
                ? 'transit-table tr--highlight-jupiter'
                : '';

              return (
                <tr key={item.planet} className={rowClass}>
                  <td>
                    <strong>{planetName(item.planet, lang)}</strong>
                  </td>
                  <td>{item.sign}</td>
                  <td className="mono">{item.degree_in_sign}°</td>
                  <td>
                    {lang === 'mr' ? `भाव ${item.house_from_moon}` : lang === 'hi' ? `भाव ${item.house_from_moon}` : lang === 'gu' ? `${item.house_from_moon}મો ભાવ` : `House ${item.house_from_moon}`}
                    {isSaturn && sade_sati.active && ' ⚠️'}
                    {isJupiter && jupiter_gochara.favorable && ' ✦'}
                  </td>
                  <td>
                    {lang === 'mr' ? `भाव ${item.house_from_lagna}` : lang === 'hi' ? `भाव ${item.house_from_lagna}` : lang === 'gu' ? `${item.house_from_lagna}મો ભાવ` : `House ${item.house_from_lagna}`}
                  </td>
                  <td>
                    {item.retrograde ? (
                      <span className="retrograde-badge" title="Retrograde (Vakri)">
                        {lang === 'mr' || lang === 'hi' ? '℞ वक्री' : lang === 'gu' ? '℞ વક્રી' : '℞ Vakri'}
                      </span>
                    ) : (
                      lang === 'mr' || lang === 'hi' ? 'मार्गी' : lang === 'gu' ? 'માર્ગી' : 'Direct'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
