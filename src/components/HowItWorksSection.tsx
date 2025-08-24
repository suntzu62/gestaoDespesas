import React from 'react';
import { Mail, Smartphone, Target, ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react';
import { trackEvent } from '../utils/telemetry';

export const HowItWorksSection = () => {
  const handleCTAClick = () => {
    trackEvent('cta_click', { source: 'how_it_works', button_text: 'Começar agora' });
  };

  const steps = [
    {
      number: 1,
      icon: <Smartphone className="w-8 h-8" />,
      title: "Encaminhe comprovante",
      description: "Envie foto ou print do comprovante pelo WhatsApp. PIX, cartão, boleto - qualquer formato. Nosso OCR processa tudo automaticamente.",
      features: ["WhatsApp oficial", "OCR inteligente", "Formatos diversos"],
      image: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      number: 2,
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Confirme com 1 toque",
      description: "IA identifica valor, data e estabelecimento. Sugere categoria baseada em padrões brasileiros. Confirme ou edite direto no chat.",
      features: ["IA em português", "Sugestões contextuais", "Botões interativos"],
      image: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      number: 3,
      icon: <Target className="w-8 h-8" />,
      title: "Veja no painel",
      description: "Dashboard atualiza em tempo real. Comandos no WhatsApp (/resumo, /categorias) para consultas rápidas. Insights automáticos.",
      features: ["Dashboard realtime", "Comandos WhatsApp", "Insights automáticos"],
      image: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Como funciona em 3 etapas simples
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Setup de 5 minutos, depois tudo funciona automaticamente. 
            Sem digitação, sem complicação.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    {step.icon}
                  </div>
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900">
                  {step.title}
                </h3>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">{feature}</span>
                    </div>
                  ))}
                </div>

                {step.number === 3 && (
                  <div className="pt-4">
                    <button
                      onClick={handleCTAClick}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                      Começar agora
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="flex-1 relative">
                <div className="relative">
                  <img 
                    src={step.image}
                    alt={`Etapa ${step.number}: ${step.title}`}
                    className="w-full h-80 object-cover rounded-2xl shadow-lg"
                    loading={step.number === 1 ? "eager" : "lazy"}
                    style={{ aspectRatio: '16/9' }}
                  />
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      {step.number === 1 && (
                        <>
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">LGPD</span>
                        </>
                      )}
                      {step.number === 2 && (
                        <>
                          <Smartphone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">IA BR</span>
                        </>
                      )}
                      {step.number === 3 && (
                        <>
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Real-time</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para controlar suas finanças via WhatsApp?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Junte-se a milhares de brasileiros que controlam suas finanças pelo WhatsApp. 
              Comece hoje mesmo!
            </p>
            <button
              onClick={handleCTAClick}
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Iniciar no WhatsApp
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};