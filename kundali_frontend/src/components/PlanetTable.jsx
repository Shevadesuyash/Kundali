import { getPlanetaryDignity } from '../utils/astrology';
import { useLang } from '../context/LanguageContext';
import { planetName, signAbbr, nakshatraName, dignityName } from '../utils/i18n';
import './PlanetTable.css';

const ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export default function PlanetTable({ planets }) {
  const { lang, t } = useLang();

  return (
    <div className="planet-table-wrap">
      <table className="planet-table">
        <thead>
          <tr>
            <th>{t('planet.graha')}</th>
            <th>{t('planet.sign')}</th>
            <th>{t('planet.degree')}</th>
            <th>{t('planet.abs.lon')}</th>
            <th>{t('planet.nakshatra')}</th>
            <th>{t('planet.pada')}</th>
            <th>{t('planet.house')}</th>
            <th>{t('planet.lord')}</th>
            <th>{t('planet.dignity')}</th>
          </tr>
        </thead>
        <tbody>
          {ORDER.map((name) => {
            const p = planets[name];
            if (!p) return null;
            const dignity = getPlanetaryDignity(name, p.sign_index);
            const dignityClass = dignity.toLowerCase().replace(/\s+/g, '-');
            const translatedDignity = dignityName(dignity, lang);
            const translatedPlanet = planetName(name, lang);
            const translatedNakshatra = nakshatraName(p.nakshatra, lang);
            // Translate sign: the API returns English sign name; we translate by sign_index
            const translatedSign = p.sign_index !== undefined
              ? `${signAbbr(p.sign_index, lang)} (${p.sign_index + 1})`
              : p.sign;
            // Sign lord — translate if recognised
            const translatedLord = planetName(p.sign_lord, lang);
            const retroLabel = lang === 'mr' ? 'व' : 'R';

            return (
              <tr key={name}>
                <td className="planet-table__name">
                  {translatedPlanet}
                  {p.retrograde && (
                    <span className="planet-table__retro" title={t('planet.retrograde')}>
                      {retroLabel}
                    </span>
                  )}
                </td>
                <td className="planet-table__sign">{translatedSign}</td>
                <td className="mono">{p.degree_str}</td>
                <td className="mono">{p.longitude ? `${p.longitude.toFixed(2)}°` : '—'}</td>
                <td>{translatedNakshatra}</td>
                <td className="mono">{p.pada}</td>
                <td className="mono">{p.house_from_lagna}</td>
                <td>{translatedLord}</td>
                <td>
                  <span className={`dignity-badge dignity-badge--${dignityClass}`}>
                    {translatedDignity}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
