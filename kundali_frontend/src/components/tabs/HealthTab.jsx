import HealthReport from '../HealthReport';
import './tabs.css';

/**
 * HealthTab — wraps the existing HealthReport component.
 */
export default function HealthTab({ report }) {
  return (
    <div className="tab-panel">
      <HealthReport report={report} />
    </div>
  );
}
