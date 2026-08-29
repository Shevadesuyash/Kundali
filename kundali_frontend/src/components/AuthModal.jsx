import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, promptMessage }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { lang } = useLang();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        setSuccessMsg(lang === 'mr' ? 'नोंदणी यशस्वी! कृपया लॉग इन करा.' : 'Account created successfully! You are now logged in.');
        setTimeout(() => onClose(), 1200);
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="auth-modal-header">
          <span className="auth-modal-icon">🕉️</span>
          <h3>{isSignUp ? (lang === 'mr' ? 'नवीन खाते तयार करा' : 'Create Account') : (lang === 'mr' ? 'लॉग इन करा' : 'Welcome to Kundali Milan')}</h3>
          {promptMessage && <p className="auth-modal-prompt">{promptMessage}</p>}
        </div>

        {errorMsg && <div className="auth-modal-alert auth-modal-alert--error">{errorMsg}</div>}
        {successMsg && <div className="auth-modal-alert auth-modal-alert--success">{successMsg}</div>}

        <button type="button" className="btn-google-auth" onClick={handleGoogle}>
          <span>🇬</span> {lang === 'mr' ? 'गुगलने सुरू करा' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>{lang === 'mr' ? 'किंवा ईमेलने' : 'or with email'}</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{lang === 'mr' ? 'ईमेल' : 'Email Address'}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label>{lang === 'mr' ? 'पासवर्ड' : 'Password'}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? '...' : isSignUp ? (lang === 'mr' ? 'नोंदणी करा' : 'Sign Up') : (lang === 'mr' ? 'लॉग इन' : 'Sign In')}
          </button>
        </form>

        <div className="auth-modal-footer">
          {isSignUp ? (
            <p>
              {lang === 'mr' ? 'आधीच खाते आहे?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setIsSignUp(false)}>
                {lang === 'mr' ? 'लॉग इन करा' : 'Sign In'}
              </button>
            </p>
          ) : (
            <p>
              {lang === 'mr' ? 'खाते नाही?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => setIsSignUp(true)}>
                {lang === 'mr' ? 'नवीन खाते तयार करा' : 'Sign Up'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
