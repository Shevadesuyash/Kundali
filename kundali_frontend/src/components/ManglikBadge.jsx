import './ManglikBadge.css';

/**
 * ManglikBadge — shows full Mangal Dosha status for one person.
 *
 * Updates:
 *   - Tiered Severity Classification
 *   - Papa Samyam score display
 *   - Conditional progressive disclosure for non-Manglik
 */
export default function ManglikBadge({ manglik }) {
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
  let label = 'Not Manglik';

  if (is_manglik && is_cancelled) {
    tone  = 'gold';
    label = 'Manglik — Dosha Cancelled';
  } else if (is_manglik) {
    tone  = severity?.startsWith('Primary') ? 'vermilion' : 'amber';
    label = `Manglik — ${severity}`;
  } else if (severity && severity !== 'None') {
    // Surface Anshik/Minor without calling them full Manglik
    label = `Not Manglik — ${severity}`;
  }

  const hasMultiChart = manglik_from_lagna != null && is_manglik;

  return (
    <div className={`manglik-badge manglik-badge--${tone}`}>
      <span className="manglik-badge__dot" />

      <div className="manglik-badge__body">
        {/* Primary label */}
        <p className="manglik-badge__label">{label}</p>

        {/* Mars position / Progressive disclosure */}
        {!is_manglik ? (
          <details className="manglik-badge__details-accordion">
            <summary className="manglik-badge__summary">View Detailed Planetary Positions</summary>
            <p className="manglik-badge__detail mono">
              Mars in house {mars_house_lagna ?? '—'} · {mars_sign}
            </p>
            {papa_points !== undefined && (
              <p className="manglik-badge__papa-points">
                Papa Samyam (Malefic Score): {papa_points}
              </p>
            )}
          </details>
        ) : (
          <>
            <p className="manglik-badge__detail mono">
              Mars in house {mars_house_lagna ?? '—'} · {mars_sign}
            </p>
            {papa_points !== undefined && (
              <p className="manglik-badge__papa-points" style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '4px' }}>
                Papa Samyam (Malefic Score): {papa_points}
              </p>
            )}
          </>
        )}

        {/* Cancellation reason */}
        {is_cancelled && cancellation_reason && (
          <p className="manglik-badge__cancellation">
            <span aria-hidden="true">✓</span> {cancellation_reason}
          </p>
        )}

        {/* Multi-chart breakdown */}
        {hasMultiChart && (
          <div className="manglik-badge__charts">
            <ChartPill
              label="Lagna"
              house={mars_house_lagna}
              active={manglik_from_lagna}
            />
            <ChartPill
              label="Moon"
              house={mars_house_moon}
              active={manglik_from_moon}
            />
            <ChartPill
              label="Venus"
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
