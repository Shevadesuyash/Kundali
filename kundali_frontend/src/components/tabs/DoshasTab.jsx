import ManglikBadge from '../ManglikBadge';
import YogaList from '../YogaList';
import GemstonePanel from '../GemstonePanel';
import HelpAccordion from '../HelpAccordion';
import { useLang } from '../../context/LanguageContext';
import './tabs.css';

/**
 * DoshasTab — Comprehensive Doshas analysis including Mangal Dosha (Papa Samyam),
 * Kaal Sarp, Guru Chandal, Pitra Dosha, Kemadruma, and Gemstone / Rudraksha Remedies.
 */
export default function DoshasTab({ report }) {
  const { manglik_dosha, yogas, gemstone_recommendations } = report;
  const { lang, t } = useLang();

  const guideTitle = lang === 'mr' ? 'मंगळ दोष, पाप साम्य आणि रत्न उपाय कसे समजून घ्यावे?' :
                     lang === 'hi' ? 'मांगलिक दोष, पाप साम्य और रत्न उपाय को कैसे समझें?' :
                     lang === 'gu' ? 'માંગલિક દોષ, પાપ સામ્ય અને રત્ન ઉપાય કેવી રીતે સમજવું?' :
                     'How to Read Manglik Dosha, Papa Samyam & Remedies';

  return (
    <div className="tab-panel">
      {/* Beginner & Astrologer Guide */}
      <HelpAccordion id="doshas-help" title={guideTitle} defaultOpen={false}>
        <div className="help-grid-cards">
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '१. मंगळ दोष (Manglik)' : lang === 'hi' ? '१. मांगलिक दोष' : lang === 'gu' ? '૧. માંગલિક દોષ' : '1. Mangal Dosha'}</h5>
            <p>
              {lang === 'mr' ? 'लग्न, चंद्र किंवा शुक्रापासून १, ४, ७, ८, १२ या भावात मंगळ असल्यास मंगळ दोष मानला जातो. (पाराशरी नियमानुसार २ ऱ्या भावात मंगळ दोष मानला जात नाही).' :
               lang === 'hi' ? 'लग्न, चंद्र या शुक्र से १, ४, ७, ८, १२ भावों में मंगल होने पर मांगलिक दोष माना जाता है। (पाराशरी पद्धति में द्वितीय भाव में मंगल दोष नहीं होता)।' :
               lang === 'gu' ? 'લગ્ન, ચંદ્ર કે શુક્રથી ૧, ૪, ૭, ૮, ૧૨ ભાવમાં મંગળ હોય તો માંગલિક દોષ ગણાય છે.' :
               'Calculated from Lagna, Moon, and Venus in houses 1, 4, 7, 8, 12. Mars in house 2 is NOT Manglik in standard Parashari Jyotish.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '२. पाप साम्य (Papa Samyam)' : lang === 'hi' ? '२. पाप साम्य' : lang === 'gu' ? '૨. પાપ સામ્ય' : '2. Papa Samyam'}</h5>
            <p>
              {lang === 'mr' ? 'पाप ग्रहांचे संतुलित भारमान. वधू आणि वर यांच्या पाप साम्य गुणांमध्ये २५ पेक्षा कमी फरक असल्यास वैवाहिक जीवन शांत व सुसंवादी राहते.' :
               lang === 'hi' ? 'पाप ग्रहों का भारित स्कोर। वर-वधू के पाप साम्य में २५ से कम का अंतर उत्तम सामंजस्य प्रदान करता है।' :
               lang === 'gu' ? 'પાપ ગ્રહોનું ભારિત મૂલ્ય. વર-કન્યા વચ્ચે ૨૫ થી ઓછો તફાવત ઉત્તમ સુમેળ દર્શાવે છે.' :
               'Weighted malefic score from Lagna, Moon, and Venus. A differential under 25 points between partners indicates karmic compatibility.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '३. कालसर्प आणि पितृ दोष' : lang === 'hi' ? '३. कालसर्प एवं पितृ दोष' : lang === 'gu' ? '૩. કાલસર્પ અને પિતૃ દોષ' : '3. Special Afflictions'}</h5>
            <p>
              {lang === 'mr' ? 'राहू आणि केतू यांच्या एकाच बाजूला सर्व ७ ग्रह आल्यास कालसर्प योग बनतो. यामुळे जीवनात सुरुवातीला संघर्ष पण नंतर मोठा उदय होतो.' :
               lang === 'hi' ? 'राहु और केतु के मध्य सभी ७ ग्रह आने पर कालसर्प बनता है, जो प्रारंभिक संघर्ष के बाद अद्भुत सफलता देता है।' :
               lang === 'gu' ? 'રાહુ-કેતુ વચ્ચે બધા ૭ ગ્રહ આવે ત્યારે કાલસર્પ બને છે, જે પરિશ્રમ પછી પ્રગતિ આપે છે.' :
               'Occurs when all 7 classical planets sit between Rahu and Ketu, creating formative struggle followed by breakthrough success.'}
            </p>
          </div>
          <div className="help-card-item">
            <h5>{lang === 'mr' ? '४. रत्न आणि रुद्राक्ष उपाय' : lang === 'hi' ? '४. रत्न एवं रुद्राक्ष उपाय' : lang === 'gu' ? '૪. રત્ન અને રુદ્રાક્ષ ઉપાય' : '4. Astrological Remedies'}</h5>
            <p>
              {lang === 'mr' ? 'केवळ योगकारक व लग्नेश ग्रहांचे रत्न धारण करावे. त्रिक भावांचे (६, ८, १२) रत्न कधीही घालू नये.' :
               lang === 'hi' ? 'केवल लग्नेश और शुभ योगकारक ग्रहों का ही रत्न धारण करें। त्रिक (६, ८, १२) भावों के रत्न कभी न पहनें।' :
               lang === 'gu' ? 'માત્ર શુભ યોગકારક ગ્રહોના રત્ન પહેરવા જોઈએ. ૬, ૮, ૧૨ ભાવોના રત્ન ન પહેરવા.' :
               'Only wear gemstones for functional benefics and Lagna lord; never wear gemstones for 6th, 8th, or 12th house lords.'}
            </p>
          </div>
        </div>
      </HelpAccordion>

      {/* ── 1. Mangal Dosha & Papa Samyam ────────────────────────────── */}
      <div className="tab-section" data-pdf-section="mangal-dosha">
        <p className="tab-section__title">Mangal (Kuja) Dosha &amp; Papa Samyam</p>
        <p className="tab-section__subtitle">
          Evaluated from Lagna, Moon, and Venus using standard Parashari houses (1, 4, 7, 8, 12).
        </p>
        <ManglikBadge manglik={manglik_dosha} />

        {/* Papa Samyam score breakdown */}
        <div className="dosha-papa-table">
          <p className="dosha-papa-table__title">Papa Samyam Score Breakdown</p>
          <p className="dosha-papa-table__note">
            Total = S_Lagna + (0.75 × S_Moon) + (0.50 × S_Venus)
          </p>
          <div className="dosha-papa-row">
            <span>From Lagna</span>
            <span>Mars H{manglik_dosha.mars_house_lagna} &nbsp;
              {manglik_dosha.manglik_from_lagna ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.lagna ?? 0}</span>
          </div>
          <div className="dosha-papa-row">
            <span>From Moon</span>
            <span>Mars H{manglik_dosha.mars_house_moon} &nbsp;
              {manglik_dosha.manglik_from_moon ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.moon ?? 0} × 0.75 = {((manglik_dosha.papa_breakdown?.moon ?? 0) * 0.75).toFixed(2)}</span>
          </div>
          <div className="dosha-papa-row">
            <span>From Venus</span>
            <span>Mars H{manglik_dosha.mars_house_venus} &nbsp;
              {manglik_dosha.manglik_from_venus ? '⚠ Manglik' : '— Not Manglik'}
            </span>
            <span className="mono">{manglik_dosha.papa_breakdown?.venus ?? 0} × 0.50 = {((manglik_dosha.papa_breakdown?.venus ?? 0) * 0.50).toFixed(2)}</span>
          </div>
          <div className="dosha-papa-row dosha-papa-row--total">
            <span>Total Papa Samyam</span>
            <span></span>
            <span className="mono">{manglik_dosha.papa_points}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Other Classical Doshas & Karmic Influences ──────────────── */}
      <div className="tab-section" data-pdf-section="special-doshas">
        <p className="tab-section__title">Special Doshas &amp; Planetary Afflictions</p>
        <p className="tab-section__subtitle">
          Kaal Sarp variants, Guru Chandal, Pitra Dosha, Kemadruma, and Classical Afflictions.
        </p>
        {yogas && <YogaList yogas={yogas} filterType="malefic" />}
      </div>

      {/* ── 3. Gemstone & Rudraksha Remedies ─────────────────────────── */}
      <div className="tab-section" data-pdf-section="gemstone-remedies">
        <p className="tab-section__title">Vedic Astrological Remedies</p>
        <p className="tab-section__subtitle">
          Gemstones, Rudraksha, Mantras, and Charitable remedies tailored to your functional benefics.
        </p>
        {gemstone_recommendations && (
          <GemstonePanel recommendations={gemstone_recommendations} />
        )}
      </div>
    </div>
  );
}
