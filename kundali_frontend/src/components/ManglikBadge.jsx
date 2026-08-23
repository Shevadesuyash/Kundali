import './ManglikBadge.css';

/**
 * ManglikBadge — shows full Mangal Dosha status for one person.
 *
 * New in accuracy upgrade:
 *   - Multi-chart breakdown (Lagna / Moon / Venus)
 *   - Cancellation reason shown explicitly
 *   - Ketu supplementary indicator
 *   - Severity mapped to colour tone
 */
export default function ManglikBadge({ manglik }) {
  const {
    is_manglik,
    is_cancelled,
    cancellation_reason,
    severity,
    mars_sign,
    manglik_from_lagna,
    manglik_from_moon,
    manglik_from_venus,
    mars_house_lagna,
    mars_house_moon,
    mars_house_venus,
    ketu_manglik,
  } = manglik;

  // Derive tone from effective state
  let tone = 'jade';
  let label = 'Not Manglik';

  if (is_manglik && is_cancelled) {
    tone  = 'gold';
    label = 'Manglik — Dosha Cancelled';
  } else if (is_manglik) {
    tone  = severity?.startsWith('Severe') || severity?.startsWith('High') ? 'vermilion' : 'amber';
    label = `Manglik — ${severity}`;
  }

  const hasMultiChart = manglik_from_lagna != null;

  return (
    <div className={`manglik-badge manglik-badge--${tone}`}>
      <span className="manglik-badge__dot" />

      <div className="manglik-badge__body">
        {/* Primary label */}
        <p className="manglik-badge__label">{label}</p>

        {/* Mars position */}
        <p className="manglik-badge__detail mono">
          Mars in house {mars_house_lagna ?? '—'} · {mars_sign}
        </p>

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

        {/* Ketu supplementary indicator */}
        {ketu_manglik?.is_manglik && (
          <p className="manglik-badge__ketu">
            <span aria-hidden="true">◈</span>{' '}
            Ketu also in house {ketu_manglik.ketu_house} ({ketu_manglik.ketu_sign}) —{' '}
            <span className="manglik-badge__ketu-note">{ketu_manglik.note}</span>
          </p>
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
