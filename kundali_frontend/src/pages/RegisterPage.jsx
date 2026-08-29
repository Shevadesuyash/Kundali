import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) throw error;
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <span className="auth-card-icon">🕉️</span>
          <h2>{lang === 'mr' ? 'नवीन खाते तयार करा' : 'Create an Account'}</h2>
          <p>{lang === 'mr' ? 'अमर्यादित क्लाउड प्रोफाइल्स व AI कन्सल्टेशनसाठी' : 'Save unlimited horoscopes and sync across devices'}</p>
        </div>

        {errorMsg && <div className="auth-modal-alert auth-modal-alert--error">{errorMsg}</div>}

        <button type="button" className="btn-google-auth" onClick={signInWithGoogle}>
          <span>🇬</span> {lang === 'mr' ? 'गुगलने नोंदणी करा' : 'Sign up with Google'}
        </button>

        <div className="auth-divider">
          <span>{lang === 'mr' ? 'किंवा ईमेलने' : 'or with email'}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>{lang === 'mr' ? 'ईमेल पत्ता' : 'Email Address'}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-form-group">
            <label>{lang === 'mr' ? 'पासवर्ड (किमान ६ अक्षरे)' : 'Password (min 6 characters)'}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="auth-form-group">
            <label>{lang === 'mr' ? 'पासवर्ड पुन्हा टाका' : 'Confirm Password'}</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? '...' : (lang === 'mr' ? 'नोंदणी करा' : 'Create Account')}
          </button>
        </form>

        <div className="auth-card-footer">
          <span>{lang === 'mr' ? 'आधीच खाते आहे?' : 'Already have an account?'}</span>
          <Link to="/login">{lang === 'mr' ? 'लॉग इन करा' : 'Sign In'}</Link>
        </div>
      </div>
    </div>
  );
}
