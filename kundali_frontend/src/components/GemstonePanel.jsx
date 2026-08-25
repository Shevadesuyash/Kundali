import React from 'react';
import './GemstonePanel.css';

/**
 * GemstonePanel — Displays personalized Life Stone, Fortune Stone,
 * Intellect Stone, Career Stone, metal/finger specifications, and Rudraksha guidance.
 *
 * Props:
 *   data: gemstone_recommendations object from backend
 */
export default function GemstonePanel({ data }) {
  if (!data) return null;

  const { recommendations = [], general_safety = [] } = data;

  return (
    <section className="gemstone-panel" data-pdf-section="gemstones">
      <div className="gemstone-panel__title-wrap">
        <h3 className="gemstone-panel__title">
          <span>💎</span> Gemstone &amp; Rudraksha Recommendations
        </h3>
        <p className="gemstone-panel__subtitle">
          Based on your Lagna lord, 5th, 9th, and 10th functional house rulers with safety contraindications.
        </p>
      </div>

      <div className="gemstones-grid">
        {recommendations.map((gem, idx) => (
          <div
            key={idx}
            className={`gemstone-card ${!gem.is_safe ? 'gemstone-card--caution' : ''}`}
          >
            <div className="gemstone-card__header">
              <div>
                <p className="gemstone-card__category">{gem.category}</p>
                <h4 className="gemstone-card__gem-name">{gem.primary_gemstone}</h4>
                <p className="gemstone-card__purpose">{gem.purpose}</p>
              </div>
              <span className="gemstone-card__planet-pill">
                {gem.ruling_planet}
              </span>
            </div>

            {/* Contraindications if any */}
            {!gem.is_safe && gem.contraindications.length > 0 && (
              <div className="gemstone-card__warning">
                <span>⚠️</span>
                <div>
                  <strong>Precaution:</strong> {gem.contraindications.join(' ')}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="gemstone-card__specs">
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">Ideal Metal</span>
                <span className="gemstone-spec__val">{gem.metal}</span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">Finger</span>
                <span className="gemstone-spec__val">{gem.finger}</span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">Weight</span>
                <span className="gemstone-spec__val">{gem.carats}</span>
              </div>
              <div className="gemstone-spec">
                <span className="gemstone-spec__label">Wearing Day</span>
                <span className="gemstone-spec__val">{gem.day_time}</span>
              </div>
            </div>

            {/* Substitute */}
            {gem.substitute_gemstone && (
              <div className="gemstone-rudraksha">
                <strong>Alternate Stone:</strong> {gem.substitute_gemstone}
              </div>
            )}

            {/* Rudraksha Option */}
            {gem.rudraksha && (
              <div className="gemstone-rudraksha">
                <strong>📿 Recommended Rudraksha:</strong> {gem.rudraksha}
              </div>
            )}

            {/* Mantra Box */}
            <div className="gemstone-card__mantra-box">
              <span className="gemstone-mantra-title">Energizing Mantra</span>
              <span className="gemstone-mantra-text">{gem.mantra}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety & Prana Pratishtha Guidelines */}
      {general_safety.length > 0 && (
        <div className="gemstone-safety-card">
          <h4 className="gemstone-safety-title">
            <span>🛡️</span> Classical Gemstone Rules &amp; Prana Pratishtha
          </h4>
          <ul className="gemstone-safety-list">
            {general_safety.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
