import { useState } from 'react';
import ChartGrid from './ChartGrid';
import PlanetTable from './PlanetTable';
import DashaTable from './DashaTable';
import ManglikBadge from './ManglikBadge';
import HealthReport from './HealthReport';
import { CLASSIFICATION_INFO } from '../utils/astrology';
import { useLang } from '../context/LanguageContext';
import './KundaliReport.css';

export default function KundaliReport({ report, compact = false }) {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState('d1'); // 'd1' | 'd9' | 'rashi' | 'all'
  const {
    profile,
    ascendant,
    moon_sign,
    moon_nakshatra,
    moon_pada,
    classification,
    planets,
    manglik_dosha,
    charts,
    ayanamsha_used,
    dasha_periods,
    _technical_profile,
  } = report;

  const varnaInfo = CLASSIFICATION_INFO.varna[classification.varna];
  const ganaInfo = CLASSIFICATION_INFO.gana[classification.gana];
  const nadiInfo = CLASSIFICATION_INFO.nadi[classification.nadi];

  const ayanamshaVal = _technical_profile?.ayanamsha;

  // Build house summary strip from D1 chart or planet house_from_lagna
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
    <div className="kundali-report">
      {/* 1. Header Profile & Extended Stats */}
      <div className="kundali-report__header">
        <div className="kundali-report__profile">
          <p className="eyebrow">{t('report.eyebrow')}</p>
          <h2 className="kundali-report__name">{profile.name}</h2>
          <div className="kundali-report__meta-group mono">
            <span>📅 {profile.local}</span>
            <span>🌐 Lat: {profile.lat}, Lon: {profile.lon}</span>
            {profile.utc && <span>⏱️ UTC: {new Date(profile.utc).toUTCString()}</span>}
          </div>
        </div>

        <dl className="kundali-report__stats-grid">
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
              {manglik_dosha.is_manglik ? (manglik_dosha.is_cancelled ? t('report.cancelled') : manglik_dosha.severity) : t('report.clear')}
            </dd>
            <dd className="stat-card__sub">{t('report.house')} {manglik_dosha.mars_house_lagna}</dd>
          </div>
        </dl>
      </div>

      {/* 2. Manglik Banner */}
      <ManglikBadge manglik={manglik_dosha} />

      {/* 3. Classification Detail Cards (Varna, Gana, Nadi) */}
      <div className="kundali-report__classifications">
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

      {/* 4. House Summary Strip */}
      {charts?.D1_lagna && (
        <div className="kundali-report__house-strip">
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

      {/* 5. Interactive Chart Selector & Display (D1, D9, Rashi) */}
      {charts && !compact && (
        <div className="kundali-report__charts-section">
          <div className="chart-tabs-bar">
            <span className="chart-tabs-title">{t('report.chart.select')}</span>
            <button
              type="button"
              className={`chart-tab${activeTab === 'd1' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('d1')}
            >
              {t('report.chart.d1')}
            </button>
            <button
              type="button"
              className={`chart-tab${activeTab === 'd9' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('d9')}
            >
              {t('report.chart.d9')}
            </button>
            {charts.rashi_moon_chart && (
              <button
                type="button"
                className={`chart-tab${activeTab === 'rashi' ? ' is-active' : ''}`}
                onClick={() => setActiveTab('rashi')}
              >
                {t('report.chart.rashi')}
              </button>
            )}
            <button
              type="button"
              className={`chart-tab${activeTab === 'all' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {t('report.chart.all')}
            </button>
          </div>

          <div className="kundali-report__charts-grid">
            {(activeTab === 'd1' || activeTab === 'all') && (
              <div className="chart-block">
                <p className="kundali-report__chart-label">{t('chart.d1.label')}</p>
                <ChartGrid houses={charts.D1_lagna} title="D1 Rāśi" ascendantSignIndex={ascendant.sign_index} />
              </div>
            )}

            {(activeTab === 'd9' || activeTab === 'all') && (
              <div className="chart-block">
                <p className="kundali-report__chart-label">{t('chart.d9.label')}</p>
                <ChartGrid houses={charts.D9_navamsa} title="D9 Navāṁśa" ascendantSignIndex={ascendant.sign_index} />
              </div>
            )}

            {(activeTab === 'rashi' || activeTab === 'all') && charts.rashi_moon_chart && (
              <div className="chart-block">
                <p className="kundali-report__chart-label">{t('chart.rashi.label')}</p>
                <ChartGrid houses={charts.rashi_moon_chart} title="Chandra" ascendantSignIndex={charts.rashi_moon_chart[0]?.sign_index} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Health & Disease Report */}
      {!compact && (
        <div className="kundali-report__table">
          <p className="kundali-report__section-title">🌿 {t('health.title')}</p>
          <HealthReport report={report} />
        </div>
      )}

      {/* 7. Comprehensive Planetary Positions Table */}
      <div className="kundali-report__table">
        <p className="kundali-report__section-title">{t('report.planets.title')}</p>
        <PlanetTable planets={planets} />
      </div>

      {/* 8. Vimshottari Dasha Table */}
      {!compact && dasha_periods && (
        <div className="kundali-report__table">
          <p className="kundali-report__section-title">⏳ Vimshottari Dasha (Planetary Periods)</p>
          <DashaTable periods={dasha_periods} />
        </div>
      )}
    </div>
  );
}
