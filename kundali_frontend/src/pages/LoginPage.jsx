import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './AuthPages.css';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/profiles';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('test@test.test');
    setPassword('Test@test');
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <span className="auth-card-icon">🕉️</span>
          <h2>{lang === 'mr' ? 'खात्यामध्ये प्रवेश करा' : 'Sign In to Kundali Milan'}</h2>
          <p>{lang === 'mr' ? 'आपल्या सेव्ह केलेल्या कुंडल्या आणि क्लाउड प्रोफाइल्स' : 'Access your saved horoscopes & cloud profiles'}</p>
        </div>

        {/* Demo Account Quick-Fill Helper */}
        <div className="auth-test-badge">
          <span>⚡ <strong>Demo / Test Account:</strong></span><br />
          <span>Email: <code>test@test.test</code> | Pass: <code>Test@test</code></span><br />
          <button
            type="button"
            onClick={handleFillDemo}
            style={{ background: 'transparent', border: 'none', color: '#9c4b00', fontWeight: 'bold', cursor: 'pointer', padding: 0, textDecoration: 'underline', marginTop: '0.3rem' }}
          >
            Click to auto-fill Test Account
          </button>
        </div>

        {errorMsg && <div className="auth-modal-alert auth-modal-alert--error">{errorMsg}</div>}

        <button type="button" className="btn-google-auth" onClick={signInWithGoogle}>
          <span>🇬</span> {lang === 'mr' ? 'गुगलने लॉग इन करा' : 'Sign in with Google'}
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
            <label>{lang === 'mr' ? 'पासवर्ड' : 'Password'}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? '...' : (lang === 'mr' ? 'लॉग इन करा' : 'Sign In')}
          </button>
        </form>

        <div className="auth-card-footer">
          <span>{lang === 'mr' ? 'खाते नाही?' : "Don't have an account?"}</span>
          <Link to="/register">{lang === 'mr' ? 'नोंदणी करा' : 'Create Account'}</Link>
        </div>
      </div>
    </div>
  );
}
