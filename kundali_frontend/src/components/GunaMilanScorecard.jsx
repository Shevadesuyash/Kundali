import KootaBar from './KootaBar';
import './GunaMilanScorecard.css';

export default function GunaMilanScorecard({ gunaMilan, manglikAnalysis }) {
  const { kootas, total_score, total_max, verdict, nadi_dosha, bhakoot_dosha } = gunaMilan;
  const pct = Math.round((total_score / total_max) * 100);

  return (
    <div className="scorecard">
      <div className="scorecard__total">
        <div className="scorecard__ring" style={{ '--pct': pct }}>
          <span className="scorecard__ring-number mono">{total_score}</span>
          <span className="scorecard__ring-max mono">/ {total_max}</span>
        </div>
        <div className="scorecard__verdict-block">
          <p className="eyebrow">Guna Milan verdict</p>
          <h3 className="scorecard__verdict">{verdict}</h3>
          <div className="scorecard__flags">
            {nadi_dosha && <span className="scorecard__flag scorecard__flag--warn">Nadi Dosha</span>}
            {bhakoot_dosha && <span className="scorecard__flag scorecard__flag--warn">Bhakoot Dosha</span>}
            {!nadi_dosha && !bhakoot_dosha && <span className="scorecard__flag scorecard__flag--ok">No hard doshas</span>}
          </div>
        </div>
      </div>

      <p className="scorecard__manglik-verdict">{manglikAnalysis.combined_verdict}</p>

      <div className="scorecard__kootas">
        {kootas.map((k) => <KootaBar key={k.koota} koota={k} />)}
      </div>
    </div>
  );
}
