import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, AuthUser, UserRole } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has required role(s)
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(user.role);
  };

  // Get user profile from database
  const getUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      console.log('📄 [AuthContext] Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        console.log('⚠️ [AuthContext] Profile not found, will use auth user data as fallback');
        return null;
      }

      console.log('✅ [AuthContext] Profile fetched successfully:', profile.name);
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
        role: profile.role as UserRole,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  // Create user from auth user data (fallback)
  const createUserFromAuth = (authUser: User): AuthUser => {
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.email || '',
      avatar_url: authUser.user_metadata?.avatar_url,
      role: 'collaborator' as UserRole,
    };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;

    return {
      needsConfirmation: !data.session && !!data.user,
    };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    let authTimeoutId: NodeJS.Timeout;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔄 [AuthContext] Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('📊 [AuthContext] Initial session:', session ? 'EXISTS' : 'NULL');
          setSession(session);
          
          if (session?.user) {
            console.log('👤 [AuthContext] Session user found, fetching profile...');
            const profile = await getUserProfile(session.user.id);
            console.log('📄 [AuthContext] Profile fetched:', profile ? 'SUCCESS' : 'FALLBACK');
            setUser(profile || createUserFromAuth(session.user));
          } else {
            console.log('❌ [AuthContext] No session user found');
            setUser(null);
          }
          
          setLoading(false);
          console.log('✅ [AuthContext] Initial session processing complete');
          // Clear timeout if session loaded successfully
          if (sessionTimeoutId) {
            clearTimeout(sessionTimeoutId);
          }
        }
      } catch (error) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(`🔔 [AuthContext] Auth state change: ${event}`, session ? 'with session' : 'no session');
        setSession(session);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔑 [AuthContext] SIGNED_IN event - fetching profile...');
          const profile = await getUserProfile(session.user.id);
          console.log('📄 [AuthContext] Profile result:', profile ? 'SUCCESS' : 'FALLBACK');
          setUser(profile || createUserFromAuth(session.user));
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 [AuthContext] SIGNED_OUT event');
          setUser(null);
        }

        setLoading(false);
        console.log(`✅ [AuthContext] Auth state change processing complete for: ${event}`);
      }
    );

    // Additional timeout for auth state changes
    authTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth state change timeout - forcing loading to false');
        setLoading(false);
      }
    }, 12000); // 12 seconds timeout for auth state changes

    return () => {
      mounted = false;
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}