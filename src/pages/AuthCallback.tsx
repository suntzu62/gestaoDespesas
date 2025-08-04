import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase, UserRole } from '../lib/supabase';

const getRoleBasedRedirect = (role: UserRole): string => {
  switch (role) {
    case 'owner':
    case 'admin':
      return '/admin-dashboard';
    case 'collaborator':
    default:
      return '/dashboard';
  }
};

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);
          
          // Get user profile to determine role-based redirect
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            const userRole = (profile?.role as UserRole) || 'collaborator';
            const redirectTo = getRoleBasedRedirect(userRole);
            
            console.log('🎯 Redirecting to:', redirectTo);
            navigate(redirectTo, { replace: true });
          } catch (profileError) {
            console.warn('⚠️ Could not fetch profile, using default redirect');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('❌ No session found, redirecting to signin');
          navigate('/signin', { replace: true });
        }
      } catch (err: any) {
        console.error('💥 Auth callback error:', err);
        setError('Erro ao processar autenticação. Redirecionando...');
        
        // Redirect to sign in after showing error briefly
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando...</h2>
        <p className="text-gray-600">Finalizando sua autenticação</p>
      </div>
    </div>
  );
}