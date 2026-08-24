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

  const personPayload = {
    name:         profile?.name || '',
    year:         profile?.year,
    month:        profile?.month,
    day:          profile?.day,
    hour:         profile?.hour,
    minute:       profile?.minute,
    lat:          profile?.lat,
    lon:          profile?.lon,
    timezone_str: profile?.timezone_str,
  };

  return (
    <div className="tab-panel">
      {/* 1. Planet positions table */}
      <div className="tab-section">
        <p className="tab-section__title">Planetary Positions (Sidereal / Lahiri)</p>
        <PlanetTable planets={planets} />
      </div>

      {/* 2. Chart selector */}
      {charts && (
        <div className="tab-section">
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

          <div className="charts-grid-wrap">
            {(activeChart === 'd1' || activeChart === 'all') && (
              <div className="chart-block">
                <p className="chart-block__label">D1 Rāśi (Lagna Chart)</p>
                <ChartGrid houses={charts.D1_lagna} title="D1 Rāśi" ascendantSignIndex={ascendant.sign_index} />
              </div>
            )}
            {(activeChart === 'd9' || activeChart === 'all') && (
              <div className="chart-block">
                <p className="chart-block__label">D9 Navāṁśa (Marriage / Soul)</p>
                <ChartGrid houses={charts.D9_navamsa} title="D9 Navāṁśa" ascendantSignIndex={ascendant.sign_index} />
              </div>
            )}
            {(activeChart === 'rashi' || activeChart === 'all') && charts.rashi_moon_chart && (
              <div className="chart-block">
                <p className="chart-block__label">Chandra Rāśi (Moon Chart)</p>
                <ChartGrid houses={charts.rashi_moon_chart} title="Chandra" ascendantSignIndex={charts.rashi_moon_chart[0]?.sign_index} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ashtakvarga (SAV scorecard + on-demand BAV) */}
      {ashtakvarga_sav && (
        <div className="tab-section">
          <p className="tab-section__title">Ashtakvarga Strength System</p>
          <AshtakvargaGrid savData={ashtakvarga_sav} personPayload={personPayload} />
        </div>
      )}
    </div>
  );
}
