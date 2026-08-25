import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchBulk } from '../api/kundaliApi';
import './BulkMatchMatrix.css';

/**
 * BulkMatchMatrix — Leaderboard modal showing compatibility scores
 * of one anchor profile matched against all opposite-gender profiles.
 *
 * Props:
 *   anchorProfile: ProfileSummary object
 *   onClose:       () => void
 */
export default function BulkMatchMatrix({ anchorProfile, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!anchorProfile?.id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    matchBulk(anchorProfile.id)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to calculate bulk matches');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [anchorProfile]);

  const handleOpenMatch = (candidateId) => {
    if (anchorProfile.gender === 'male') {
      navigate(`/match?boy_id=${anchorProfile.id}&girl_id=${candidateId}`);
    } else {
      navigate(`/match?boy_id=${candidateId}&girl_id=${anchorProfile.id}`);
    }
  };

  return (
    <div className="bulk-matrix-overlay" onClick={onClose}>
      <div className="bulk-matrix-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bulk-matrix-header">
          <div>
            <h3 className="bulk-matrix-title">
              <span>⚡</span> Quick Compatibility Leaderboard
            </h3>
            <p className="bulk-matrix-subtitle">
              Matching <strong>{anchorProfile.name}</strong> ({anchorProfile.gender === 'male' ? '♂ Groom' : '♀ Bride'}) against all saved candidates
            </p>
          </div>
          <button className="bulk-matrix-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="bulk-matrix-body">
          {loading && (
            <div className="bulk-matrix-loading">
              <p>⏳ Computing Ashtakoot Guna Milan across all candidates...</p>
            </div>
          )}

          {error && (
            <div className="bulk-matrix-empty" style={{ color: '#ef4444' }}>
              <p>⚠️ {error}</p>
            </div>
          )}

          {!loading && !error && data?.results?.length === 0 && (
            <div className="bulk-matrix-empty">
              <p>No saved {anchorProfile.gender === 'male' ? 'female (Bride)' : 'male (Groom)'} candidate profiles found.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
                Save some {anchorProfile.gender === 'male' ? 'female' : 'male'} profiles in the dashboard first to match them here.
              </p>
            </div>
          )}

          {!loading && !error && data?.results?.length > 0 && (
            <table className="bulk-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Guna Score</th>
                  <th>Compatibility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((cand, idx) => {
                  const score = cand.total_score;
                  const scoreType =
                    score >= 28 ? 'high' : score >= 18 ? 'mid' : 'low';

                  return (
                    <tr key={cand.profile_id}>
                      <td className={`bulk-rank bulk-rank--${idx + 1}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td>
                        <div className="bulk-candidate-info">
                          <span className="bulk-candidate-name">{cand.name}</span>
                          <span className="bulk-candidate-meta">
                            {cand.birth_place ? `🌐 ${cand.birth_place.split(',')[0]}` : 'Birth details saved'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="bulk-score-wrap">
                          <div className="bulk-score-bar-bg">
                            <div
                              className={`bulk-score-bar-fill bulk-score-bar-fill--${scoreType}`}
                              style={{ width: `${(score / 36) * 100}%` }}
                            />
                          </div>
                          <span className="bulk-score-val mono">
                            {score} / 36
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`bulk-manglik-tag ${
                            score >= 18 ? 'bulk-manglik-tag--ok' : 'bulk-manglik-tag--warn'
                          }`}
                        >
                          {cand.verdict}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="bulk-btn-open"
                          onClick={() => handleOpenMatch(cand.profile_id)}
                          title="Open detailed Guna Milan scorecard"
                        >
                          View Match ↗
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
