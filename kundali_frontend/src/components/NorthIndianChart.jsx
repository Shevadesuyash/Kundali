import { signAbbr, getPlanetAbbr } from '../utils/i18n';
import './NorthIndianChart.css';

// Exact center and sign-number positions for all 12 houses in SVG (400x400)
const HOUSE_POSITIONS = {
  1:  { signX: 200, signY: 45,  centerX: 200, centerY: 100, isLagna: true },
  2:  { signX: 130, signY: 32,  centerX: 95,  centerY: 52 },
  3:  { signX: 32,  signY: 130, centerX: 52,  centerY: 95 },
  4:  { signX: 45,  signY: 200, centerX: 100, centerY: 200 },
  5:  { signX: 32,  signY: 270, centerX: 52,  centerY: 305 },
  6:  { signX: 130, signY: 368, centerX: 95,  centerY: 348 },
  7:  { signX: 200, signY: 355, centerX: 200, centerY: 300 },
  8:  { signX: 270, signY: 368, centerX: 305, centerY: 348 },
  9:  { signX: 368, signY: 270, centerX: 348, centerY: 305 },
  10: { signX: 355, signY: 200, centerX: 300, centerY: 200 },
  11: { signX: 368, signY: 130, centerX: 348, centerY: 95 },
  12: { signX: 270, signY: 32,  centerX: 305, centerY: 52 },
};

/** Map English abbreviation → Marathi */
function getMrAbbr(enAbbr) {
  const MAP = {
    Su: 'सू', Mo: 'चं', Ma: 'मं', Me: 'बु',
    Ju: 'गु', Ve: 'शु', Sa: 'श', Ra: 'रा', Ke: 'के',
  };
  return MAP[enAbbr] || enAbbr;
}

/**
 * Authentic North Indian Diamond chart (SVG).
 * Receives `lang` prop so sign abbreviations and planet chips switch language.
 */
export default function NorthIndianChart({ houses, title, lang = 'en' }) {
  if (!houses || houses.length === 0) return null;

  const cellByHouse = {};
  houses.forEach((h) => { cellByHouse[h.house] = h; });

  const lagnaLabel = lang === 'mr' ? 'ल' : 'L';

  return (
    <div className="north-chart-wrap">
      <svg
        viewBox="0 0 400 400"
        className="north-chart-svg"
        aria-label={`${title} North Indian Chart`}
      >
        {/* Background */}
        <rect x="4" y="4" width="392" height="392" className="north-chart-bg" />

        {/* Lagna highlight */}
        <polygon points="200,4 396,200 200,396 4,200" className="north-chart-diamond-fill" />
        <polygon points="200,4 300,100 200,200 100,100" className="north-chart-lagna-fill" />

        {/* Outer border */}
        <rect x="4" y="4" width="392" height="392" className="north-chart-border" />

        {/* Main diagonals */}
        <line x1="4" y1="4" x2="396" y2="396" className="north-chart-line" />
        <line x1="396" y1="4" x2="4" y2="396" className="north-chart-line" />

        {/* Inner diamond */}
        <polygon points="200,4 396,200 200,396 4,200" className="north-chart-diamond-border" />

        {/* Center title */}
        <text x="200" y="192" textAnchor="middle" className="north-chart-title">{title}</text>
        <text x="200" y="210" textAnchor="middle" className="north-chart-subtitle">
          {lang === 'mr' ? 'उत्तर भारतीय' : lang === 'hi' ? 'उत्तर भारतीय' : lang === 'gu' ? 'ઉત્તર ભારતીય' : 'North Indian'}
        </text>

        {/* 12 houses */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          const pos = HOUSE_POSITIONS[houseNum];
          const houseData = cellByHouse[houseNum];
          const signIdx = houseData ? houseData.sign_index : 0;
          const occupants = houseData?.occupants || [];
          // Sign label: abbreviation in selected language + number
          const signLabel = signAbbr(signIdx, lang);

          return (
            <g key={houseNum} className={`north-house-group house-${houseNum}`}>
              {/* Sign abbreviation in selected language */}
              <text
                x={pos.signX}
                y={pos.signY}
                textAnchor="middle"
                dominantBaseline="central"
                className={`north-sign-num ${pos.isLagna ? 'is-lagna-num' : ''}`}
              >
                {signLabel}
              </text>

              {/* Lagna marker for house 1 */}
              {pos.isLagna && (
                <text
                  x={pos.signX}
                  y={pos.signY + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="north-lagna-marker"
                >
                  {lagnaLabel}
                </text>
              )}

              {/* Occupying Grahas */}
              {occupants.length > 0 && (
                <g transform={`translate(${pos.centerX}, ${pos.centerY})`}>
                  {occupants.map((p, idx) => {
                    const total = occupants.length;
                    const offsetY = total > 1 ? (idx - (total - 1) / 2) * 14 : 0;
                    const label = lang === 'mr' ? getPlanetAbbr(p.abbr, lang) : p.abbr;
                    const retroMark = p.retrograde ? (lang === 'mr' ? 'व' : 'R') : '';
                    return (
                      <text
                        key={p.planet}
                        x="0"
                        y={offsetY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`north-planet-name ${p.retrograde ? 'is-retro' : ''}`}
                      >
                        {label}{retroMark}
                      </text>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
