import './KootaBar.css';

export default function KootaBar({ koota }) {
  const pct = (koota.score / koota.max) * 100;
  const isZero = koota.score === 0;
  const isFull = koota.score === koota.max;

  return (
    <div className="koota-bar">
      <div className="koota-bar__head">
        <span className="koota-bar__name">{koota.koota}</span>
        <span className="koota-bar__score mono">{koota.score}/{koota.max}</span>
      </div>
      <div className="koota-bar__track">
        <div
          className={`koota-bar__fill${isZero ? ' is-zero' : ''}${isFull ? ' is-full' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="koota-bar__detail">{koota.detail}</p>
    </div>
  );
}
