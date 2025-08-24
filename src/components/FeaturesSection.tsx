import React from 'react';
import { Inbox, FileText, CreditCard, ArrowRight, Zap, Clock, Shield, CheckCircle } from 'lucide-react';
import { trackEvent } from '../utils/telemetry';

export const FeaturesSection = () => {
  const handleCTAClick = (source: string) => {
    trackEvent('cta_click', { source: 'features', location: source });
  };
  
  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "WhatsApp como interface principal",
      description: "Envie comprovantes (foto/print) pelo WhatsApp. OCR + IA processam automaticamente. Confirme com botões interativos no chat.",
      badge: "WhatsApp Bot",
      metrics: "1 toque para confirmar",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "OCR + IA em português",
      description: "Reconhecimento ótico treinado para comprovantes brasileiros. Identifica valores, datas, estabelecimentos e sugere categorias.",
      badge: "OCR BR",
      metrics: "95% de precisão",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Dashboard com insights",
      description: "Visualize seus gastos por categoria, evolução mensal e metas. Use comandos /resumo direto no WhatsApp para consultas rápidas.",
      badge: "Insights IA",
      metrics: "Comandos instantâneos",
      color: "from-purple-500 to-purple-600",
      isRoadmap: false
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Automação financeira que funciona
            <span className="block text-green-600">para o seu dia a dia</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pare de perder tempo digitando gastos. O BolsoZen automatiza a captura 
            e você foca no que importa: suas metas financeiras.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl transition-all hover:shadow-xl group cursor-pointer ${
                feature.isRoadmap 
                  ? 'bg-white border-2 border-dashed border-purple-300 hover:border-purple-500' 
                  : 'bg-white border border-gray-100 hover:border-green-200'
              }`}
            >
              {/* Badge */}
              <div className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-semibold ${
                feature.isRoadmap 
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {feature.badge}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br ${feature.color}`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              {/* Metrics */}
              <div className={`flex items-center gap-2 text-sm font-medium ${
                feature.isRoadmap ? 'text-purple-600' : 'text-green-600'
              }`}>
                <Zap className="w-4 h-4" />
                {feature.metrics}
              </div>
              
              {/* Additional benefits for non-roadmap items */}
              {!feature.isRoadmap && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Economia de tempo diária</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>100% seguro e auditável</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={() => handleCTAClick('features-bottom')}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            Experimentar automação grátis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};