import './ManglikBadge.css';

export default function ManglikBadge({ manglik }) {
  const { is_manglik, is_cancelled, severity, mars_house, mars_sign } = manglik;

  let tone = 'jade';
  let label = 'Not Manglik';
  if (is_manglik && is_cancelled) {
    tone = 'gold';
    label = 'Manglik — cancelled';
  } else if (is_manglik) {
    tone = 'vermilion';
    label = `Manglik — ${severity}`;
  }

  return (
    <div className={`manglik-badge manglik-badge--${tone}`}>
      <span className="manglik-badge__dot" />
      <div>
        <p className="manglik-badge__label">{label}</p>
        <p className="manglik-badge__detail mono">Mars in house {mars_house} · {mars_sign}</p>
      </div>
    </div>
  );
}
