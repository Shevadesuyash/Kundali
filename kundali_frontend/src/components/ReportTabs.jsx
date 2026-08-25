import { useState } from 'react';
import './ReportTabs.css';

const TABS = [
  { id: 'overview',  icon: '🪐', label: 'Overview' },
  { id: 'planets',   icon: '☿',  label: 'Planets'  },
  { id: 'dasha',     icon: '⏳', label: 'Dasha'    },
  { id: 'doshas',    icon: '⚖️', label: 'Doshas'   },
  { id: 'panchang',  icon: '📿', label: 'Panchang' },
  { id: 'health',    icon: '🌿', label: 'Health'   },
];

/**
 * ReportTabs — top-level 5-tab navigator for the Kundali Report.
 * Props:
 *   activeTab: string  — current active tab id
 *   onChange: (id) => void
 */
export default function ReportTabs({ activeTab, onChange }) {
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
          <span className="report-tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
