import React from 'react';
import { useLang } from '../context/LanguageContext';
import './SupportDeveloper.css';

export default function SupportDeveloper({ onClose }) {
  const { lang } = useLang();

  const titleText =
    lang === 'mr' ? '👨‍💻 विकासक परिचय आणि सहकार्य' :
    lang === 'hi' ? '👨‍💻 डेवलपर परिचय एवं सहयोग' :
    lang === 'gu' ? '👨‍💻 ડેવલપર પરિચય અને સહયોગ' :
    'Support the Developer 👨‍💻';

  const bioText =
    lang === 'mr' ? 'नमस्कार! मी सुयश दिलीप शेवडे. अचूक स्विस एफेमेरिस (लाहिरी अयनांश) आणि वैदिक सिद्धांतांवर आधारित हे कुंडली ॲप सर्वांसाठी मोफत आणि उच्च अचूकतेसह विकसित केले आहे. हे ॲप आपल्या उपयोगी पडत असल्यास आपण प्रोजेक्टला पाठबळ देऊ शकता.' :
    lang === 'hi' ? 'नमस्ते! मैं सुयश दिलीप शेवडे। सटीक स्विस एफेमेरिस (लाहिरी अयनांश) एवं वैदिक ज्योतिष सिद्धांतों पर आधारित यह कुंडली सूट उच्च सटीकता के साथ विकसित किया गया है। यदि यह आपके उपयोगी रहा हो, तो आप सहयोग कर सकते हैं।' :
    lang === 'gu' ? 'નમસ્તે! હું સુયશ દિલીપ શેવડે. સચોટ સ્વિસ એફેમેરિસ અને વૈદિક જ્યોતિષ પર આધારિત આ કુંડળી ટૂલ વિકસાવ્યું છે. જો આ તમારા માટે ઉપયોગી રહ્યું હોય તો સહયોગ આપી શકો છો.' :
    'Hi! I am Suyash Dilip Shevade, the developer behind this Kundali Milan Suite. I maintain this platform with high-precision Swiss Ephemeris calculations and AI Jyotish insights. If this tool helped you, consider supporting the project!';

  return (
    <div className="support-dev-card">
      {onClose && (
        <button type="button" className="support-dev-close" onClick={onClose}>
          ✕
        </button>
      )}

      <div className="support-dev-header">
        <div className="support-dev-avatar">
          <span>🕉️</span>
        </div>
        <div>
          <h3 className="support-dev-title">{titleText}</h3>
          <p className="support-dev-role">Suyash Dilip Shevade · Full Stack & Vedic Astrology Developer</p>
        </div>
      </div>

      <p className="support-dev-bio">{bioText}</p>

      {/* Pricing / Monetization Offerings */}
      <div className="support-tiers-grid">
        <div className="support-tier-box">
          <div className="support-tier-badge">🌟 Explorer Pack</div>
          <h4>₹49 / $0.99</h4>
          <p>50 AI Jyotish Question Credits with in-depth remedies and life guidance.</p>
        </div>

        <div className="support-tier-box support-tier-box--popular">
          <div className="support-tier-badge support-tier-badge--gold">🔥 24h Consultation Pass</div>
          <h4>₹49 / $0.99</h4>
          <p>Unlimited AI Astrologer questions for 24 hours with full chart context.</p>
        </div>

        <div className="support-tier-box">
          <div className="support-tier-badge">👑 Pro Astrologer</div>
          <h4>₹149 / mo</h4>
          <p>Unlimited Cloud Profile Sync across all devices + 150 AI questions/month.</p>
        </div>
      </div>

      {/* Donation & Social Links */}
      <div className="support-dev-actions">
        <a
          href="https://www.paypal.me/Shevadesuyash"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-donate-paypal"
        >
          <span>💳 Donate via PayPal</span>
        </a>

        <div className="support-social-links">
          <a
            href="https://github.com/Shevadesuyash"
            target="_blank"
            rel="noopener noreferrer"
            className="social-pill"
          >
            <span>🐙 GitHub: Shevadesuyash</span>
          </a>
          <a
            href="https://www.linkedin.com/in/suyash-shevade-8b07a9236/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-pill"
          >
            <span>💼 LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  );
}
