import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { API_BASE_URL } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<{ error: any }>;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// دالة مساعدة لإعادة المحاولة مع تأخير تصاعدي
const retryWithBackoff = async (fn: () => Promise<any>, maxAttempts: number = 3) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429) {
        attempt++;
        if (attempt === maxAttempts) throw error;
        const delay = Math.pow(2, attempt) * 1000; // تأخير تصاعدي (1s, 2s, 4s)
        console.log(`🔴 [RETRY] Rate limit hit, retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retry attempts reached');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionCache = useRef<Session | null>(null); // // Cache session temporarily

  useEffect(() => {
    // // Load initial session
    const loadInitialSession = async () => {
      if (sessionCache.current) {
        setSession(sessionCache.current);
        setUser(sessionCache.current?.user ?? null);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await retryWithBackoff(() =>
          supabase.auth.getSession()
        );
        sessionCache.current = session;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('🔵 [AUTH] Error loading initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialSession();

    // // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        sessionCache.current = session;
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    try {

      // Check if phone already exists
      try {
        const response = await fetch(`${API_BASE_URL}/auth/resolve-phone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });

        if (response.ok) {
          console.error('🔴 [AUTH] Phone number already registered:', phone);
          return { error: { message: 'Phone number is already registered' } };
        }
      } catch (backendError) {
        console.error('🔴 [AUTH] Backend fetch error during signup phone check:', backendError);
        return { error: { message: 'Could not connect to server to verify phone number' } };
      }

      const { data, error } = await retryWithBackoff(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              phone,
              display_name: name,
              name
            }
          }
        })
      );

      if (error) {
        console.error('🔴 [AUTH] Signup error:', error);
        return { error };
      }


      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              name,
              phone
            }
          ]);

        if (insertError) {
          console.error('🔴 [AUTH] Insert user error:', insertError);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('🔴 [AUTH] Signup exception:', err);
      return { error: err };
    }
  };

  const signIn = async (emailOrPhone: string, password: string) => {
    try {

      let email = emailOrPhone;

      if (!emailOrPhone.includes('@')) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/resolve-phone`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: emailOrPhone }),
          });

          if (!response.ok) {
            console.error('🔴 [AUTH] User not found by phone via backend');
            return { error: { message: 'Phone number is not registered' } };
          }

          const data = await response.json();
          email = data.email;
        } catch (backendError) {
          console.error('🔴 [AUTH] Backend fetch error:', backendError);
          return { error: { message: 'Could not connect to server to verify phone number' } };
        }
      }

      const { error } = await retryWithBackoff(() =>
        supabase.auth.signInWithPassword({
          email,
          password
        })
      );

      if (error) {
        console.error('🔴 [AUTH] Signin error:', error);
      }

      return { error };
    } catch (err) {
      console.error('🔴 [AUTH] Signin exception:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionCache.current = null; // إعادة تعيين التخزين المؤقت
  };

  const value = useMemo(() => ({
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};