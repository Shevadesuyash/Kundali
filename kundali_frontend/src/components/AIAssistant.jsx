import React, { useState, useRef, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { askAIChat } from '../api/kundaliApi';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SupportDeveloper from './SupportDeveloper';
import './AIAssistant.css';

const QUICK_CHIPS = [
  '💼 Career & Wealth outlook in current Dasha?',
  '💍 Marriage timing & compatibility indicators?',
  '🪐 How will Saturn Sade Sati affect me?',
  '🌿 Most beneficial Gemstone & Vedic remedies?',
];

function BotMessageItem({ text, isLimitReached, onOpenSupport }) {
  const [showDetails, setShowDetails] = useState(true);

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
    <div className={`ai-msg ai-msg--bot${isLimitReached ? ' ai-msg--limit' : ''}`}>
      {executiveSummary && (
        <div className="ai-summary-highlight">
          <span className="ai-summary-badge">
            <span>⚡</span> Executive Summary
          </span>
          <p className="ai-summary-text">{executiveSummary}</p>
        </div>
      )}

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

      {isLimitReached && (
        <div className="ai-limit-banner">
          <div className="ai-limit-badge">🌟 Daily Free Quota Used</div>
          <p>You have asked your 1 free question for today. Unlock 50 questions for ₹49 or 24-hour pass:</p>
          <button
            type="button"
            className="btn-unlock-wallet"
            onClick={onOpenSupport}
          >
            ⚡ Unlock 50 Questions (₹49) / Support Creator
          </button>
        </div>
      )}
    </div>
  );
}

