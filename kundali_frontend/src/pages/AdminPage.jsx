import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function adminFetch(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminPage() {
  const { user, token, isLoggedIn } = useAuth();

  const [stats, setStats]           = useState(null);
  const [profiles, setProfiles]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deleting, setDeleting]     = useState(null);
  const [query, setQuery]           = useState('');
  const [gender, setGender]         = useState('');
  const [tag, setTag]               = useState('');
  const [page, setPage]             = useState(1);

  const PER_PAGE = 50;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [statsData, profilesData] = await Promise.all([
        adminFetch('/api/v1/admin/stats', token),
        adminFetch(
          `/api/v1/admin/profiles?q=${encodeURIComponent(query)}&gender=${gender}&tag=${tag}&page=${page}&per_page=${PER_PAGE}`,
          token
        ),
      ]);
      setStats(statsData);
      setProfiles(profilesData.profiles || []);
      setTotal(profilesData.total || 0);
    } catch (e) {
      setError(e.message || 'Access denied or server error.');
    } finally {
      setLoading(false);
    }
  }, [token, query, gender, tag, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`🗑️ Permanently delete profile "${name}" (ID #${id})? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminFetch(`/api/v1/admin/profiles/${id}`, token);
      setProfiles(p => p.filter(x => x.id !== id));
      setTotal(t => t - 1);
      setStats(s => s ? { ...s, total_profiles: s.total_profiles - 1 } : s);
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container admin-page">
        <div className="admin-access-denied">
          <h2>🔒 Sign In Required</h2>
          <p>You must be signed in as the administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      {/* Admin Banner */}
      <div className="admin-banner">
        <span className="admin-banner-icon">🛡️</span>
        <div>
          <h1>Admin Control Panel — Kundali Milan</h1>
          <p>
            Logged in as: <strong>{user?.email || user?.user_metadata?.full_name || user?.id}</strong>
            &nbsp;·&nbsp; Full access to all user profiles
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#991b1b' }}>
          ⚠️ {error}
          <br /><small>If you see "Admin access required", make sure your <code>ADMIN_USER_ID</code> in <code>.env</code> matches your Supabase user ID: <strong>{user?.id}</strong></small>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-num">{stats.total_profiles}</span>
            <span className="stat-label">Total Profiles</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-num" style={{ color: '#1e40af' }}>{stats.male_profiles}</span>
            <span className="stat-label">♂ Male</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-num" style={{ color: '#9d174d' }}>{stats.female_profiles}</span>
            <span className="stat-label">♀ Female</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-num">{stats.unique_users}</span>
            <span className="stat-label">Registered Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-num">{stats.total_ai_queries ?? 0}</span>
            <span className="stat-label">Total AI Queries</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-num">{stats.unique_ips_queried_ai ?? 0}</span>
            <span className="stat-label">Unique IPs (AI)</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="🔍 Search by name…"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
          style={{ flex: '1 1 200px' }}
        />
        <select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
          <option value="">All Genders</option>
          <option value="male">♂ Male</option>
          <option value="female">♀ Female</option>
        </select>
        <select value={tag} onChange={e => { setTag(e.target.value); setPage(1); }}>
          <option value="">All Tags</option>
          {['self','family','friend','partner','client'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.85rem' }}>
          Showing {profiles.length} of {total} profiles
        </span>
      </div>

      {/* Profiles Table */}
      <p className="admin-section-title">📋 All Saved Profiles (All Users)</p>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Loading all profiles…</p>
      ) : profiles.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No profiles found.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-profile-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Lagna</th>
                  <th>Moon Sign</th>
                  <th>Nakshatra</th>
                  <th>Manglik</th>
                  <th>Dasha</th>
                  <th>Tag</th>
                  <th>User ID</th>
                  <th>Saved On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className={p.gender === 'male' ? 'badge-male' : 'badge-female'}>
                        {p.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </span>
                    </td>
                    <td>{p.day}/{p.month}/{p.year}</td>
                    <td>{p.lagna || '—'}</td>
                    <td>{p.moon_sign || '—'}</td>
                    <td>{p.nakshatra || '—'}</td>
                    <td>
                      {p.is_manglik
                        ? <span className="badge-manglik">⚠️ Yes</span>
                        : <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>✓ No</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{p.active_dasha || '—'}</td>
                    <td><span className="badge-tag">{p.tag || 'self'}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.user_id || <em style={{ color: '#9ca3af' }}>guest</em>}
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {p.created_at ? p.created_at.slice(0, 10) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn-admin-delete"
                        disabled={deleting === p.id}
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        {deleting === p.id ? '…' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > PER_PAGE && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: '0.5rem 1.2rem', border: '1px solid #e2d9cc', borderRadius: '8px', cursor: 'pointer' }}
              >
                ← Prev
              </button>
              <span style={{ lineHeight: '2.2', color: '#6b7280', fontSize: '0.85rem' }}>
                Page {page} of {Math.ceil(total / PER_PAGE)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / PER_PAGE)}
                style={{ padding: '0.5rem 1.2rem', border: '1px solid #e2d9cc', borderRadius: '8px', cursor: 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
