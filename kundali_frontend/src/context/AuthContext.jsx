import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isLoggedIn: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'local_user_1', email, user_metadata: { full_name: email.split('@')[0] } };
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'local_user_1', email, user_metadata: { full_name: email.split('@')[0] } };
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'local_user_1', email: 'user@gmail.com', user_metadata: { full_name: 'Vedic Seeker' } };
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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
