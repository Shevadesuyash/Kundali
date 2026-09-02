import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/* ─── Helpers ───────────────────────────────────────────────────── */
async function adminFetch(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Derive a role from a user object. Falls back to 'user'. */
function deriveRole(user) {
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@kundali.app';
  if (
    user?.id === 'local_test_user_1' ||
    user?.id === '425a7447-6bdb-4461-9d39-dda0fd4ed58f' ||
    user?.email === 'admin@kundali.app' ||
    user?.email === 'test@test.test' ||
    (ADMIN_EMAIL && user?.email === ADMIN_EMAIL)
  ) {
    return 'super_admin';
  }
  return (
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    user?.role ||
    'user'
  );
}

/* ─── Role Badge ─────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const MAP = {
    super_admin: { bg: '#c8720a', label: '🔑 super_admin' },
    admin:       { bg: '#2563eb', label: '🛡️ admin' },
    user:        { bg: '#6b7280', label: '👤 user' },
  };
  const cfg = MAP[role] || MAP.user;
  return (
    <span
      style={{
        background: cfg.bg,
        color: '#fff',
        borderRadius: '999px',
        padding: '0.15rem 0.65rem',
        fontSize: '0.74rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Users Tab ──────────────────────────────────────────────────── */
function UsersTab({ token, isSuperAdmin }) {
  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  // Reset password inline form state: { [user_id]: { open, pw, busy, msg } }
  const [resetForms, setResetForms] = useState({});
  // Change-role busy map: { [user_id]: bool }
  const [roleBusy, setRoleBusy]     = useState({});

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminFetch('/api/v1/admin/users', token);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* ── Reset password helpers ── */
  const openReset = (uid) =>
    setResetForms(f => ({ ...f, [uid]: { open: true, pw: '', busy: false, msg: '' } }));
  const closeReset = (uid) =>
    setResetForms(f => ({ ...f, [uid]: { ...f[uid], open: false, msg: '' } }));
  const updatePw = (uid, pw) =>
    setResetForms(f => ({ ...f, [uid]: { ...f[uid], pw } }));

  const submitReset = async (uid) => {
    const form = resetForms[uid];
    if (!form?.pw || form.pw.length < 6) {
      setResetForms(f => ({ ...f, [uid]: { ...f[uid], msg: '⚠️ Password must be at least 6 characters.' } }));
      return;
    }
    setResetForms(f => ({ ...f, [uid]: { ...f[uid], busy: true, msg: '' } }));
    try {
      await adminFetch(`/api/v1/admin/users/${uid}/reset-password`, token, {
        method: 'POST',
        body: JSON.stringify({ new_password: form.pw }),
      });
      setResetForms(f => ({ ...f, [uid]: { ...f[uid], busy: false, pw: '', msg: '✅ Password reset successfully.' } }));
    } catch (e) {
      setResetForms(f => ({ ...f, [uid]: { ...f[uid], busy: false, msg: `❌ ${e.message}` } }));
    }
  };

  /* ── Change role helper ── */
  const changeRole = async (uid, email, newRole) => {
    if (!window.confirm(`Change role of ${email} to "${newRole}"?`)) return;
    setRoleBusy(b => ({ ...b, [uid]: true }));
    try {
      await adminFetch(`/api/v1/admin/users/${uid}/role`, token, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole, email }),
      });
      setUsers(prev =>
        prev.map(u => u.user_id === uid ? { ...u, role: newRole } : u)
      );
    } catch (e) {
      alert('Role change failed: ' + e.message);
    } finally {
      setRoleBusy(b => ({ ...b, [uid]: false }));
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="admin-superadmin-warning">
        <span className="warning-icon">🔒</span>
        <div>
          <strong>Super Admin Access Required</strong>
          <p>The Users tab is restricted to super_admin accounts only.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="admin-section-title">👥 All Registered Users</p>

      {error && (
        <div className="admin-error-box">⚠️ {error}</div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Loading users…</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No users found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ marginBottom: '0.75rem', color: '#6b7280', fontSize: '0.85rem' }}>
            Showing {users.length} of {total} users
          </div>
          <table className="admin-profile-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Display Name</th>
                <th>Role</th>
                <th>Profiles</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const uid   = u.user_id;
                const form  = resetForms[uid] || {};
                const busy  = roleBusy[uid]   || false;
                const role  = u.role || 'user';

                return (
                  <React.Fragment key={uid}>
                    <tr>
                      {/* Email */}
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.email}</td>

                      {/* Display Name */}
                      <td style={{ fontSize: '0.83rem', color: '#44403c' }}>
                        {u.display_name || <em style={{ color: '#9ca3af' }}>—</em>}
                      </td>

                      {/* Role badge */}
                      <td><RoleBadge role={role} /></td>

                      {/* Profile count */}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#c8720a' }}>
                        {u.profile_count ?? 0}
                      </td>

                      {/* Last active */}
                      <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        {u.last_active ? u.last_active.slice(0, 10) : '—'}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="user-actions-cell">
                          {/* Reset password button */}
                          <button
                            className="btn-admin-action"
                            onClick={() => form.open ? closeReset(uid) : openReset(uid)}
                            title="Reset Password"
                          >
                            🔑 {form.open ? 'Cancel' : 'Reset Pwd'}
                          </button>

                          {/* Change role dropdown */}
                          <select
                            className="role-select"
                            value={role}
                            disabled={busy}
                            onChange={e => changeRole(uid, u.email, e.target.value)}
                            title="Change Role"
                          >
                            <option value="user">👤 user</option>
                            <option value="admin">🛡️ admin</option>
                            <option value="super_admin">🔑 super_admin</option>
                          </select>
                          {busy && <span style={{ fontSize: '0.75rem', color: '#c8720a' }}>Saving…</span>}
                        </div>
                      </td>
                    </tr>

                    {/* Inline reset password form */}
                    {form.open && (
                      <tr className="reset-pw-row">
                        <td colSpan={6}>
                          <div className="reset-pw-form">
                            <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#44403c' }}>
                              New password for <em>{u.email}</em>:
                            </span>
                            <input
                              type="password"
                              placeholder="Min 6 characters"
                              value={form.pw || ''}
                              onChange={e => updatePw(uid, e.target.value)}
                              className="reset-pw-input"
                              onKeyDown={e => e.key === 'Enter' && submitReset(uid)}
                            />
                            <button
                              className="btn-admin-save"
                              onClick={() => submitReset(uid)}
                              disabled={form.busy}
                            >
                              {form.busy ? 'Saving…' : '✅ Save'}
                            </button>
                            {form.msg && (
                              <span className={`reset-msg ${form.msg.startsWith('✅') ? 'msg-ok' : 'msg-err'}`}>
                                {form.msg}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Main AdminPage ─────────────────────────────────────────────── */
export default function AdminPage() {
  const { user, token, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab]   = useState('dashboard');
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

  // Determine role: check user metadata or app_metadata
  const role = deriveRole(user);
  const isSuperAdmin = role === 'super_admin';

  /* ── Load dashboard + profiles data ── */
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

  /* ── Delete profile ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`🗑️ Permanently delete profile "${name}" (ID #${id})? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminFetch(`/api/v1/admin/profiles/${id}`, token, { method: 'DELETE' });
      setProfiles(p => p.filter(x => x.id !== id));
      setTotal(t => t - 1);
      setStats(s => s ? { ...s, total_profiles: s.total_profiles - 1 } : s);
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  /* ── Guard: not logged in ── */
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

  /* ── Render ── */
  return (
    <div className="container admin-page">
      {/* Admin Banner */}
      <div className="admin-banner">
        <span className="admin-banner-icon">🛡️</span>
        <div>
          <h1>Admin Control Panel — Kundali Milan</h1>
          <p>
            Logged in as: <strong>{user?.email || user?.user_metadata?.full_name || user?.id}</strong>
            &nbsp;·&nbsp;
            <RoleBadge role={role} />
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-error-box" style={{ marginBottom: '1.5rem' }}>
          ⚠️ {error}
          <br /><small>If you see "Admin access required", make sure your <code>ADMIN_USER_ID</code> in <code>.env</code> matches your Supabase user ID: <strong>{user?.id}</strong></small>
        </div>
      )}

      {/* ── Tab Nav ── */}
      <div className="admin-tab-nav">
        <button
          className={`admin-tab-btn${activeTab === 'dashboard' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'profiles' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          🗃️ Profiles
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'users' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
          {!isSuperAdmin && <span className="tab-lock">🔒</span>}
        </button>
      </div>

      {/* ── Tab: Dashboard ── */}
      {activeTab === 'dashboard' && (
        <div className="admin-tab-panel">
          {loading && !stats ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Loading stats…</p>
          ) : stats ? (
            <>
              <p className="admin-section-title">📊 Overview</p>
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
            </>
          ) : null}
        </div>
      )}

      {/* ── Tab: Profiles ── */}
      {activeTab === 'profiles' && (
        <div className="admin-tab-panel">
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
              {['self', 'family', 'friend', 'partner', 'client'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.85rem' }}>
              Showing {profiles.length} of {total} profiles
            </span>
          </div>

          <p className="admin-section-title">📋 All Saved Profiles (All Users)</p>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Loading profiles…</p>
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
      )}

      {/* ── Tab: Users ── */}
      {activeTab === 'users' && (
        <div className="admin-tab-panel">
          <UsersTab token={token} isSuperAdmin={isSuperAdmin} />
        </div>
      )}
    </div>
  );
}
