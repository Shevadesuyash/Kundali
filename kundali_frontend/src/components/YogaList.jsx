import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import { getYogaName, getYogaCategory, getYogaDesc, getDoshaName, getDoshaDesc } from '../utils/astroTranslations';
import './YogaList.css';

/**
 * YogaList — Displays detected Vedic Yogas and Doshas.
 *
 * Props:
 *   yogas: List of yoga dicts from backend { name, type, category, planets_involved, description, is_present }
 *   filterType: 'all' | 'benefic' | 'malefic'
 */
export default function YogaList({ yogas = [], filterType = 'all' }) {
  const { lang } = useLang();

  const emptyText =
    lang === 'mr' ? 'या कुंडलीसाठी कोणतेही प्रतिकूल किंवा तीव्र योग आढळले नाहीत.' :
    lang === 'hi' ? 'इस कुंडली के लिए कोई प्रतिकूल या तीव्र योग सक्रिय नहीं हैं।' :
    lang === 'gu' ? 'આ કુંડળી માટે કોઈ પ્રતિકૂળ કે તીવ્ર યોગ સક્રિય નથી.' :
    'No specific major classical Yogas triggered for this chart configuration.';

  if (!yogas || yogas.length === 0) {
    return (
      <div className="yoga-list-empty">
        <p>{emptyText}</p>
      </div>
    );
  }

  const benefic = yogas.filter((y) => y.is_present && y.type === 'benefic');
  const malefic = yogas.filter((y) => y.is_present && y.type === 'malefic');

  const showBenefic = (filterType === 'all' || filterType === 'benefic') && benefic.length > 0;
  const showMalefic = (filterType === 'all' || filterType === 'malefic') && malefic.length > 0;

  const beneficHeader =
    lang === 'mr' ? `सक्रिय शुभ राजयोग व धनयोग (${benefic.length})` :
    lang === 'hi' ? `सक्रिय शुभ राजयोग एवं धन योग (${benefic.length})` :
    lang === 'gu' ? `સક્રિય શુભ રાજયોગ અને ધનયોગ (${benefic.length})` :
    `Active Benefic Yogas (${benefic.length})`;

  const maleficHeader =
    lang === 'mr' ? `विशेष ज्योतिषीय घटक व कालसर्प/दोष (${malefic.length})` :
    lang === 'hi' ? `विशेष ज्योतिषीय घटक एवं कालसर्प/दोष (${malefic.length})` :
    lang === 'gu' ? `વિશેષ જ્યોતિષીય પરિબળો અને દોષ (${malefic.length})` :
    `Special Astrological Factors & Doshas (${malefic.length})`;

  const cancelledTag =
    lang === 'mr' ? 'दोष भंग (रद्द)' :
    lang === 'hi' ? 'दोष भंग (रद्द)' :
    lang === 'gu' ? 'દોષ ભંગ (રદ)' :
    'Cancelled (Bhanga)';

  return (
    <div className="yoga-list">
      {/* ── Benefic Yogas ────────────────────────────────────────────── */}
      {showBenefic && (
        <div className="yoga-section">
          <div className="yoga-section__header">
            <span className="yoga-section__icon">✨</span>
            <h4 className="yoga-section__title">{beneficHeader}</h4>
          </div>
          <div className="yoga-grid">
            {benefic.map((yoga, idx) => {
              const localizedName = getYogaName(yoga.name, lang);
              const localizedCategory = getYogaCategory(yoga.name, yoga.category || 'Auspicious', lang);
              const localizedDesc = getYogaDesc(yoga.name, yoga.description, lang);

              return (
                <div key={yoga.name + idx} className="yoga-card yoga-card--benefic">
                  <div className="yoga-card__top">
                    <div className="yoga-card__title-row">
                      <span className="yoga-card__badge yoga-card__badge--benefic">
                        {localizedCategory}
                      </span>
                      <h5 className="yoga-card__name">{localizedName}</h5>
                    </div>
                    <div className="yoga-card__planets">
                      {yoga.planets_involved?.map((p) => (
                        <span key={p} className="yoga-planet-chip">
                          {planetName(p, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="yoga-card__desc">{localizedDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Malefic Yogas / Doshas ───────────────────────────────────── */}
      {showMalefic && (
        <div className="yoga-section">
          <div className="yoga-section__header">
            <span className="yoga-section__icon">⚖️</span>
            <h4 className="yoga-section__title">{maleficHeader}</h4>
          </div>
          <div className="yoga-grid">
            {malefic.map((yoga, idx) => {
              const localizedName = getDoshaName(yoga.name, lang);
              const localizedCategory = getYogaCategory(yoga.name, yoga.category || 'Karmic', lang);
              const localizedDesc = getDoshaDesc(yoga.name, yoga.description, lang);

              return (
                <div
                  key={yoga.name + idx}
                  className={`yoga-card yoga-card--malefic${yoga.is_cancelled ? ' yoga-card--cancelled' : ''}`}
                >
                  <div className="yoga-card__top">
                    <div className="yoga-card__title-row">
                      <span className="yoga-card__badge yoga-card__badge--malefic">
                        {localizedCategory}
                      </span>
                      <h5 className="yoga-card__name">
                        {localizedName}
                        {yoga.is_cancelled && (
                          <span className="yoga-cancelled-tag">{cancelledTag}</span>
                        )}
                      </h5>
                    </div>
                    <div className="yoga-card__planets">
                      {yoga.planets_involved?.map((p) => (
                        <span key={p} className="yoga-planet-chip yoga-planet-chip--malefic">
                          {planetName(p, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="yoga-card__desc">{localizedDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
