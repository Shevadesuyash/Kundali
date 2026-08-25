import HealthReport from '../HealthReport';
import './tabs.css';

/**
 * HealthTab — wraps the existing HealthReport component.
 */
export default function HealthTab({ report }) {
  return (
    <div className="tab-panel" data-pdf-section="ayurveda-health">
      <HealthReport report={report} />
    </div>
  );
}
