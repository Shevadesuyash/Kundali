import DashaTree from '../DashaTree';
import YogaList from '../YogaList';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import './tabs.css';

/**
 * DashaTab — Vimshottari Mahadasha / Antardasha tree and active Yogas.
 * Includes beginner & astrologer guide explaining life timing.
 */
export default function DashaTab({ report }) {
  const { dasha_periods, yogas } = report;
  const { lang } = useLang();

  const guideTitle = lang === 'mr' ? 'विंशोत्तरी दशा व वैदिक योग कसे समजून घ्यावे?' :
                     lang === 'hi' ? 'विंशोत्तरी दशा और वैदिक योग को कैसे समझें?' :
                     lang === 'gu' ? 'વિંશોત્તરી દશા અને વૈદિક યોગ કેવી રીતે સમજવું?' :
                     'How to Read Vimshottari Dasha & Classical Vedic Yogas';

  return (
    <div className="tab-panel">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="dasha-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. विंशोत्तरी महादशा' : lang === 'hi' ? '१. विंशोत्तरी महादशा' : lang === 'gu' ? '૧. વિંશોત્તરી મહાદશા' : '1. Vimshottari Mahadasha'}</h5>
            <p>
              {lang === 'mr' ? '१२० वर्षांचे मानवी जीवनचक्र. जन्म नक्षत्राच्या स्वामीवरून पहिली दशा सुरू होते आणि जीवनाची मुख्य दिशा ठरवते.' :
               lang === 'hi' ? '१२० वर्ष का जीवन चक्र। जन्म नक्षत्र के स्वामी से प्रथम दशा प्रारंभ होकर जीवन की मुख्य दिशा निर्धारित करती है।' :
               lang === 'gu' ? '૧૨૦ વર્ષનું જીવન ચક્ર. જન્મ નક્ષત્રના સ્વામીથી શરૂ થઈ જીવનની મુખ્ય દિશા નક્કી કરે છે.' :
               '120-year Vedic cycle starting from birth Moon Nakshatra ruler, defining life chapters.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. अंतर्दशा (Sub-Period)' : lang === 'hi' ? '२. अंतर्दशा (Sub-Period)' : lang === 'gu' ? '૨. અંતર્દશા' : '2. Antardasha (Sub-Period)'}</h5>
            <p>
              {lang === 'mr' ? 'महादशेच्या अंतर्गत येणारे उप-काळ. महादशा स्वामी आणि अंतर्दशा स्वामी यांच्या परस्पर संबंधांवरून (उदा. ६-८ किंवा ५-९) फळ मिळते.' :
               lang === 'hi' ? 'महादशा के अधीन सूक्ष्म कालखंड। दोनों ग्रहों के आपसी संबंध (जैसे ५-९ शुभ, ६-८ संघर्ष) से तात्कालिक फल मिलता है।' :
               lang === 'gu' ? 'મહાદશા અંતર્ગતના ઉપ-સમયગાળા. બંને ગ્રહોના પારસ્પરિક સંબંધો મુજબ ચોક્કસ પરિણામો મળે છે.' :
               'Sub-periods manifesting specific events based on the mutual axis of the Mahadasha and Antardasha lords.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. वैदिक राजयोग व धनयोग' : lang === 'hi' ? '३. वैदिक राजयोग एवं धनयोग' : lang === 'gu' ? '૩. રાજયોગ અને ધનયોગ' : '3. Classical Auspicious Yogas'}</h5>
            <p>
              {lang === 'mr' ? 'केंद्र (१, ४, ७, १०) आणि त्रिकोण (१, ५, ९) यांचे संबंध राजयोग घडवतात, ज्यांचे फळ संबंधित ग्रहाच्या दशेत पूर्णत्वाने मिळते.' :
               lang === 'hi' ? 'केंद्र (१, ४, ७, १०) और त्रिकोण (१, ५, ९) स्वामियों का युति-दृष्टि संबंध राजयोग बनाता है जो संबंधित दशा में फलित होता है।' :
               lang === 'gu' ? 'કેન્દ્ર અને ત્રિકોણ ભાવોના સંબંધથી રાજયોગ બને છે, જે સંબંધિત દશામાં સિદ્ધિ આપે છે.' :
               'Kendra and Trikona mutual alignments form powerful Raja & Dhana Yogas that activate during their Dashas.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* 1. Interactive Vimshottari Dasha Tree */}
      <div className="tab-section" data-pdf-section="dasha-tree">
        <p className="tab-section__title">Vimshottari Dasha &amp; Antardashas</p>
        <p className="tab-section__subtitle">
          Major planetary cycles (Mahadashas) and sub-periods (Antardashas). Click any cycle to expand.
        </p>
        <DashaTree periods={dasha_periods} />
      </div>

      {/* 2. Classical Vedic Yogas */}
      <div className="tab-section" data-pdf-section="vedic-yogas">
        <p className="tab-section__title">Vedic Yogas &amp; Planetary Combinations</p>
        <YogaList yogas={yogas} filterType="all" />
      </div>
    </div>
  );
}
