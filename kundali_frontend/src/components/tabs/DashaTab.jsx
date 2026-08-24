import DashaTable from '../DashaTable';
import './tabs.css';

/**
 * DashaTab — Vimshottari Mahadasha table.
 * Placeholder for Phase 4 Antardasha tree and transit cards.
 */
export default function DashaTab({ report }) {
  const { dasha_periods } = report;

  return (
    <div className="tab-panel">
      <div className="tab-section">
        <p className="tab-section__title">Vimshottari Dasha (Planetary Periods)</p>
        <p className="tab-section__subtitle">
          Each Mahadasha is a major planetary cycle. The active period is highlighted.
        </p>
        <DashaTable periods={dasha_periods} />
      </div>

      {/* Phase 4 placeholder — Antardasha tree will be added here */}
      <div className="tab-coming-soon">
        <span>🔮</span>
        <p>Antardasha (sub-period) breakdown coming in Phase 4</p>
      </div>
    </div>
  );
}
