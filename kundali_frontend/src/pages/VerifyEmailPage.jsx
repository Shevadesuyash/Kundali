import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './AuthPages.css';

export default function VerifyEmailPage() {
  const { lang } = useLang();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="container auth-page-container">
      <div className="auth-card verify-box">
        <div className="verify-icon">✉️</div>
        <h3>{lang === 'mr' ? 'ईमेल पडताळणी लिंक पाठवली आहे' : 'Verify Your Email'}</h3>
        <p>
          {lang === 'mr'
            ? `आम्ही ${email} वर पडताळणी लिंक पाठवली आहे. कृपया आपल्या इनबॉक्समधील लिंकवर क्लिक करून खाते सक्रिय करा.`
            : `We have sent a verification link to ${email}. Please check your inbox and click the link to activate your account.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/login" className="btn-auth-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            {lang === 'mr' ? 'लॉग इन पानावर जा' : 'Proceed to Sign In'}
          </Link>
          <Link to="/" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none' }}>
            {lang === 'mr' ? '← मुख्य पानावर परत जा' : '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
