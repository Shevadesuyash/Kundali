import { useState } from 'react';
import PlanetTable from '../PlanetTable';
import ChartGrid from '../ChartGrid';
import AshtakvargaGrid from '../AshtakvargaGrid';
import './tabs.css';

/**
 * PlanetsTab — planetary positions table + D1/D9/Rashi chart selector + Ashtakvarga (SAV & on-demand BAV).
 */
export default function PlanetsTab({ report }) {
  const { planets, charts, ascendant, ashtakvarga_sav, profile } = report;
  const [activeChart, setActiveChart] = useState('d1');

  const CHART_TABS = [
    { id: 'd1',    label: 'D1 Rāśi'     },
    { id: 'd9',    label: 'D9 Navāṁśa'  },
    ...(charts?.rashi_moon_chart ? [{ id: 'rashi', label: 'Chandra Rāśi' }] : []),
    { id: 'all',   label: 'All Charts'  },
  ];

  // 'person' is injected by the backend into every /api/v1/kundali response.
  // 'raw_person' is attached by KundaliPage.jsx as a local fallback.
  const personPayload = report.person || report.raw_person || {
    name:         profile?.name || '',
    year:         parseInt(profile?.year, 10),
    month:        parseInt(profile?.month, 10),
    day:          parseInt(profile?.day, 10),
    hour:         parseInt(profile?.hour, 10),
    minute:       parseInt(profile?.minute, 10),
    lat:          parseFloat(profile?.lat),
    lon:          parseFloat(profile?.lon),
    timezone_str: profile?.timezone_str || 'Asia/Kolkata',
  };

  return (
    <div className="tab-panel">
      {/* 1. Planet positions table */}
      <div className="tab-section" data-pdf-section="planet-positions">
        <p className="tab-section__title">Planetary Positions (Sidereal / Lahiri)</p>
        <PlanetTable planets={planets} />
      </div>

      {/* 2. Chart selector */}
      {charts && (
        <div className="tab-section" data-pdf-section="charts-grid">
          <div className="inner-tabs">
            {CHART_TABS.map((ct) => (
              <button
                key={ct.id}
                type="button"
                className={`inner-tab${activeChart === ct.id ? ' is-active' : ''}`}
                onClick={() => setActiveChart(ct.id)}
              >
                {ct.label}
              </button>
            ))}
          </div>

          <div className="chart-wrapper">
            {activeChart === 'd1' && charts.D1_lagna && (
              <ChartGrid houses={charts.D1_lagna} title="D1 Rāśi Chart (Lagna)" ascendantSignIndex={ascendant.sign_index} />
            )}
            {activeChart === 'd9' && charts.D9_navamsha && (
              <ChartGrid houses={charts.D9_navamsha} title="D9 Navāṁśa Chart" ascendantSignIndex={ascendant.sign_index} />
            )}
            {activeChart === 'rashi' && charts.rashi_moon_chart && (
              <ChartGrid houses={charts.rashi_moon_chart} title="Chandra Rāśi Chart" ascendantSignIndex={ascendant.sign_index} />
            )}
            {activeChart === 'all' && (
              <div className="all-charts-grid">
                {charts.D1_lagna && <ChartGrid houses={charts.D1_lagna} title="D1 Rāśi" ascendantSignIndex={ascendant.sign_index} />}
                {charts.D9_navamsha && <ChartGrid houses={charts.D9_navamsha} title="D9 Navāṁśa" ascendantSignIndex={ascendant.sign_index} />}
                {charts.rashi_moon_chart && <ChartGrid houses={charts.rashi_moon_chart} title="Chandra Rāśi" ascendantSignIndex={ascendant.sign_index} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ashtakvarga SAV Heatmap & On-demand BAV */}
      <div className="tab-section" data-pdf-section="ashtakvarga">
        <p className="tab-section__title">Ashtakvarga Strength System</p>
        <AshtakvargaGrid savData={ashtakvarga_sav} personPayload={personPayload} />
      </div>
    </div>
  );
}
