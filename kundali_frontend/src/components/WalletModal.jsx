import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { getUserWallet } from '../api/kundaliApi';
import './WalletModal.css';

export default function WalletModal({ isOpen, onClose }) {
  const { isLoggedIn, user } = useAuth();
  const { lang } = useLang();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getUserWallet()
      .then((data) => setWallet(data))
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="wallet-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="wallet-modal-header">
          <div className="wallet-modal-icon">🪙</div>
          <div>
            <h2>{lang === 'mr' ? 'ज्योतिष वॉलेट आणि प्लॅन्स' : lang === 'hi' ? 'ज्योतिष वॉलेट एवं प्लान्स' : 'Astro Wallet & Plans'}</h2>
            <p className="wallet-modal-subtitle">
              {isLoggedIn ? (
                <span>Account: <strong>{user?.email}</strong></span>
              ) : (
                <span>Guest mode · Sign in to link purchased packs to your cloud account</span>
              )}
            </p>
          </div>
        </div>

        {/* Current Active Quota Banner */}
        <div className="wallet-status-banner">
          {loading ? (
            <p className="wallet-loading-text">Loading wallet status…</p>
          ) : wallet?.is_unlimited ? (
            <div className="wallet-pass-active">
              <span className="pass-badge">🔥 24-Hour Pass Active</span>
              <p>Unlimited AI Jyotish Questions active until: <strong>{new Date(wallet.unlimited_until).toLocaleString()}</strong></p>
            </div>
          ) : (
            <div className="wallet-balance-row">
              <div className="wallet-balance-item">
                <span className="balance-label">AI Question Credits</span>
                <span className="balance-value">{wallet?.credits ?? 0}</span>
              </div>
              <div className="wallet-balance-divider" />
              <div className="wallet-balance-item">
                <span className="balance-label">Daily Free Guest Question</span>
                <span className={`balance-value ${wallet?.free_daily_available ? 'text-green' : 'text-orange'}`}>
                  {wallet?.free_daily_available ? '✓ 1 Available' : '⏳ Used (Resets 24h)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="wallet-plans-section">
          <h3>🌟 Choose an Astrological Pack</h3>
          <div className="wallet-plans-grid">
            {/* Plan 1: Explorer */}
            <div className="wallet-plan-card">
              <div className="plan-badge">Most Flexible</div>
              <h4>Explorer Pack</h4>
              <div className="plan-price">₹49 <span>/ 50 Qs</span></div>
              <ul className="plan-features">
                <li>✨ 50 in-depth AI Jyotish Questions</li>
                <li>🔮 Full Mahadasha & Transit context</li>
                <li>💎 Astrological gemstone remedies</li>
                <li>⏳ Never expires (Lifetime validity)</li>
              </ul>
              <a
                href="https://www.paypal.me/Shevadesuyash"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-select-plan"
              >
                💳 Get 50 Credits (₹49)
              </a>
            </div>

            {/* Plan 2: 24h Pass */}
            <div className="wallet-plan-card wallet-plan-card--featured">
              <div className="plan-badge plan-badge--gold">🔥 Most Popular</div>
              <h4>24-Hour Pass</h4>
              <div className="plan-price">₹49 <span>/ 24 Hours</span></div>
              <ul className="plan-features">
                <li>⚡ <strong>Unlimited</strong> AI Consultation for 24h</li>
                <li>🪐 Live Kundali Milan compatibility</li>
                <li>🎯 Immediate real-time answers</li>
                <li>📜 Detailed chart & dosha breakdown</li>
              </ul>
              <a
                href="https://www.paypal.me/Shevadesuyash"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-select-plan btn-select-plan--gold"
              >
                ⚡ Activate 24h Pass (₹49)
              </a>
            </div>

            {/* Plan 3: Pro Monthly */}
            <div className="wallet-plan-card">
              <div className="plan-badge">Professional</div>
              <h4>Pro Astrologer</h4>
              <div className="plan-price">₹149 <span>/ month</span></div>
              <ul className="plan-features">
                <li>☁️ Unlimited Cloud Profile Storage</li>
                <li>👥 Multi-profile bulk matchmaking</li>
                <li>🌟 150 AI Questions every month</li>
                <li>👑 Priority calculations & updates</li>
              </ul>
              <a
                href="https://www.paypal.me/Shevadesuyash"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-select-plan"
              >
                👑 Subscribe (₹149/mo)
              </a>
            </div>
          </div>
        </div>

        <div className="wallet-footer-note">
          <span>🔒 Secure Instant Activation · UPI & International Cards Supported via PayPal</span>
        </div>
      </div>
    </div>
  );
}
