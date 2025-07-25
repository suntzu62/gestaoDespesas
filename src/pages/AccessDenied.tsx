import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AccessDenied() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
        
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página. 
          {user?.role && (
            <span className="block mt-2 text-sm">
              Sua role atual: <span className="font-semibold text-gray-800">{user.role}</span>
            </span>
          )}
        </p>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          
          <div className="text-sm text-gray-500">
            Se você acredita que deveria ter acesso, entre em contato com o administrador.
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">BolsoZen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}