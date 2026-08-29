import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  token: null,
  loading: true,
  isLoggedIn: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

const TEST_EMAIL = 'test@test.test';
const TEST_PASS = 'Test@test';
const TEST_TOKEN = 'mock_jwt_test_user_token_123';
const TEST_USER = {
  id: 'local_test_user_1',
  email: 'test@test.test',
  user_metadata: { full_name: 'Test Vedic Astrologer' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session/token
    const savedToken = localStorage.getItem('kundali_auth_token');
    const savedUser = localStorage.getItem('kundali_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('kundali_auth_token');
        localStorage.removeItem('kundali_auth_user');
      }
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setToken(session.access_token);
        localStorage.setItem('kundali_auth_token', session.access_token);
        localStorage.setItem('kundali_auth_user', JSON.stringify(session.user));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setToken(session.access_token);
        localStorage.setItem('kundali_auth_token', session.access_token);
        localStorage.setItem('kundali_auth_user', JSON.stringify(session.user));
      } else if (!localStorage.getItem('kundali_auth_token')?.startsWith('mock_jwt_')) {
        setSession(null);
        setUser(null);
        setToken(null);
        localStorage.removeItem('kundali_auth_token');
        localStorage.removeItem('kundali_auth_user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    // 1. Check local test fallback credentials
    if (email.trim().toLowerCase() === TEST_EMAIL && password === TEST_PASS) {
      setUser(TEST_USER);
      setToken(TEST_TOKEN);
      localStorage.setItem('kundali_auth_token', TEST_TOKEN);
      localStorage.setItem('kundali_auth_user', JSON.stringify(TEST_USER));
      return { data: { user: TEST_USER, session: { access_token: TEST_TOKEN } }, error: null };
    }

    if (!isSupabaseConfigured) {
      // Offline fallback mode for any user
      const mockUser = { id: `local_${Date.now()}`, email, user_metadata: { full_name: email.split('@')[0] } };
      const mockToken = `mock_jwt_${mockUser.id}`;
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('kundali_auth_token', mockToken);
      localStorage.setItem('kundali_auth_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data?.session) {
      setSession(res.data.session);
      setUser(res.data.user);
      setToken(res.data.session.access_token);
      localStorage.setItem('kundali_auth_token', res.data.session.access_token);
      localStorage.setItem('kundali_auth_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const signUpWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: `local_${Date.now()}`, email, user_metadata: { full_name: email.split('@')[0] } };
      const mockToken = `mock_jwt_${mockUser.id}`;
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('kundali_auth_token', mockToken);
      localStorage.setItem('kundali_auth_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setUser(TEST_USER);
      setToken(TEST_TOKEN);
      localStorage.setItem('kundali_auth_token', TEST_TOKEN);
      localStorage.setItem('kundali_auth_user', JSON.stringify(TEST_USER));
      return { data: { user: TEST_USER }, error: null };
    }
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profiles`,
      },
    });
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setSession(null);
    setToken(null);
    localStorage.removeItem('kundali_auth_token');
    localStorage.removeItem('kundali_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        loading,
        isLoggedIn: Boolean(user),
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
