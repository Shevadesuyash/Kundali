import React, { useState } from 'react';
import { askAIChat } from '../api/kundaliApi';
import './AIAssistant.css';

const QUICK_CHIPS = [
  '💼 What are my strongest career & wealth indicators?',
  '💍 What is the astrological timing for marriage & relationships?',
  '🪐 How will current Saturn Sade Sati & Jupiter transits affect me?',
  '🌿 What gemstones, mantras, or spiritual remedies are most beneficial?',
];

/**
 * AIAssistant — Context-aware interactive Q&A assistant panel.
 * Uses Gemini 2.0 Flash with verified Swiss-Ephemeris chart facts.
 *
 * Props:
 *   report: full Kundali report object
 */
export default function AIAssistant({ report }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');

  const handleAsk = async (qText) => {
    const q = qText || question;
    if (!q || !q.trim()) return;

    setLoading(true);
    setError('');
    setLastQuestion(q);

    try {
      const res = await askAIChat(report, q.trim());
      setAnswer(res.answer || 'No reading generated.');
      setQuestion('');
    } catch (err) {
      setError(err.message || 'Failed to generate AI astrological reading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-assistant-card" data-pdf-section="ai-assistant">
      <div className="ai-assistant-header">
        <h3 className="ai-assistant-title">
          <span>✨</span> Interactive Vedic AI Astrologer
        </h3>
        <span className="ai-assistant-tag">Gemini 2.0 Flash</span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="ai-chips-wrap">
        <span className="ai-chips-label">Popular astrological questions:</span>
        <div className="ai-chips-list">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-chip-btn"
              onClick={() => handleAsk(chip)}
              disabled={loading}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        className="ai-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
      >
        <input
          type="text"
          className="ai-input-text"
          placeholder="Ask any personalized astrological question about this chart..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn--ai-ask"
          disabled={loading || !question.trim()}
        >
          <span>{loading ? '⏳' : '🔮'}</span>
          <span>{loading ? 'Consulting...' : 'Ask AI'}</span>
        </button>
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div className="ai-loading-indicator">
          <span>✨ Synthesizing chart planetary yogas, dasha periods, and transits...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Answer Output Box */}
      {answer && !loading && (
        <div className="ai-answer-box">
          <h4 className="ai-answer-question">💬 {lastQuestion}</h4>
          <div className="ai-answer-content">
            {answer}
          </div>
        </div>
      )}
    </section>
  );
}
