import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { StickyCTA } from './components/StickyCTA';
import { trackPageView, trackEvent } from './utils/telemetry';
import { 
  TrendingUp, 
  LogOut,
  User,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleCTAClick = (source: string) => {
    trackEvent('cta_click', { source, location: 'header' });
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#como-funciona" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Como Funciona</a>
            <a href="#beneficios" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Benefícios</a>
            <a href="#depoimentos" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Depoimentos</a>
            <a href="#demo" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Demo</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/signin" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Login</a>
            <a 
              href="/signup" 
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => handleCTAClick('header')}
            >
              Comece Grátis
            </a>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <a href="#como-funciona" className="block py-3 text-gray-600 font-medium">Como Funciona</a>
            <a href="#beneficios" className="block py-3 text-gray-600 font-medium">Benefícios</a>
            <a href="#depoimentos" className="block py-3 text-gray-600 font-medium">Depoimentos</a>
            <a href="#demo" className="block py-3 text-gray-600 font-medium">Demo</a>
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <a href="/signin" className="block py-3 text-gray-600 font-medium">Login</a>
              <a 
                href="/signup" 
                className="block w-full bg-green-600 text-white px-4 py-3 rounded-xl text-center font-semibold"
                onClick={() => handleCTAClick('header-mobile')}
              >
                Comece Grátis
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const handleCTAClick = (source: string) => {
    trackEvent('cta_click', { source, location: 'footer' });
  };

  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">BolsoZen</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              A primeira plataforma de gestão financeira verdadeiramente brasileira. 
              Orçamento base zero, IA em português e integração completa com o ecossistema financeiro nacional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Instagram</span>
                📱
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">YouTube</span>
                📺
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Produto</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
              <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors">Demo Interativa</a></li>
              <li><a href="/api-docs" className="text-gray-400 hover:text-white transition-colors">API Developers</a></li>
              <li><a href="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrações</a></li>
              <li><a href="/security" className="text-gray-400 hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Empresa</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">Imprensa</a></li>
              <li><a href="/partners" className="text-gray-400 hover:text-white transition-colors">Parceiros</a></li>
              <li><a href="/investors" className="text-gray-400 hover:text-white transition-colors">Investidores</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Suporte</h3>
            <ul className="space-y-3">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              <li><a href="/whatsapp" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="/status" className="text-gray-400 hover:text-white transition-colors">Status da Plataforma</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-6 md:mb-0">
              © 2025 BolsoZen. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
            </div>
            <div className="flex space-x-6">
              <a 
                href="/signup" 
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                onClick={() => handleCTAClick('footer')}
              >
                Comece Grátis
              </a>
              <a 
                href="/signin" 
                className="border border-green-600 text-green-400 px-6 py-3 rounded-xl hover:bg-green-600 hover:text-white transition-colors font-semibold"
                onClick={() => handleCTAClick('footer-signin')}
              >
                Fazer Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
    
    if (!loading) {
      trackPageView('landing_page');
      trackEvent('hero_view', { timestamp: new Date().toISOString() });
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
      <StickyCTA />
    </div>
  );
}

export default App;