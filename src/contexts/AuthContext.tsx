import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, AuthUser, UserRole, authHelpers } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;
    
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(user.role);
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const userData = await authHelpers.getCurrentUserProfile();
      setUser(userData);
      console.log('✅ User data refreshed:', userData ? userData.email : 'No user');
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      await authHelpers.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('🔔 Auth state changed:', event, session ? 'with session' : 'no session');
    
    setSession(session);
    
    if (session?.user) {
      // User is signed in, get their profile
      await refreshUser();
    } else {
      // User is signed out
      setUser(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          if (session) {
            console.log('📝 Initial session found');
            setSession(session);
            await refreshUser();
          } else {
            console.log('❌ No initial session found');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshUser, hasRole }}>
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