import { useState, useRef } from 'react';
import ReportTabs from './ReportTabs';
import OverviewTab from './tabs/OverviewTab';
import PlanetsTab  from './tabs/PlanetsTab';
import DashaTab    from './tabs/DashaTab';
import DoshasTab   from './tabs/DoshasTab';
import PanchangTab from './tabs/PanchangTab';
import HealthTab   from './tabs/HealthTab';
import ExportPDFButton from './ExportPDFButton';
import { useLang } from '../context/LanguageContext';
import './KundaliReport.css';

/**
 * KundaliReport — 6-tab Kundali report viewer with one-click full PDF export.
 *
 * Tabs:
 *   1. Overview  — stat cards, classification, house strip, D1 chart, Gochara transits
 *   2. Planets   — planet table + chart selector (D1/D9/Rashi) + Ashtakvarga (SAV & BAV)
 *   3. Dasha     — Vimshottari Mahadasha & Antardasha tree + Benefic Yogas
 *   4. Doshas    — Mangal Dosha (full Papa Samyam) + Malefic Doshas + Gemstone Panel
 *   5. Panchang  — Janma Panchang (5 Limbs on birth date + Muhurtas + Choghadiya)
 *   6. Health    — Ayurvedic HealthReport
 *
 * When compact=true (used inside the Match report), only shows the
 * Overview and Planets tabs without tab navigation.
 */
export default function KundaliReport({ report, compact = false }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('overview');
  const exportTargetRef = useRef(null);

  const { profile } = report;

  if (compact) {
    // Compact mode: just the header + overview tab, no tabs
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
      case 'panchang': return <PanchangTab report={report} />;
      case 'health':   return <HealthTab   report={report} />;
      default:         return <OverviewTab report={report} />;
    }
  };

  return (
    <div className="kundali-report">
      {/* Report Header — always visible */}
      <ReportHeader
        profile={profile}
        report={report}
        t={t}
        exportBtn={<ExportPDFButton reportRef={exportTargetRef} personName={profile.name} />}
      />

      {/* Tab navigation */}
      <ReportTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Active tab content */}
      {renderTab()}

      {/* Offscreen full multi-tab document container for complete PDF export */}
      <div
        ref={exportTargetRef}
        className="kundali-pdf-document-source"
        aria-hidden="true"
      >
        <div data-pdf-section="header">
          <ReportHeader profile={profile} report={report} t={t} hideExportBtn />
        </div>
        <OverviewTab report={report} />
        <PlanetsTab report={report} />
        <DashaTab report={report} />
        <DoshasTab report={report} />
        <PanchangTab report={report} />
        <HealthTab report={report} />
      </div>
    </div>
  );
}

/** Shared header strip — name, date/time, location, and optional action buttons */
function ReportHeader({ profile, report, t, exportBtn = null, hideExportBtn = false }) {
  const gender = report.gender || profile.gender;
  return (
    <div className="kundali-report__header">
      <div className="kundali-report__profile">
        <p className="eyebrow">{t('report.eyebrow')}</p>
        <h2 className="kundali-report__name">
          {profile.name}
          {gender && (
            <span className={`gender-badge gender-badge--${gender}`}>
              {gender === 'male' ? '♂ Male' : '♀ Female'}
            </span>
          )}
        </h2>
        <div className="kundali-report__meta-group mono">
          {gender && (
            <span>{gender === 'male' ? '♂ Male' : '♀ Female'}</span>
          )}
          <span>📅 {profile.local}</span>
          {report.birth_place && (
            <span>🌐 {report.birth_place}</span>
          )}
          <span>📍 Lat: {profile.lat}, Lon: {profile.lon}</span>
          {profile.utc && <span>⏱️ UTC: {new Date(profile.utc).toUTCString()}</span>}
        </div>
      </div>

      {!hideExportBtn && exportBtn && (
        <div className="kundali-report__header-actions">
          {exportBtn}
        </div>
      )}
    </div>
  );
}


