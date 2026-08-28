import { useLang } from '../context/LanguageContext';
import { getKootaTitle, getKootaDesc } from '../utils/astroTranslations';
import './KootaBar.css';

/**
 * KootaBar — renders a single Koota row in the Guna Milan scorecard.
 *
 * New in accuracy upgrade:
 *   - `koota.parihara`      : string | null  — cancellation reason (shown in green)
 *   - `koota.tara_warnings` : string[] | null — dangerous Tara positions (shown in amber)
 */
export default function KootaBar({ koota }) {
  const { lang } = useLang();
  const pct     = (koota.score / koota.max) * 100;
  const isZero  = koota.score === 0;
  const isFull  = koota.score === koota.max;
  const hasParihara = koota.parihara != null;

  const localizedTitle = getKootaTitle(koota.koota, lang);
  const localizedDetail = getKootaDesc(koota.koota, koota.detail, lang);

  return (
    <div className="koota-bar">
      <div className="koota-bar__head">
        <span className="koota-bar__name">{localizedTitle}</span>
        <span className="koota-bar__score mono">{koota.score}/{koota.max}</span>
      </div>

      <div className="koota-bar__track">
        <div
          className={`koota-bar__fill${isZero ? ' is-zero' : ''}${isFull ? ' is-full' : ''}${hasParihara ? ' is-parihara' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="koota-bar__detail">{localizedDetail}</p>

      {/* Parihara / Dosha-cancellation banner */}
      {hasParihara && (
        <p className="koota-bar__parihara">
          <span className="koota-bar__parihara-icon" aria-hidden="true">✓</span>
          {koota.parihara}
        </p>
      )}

      {/* Tara named warnings (Janma, Vipat, Pratyak, Naidhana) */}
      {koota.tara_warnings && koota.tara_warnings.length > 0 && (
        <ul className="koota-bar__tara-warnings">
          {koota.tara_warnings.map((w, i) => (
            <li key={i} className="koota-bar__tara-warning">
              <span aria-hidden="true">⚠</span> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
