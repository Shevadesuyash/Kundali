import { useLang } from '../context/LanguageContext';
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
  const { lang } = useLang();
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

  const localizedVerdict = () => {
    if (total_score >= 28) {
      return lang === 'mr' ? 'उत्कृष्ट विवाह जुळणी' : lang === 'hi' ? 'उत्कृष्ट विवाह मिलान' : lang === 'gu' ? 'ઉત્કૃષ્ટ લગ્ન મેળવણ' : 'Excellent Compatibility';
    }
    if (total_score >= 20) {
      return lang === 'mr' ? 'उत्तम व शुभ जुळणी' : lang === 'hi' ? 'उत्तम एवं शुभ मिलान' : lang === 'gu' ? 'ઉત્તમ અને શુભ મેળવણ' : 'Good Compatibility';
    }
    if (total_score >= 18) {
      return lang === 'mr' ? 'मध्यम / स्वीकार्य जुळणी' : lang === 'hi' ? 'मध्यम / सामान्य मिलान' : lang === 'gu' ? 'મધ્યમ / સ્વીકાર્ય મેળવણ' : 'Acceptable / Average Match';
    }
    return lang === 'mr' ? 'कमी गुण — विवाह विचार विसंगत' : lang === 'hi' ? 'अल्प गुण — मिलान प्रतिकूल' : lang === 'gu' ? 'ઓછા ગુણ — મેળવણ પ્રતિકૂળ' : 'Incompatible Match';
  };

  const eyebrowText =
    lang === 'mr' ? 'अष्टकूट गुण मिलन निकाल' :
    lang === 'hi' ? 'अष्टकूट गुण मिलान परिणाम' :
    lang === 'gu' ? 'અષ્ટકૂટ ગુણ મેળવણ પરિણામ' :
    'Guna Milan verdict';

  const noHardDoshasText =
    lang === 'mr' ? 'कोणताही गंभीर दोष नाही' :
    lang === 'hi' ? 'कोई गंभीर दोष नहीं' :
    lang === 'gu' ? 'કોઈ ગંભીર દોષ નથી' :
    'No hard doshas';

  const allResolvedText =
    lang === 'mr' ? 'सर्व दोष परिहाराने शांत' :
    lang === 'hi' ? 'सभी दोष परिहार से शांत' :
    lang === 'gu' ? 'બધા દોષ પરિહારથી શાંત' :
    'All doshas resolved';

  return (
    <div className="scorecard">
      {/* ── Total ring + verdict ── */}
      <div className="scorecard__total">
        <div className="scorecard__ring" style={{ '--pct': pct }}>
          <span className="scorecard__ring-number mono">{total_score}</span>
          <span className="scorecard__ring-max mono">/ {total_max}</span>
        </div>

        <div className="scorecard__verdict-block">
          <p className="eyebrow">{eyebrowText}</p>
          <h3 className="scorecard__verdict">{localizedVerdict()}</h3>

          <div className="scorecard__flags">
            {nadi_dosha    && <span className="scorecard__flag scorecard__flag--warn">{lang === 'mr' ? 'नाडी दोष' : lang === 'hi' ? 'नाड़ी दोष' : lang === 'gu' ? 'નાડી દોષ' : 'Nadi Dosha'}</span>}
            {bhakoot_dosha && <span className="scorecard__flag scorecard__flag--warn">{lang === 'mr' ? 'भकूट दोष' : lang === 'hi' ? 'भकूट दोष' : lang === 'gu' ? 'ભકૂટ દોષ' : 'Bhakoot Dosha'}</span>}
            {rajjuDosha    && <span className="scorecard__flag scorecard__flag--warn">{lang === 'mr' ? 'रज्जू दोष' : lang === 'hi' ? 'रज्जू दोष' : lang === 'gu' ? 'રજ્જૂ દોષ' : 'Rajju Dosha'}</span>}
            {pariharaCount > 0 && (
              <span className="scorecard__flag scorecard__flag--parihara">
                {pariharaCount} {lang === 'mr' ? 'दोष परिहार लागू' : lang === 'hi' ? 'दोष परिहार लागू' : lang === 'gu' ? 'દોષ પરિહાર લાગુ' : 'Pariharas applied'}
              </span>
            )}
            {allClear && pariharaCount === 0 && (
              <span className="scorecard__flag scorecard__flag--ok">{noHardDoshasText}</span>
            )}
            {allClear && pariharaCount > 0 && (
              <span className="scorecard__flag scorecard__flag--ok">{allResolvedText}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Manglik verdict strip ── */}
      <p className="scorecard__manglik-verdict">{manglikAnalysis?.combined_verdict || ''}</p>

      {/* ── Rajju supplementary panel ── */}
      {rajju && (
        <div className={`scorecard__rajju${rajjuDosha ? ' scorecard__rajju--warn' : ' scorecard__rajju--ok'}`}>
          <div className="scorecard__rajju-head">
            <span className="scorecard__rajju-title">
              {rajjuDosha ? '⚠' : '✓'} {lang === 'mr' ? 'रज्जू कूट' : lang === 'hi' ? 'रज्जू कूट' : lang === 'gu' ? 'રજ્જૂ કૂટ' : 'Rajju Koota'} <span className="scorecard__rajju-badge">{lang === 'mr' ? 'पूरक तपासणी' : lang === 'hi' ? 'पूरक परीक्षण' : lang === 'gu' ? 'પૂરક ચકાસણી' : 'Supplementary'}</span>
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
