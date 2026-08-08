import { useState } from 'react';
import NorthIndianChart from './NorthIndianChart';
import { useLang } from '../context/LanguageContext';
import { signAbbr } from '../utils/i18n';
import './ChartGrid.css';

// South Indian: Fixed sign_index -> [row, col] position in 4x4 grid.
const SOUTH_SIGN_POS = {
  11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
  10: [1, 0],                               3: [1, 3],
  9:  [2, 0],                               4: [2, 3],
  8:  [3, 0], 7: [3, 1], 6: [3, 2], 5: [3, 3],
};

export default function ChartGrid({ houses, title, ascendantSignIndex, allowToggle = true }) {
  const [chartStyle, setChartStyle] = useState('south');
  const { lang, t } = useLang();

  if (!houses || houses.length === 0) {
    return <div className="chart-grid-wrap"><p className="chart-grid__empty">{t('chart.no.data')}</p></div>;
  }

  const cellBySign = {};
  houses.forEach((h) => { cellBySign[h.sign_index] = h; });

  const cells = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const isCenter = row >= 1 && row <= 2 && col >= 1 && col <= 2;
      if (isCenter) continue;

      const signIndexStr = Object.keys(SOUTH_SIGN_POS).find(
        (k) => SOUTH_SIGN_POS[k][0] === row && SOUTH_SIGN_POS[k][1] === col
      );
      const signIdx = Number(signIndexStr);
      const houseData = cellBySign[signIdx];
      const isAscendant = signIdx === ascendantSignIndex;

      cells.push(
        <div
          key={`south-${row}-${col}`}
          className={`chart-grid__cell${isAscendant ? ' chart-grid__cell--asc' : ''}`}
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
        >
          <div className="chart-grid__header">
            {/* Sign abbreviation in selected language */}
            <span className="chart-grid__sign">{signAbbr(signIdx, lang)}</span>
            {houseData && <span className="chart-grid__house-num">{t('chart.lagna.label').slice(0, 1)}{houseData.house}</span>}
          </div>
          <div className="chart-grid__occupants">
            {houseData?.occupants.map((p) => (
              <span
                key={p.planet}
                className={`chart-grid__planet${p.retrograde ? ' is-retro' : ''}`}
                title={`${p.planet} ${p.degree_str}${p.retrograde ? ` (${t('chart.retrograde')})` : ''}`}
              >
                {/* Use language-appropriate abbreviation */}
                {lang === 'mr' ? getMrAbbr(p.abbr) : p.abbr}
                {p.retrograde && <sup>व</sup>}
              </span>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="chart-grid-container">
      {allowToggle && (
        <div className="chart-style-toggle">
          <button
            type="button"
            className={`chart-style-btn${chartStyle === 'south' ? ' is-active' : ''}`}
            onClick={() => setChartStyle('south')}
          >
            {t('chart.south.btn')}
          </button>
          <button
            type="button"
            className={`chart-style-btn${chartStyle === 'north' ? ' is-active' : ''}`}
            onClick={() => setChartStyle('north')}
          >
            {t('chart.north.btn')}
          </button>
        </div>
      )}

      {chartStyle === 'north' ? (
        <NorthIndianChart houses={houses} title={title} lang={lang} />
      ) : (
        <div className="chart-grid-wrap">
          <div className="chart-grid">
            {cells}
            <div className="chart-grid__title" style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}>
              <span className="chart-grid__title-text">{title}</span>
              <span className="chart-grid__subtitle-text">{t('chart.south.label')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Map English abbreviation to Marathi single-letter abbreviation */
function getMrAbbr(enAbbr) {
  const MAP = {
    Su: 'सू', Mo: 'चं', Ma: 'मं', Me: 'बु',
    Ju: 'गु', Ve: 'शु', Sa: 'श', Ra: 'रा', Ke: 'के',
    As: 'ल', // Ascendant
  };
  return MAP[enAbbr] || enAbbr;
}
