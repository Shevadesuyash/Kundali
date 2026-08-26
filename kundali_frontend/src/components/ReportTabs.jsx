import React from 'react';
import { useLang } from '../context/LanguageContext';
import './ReportTabs.css';

const TABS = [
  { id: 'overview',  icon: '🪐' },
  { id: 'planets',   icon: '☿'  },
  { id: 'dasha',     icon: '⏳' },
  { id: 'doshas',    icon: '⚖️' },
  { id: 'panchang',  icon: '📿' },
  { id: 'kp',        icon: '📐' },
  { id: 'varshapal', icon: '☀️' },
  { id: 'health',    icon: '🌿' },
];

/**
 * ReportTabs — top-level 8-tab navigator for the Kundali Report.
 * Localized dynamically via useLang().
 */
export default function ReportTabs({ activeTab, onChange }) {
  const { t } = useLang();

  return (
    <nav className="report-tabs" role="tablist" aria-label="Kundali report sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          className={`report-tab${activeTab === tab.id ? ' is-active' : ''}`}
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          <span className="report-tab__icon">{tab.icon}</span>
          <span className="report-tab__label">{t(`tab.${tab.id}`) || tab.id}</span>
        </button>
      ))}
    </nav>
  );
}
