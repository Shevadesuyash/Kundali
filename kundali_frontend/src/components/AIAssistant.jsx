import React, { useState, useRef, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { askAIChat } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import './AIAssistant.css';

const QUICK_CHIPS = [
  '💼 Career & Wealth outlook in current Dasha?',
  '💍 Marriage timing & compatibility indicators?',
  '🪐 How will Saturn Sade Sati affect me?',
  '🌿 Most beneficial Gemstone & Vedic remedies?',
];

function BotMessageItem({ text }) {
  const [showDetails, setShowDetails] = useState(true);

  // Parse Executive Summary vs In-Depth Details
  const { executiveSummary, detailsMarkdown } = useMemo(() => {
    if (!text) return { executiveSummary: '', detailsMarkdown: '' };

    const summaryMatch = text.match(/###\s*(?:⚡)?\s*Executive Summary\s*\n+([\s\S]*?)(?=\n###|$)/i);

    if (summaryMatch) {
      const summaryText = summaryMatch[1].trim();
      const remaining = text.replace(/###\s*(?:⚡)?\s*Executive Summary\s*\n+[\s\S]*?(?=\n###|$)/i, '').trim();
      return {
        executiveSummary: summaryText,
        detailsMarkdown: remaining,
      };
    }

    return {
      executiveSummary: '',
      detailsMarkdown: text,
    };
  }, [text]);

  const sanitizedDetailsHtml = useMemo(() => {
    if (!detailsMarkdown) return '';
    const rawHtml = marked.parse(detailsMarkdown, { breaks: true, gfm: true });
    return DOMPurify.sanitize(rawHtml);
  }, [detailsMarkdown]);

  return (
    <div className="ai-msg ai-msg--bot">
      {/* 1. Executive Summary Highlight Box */}
      {executiveSummary && (
        <div className="ai-summary-highlight">
          <span className="ai-summary-badge">
            <span>⚡</span> Executive Summary
          </span>
          <p className="ai-summary-text">{executiveSummary}</p>
        </div>
      )}

      {/* 2. In-Depth Details Toggle & Rich Markdown Preview */}
      {detailsMarkdown && (
        <>
          <button
            type="button"
            className="ai-details-toggle-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>{showDetails ? '▼ Hide In-Depth Breakdown' : '▶ View In-Depth Astrological Breakdown'}</span>
          </button>

          {showDetails && (
            <div
              className="ai-markdown-preview"
              dangerouslySetInnerHTML={{ __html: sanitizedDetailsHtml }}
            />
          )}
        </>
      )}
    </div>
  );
}

/**
 * AIAssistant — Right-Side Floating Interactive Astrologer Bot.
 *
 * Features:
 * - Floating Launcher on bottom-right (doesn't obstruct chart tabs).
 * - Full-featured right-side chat drawer.
 * - Concise Executive Summary at top + rich formatted Markdown preview.
 * - Quick inquiry suggestion chips.
 */
export default function AIAssistant({ report }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  const { lang, t } = useLang();
  const { profile, ascendant, moon_sign } = report || {};
  const personName = profile?.name || 'Friend';

  // Scroll to bottom of message list on new messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputValue).trim();
    if (!q || loading) return;

    // Add user message to conversation
    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await askAIChat(report, q, lang);
      setMessages([...newMessages, { sender: 'bot', text: res.answer || 'Reading unavailable.' }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'bot', text: `⚠️ ${err.message || 'Failed to connect to Astrologer AI.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Floating Right-Side Action Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-bot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open Vedic AI Astrologer"
        >
          <span className="ai-bot-fab__sparkle">✨</span>
          <span>Ask Astrologer</span>
        </button>
      )}

      {/* 2. Backdrop (on mobile / focus) */}
      {isOpen && (
        <div
          className="ai-bot-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Right-Side Interactive Chat Drawer */}
      {isOpen && (
        <aside className="ai-bot-drawer" role="dialog" aria-label="Vedic AI Astrologer">
          {/* Header */}
          <header className="ai-bot-header">
            <div className="ai-bot-header__info">
              <div className="ai-bot-avatar">🕉️</div>
              <div>
                <h3 className="ai-bot-title">Vedic AI Astrologer</h3>
                <p className="ai-bot-subtitle">Gemini 2.5 Flash · Chart-Aware</p>
              </div>
            </div>
            <button
              type="button"
              className="ai-bot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              ✕
            </button>
          </header>

          {/* Conversation Feed */}
          <div className="ai-bot-body" ref={bodyRef}>
            {/* Welcome Bubble */}
            <div className="ai-bot-welcome">
              Namaste <strong>{personName}</strong>! I have analyzed your{' '}
              <strong>{ascendant?.sign || 'Lagna'}</strong> Ascendant and{' '}
              <strong>{moon_sign || 'Moon'}</strong> Rashi. Ask me anything about your chart:
            </div>

            {/* Quick Chips (if no conversation yet) */}
            {messages.length === 0 && (
              <div className="ai-bot-chips">
                <span className="ai-bot-chips-label">Suggested Questions</span>
                <div className="ai-bot-chips-list">
                  {QUICK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-bot-chip-btn"
                      onClick={() => handleSend(chip)}
                      disabled={loading}
                    >
                      <span>✦</span>
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Chat Messages */}
            {messages.map((msg, index) =>
              msg.sender === 'user' ? (
                <div key={index} className="ai-msg ai-msg--user">
                  {msg.text}
                </div>
              ) : (
                <BotMessageItem key={index} text={msg.text} />
              )
            )}

            {/* Loading animation */}
            {loading && (
              <div className="ai-bot-loading">
                <span>✨ Astrologer is analyzing your planetary yogas &amp; transits...</span>
              </div>
            )}
          </div>

          {/* Footer Input Bar */}
          <footer className="ai-bot-footer">
            <form
              className="ai-bot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="ai-bot-input-field"
                placeholder="Ask about career, marriage, remedies..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="ai-bot-send-btn"
                disabled={loading || !inputValue.trim()}
              >
                <span>Ask</span>
                <span>↗</span>
              </button>
            </form>
          </footer>
        </aside>
      )}
    </>
  );
}