export default function AIAssistant({ report }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const bodyRef = useRef(null);

  const { lang, t } = useLang();
  const { user } = useAuth();
  const { profile, ascendant, moon_sign } = report || {};
  const personName = profile?.name || 'Friend';

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputValue).trim();
    if (!q || loading) return;

    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await askAIChat(report, q, lang, user?.id || null);
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: res.answer || 'Reading unavailable.',
          isLimitReached: Boolean(res.limit_reached),
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'bot', text: `⚠️ ${err.message || 'Failed to connect to Astrologer AI.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = useMemo(() => {
    if (lang === 'mr') {
      return [
        '💼 चालू महादशेत करिअर व धनयोग कसा राहील?',
        '💍 विवाह योग आणि अनुकूल कालावधी कधी आहे?',
        '🪐 शनीची साडेसाती / ढिय्या प्रभाव कसा आहे?',
        '🌿 सर्वात लाभदायक रत्न आणि वैदिक उपाय कोणते?',
      ];
    }
    if (lang === 'hi') {
      return [
        '💼 वर्तमान महादशा में आजीविका एवं धन लाभ?',
        '💍 विवाह योग एवं अनुकूल समय कब बनेगा?',
        '🪐 शनि की साढ़ेसाती का क्या प्रभाव रहेगा?',
        '🌿 सर्वाधिक लाभकारी रत्न एवं वैदिक उपाय?',
      ];
    }
    if (lang === 'gu') {
      return [
        '💼 વર્તમાન દશામાં કારકિર્દી અને ધનલાભ કેવો રહેશે?',
        '💍 વિવાહ યોગ અને અનુકૂળ સમય ક્યારે બનશે?',
        '🪐 શનિની સાડાસાતીની શું અસર રહેશે?',
        '🌿 સૌથી ફાયદાકારક રત્ન અને વૈદિક ઉપાયો કયા છે?',
      ];
    }
    return QUICK_CHIPS;
  }, [lang]);

  const botTitle = lang === 'mr' ? 'वैदिक AI ज्योतिषी' :
                    lang === 'hi' ? 'वैदिक AI ज्योतिषी' :
                    lang === 'gu' ? 'વૈદિક AI જ્યોતિષી' :
                    'Vedic AI Astrologer';

  const fabText = lang === 'mr' ? 'ज्योतिषाला विचारा' :
                  lang === 'hi' ? 'ज्योतिषी से पूछें' :
                  lang === 'gu' ? 'જ્યોતિષીને પૂછો' :
                  'Ask Astrologer';

  const chipsLabel = lang === 'mr' ? 'सुचवलेले प्रश्न' :
                     lang === 'hi' ? 'सुझाए गए प्रश्न' :
                     lang === 'gu' ? 'સૂચવેલા પ્રશ્નો' :
                     'Suggested Questions';

  const loadingText = lang === 'mr' ? '✨ ज्योतिषी आपल्या ग्रहांच्या योगांचे व गोचराचे विश्लेषण करत आहेत...' :
                      lang === 'hi' ? '✨ ज्योतिषी आपके ग्रह योगों एवं गोचर का विश्लेषण कर रहे हैं...' :
                      lang === 'gu' ? '✨ જ્યોતિષી તમારા ગ્રહ યોગો અને ગોચરનું વિશ્લેષણ કરી રહ્યા છે...' :
                      '✨ Astrologer is analyzing your planetary yogas & transits...';

  const inputPlaceholder = lang === 'mr' ? 'करिअर, विवाह, आरोग्य किंवा उपायांविषयी विचारा...' :
                            lang === 'hi' ? 'करियर, विवाह, स्वास्थ्य अथवा उपायों के बारे में पूछें...' :
                            lang === 'gu' ? 'કારકિર્દી, વિવાહ, સ્વાસ્થ્ય કે ઉપાયો વિશે પૂછો...' :
                            'Ask about career, marriage, remedies...';

  const askBtnText = lang === 'mr' ? 'विचारा' :
                     lang === 'hi' ? 'पूछें' :
                     lang === 'gu' ? 'પૂછો' :
                     'Ask';

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="ai-bot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open Vedic AI Astrologer"
        >
          <span className="ai-bot-fab__sparkle">✨</span>
          <span>{fabText}</span>
        </button>
      )}

      {isOpen && (
        <aside className="ai-bot-drawer" aria-label="Astrology Consultation Assistant">
          <header className="ai-bot-header">
            <div className="ai-bot-header__title-group">
              <span className="ai-bot-header__icon">🕉️</span>
              <div>
                <h3 className="ai-bot-header__name">{botTitle}</h3>
                <span className="ai-bot-header__status">● Gemini 2.0 Flash Active</span>
              </div>
            </div>
            <button
              type="button"
              className="ai-bot-header__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              ✕
            </button>
          </header>

          <div className="ai-bot-body" ref={bodyRef}>
            <div className="ai-bot-welcome">
              Namaste <strong>{personName}</strong>! I have loaded your birth chart with{' '}
              <strong>{ascendant?.sign || 'Ascendant'}</strong> Lagna and{' '}
              <strong>{moon_sign || 'Moon'}</strong> Rashi. (1 Free Question / Day):
            </div>

            {messages.length === 0 && (
              <div className="ai-bot-chips">
                <span className="ai-bot-chips-label">{chipsLabel}</span>
                <div className="ai-bot-chips-list">
                  {quickChips.map((chip, idx) => (
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

            {messages.map((msg, index) =>
              msg.sender === 'user' ? (
                <div key={index} className="ai-msg ai-msg--user">
                  {msg.text}
                </div>
              ) : (
                <BotMessageItem
                  key={index}
                  text={msg.text}
                  isLimitReached={msg.isLimitReached}
                  onOpenSupport={() => setShowSupportModal(true)}
                />
              )
            )}

            {loading && (
              <div className="ai-bot-loading">
                <span>{loadingText}</span>
              </div>
            )}
          </div>

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
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="ai-bot-send-btn"
                disabled={loading || !inputValue.trim()}
              >
                <span>{askBtnText}</span>
                <span>↗</span>
              </button>
            </form>
          </footer>
        </aside>
      )}

      {showSupportModal && (
        <div className="auth-modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="auth-modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <SupportDeveloper onClose={() => setShowSupportModal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
