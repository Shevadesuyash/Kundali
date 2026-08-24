import DashaTree from '../DashaTree';
import YogaList from '../YogaList';
import './tabs.css';

/**
 * DashaTab — Vimshottari Mahadasha / Antardasha tree and active Yogas.
 */
export default function DashaTab({ report }) {
  const { dasha_periods, yogas } = report;

  return (
    <div className="tab-panel">
      {/* 1. Interactive Vimshottari Dasha Tree */}
      <div className="tab-section">
        <p className="tab-section__title">Vimshottari Dasha &amp; Antardashas</p>
        <p className="tab-section__subtitle">
          Major planetary cycles (Mahadashas) and sub-periods (Antardashas). Click any cycle to expand.
        </p>
        <DashaTree periods={dasha_periods} />
      </div>

      {/* 2. Classical Vedic Yogas */}
      <div className="tab-section">
        <p className="tab-section__title">Vedic Yogas &amp; Planetary Combinations</p>
        <YogaList yogas={yogas} filterType="all" />
      </div>
    </div>
  );
}
