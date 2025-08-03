import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, AuthUser, UserRole } from '../lib/supabase';

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
    console.log('🔄 AuthContext: refreshUser called');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📝 AuthContext: session from getSession:', session?.user?.id || 'NO SESSION');
      setSession(session);
      
      if (session?.user) {
        console.log('👤 AuthContext: user found in session:', session.user.id, session.user.email);
        
        console.log('🔍 AuthContext: fetching profile from database...');
        
        // Get profile data from our profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('💥 AuthContext: error fetching profile:', profileError);
          console.log('⚠️ AuthContext: profile error, using fallback user data');
          
          // Set fallback user data even with profile error
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            role: 'collaborator' as UserRole,
          });
          console.log('✅ AuthContext: fallback user set due to profile error');
          return;
        }

        console.log('📋 AuthContext: profile data from DB:', profile);

        if (profile) {
          console.log('✅ AuthContext: setting user with profile data');
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatar_url,
            role: profile.role as UserRole,
          });
          console.log('👤 AuthContext: user set:', {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role
          });
        } else {
          // Fallback to auth user data
          console.log('⚠️ AuthContext: no profile found, using fallback user data');
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            role: 'collaborator' as UserRole,
          });
          console.log('✅ AuthContext: fallback user set - no profile found');
        }
      } else {
        console.log('❌ AuthContext: no user in session, setting user to null');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 AuthContext: critical error in refreshUser:', error);
      
      // Try to get session even if there was an error
      try {
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession?.user) {
          console.log('🆘 AuthContext: using emergency fallback user setup');
          setUser({
            id: fallbackSession.user.id,
            email: fallbackSession.user.email || '',
            name: fallbackSession.user.user_metadata?.full_name || fallbackSession.user.email || '',
            avatar_url: fallbackSession.user.user_metadata?.avatar_url,
            role: 'collaborator' as UserRole,
          });
          setSession(fallbackSession);
          console.log('✅ AuthContext: emergency fallback user set');
          return;
        }
      } catch (fallbackError) {
        console.error('💥💥 AuthContext: even fallback failed:', fallbackError);
      }
      
      console.log('❌ AuthContext: all options exhausted, clearing user and session');
      setUser(null);
      setSession(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  useEffect(() => {
    // Get initial session
    refreshUser().finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthContext: onAuthStateChange event:', event, 'session:', session);
        setSession(session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔐 AuthContext: SIGNED_IN or TOKEN_REFRESHED, calling refreshUser');
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AuthContext: SIGNED_OUT, setting user to null');
          setUser(null);
        }
        
        console.log('⏰ AuthContext: setting loading to false');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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