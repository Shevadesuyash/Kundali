import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './AuthPages.css';

export default function VerifyEmailPage() {
  const { lang } = useLang();
  const { resendVerificationEmail } = useAuth();
  const location = useLocation();
  const [emailInput, setEmailInput] = useState(location.state?.email || '');
  const isUnconfirmed = Boolean(location.state?.unconfirmed);

  const [resending, setResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async (e) => {
    e?.preventDefault();
    if (!emailInput.trim() || cooldown > 0) return;

    setResending(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await resendVerificationEmail(emailInput.trim());
      if (res?.error) throw res.error;
      setSuccessMsg(
        lang === 'mr'
          ? 'पडताळणी लिंक पुन्हा पाठवली आहे! कृपया आपला ईमेल इनबॉक्स आणि स्पॅम फोल्डर तपासा.'
          : 'Verification link resent successfully! Please check your inbox and spam folder.'
      );
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card verify-box">
        <div className="verify-icon">✉️</div>
        <h2>
          {isUnconfirmed
            ? (lang === 'mr' ? 'ईमेल पडताळणी आवश्यक आहे' : 'Email Verification Required')
            : (lang === 'mr' ? 'ईमेल पडताळणी लिंक पाठवली आहे' : 'Verify Your Email')}
        </h2>

        {isUnconfirmed ? (
          <p style={{ color: '#b45309', background: '#fef3c7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'mr'
              ? 'आपले खाते अद्याप पडताळलेले नाही. लॉग इन करण्यापूर्वी कृपया आपला ईमेल पडताळा.'
              : 'Your email address has not been verified yet. Please confirm your email before signing in.'}
          </p>
        ) : (
          <p>
            {lang === 'mr'
              ? `आम्ही ${emailInput ? emailInput : 'आपल्या ईमेल'} वर पडताळणी लिंक पाठवली आहे. कृपया इनबॉक्समधील लिंकवर क्लिक करून खाते सक्रिय करा.`
              : `We have sent a verification link to ${emailInput ? emailInput : 'your email'}. Please check your inbox and click the link to activate your account.`}
          </p>
        )}

        {successMsg && (
          <div className="auth-modal-alert" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem' }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="auth-modal-alert auth-modal-alert--error" style={{ marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Email input field if missing or editable */}
        {!emailInput && (
          <div className="auth-form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label>{lang === 'mr' ? 'आपला ईमेल पत्ता' : 'Your Email Address'}</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !emailInput.trim()}
            style={{ padding: '10px 16px', fontSize: '0.92rem' }}
          >
            {resending
              ? (lang === 'mr' ? 'पाठवत आहे...' : 'Sending link...')
              : cooldown > 0
              ? `${lang === 'mr' ? 'पुन्हा पाठवा' : 'Resend Link'} (${cooldown}s)`
              : (lang === 'mr' ? '🔄 पडताळणी लिंक पुन्हा पाठवा' : '🔄 Resend Verification Email')}
          </button>

          <Link to="/login" className="btn-auth-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}>
            {lang === 'mr' ? 'लॉग इन पानावर परत जा' : 'Proceed to Sign In'}
          </Link>
          <Link to="/" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', marginTop: '4px' }}>
            {lang === 'mr' ? '← मुख्य पानावर परत जा' : '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
