import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './AuthModal.css';

export default function UserSettingsModal({ isOpen, onClose }) {
  const { user, isOfflineMode } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!newPassword || newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      if (isOfflineMode || user?.id === 'local_test_user_1') {
        // Mock mode for local dev test user
        await new Promise((r) => setTimeout(r, 600));
        setStatus({
          type: 'success',
          message: 'Password updated (mock mode for local test user).',
        });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        setStatus({
          type: 'success',
          message: 'Your password has been updated successfully!',
        });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to update password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon">⚙️</div>
          <h2>Account Settings</h2>
          <p className="auth-modal-subtitle">
            Manage credentials for <strong>{user?.email || 'your account'}</strong>
          </p>
        </div>

        {status.message && (
          <div
            className={`auth-alert ${status.type === 'error' ? 'auth-alert--error' : 'auth-alert--success'}`}
            style={{ marginBottom: '1rem' }}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="settings-new-password">New Password</label>
            <input
              id="settings-new-password"
              type="password"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="settings-confirm-password">Confirm New Password</label>
            <input
              id="settings-confirm-password"
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
