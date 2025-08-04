import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SignInData } from '../lib/validations';
import { handleAuthError } from '../utils/handleError';
import { AuthForm } from '../components/AuthForm';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { AppleAuthButton } from '../components/AppleAuthButton';

export function SignIn() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleEmailSignIn = async (data: SignInData) => {
    setLoading(true);
    setError('');

    try {
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
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
      await signInWithGoogle();
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
      await signInWithApple();
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
      setAppleLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
          <p className="text-gray-600">
            Entre na sua conta para continuar gerenciando suas finanças
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-100">
          <div className="space-y-6">
            <AuthForm
              mode="signin"
              onSubmit={handleEmailSignIn}
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
              mode="signin"
              onClick={handleGoogleSignIn}
              loading={googleLoading}
            />

            <AppleAuthButton
              mode="signin"
              onClick={handleAppleSignIn}
              loading={appleLoading}
            />

            <div className="text-center">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link
                to="/signup"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Cadastre-se grátis
              </Link>
            </div>

            <div className="text-center">
              <Link
                to="/forgot-password" 
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}