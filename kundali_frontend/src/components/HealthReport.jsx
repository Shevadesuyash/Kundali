import { analyzeHealth, FEVER_LEVEL_COLORS } from '../utils/healthAnalysis';
import { useLang } from '../context/LanguageContext';
import './HealthReport.css';

const FEVER_ICONS = { high: '🔴', moderate: '🟠', mild: '🔵', low: '🟢' };
const FEVER_LABELS = {
  high:     { en: 'High Risk', mr: 'उच्च धोका' },
  moderate: { en: 'Moderate', mr: 'मध्यम' },
  mild:     { en: 'Mild Tendency', mr: 'सौम्य प्रवृत्ती' },
  low:      { en: 'Low Risk', mr: 'कमी धोका' },
};

export default function HealthReport({ report }) {
  const { lang, t } = useLang();
  const health = analyzeHealth(report || {});
  const { signHealth = {}, feverRisk = {}, mentalFactors = [], diseaseIndicators = [], marsHouse = 1, sixthOccupants = [], eighthOccupants = [] } = health || {};
  const feverColors = (feverRisk?.level && FEVER_LEVEL_COLORS[feverRisk.level]) || FEVER_LEVEL_COLORS.low || { bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.2)', text: '#1d4ed8' };

  const feverLabel = feverRisk?.level && FEVER_LABELS[feverRisk.level] ? (lang === 'mr' ? FEVER_LABELS[feverRisk.level].mr : FEVER_LABELS[feverRisk.level].en) : 'Low Risk';

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
            {signHealth?.prakriti ? (lang === 'mr' ? signHealth.prakriti.mr : signHealth.prakriti.en) : 'Balanced'}
          </div>
          <p className="health-card__desc">
            {signHealth?.constitution ? (lang === 'mr' ? signHealth.constitution.mr : signHealth.constitution.en) : ''}
          </p>
        </div>

        <div className="health-card health-card--bodyparts">
          <div className="health-card__icon">🫀</div>
          <h4 className="health-card__title">{t('health.body.part')}</h4>
          <p className="health-card__body-parts">
            {signHealth?.bodyParts ? (lang === 'mr' ? signHealth.bodyParts.mr : signHealth.bodyParts.en) : ''}
          </p>
          {signHealth?.diseases && (
            <div className="health-card__diseases-list">
              <p className="health-card__dis-label">{t('health.tendencies')}:</p>
              {signHealth.diseases.map((d, i) => (
                <div key={i} className="health-disease-item">
                  <span className="health-disease-dot" />
                  <span>{lang === 'mr' ? d.mr : d.en}</span>
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
            <span className="health-mars-badge">♂ Mars in H{marsHouse}</span>
          </div>
        </div>
        <p className="health-fever-text">
          {feverRisk ? (lang === 'mr' ? feverRisk.mr : feverRisk.en) : ''}
        </p>
        {signHealth?.fever && (
          <div className="health-fever-sign-note">
            <strong>{lang === 'mr' ? signHealth.fever.mr : signHealth.fever.en}</strong>
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
                {t('health.tendencies')} (6th House: {health.sixthHouseSign})
              </h4>
              <div className="health-card__planet-tags">
                {sixthOccupants.map((p) => (
                  <span key={p.planet} className="health-planet-tag">{p.planet} {p.retrograde ? '(R)' : ''}</span>
                ))}
              </div>
              {diseaseIndicators
                .filter((d) => d.house === 6)
                .flatMap((d) => d.conditions)
                .map((c, i) => (
                  <div key={i} className="health-disease-item">
                    <span className="health-disease-dot health-disease-dot--warn" />
                    <span>{lang === 'mr' ? c.mr : c.en}</span>
                  </div>
                ))}
            </div>
          )}

          {eighthOccupants.length > 0 && (
            <div className="health-card health-card--house8">
              <div className="health-card__icon">🔮</div>
              <h4 className="health-card__title">
                {t('health.chronic')} (8th: {health.eighthHouseSign})
              </h4>
              <div className="health-card__planet-tags">
                {eighthOccupants.map((p) => (
                  <span key={p.planet} className="health-planet-tag health-planet-tag--chronic">{p.planet} {p.retrograde ? '(R)' : ''}</span>
                ))}
              </div>
              {diseaseIndicators
                .filter((d) => d.house === 8)
                .flatMap((d) => d.conditions)
                .map((c, i) => (
                  <div key={i} className="health-disease-item">
                    <span className="health-disease-dot health-disease-dot--chronic" />
                    <span>{lang === 'mr' ? c.mr : c.en}</span>
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
            {lang === 'mr' ? m.mr : m.en}
          </p>
        ))}
      </div>

      {/* 5. Remedy */}
      <div className="health-card health-card--remedy">
        <div className="health-card__icon">💊</div>
        <h4 className="health-card__title">{t('health.remedy')}</h4>
        <p className="health-remedy-text">
          {lang === 'mr' ? signHealth.remedy.mr : signHealth.remedy.en}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="health-disclaimer">{t('health.disclaimer')}</p>
    </div>
  );
}
