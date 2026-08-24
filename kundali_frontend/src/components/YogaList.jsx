import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
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

  if (!yogas || yogas.length === 0) {
    return (
      <div className="yoga-list-empty">
        <p>No specific major classical Yogas triggered for this chart configuration.</p>
      </div>
    );
  }

  const benefic = yogas.filter((y) => y.is_present && y.type === 'benefic');
  const malefic = yogas.filter((y) => y.is_present && y.type === 'malefic');

  const showBenefic = (filterType === 'all' || filterType === 'benefic') && benefic.length > 0;
  const showMalefic = (filterType === 'all' || filterType === 'malefic') && malefic.length > 0;

  return (
    <div className="yoga-list">
      {/* ── Benefic Yogas ────────────────────────────────────────────── */}
      {showBenefic && (
        <div className="yoga-section">
          <div className="yoga-section__header">
            <span className="yoga-section__icon">✨</span>
            <h4 className="yoga-section__title">
              Active Benefic Yogas ({benefic.length})
            </h4>
          </div>
          <div className="yoga-grid">
            {benefic.map((yoga, idx) => (
              <div key={yoga.name + idx} className="yoga-card yoga-card--benefic">
                <div className="yoga-card__top">
                  <div className="yoga-card__title-row">
                    <span className="yoga-card__badge yoga-card__badge--benefic">
                      {yoga.category || 'Auspicious'}
                    </span>
                    <h5 className="yoga-card__name">{yoga.name}</h5>
                  </div>
                  <div className="yoga-card__planets">
                    {yoga.planets_involved?.map((p) => (
                      <span key={p} className="yoga-planet-chip">
                        {planetName(p, lang)}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="yoga-card__desc">{yoga.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Malefic Yogas / Doshas ───────────────────────────────────── */}
      {showMalefic && (
        <div className="yoga-section">
          <div className="yoga-section__header">
            <span className="yoga-section__icon">⚖️</span>
            <h4 className="yoga-section__title">
              Special Astrological Factors &amp; Doshas ({malefic.length})
            </h4>
          </div>
          <div className="yoga-grid">
            {malefic.map((yoga, idx) => (
              <div
                key={yoga.name + idx}
                className={`yoga-card yoga-card--malefic${yoga.is_cancelled ? ' yoga-card--cancelled' : ''}`}
              >
                <div className="yoga-card__top">
                  <div className="yoga-card__title-row">
                    <span className="yoga-card__badge yoga-card__badge--malefic">
                      {yoga.category || 'Karmic'}
                    </span>
                    <h5 className="yoga-card__name">
                      {yoga.name}
                      {yoga.is_cancelled && (
                        <span className="yoga-cancelled-tag">Cancelled (Bhanga)</span>
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
                <p className="yoga-card__desc">{yoga.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
