import ChartGrid from '../ChartGrid';
import ManglikBadge from '../ManglikBadge';
import TransitTracker from '../TransitTracker';
import { CLASSIFICATION_INFO } from '../../utils/astrology';
import { useLang } from '../../context/LanguageContext';
import './tabs.css';

/**
 * OverviewTab — Summary panel shown on the first tab.
 * Contains: stat cards, classification (Varna/Gana/Nadi),
 * house strip, D1 chart, and Real-Time Gochara / Sade Sati Tracker.
 */
export default function OverviewTab({ report }) {
  const { t, lang } = useLang();
  const {
    ascendant, moon_sign, moon_nakshatra, moon_pada,
    classification, manglik_dosha, charts, ayanamsha_used,
    current_transits,
    _technical_profile,
  } = report;

  const ayanamshaVal = _technical_profile?.ayanamsha;
  const varnaInfo = CLASSIFICATION_INFO.varna[classification.varna];
  const ganaInfo  = CLASSIFICATION_INFO.gana[classification.gana];
  const nadiInfo  = CLASSIFICATION_INFO.nadi[classification.nadi];

  const housePills = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const houseData = charts?.D1_lagna?.find((h) => h.house === houseNum);
    const occupants = houseData?.occupants || [];
    return {
      house: houseNum,
      sign: houseData ? houseData.sign.split(' ')[0] : '—',
      occupants: occupants.map((p) => p.abbr).join(' '),
    };
  });

  return (
    <div className="tab-panel">
      {/* Stat Cards */}
      <dl className="kundali-report__stats-grid" data-pdf-section="stats">
        <div className="stat-card">
          <dt>{t('report.ascendant')}</dt>
          <dd className="stat-card__val">{ascendant.sign}</dd>
          <dd className="stat-card__sub mono">{ascendant.degree_str}</dd>
        </div>
        <div className="stat-card">
          <dt>{t('report.asc.nakshatra')}</dt>
          <dd className="stat-card__val">{ascendant.nakshatra}</dd>
          <dd className="stat-card__sub mono">{t('report.pada')} {ascendant.pada}</dd>
        </div>
        <div className="stat-card">
          <dt>{t('report.moon.sign')}</dt>
          <dd className="stat-card__val">{moon_sign}</dd>
          <dd className="stat-card__sub">{t('report.lord')}: <strong>{classification.moon_sign_lord}</strong></dd>
        </div>
        <div className="stat-card">
          <dt>{t('report.moon.nakshatra')}</dt>
          <dd className="stat-card__val">{moon_nakshatra}</dd>
          <dd className="stat-card__sub mono">{t('report.pada')} {moon_pada}</dd>
        </div>
        <div className="stat-card">
          <dt>{t('report.ayanamsha')}</dt>
          <dd className="stat-card__val">{ayanamsha_used || 'Lahiri'}</dd>
          <dd className="stat-card__sub mono">
            {ayanamshaVal ? `${ayanamshaVal.toFixed(4)}°` : 'Sidereal Nirayana'}
          </dd>
        </div>
        <div className="stat-card">
          <dt>{t('report.manglik')}</dt>
          <dd className="stat-card__val">
            {manglik_dosha.is_manglik
              ? (manglik_dosha.is_cancelled ? t('report.cancelled') : 'Yes')
              : t('report.clear')}
          </dd>
          <dd className="stat-card__sub">Mars in H{manglik_dosha.mars_house_lagna}</dd>
        </div>
      </dl>

      {/* Classification Row */}
      <div className="kundali-report__classifications" data-pdf-section="classifications">
        <div className="class-card">
          <span className="class-card__title">{t('report.varna')}</span>
          <h4 className="class-card__name">{classification.varna}</h4>
          {varnaInfo && (
            <p className="class-card__desc">
              {(lang === 'mr' ? varnaInfo.mr : varnaInfo.en).meaning}
              {' · '}
              <span className="mono">{(lang === 'mr' ? varnaInfo.mr : varnaInfo.en).element}</span>
            </p>
          )}
        </div>
        <div className="class-card">
          <span className="class-card__title">{t('report.gana')}</span>
          <h4 className="class-card__name">{classification.gana}</h4>
          {ganaInfo && (
            <p className="class-card__desc">
              {(lang === 'mr' ? ganaInfo.mr : ganaInfo.en).meaning}
              {' · '}
              <strong>{(lang === 'mr' ? ganaInfo.mr : ganaInfo.en).temperament}</strong>
            </p>
          )}
        </div>
        <div className="class-card">
          <span className="class-card__title">{t('report.nadi')}</span>
          <h4 className="class-card__name">{classification.nadi}</h4>
          {nadiInfo && (
            <p className="class-card__desc">
              {(lang === 'mr' ? nadiInfo.mr : nadiInfo.en).constitution}
              {' · '}
              {lang === 'mr' ? 'स्थिती:' : 'Position:'} {(lang === 'mr' ? nadiInfo.mr : nadiInfo.en).position}
            </p>
          )}
        </div>
      </div>

      {/* House Strip */}
      {charts?.D1_lagna && (
        <div className="kundali-report__house-strip" data-pdf-section="house-strip">
          <span className="house-strip__label">{t('report.house.strip')}</span>
          <div className="house-strip__items">
            {housePills.map((item) => (
              <div key={item.house} className="house-pill">
                <span className="house-pill__num">{lang === 'mr' ? 'भाव' : 'H'}{item.house}</span>
                <span className="house-pill__sign">{item.sign}</span>
                {item.occupants && <span className="house-pill__planets">{item.occupants}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D1 Chart */}
      {charts?.D1_lagna && (
        <div className="tab-section" data-pdf-section="d1-chart">
          <p className="tab-section__title">D1 Rāśi Chart (Lagna)</p>
          <ChartGrid houses={charts.D1_lagna} title="D1 Rāśi" ascendantSignIndex={ascendant.sign_index} />
        </div>
      )}

      {/* Real-Time Gochara / Sade Sati Tracker */}
      <TransitTracker data={current_transits} compact={false} />
    </div>
  );
}

