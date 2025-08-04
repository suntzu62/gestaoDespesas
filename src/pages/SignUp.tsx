import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SignUpData } from '../lib/validations';
import { handleAuthError } from '../utils/handleError';
import { AuthForm } from '../components/AuthForm';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { AppleAuthButton } from '../components/AppleAuthButton';

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignUp = async (data: SignUpData) => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Starting email signup...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user && !authData.session) {
        // Email confirmation required
        console.log('📧 Email confirmation required');
        setSuccess(true);
      } else if (authData.session) {
        // Direct sign-in (email confirmation disabled)
        console.log('✅ Signup successful, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('SignUp Error:', err);
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      console.log('🔄 Starting Google OAuth signup...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      console.log('✅ Google OAuth initiated');
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setError('');

    try {
      console.log('🔄 Starting Apple OAuth signup...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      console.log('✅ Apple OAuth initiated');
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
      setAppleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verifique seu email</h2>
            <p className="text-gray-600 mb-6">
              Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.
            </p>
            <Link
              to="/signin"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h2>
          <p className="text-gray-600">
            Comece a gerenciar suas finanças de forma inteligente
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-100">
          <div className="space-y-6">
            <AuthForm
              mode="signup"
              onSubmit={handleEmailSignUp}
              loading={loading}
              error={error}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <GoogleAuthButton
              mode="signup"
              onClick={handleGoogleSignIn}
              loading={googleLoading}
            />

            <AppleAuthButton
              mode="signup"
              onClick={handleAppleSignIn}
              loading={appleLoading}
            />

            <div className="text-center">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link
                to="/signin"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Faça login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}