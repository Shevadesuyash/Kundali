import React from 'react';
import { signAbbr } from '../utils/i18n';
import './EastIndianChart.css';

// Exact coordinate positions for 12 signs in East Indian (Bengali/Odia) layout (400x400)
const EAST_SIGN_POSITIONS = {
  0:  { signX: 200, signY: 50,  centerX: 200, centerY: 85,  polygon: "100,4 300,4 200,100" },          // Aries (Top Center)
  1:  { signX: 120, signY: 45,  centerX: 95,  centerY: 55,  polygon: "4,4 100,4 100,100 4,100" },       // Taurus (Top Left Corner)
  2:  { signX: 50,  signY: 120, centerX: 55,  centerY: 95,  polygon: "4,4 100,100 4,200" },             // Gemini (Left Top)
  3:  { signX: 50,  signY: 200, centerX: 85,  centerY: 200, polygon: "4,100 100,200 4,300" },            // Cancer (Left Center)
  4:  { signX: 50,  signY: 280, centerX: 55,  centerY: 305, polygon: "4,200 100,300 4,396" },            // Leo (Left Bottom)
  5:  { signX: 120, signY: 355, centerX: 95,  centerY: 345, polygon: "4,300 100,300 100,396 4,396" },     // Virgo (Bottom Left Corner)
  6:  { signX: 200, signY: 350, centerX: 200, centerY: 315, polygon: "100,396 300,396 200,300" },        // Libra (Bottom Center)
  7:  { signX: 280, signY: 355, centerX: 305, centerY: 345, polygon: "300,300 396,300 396,396 300,396" }, // Scorpio (Bottom Right Corner)
  8:  { signX: 350, signY: 280, centerX: 345, centerY: 305, polygon: "300,300 396,200 396,396" },         // Sagittarius (Right Bottom)
  9:  { signX: 350, signY: 200, centerX: 315, centerY: 200, polygon: "300,200 396,100 396,300" },         // Capricorn (Right Center)
  10: { signX: 350, signY: 120, centerX: 345, centerY: 95,  polygon: "300,100 396,4 396,200" },          // Aquarius (Right Top)
  11: { signX: 280, signY: 45,  centerX: 305, centerY: 55,  polygon: "300,4 396,4 396,100 300,100" },    // Pisces (Top Right Corner)
};

/** Map English abbreviation → Language abbreviation */
function getLocalizedAbbr(enAbbr, lang) {
  const MR_MAP = {
    Su: 'सू', Mo: 'चं', Ma: 'मं', Me: 'बु',
    Ju: 'गु', Ve: 'शु', Sa: 'श', Ra: 'रा', Ke: 'के', As: 'ल',
  };
  const HI_MAP = {
    Su: 'सू', Mo: 'चं', Ma: 'मं', Me: 'बु',
    Ju: 'गु', Ve: 'शु', Sa: 'श', Ra: 'रा', Ke: 'के', As: 'ल',
  };
  const GU_MAP = {
    Su: 'સૂ', Mo: 'ચં', Ma: 'મં', Me: 'બુ',
    Ju: 'ગુ', Ve: 'શુ', Sa: 'શ', Ra: 'રા', Ke: 'કે', As: 'લ',
  };

  if (lang === 'mr') return MR_MAP[enAbbr] || enAbbr;
  if (lang === 'hi') return HI_MAP[enAbbr] || enAbbr;
  if (lang === 'gu') return GU_MAP[enAbbr] || enAbbr;
  return enAbbr;
}

/**
 * EastIndianChart — Authentic East Indian (Bengali / Odia / Assamese) Chart (SVG).
 * Fixed-sign layout where signs proceed counter-clockwise, and Lagna rotates.
 */
export default function EastIndianChart({ houses, title, ascendantSignIndex, lang = 'en' }) {
  if (!houses || houses.length === 0) return null;

  const cellBySign = {};
  houses.forEach((h) => { cellBySign[h.sign_index] = h; });

  const subtitleText =
    lang === 'mr' ? 'पूर्व भारतीय (बंगाली)' :
    lang === 'hi' ? 'पूर्वी भारतीय (बंगाली)' :
    lang === 'gu' ? 'પૂર્વ ભારતીય (બંગાળી)' : 'East Indian (Bengali)';

  return (
    <div className="east-chart-wrap">
      <svg
        viewBox="0 0 400 400"
        className="east-chart-svg"
        aria-label={`${title} East Indian Chart`}
      >
        {/* Background */}
        <rect x="4" y="4" width="392" height="392" className="east-chart-bg" />

        {/* Outer border */}
        <rect x="4" y="4" width="392" height="392" className="east-chart-border" />

        {/* Main diagonals and quadrant lines */}
        <line x1="4" y1="4" x2="396" y2="396" className="east-chart-line" />
        <line x1="396" y1="4" x2="4" y2="396" className="east-chart-line" />
        <line x1="100" y1="4" x2="100" y2="396" className="east-chart-line" />
        <line x1="300" y1="4" x2="300" y2="396" className="east-chart-line" />
        <line x1="4" y1="100" x2="396" y2="100" className="east-chart-line" />
        <line x1="4" y1="300" x2="396" y2="300" className="east-chart-line" />

        {/* Center Box Title */}
        <rect x="100" y="100" width="200" height="200" fill="#ffffff" stroke="var(--color-copper)" strokeWidth="1.5" />
        <text x="200" y="190" textAnchor="middle" className="east-chart-title">{title}</text>
        <text x="200" y="212" textAnchor="middle" className="east-chart-subtitle">{subtitleText}</text>

        {/* 12 Signs */}
        {Array.from({ length: 12 }, (_, signIdx) => {
          const pos = EAST_SIGN_POSITIONS[signIdx];
          const houseData = cellBySign[signIdx];
          const isAscendant = signIdx === ascendantSignIndex;
          const occupants = houseData?.occupants || [];
          const signLabel = signAbbr(signIdx, lang);

          return (
            <g key={signIdx} className={`east-sign-group sign-${signIdx}`}>
              {/* Lagna Highlight polygon */}
              {isAscendant && (
                <polygon points={pos.polygon} className="east-chart-lagna-fill" />
              )}

              {/* Sign label */}
              <text
                x={pos.signX}
                y={pos.signY}
                textAnchor="middle"
                dominantBaseline="central"
                className={`east-sign-label ${isAscendant ? 'is-lagna-sign' : ''}`}
              >
                {signLabel}
                {isAscendant ? ' (L)' : ''}
              </text>

              {/* Occupants */}
              {occupants.length > 0 && (
                <g transform={`translate(${pos.centerX}, ${pos.centerY})`}>
                  {occupants.map((p, idx) => {
                    const total = occupants.length;
                    const offsetY = total > 1 ? (idx - (total - 1) / 2) * 13 : 0;
                    const label = getLocalizedAbbr(p.abbr, lang);
                    const retroMark = p.retrograde ? (lang === 'en' ? 'R' : 'व') : '';
                    return (
                      <text
                        key={p.planet}
                        x="0"
                        y={offsetY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`east-planet-name ${p.retrograde ? 'is-retro' : ''}`}
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
