import { analyzeHealth, FEVER_LEVEL_COLORS } from '../utils/healthAnalysis';
import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import './HealthReport.css';

const FEVER_ICONS = { high: '🔴', moderate: '🟠', mild: '🔵', low: '🟢' };
const FEVER_LABELS = {
  high:     { en: 'High Risk', mr: 'उच्च धोका', hi: 'उच्च जोखिम', gu: 'ઉચ્ચ જોખમ' },
  moderate: { en: 'Moderate', mr: 'मध्यम', hi: 'मध्यम', gu: 'મધ્યમ' },
  mild:     { en: 'Mild Tendency', mr: 'सौम्य प्रवृत्ती', hi: 'सौम्य प्रवृत्ति', gu: 'સૌમ્ય પ્રવૃત્તિ' },
  low:      { en: 'Low Risk', mr: 'कमी धोका', hi: 'अल्प जोखिम', gu: 'ઓછું જોખમ' },
};

function getLocal(item, lang) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (item[lang]) return item[lang];
  if (lang === 'hi' || lang === 'gu') return item.hi || item.gu || item.mr || item.en || '';
  if (lang === 'mr') return item.mr || item.en || '';
  return item.en || item.mr || '';
}

export default function HealthReport({ report }) {
  const { lang, t } = useLang();
  const health = analyzeHealth(report || {});
  const { signHealth = {}, feverRisk = {}, mentalFactors = [], diseaseIndicators = [], marsHouse = 1, sixthOccupants = [], eighthOccupants = [] } = health || {};
  const feverColors = (feverRisk?.level && FEVER_LEVEL_COLORS[feverRisk.level]) || FEVER_LEVEL_COLORS.low || { bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.2)', text: '#1d4ed8' };

  const feverLabel = feverRisk?.level && FEVER_LABELS[feverRisk.level] ? getLocal(FEVER_LABELS[feverRisk.level], lang) : (lang === 'mr' ? 'कमी धोका' : lang === 'hi' ? 'अल्प जोखिम' : lang === 'gu' ? 'ઓછું જોખમ' : 'Low Risk');

  const marsBadgeText =
    lang === 'mr' ? `♂ मंगळ भाव ${marsHouse}` :
    lang === 'hi' ? `♂ मंगल भाव ${marsHouse}` :
    lang === 'gu' ? `♂ મંગળ ભાવ ${marsHouse}` :
    `♂ Mars in H${marsHouse}`;

  return (
    <div className="health-report">
      {/* Header */}
      <div className="health-report__header">
        <div>
          <p className="eyebrow">🌿 {t('health.title')}</p>
          <p className="health-report__subtitle">{t('health.subtitle')}</p>
        </div>
      </div>

      {/* 1. Body Constitution */}
      <div className="health-section-grid">
        <div className="health-card health-card--constitution">
          <div className="health-card__icon">🧬</div>
          <h4 className="health-card__title">{t('health.constitution')}</h4>
          <div className="health-card__prakriti">
            {signHealth?.prakriti ? getLocal(signHealth.prakriti, lang) : (lang === 'mr' ? 'संतुलित' : lang === 'hi' ? 'संतुलित' : lang === 'gu' ? 'સંતુલિત' : 'Balanced')}
          </div>
          <p className="health-card__desc">
            {signHealth?.constitution ? getLocal(signHealth.constitution, lang) : ''}
          </p>
        </div>

        <div className="health-card health-card--bodyparts">
          <div className="health-card__icon">🫀</div>
          <h4 className="health-card__title">{t('health.body.part')}</h4>
          <p className="health-card__body-parts">
            {signHealth?.bodyParts ? getLocal(signHealth.bodyParts, lang) : ''}
          </p>
          {signHealth?.diseases && (
            <div className="health-card__diseases-list">
              <p className="health-card__dis-label">{t('health.tendencies')}:</p>
              {signHealth.diseases.map((d, i) => (
                <div key={i} className="health-disease-item">
                  <span className="health-disease-dot" />
                  <span>{getLocal(d, lang)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Fever & Inflammation Risk */}
      <div className="health-card health-card--fever" style={{
        background: feverColors.bg,
        borderColor: feverColors.border,
      }}>
        <div className="health-fever-header">
          <span className="health-fever-icon">{FEVER_ICONS[feverRisk?.level] || '🟢'}</span>
          <div>
            <h4 className="health-card__title" style={{ color: feverColors.text }}>
              {t('health.fever')}
            </h4>
            <span className="health-fever-badge" style={{ background: feverColors.border }}>
              {feverLabel}
            </span>
          </div>
          <div className="health-mars-info">
            <span className="health-mars-badge">{marsBadgeText}</span>
          </div>
        </div>
        <p className="health-fever-text">
          {feverRisk ? getLocal(feverRisk, lang) : ''}
        </p>
        {signHealth?.fever && (
          <div className="health-fever-sign-note">
            <strong>{getLocal(signHealth.fever, lang)}</strong>
          </div>
        )}
      </div>

      {/* 3. 6th & 8th House Planets → Disease Indicators */}
      {(sixthOccupants.length > 0 || eighthOccupants.length > 0) && (
        <div className="health-house-section">
          {sixthOccupants.length > 0 && (
            <div className="health-card health-card--house6">
              <div className="health-card__icon">⚕️</div>
              <h4 className="health-card__title">
                {t('health.tendencies')} ({lang === 'mr' ? '६ वा भाव' : lang === 'hi' ? '६ठा भाव' : lang === 'gu' ? '૬ઠ્ઠો ભાવ' : '6th House'}: {health.sixthHouseSign})
              </h4>
              <div className="health-card__planet-tags">
                {sixthOccupants.map((p) => (
                  <span key={p.planet} className="health-planet-tag">
                    {planetName(p.planet, lang)} {p.retrograde ? (lang === 'mr' ? '(वक्री)' : '(R)') : ''}
                  </span>
                ))}
              </div>
              {diseaseIndicators
                .filter((d) => d.house === 6)
                .flatMap((d) => d.conditions)
                .map((c, i) => (
                  <div key={i} className="health-disease-item">
                    <span className="health-disease-dot health-disease-dot--warn" />
                    <span>{getLocal(c, lang)}</span>
                  </div>
                ))}
            </div>
          )}

          {eighthOccupants.length > 0 && (
            <div className="health-card health-card--house8">
              <div className="health-card__icon">🔮</div>
              <h4 className="health-card__title">
                {t('health.chronic')} ({lang === 'mr' ? '८ वा भाव' : lang === 'hi' ? '८वां भाव' : lang === 'gu' ? '૮મો ભાવ' : '8th House'}: {health.eighthHouseSign})
              </h4>
              <div className="health-card__planet-tags">
                {eighthOccupants.map((p) => (
                  <span key={p.planet} className="health-planet-tag health-planet-tag--chronic">
                    {planetName(p.planet, lang)} {p.retrograde ? (lang === 'mr' ? '(वक्री)' : '(R)') : ''}
                  </span>
                ))}
              </div>
              {diseaseIndicators
                .filter((d) => d.house === 8)
                .flatMap((d) => d.conditions)
                .map((c, i) => (
                  <div key={i} className="health-disease-item">
                    <span className="health-disease-dot health-disease-dot--chronic" />
                    <span>{getLocal(c, lang)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Mental & Emotional Health */}
      <div className="health-card health-card--mental">
        <div className="health-card__icon">🧠</div>
        <h4 className="health-card__title">{t('health.mental')}</h4>
        {mentalFactors.map((m, i) => (
          <p key={i} className="health-mental-text">
            {getLocal(m, lang)}
          </p>
        ))}
      </div>

      {/* 5. Remedy */}
      <div className="health-card health-card--remedy">
        <div className="health-card__icon">💊</div>
        <h4 className="health-card__title">{t('health.remedy')}</h4>
        <p className="health-remedy-text">
          {signHealth.remedy ? getLocal(signHealth.remedy, lang) : ''}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="health-disclaimer">{t('health.disclaimer')}</p>
    </div>
  );
}
