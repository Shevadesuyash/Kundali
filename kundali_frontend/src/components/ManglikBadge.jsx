import { useLang } from '../context/LanguageContext';
import { getManglikSeverity, getCancellationReason } from '../utils/astroTranslations';
import './ManglikBadge.css';

/**
 * ManglikBadge — shows full Mangal Dosha status for one person.
 *
 * Updates:
 *   - Tiered Severity Classification with Native Multi-Language Translation
 *   - Papa Samyam score display
 *   - Conditional progressive disclosure for non-Manglik
 */
export default function ManglikBadge({ manglik }) {
  const { lang } = useLang();
  const {
    is_manglik = false,
    is_cancelled = false,
    cancellation_reason = '',
    severity = 'None',
    mars_sign = '',
    manglik_from_lagna = false,
    manglik_from_moon = false,
    manglik_from_venus = false,
    mars_house_lagna = null,
    mars_house_moon = null,
    mars_house_venus = null,
    papa_points = 0,
  } = manglik || {};

  // Derive tone from effective state
  let tone = 'jade';
  let label = lang === 'mr' ? 'मंगळ दोष नाही (निर्दोष)' :
              lang === 'hi' ? 'मांगलिक दोष नहीं (निर्दोष)' :
              lang === 'gu' ? 'માંગલિક દોષ નથી (નિર્દોષ)' :
              'Not Manglik';

  if (is_manglik && is_cancelled) {
    tone  = 'gold';
    label = lang === 'mr' ? 'मंगळ दोष — दोष रद्द / परिहार' :
            lang === 'hi' ? 'मांगलिक दोष — दोष रद्द / परिहार' :
            lang === 'gu' ? 'માંગલિક દોષ — દોષ રદ / પરિહાર' :
            'Manglik — Dosha Cancelled';
  } else if (is_manglik) {
    tone  = severity?.startsWith('Primary') ? 'vermilion' : 'amber';
    label = getManglikSeverity(severity, lang);
  } else if (severity && severity !== 'None') {
    // Surface Anshik/Minor without calling them full Manglik
    label = getManglikSeverity(severity, lang);
  }

  const hasMultiChart = manglik_from_lagna != null && is_manglik;

  const viewDetailsText = lang === 'mr' ? 'तपशीलवार ग्रह स्थिती पाहा' :
                          lang === 'hi' ? 'विस्तृत ग्रह स्थिति देखें' :
                          lang === 'gu' ? 'વિસ્તૃત ગ્રહ સ્થિતિ જુઓ' :
                          'View Detailed Planetary Positions';

  const papaScoreLabel = lang === 'mr' ? 'पाप साम्य (अशुभ भारमान):' :
                         lang === 'hi' ? 'पाप साम्य (अशुभ भारित स्कोर):' :
                         lang === 'gu' ? 'પાપ સામ્ય (અશુભ સ્કોર):' :
                         'Papa Samyam (Malefic Score):';

  const marsHouseLabel = (h) => {
    if (lang === 'mr' || lang === 'hi') return `मंगळ भाव ${h ?? '—'}`;
    if (lang === 'gu') return `મંગળ ${h ?? '—'}મો ભાવ`;
    return `Mars in house ${h ?? '—'}`;
  };

  return (
    <div className={`manglik-badge manglik-badge--${tone}`}>
      <span className="manglik-badge__dot" />

      <div className="manglik-badge__body">
        {/* Primary label */}
        <p className="manglik-badge__label">{label}</p>

        {/* Mars position / Progressive disclosure */}
        {!is_manglik ? (
          <details className="manglik-badge__details-accordion">
            <summary className="manglik-badge__summary">{viewDetailsText}</summary>
            <p className="manglik-badge__detail mono">
              {marsHouseLabel(mars_house_lagna)} · {mars_sign}
            </p>
            {papa_points !== undefined && (
              <p className="manglik-badge__papa-points">
                {papaScoreLabel} {papa_points}
              </p>
            )}
          </details>
        ) : (
          <>
            <p className="manglik-badge__detail mono">
              {marsHouseLabel(mars_house_lagna)} · {mars_sign}
            </p>
            {papa_points !== undefined && (
              <p className="manglik-badge__papa-points" style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '4px' }}>
                {papaScoreLabel} {papa_points}
              </p>
            )}
          </>
        )}

        {/* Cancellation reason */}
        {is_cancelled && cancellation_reason && (
          <p className="manglik-badge__cancellation">
            <span aria-hidden="true">✓</span> {getCancellationReason(cancellation_reason, lang)}
          </p>
        )}

        {/* Multi-chart breakdown */}
        {hasMultiChart && (
          <div className="manglik-badge__charts">
            <ChartPill
              label={lang === 'mr' || lang === 'hi' ? 'लग्न' : lang === 'gu' ? 'લગ્ન' : 'Lagna'}
              house={mars_house_lagna}
              active={manglik_from_lagna}
            />
            <ChartPill
              label={lang === 'mr' || lang === 'hi' ? 'चंद्र' : lang === 'gu' ? 'ચંદ્ર' : 'Moon'}
              house={mars_house_moon}
              active={manglik_from_moon}
            />
            <ChartPill
              label={lang === 'mr' || lang === 'hi' ? 'शुक्र' : lang === 'gu' ? 'શુક્ર' : 'Venus'}
              house={mars_house_venus}
              active={manglik_from_venus}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Small pill showing a chart name + house number + active flag */
function ChartPill({ label, house, active }) {
  return (
    <span className={`manglik-chart-pill${active ? ' manglik-chart-pill--active' : ''}`}>
      <span className="manglik-chart-pill__dot" />
      {label}: H{house}
    </span>
  );
}
