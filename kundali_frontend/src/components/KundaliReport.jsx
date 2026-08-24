import { useState } from 'react';
import ReportTabs from './ReportTabs';
import OverviewTab from './tabs/OverviewTab';
import PlanetsTab  from './tabs/PlanetsTab';
import DashaTab    from './tabs/DashaTab';
import DoshasTab   from './tabs/DoshasTab';
import HealthTab   from './tabs/HealthTab';
import { useLang } from '../context/LanguageContext';
import './KundaliReport.css';

/**
 * KundaliReport — 5-tab Kundali report viewer.
 *
 * Tabs:
 *   1. Overview  — stat cards, classification, house strip, D1 chart
 *   2. Planets   — planet table + chart selector (D1/D9/Rashi)
 *   3. Dasha     — Vimshottari Mahadasha table
 *   4. Doshas    — Mangal Dosha (full), Kaal Sarp, Pitra placeholder
 *   5. Health    — existing HealthReport component
 *
 * When compact=true (used inside the Match report), only shows the
 * Overview and Planets tabs without tab navigation.
 */
export default function KundaliReport({ report, compact = false }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('overview');

  const { profile } = report;

  if (compact) {
    // Compact mode: just the header + planet table, no tabs
    return (
      <div className="kundali-report kundali-report--compact">
        <ReportHeader profile={profile} report={report} t={t} />
        <OverviewTab report={report} />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab report={report} />;
      case 'planets':  return <PlanetsTab  report={report} />;
      case 'dasha':    return <DashaTab    report={report} />;
      case 'doshas':   return <DoshasTab   report={report} />;
      case 'health':   return <HealthTab   report={report} />;
      default:         return <OverviewTab report={report} />;
    }
  };

  return (
    <div className="kundali-report">
      {/* Report Header — always visible */}
      <ReportHeader profile={profile} report={report} t={t} />

      {/* Tab navigation */}
      <ReportTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Active tab content */}
      {renderTab()}
    </div>
  );
}

/** Shared header strip — name, date/time, location */
function ReportHeader({ profile, report, t }) {
  return (
    <div className="kundali-report__header">
      <div className="kundali-report__profile">
        <p className="eyebrow">{t('report.eyebrow')}</p>
        <h2 className="kundali-report__name">{profile.name}</h2>
        <div className="kundali-report__meta-group mono">
          <span>📅 {profile.local}</span>
          {report.birth_place && (
            <span>🌐 {report.birth_place}</span>
          )}
          <span>📍 Lat: {profile.lat}, Lon: {profile.lon}</span>
          {profile.utc && <span>⏱️ UTC: {new Date(profile.utc).toUTCString()}</span>}
        </div>
      </div>
    </div>
  );
}
