import KootaBar from './KootaBar';
import './GunaMilanScorecard.css';

/**
 * GunaMilanScorecard
 *
 * New in accuracy upgrade:
 *   - Rajju Dosha supplementary panel (non-scoring, classical mandatory check)
 *   - Active parihara count shown in flags strip
 *   - "No hard doshas" badge now includes Rajju check
 */
export default function GunaMilanScorecard({ gunaMilan, manglikAnalysis }) {
  const {
    kootas,
    total_score,
    total_max,
    verdict,
    nadi_dosha,
    bhakoot_dosha,
    rajju,
  } = gunaMilan;

  const pct = Math.round((total_score / total_max) * 100);

  // Count how many kootas have an active Parihara (override)
  const pariharaCount = kootas.filter((k) => k.parihara != null).length;

  const rajjuDosha   = rajju?.rajju_dosha;
  const allClear     = !nadi_dosha && !bhakoot_dosha && !rajjuDosha;

  return (
    <div className="scorecard">
      {/* ── Total ring + verdict ── */}
      <div className="scorecard__total">
        <div className="scorecard__ring" style={{ '--pct': pct }}>
          <span className="scorecard__ring-number mono">{total_score}</span>
          <span className="scorecard__ring-max mono">/ {total_max}</span>
        </div>

        <div className="scorecard__verdict-block">
          <p className="eyebrow">Guna Milan verdict</p>
          <h3 className="scorecard__verdict">{verdict}</h3>

          <div className="scorecard__flags">
            {nadi_dosha    && <span className="scorecard__flag scorecard__flag--warn">Nadi Dosha</span>}
            {bhakoot_dosha && <span className="scorecard__flag scorecard__flag--warn">Bhakoot Dosha</span>}
            {rajjuDosha    && <span className="scorecard__flag scorecard__flag--warn">Rajju Dosha</span>}
            {pariharaCount > 0 && (
              <span className="scorecard__flag scorecard__flag--parihara">
                {pariharaCount} Parihara{pariharaCount > 1 ? 's' : ''} applied
              </span>
            )}
            {allClear && pariharaCount === 0 && (
              <span className="scorecard__flag scorecard__flag--ok">No hard doshas</span>
            )}
            {allClear && pariharaCount > 0 && (
              <span className="scorecard__flag scorecard__flag--ok">All doshas resolved</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Manglik verdict strip ── */}
      <p className="scorecard__manglik-verdict">{manglikAnalysis.combined_verdict}</p>

      {/* ── Rajju supplementary panel ── */}
      {rajju && (
        <div className={`scorecard__rajju${rajjuDosha ? ' scorecard__rajju--warn' : ' scorecard__rajju--ok'}`}>
          <div className="scorecard__rajju-head">
            <span className="scorecard__rajju-title">
              {rajjuDosha ? '⚠' : '✓'} Rajju Koota <span className="scorecard__rajju-badge">Supplementary</span>
            </span>
            <span className="scorecard__rajju-pair mono">
              {rajju.boy_rajju} · {rajju.girl_rajju}
            </span>
          </div>
          <p className="scorecard__rajju-detail">{rajju.detail}</p>
          <p className="scorecard__rajju-note">{rajju.note}</p>
        </div>
      )}

      {/* ── Per-Koota bars ── */}
      <div className="scorecard__kootas">
        {kootas.map((k) => <KootaBar key={k.koota} koota={k} />)}
      </div>
    </div>
  );
}
