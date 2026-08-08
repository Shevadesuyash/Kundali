import { useLang } from '../context/LanguageContext';
import { planetName } from '../utils/i18n';
import './DashaTable.css';

export default function DashaTable({ periods }) {
  const { lang, t } = useLang();

  if (!periods || periods.length === 0) return null;

  const now = new Date();

  return (
    <div className="dasha-table-wrap">
      <table className="dasha-table">
        <thead>
          <tr>
            <th>{t('planet.graha') || 'Mahadasha Lord'}</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration (Years)</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period, i) => {
            const startDate = new Date(period.start_date);
            const endDate = new Date(period.end_date);
            const isActive = now >= startDate && now < endDate;
            
            // Format dates
            const startStr = startDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            const endStr = endDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            
            const translatedPlanet = planetName(period.planet, lang);

            return (
              <tr key={i} className={isActive ? 'dasha-table__row--active' : ''}>
                <td className="dasha-table__name">
                  {translatedPlanet}
                  {isActive && <span className="dasha-table__active-badge">ACTIVE</span>}
                </td>
                <td className="mono">{startStr}</td>
                <td className="mono">{endStr}</td>
                <td className="mono">{period.total_years.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
