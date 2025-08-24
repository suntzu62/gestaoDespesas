import React from 'react';
import { Play, CheckCircle, TrendingUp, Users, Award, ArrowRight, Shield, Zap, Star, Smartphone } from 'lucide-react';
import { trackEvent } from '../utils/telemetry';

export const HeroSection = () => {
  const handleCTAClick = (type: 'primary' | 'secondary') => {
    trackEvent('cta_click', { 
      source: 'hero',
      type,
      button_text: type === 'primary' ? 'Comece pelo WhatsApp' : 'Ver demo de 30s'
    });
    
    if (type === 'secondary') {
      trackEvent('demo_start', { source: 'hero' });
    }
  };

  const whatsappNumber = "5511999999999"; // Substitua pelo número real
  const whatsappMessage = encodeURIComponent("Olá! Quero organizar minhas finanças com o BolsoZen 💰");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Main Headlines */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" role="heading" aria-level={1}>
              Controle financeiro
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                direto no WhatsApp
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0" role="text">
              Envie foto do comprovante pelo WhatsApp e confirme em 1 clique. 
              IA classifica automaticamente. Veja insights no dashboard.
            </p>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Envio por WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>OCR inteligente + IA</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Confirmação em 1 clique</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Dashboard com insights</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => handleCTAClick('primary')}
                aria-label="Iniciar conversa no WhatsApp"
              >
                Comece pelo WhatsApp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button 
                className="group border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                onClick={() => handleCTAClick('secondary')}
                aria-label="Assistir demonstração do produto"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ver demo de 30s
              </button>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Ou escaneie o QR Code:
                </h3>
                <div className="w-32 h-32 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(whatsappUrl)}`}
                    alt="QR Code para WhatsApp do BolsoZen"
                    className="w-full h-full rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Aponte a câmera e inicie a conversa
                </p>
              </div>
            </div>
            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>+15.000 usuários no WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>R$ 12M+ organizados</span>
              </div>
            </div>
          </div>

          {/* Right Content - App Preview */}
          <div className="relative">
            {/* Mobile App Frame */}
            <div className="relative mx-auto max-w-sm" role="img" aria-label="Screenshot do WhatsApp BolsoZen">
              <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-300">
                <div className="bg-white rounded-2xl overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-sm">
                    <span className="font-medium">9:41</span>
                    <div className="flex gap-1" aria-label="Indicadores de bateria e sinal">
                      <div className="w-4 h-2 bg-white rounded-sm" />
                      <div className="w-1 h-2 bg-white rounded-sm" />
                    </div>
                  </div>
                  
                  {/* WhatsApp Content */}
                  <div className="bg-gray-100 min-h-96" style={{ minHeight: '384px' }}>
                    {/* WhatsApp Header */}
                    <div className="bg-green-600 text-white p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">BolsoZen</div>
                        <div className="text-xs text-green-100">online</div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-4 space-y-3">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="bg-green-500 text-white rounded-2xl px-4 py-2 max-w-xs">
                          <div className="text-sm">📱 *Foto enviada*</div>
                          <div className="text-xs text-green-100 mt-1">Comprovante iFood</div>
                        </div>
                      </div>

                      {/* Bot response */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-4 py-3 max-w-xs shadow-sm">
                          <div className="text-sm text-gray-900 mb-2">
                            ✅ Identifiquei: <b>iFood - R$ 35,90</b>
                          </div>
                          <div className="text-xs text-gray-600 mb-3">
                            Categoria sugerida: <span className="text-green-600">Alimentação</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">✅ Confirmar</button>
                            <button className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">✏️ Editar</button>
                          </div>
                        </div>
                      </div>

                      {/* Confirmation */}
                      <div className="flex justify-start">
                        <div className="bg-blue-50 rounded-2xl px-4 py-2 max-w-xs">
                          <div className="text-sm text-blue-800">
                            🎉 Transação confirmada! 
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Veja no seu dashboard →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-gray-900">Olá, Gabriel! 👋</h3>
                        <p className="text-gray-600 text-sm">Janeiro 2024</p>
                      </div>
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-white rounded-xl p-4 shadow-sm mb-6" style={{ height: '120px' }}>
                      <div className="text-center" role="region" aria-label="Saldo disponível">
                        <div className="text-2xl font-bold text-gray-900 mb-1">R$ 1.254,50</div>
                        <div className="text-green-600 text-sm font-medium">Disponível para gastos</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-3 text-center" style={{ height: '64px' }}>
                        <div className="font-bold text-gray-900">R$ 3.245</div>
                        <div className="text-xs text-gray-600">Gasto este mês</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center" style={{ height: '64px' }}>
                        <div className="font-bold text-green-600">89%</div>
                        <div className="text-xs text-gray-600">Meta atingida</div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="space-y-3" role="region" aria-label="Transações recentes">
                      <h4 className="font-medium text-gray-900 text-sm">Recentes</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3" style={{ height: '52px' }}>
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm">🍕</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">iFood</div>
                            <div className="text-xs text-gray-500">Alimentação</div>
                          </div>
                          <div className="text-red-600 font-medium text-sm">-R$ 35,90</div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3" style={{ height: '52px' }}>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">🚗</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">Uber</div>
                            <div className="text-xs text-gray-500">Transporte</div>
                          </div>
                          <div className="text-red-600 font-medium text-sm">-R$ 12,50</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 animate-bounce" style={{ width: '140px', height: '48px' }}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium">WhatsApp Bot</span>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-green-600 text-white rounded-lg shadow-lg p-3" style={{ width: '130px', height: '48px' }}>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-white" />
                <div className="text-xs font-medium">OCR + IA 🤖</div>
              </div>
            </div>

            {/* Floating badge (azul) */}
<div
  className="absolute top-1/2 -left-8 bg-blue-600 text-white rounded-lg shadow-lg p-3 transform -rotate-12"
  style={{ width: '120px', height: '48px' }}
>
  <div className="flex items-center gap-1">
    <CheckCircle className="w-4 h-4 text-white" />
    <div className="text-xs font-medium">1 clique ✨</div>
  </div>
</div>
          </div>
        </div>
    

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-20 fill-current text-white" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" style={{ height: '80px' }}>
          <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};
