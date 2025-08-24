import React from 'react';
import { Star, CheckCircle, ArrowRight, Shield, TrendingUp, Award, Smartphone } from 'lucide-react';
import { trackEvent } from '../utils/telemetry';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  verified?: boolean;
  result: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ name, role, content, rating, verified, result }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
        "{content}"
      </blockquote>
      
      {/* Result */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-green-800 font-semibold text-sm">{result}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900">{name}</div>
            {verified && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <div className="text-gray-600 text-sm">{role}</div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  const handleCTAClick = (source: string) => {
    trackEvent('cta_click', { source: 'testimonials', location: source });
  };
  
  const testimonials = [
    {
      name: "Ana Carolina Silva",
      role: "Arquiteta, São Paulo",
      content: "Agora é só tirar foto do comprovante e enviar no WhatsApp. Em 60 dias organizei R$ 3.200 que estavam bagunçados. A IA acerta a categoria quase sempre!",
      rating: 5,
      verified: true,
      result: "R$ 3.200 organizados via WhatsApp"
    },
    {
      name: "Carlos Mendes",
      role: "Desenvolvedor, Rio de Janeiro",
      content: "Muito mais prático que digitar no app! Envio print do iFood pelo WhatsApp e em 2 segundos tá categorizado. Nunca mais esqueci de lançar um gasto.",
      rating: 5,
      verified: true,
      result: "100% dos gastos capturados"
    },
    {
      name: "Juliana Costa",
      role: "Consultora, Belo Horizonte",
      content: "O comando /resumo me dá o status das finanças na hora. Em 3 meses consegui formar minha reserva só organizando melhor com WhatsApp + dashboard.",
      rating: 5,
      verified: true,
      result: "Controle total em 90 dias"
    }
  ];

  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Resultados reais de quem usa
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja como mais de 25.000 brasileiros transformaram suas vidas financeiras 
            com automação inteligente
          </p>
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">R$ 12M</div>
            <div className="text-gray-600">Economia total dos usuários</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">R$ 847</div>
            <div className="text-gray-600">Economia média em 60 dias</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">83%</div>
            <div className="text-gray-600">Criam reserva de emergência</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">4.8★</div>
            <div className="text-gray-600">Avaliação nas lojas</div>
          </div>
        </div>

        {/* Trust & Security */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Segurança e Compliance</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seus dados são protegidos com os mais altos padrões de segurança bancária 
              e compliance total com LGPD
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">LGPD</div>
              <div className="text-gray-600 text-xs">Compliance Total</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">PIX</div>
              <div className="text-gray-600 text-xs">Integração Oficial</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">OPEN FINANCE</div>
              <div className="text-gray-600 text-xs">Banco Central</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">CERTIFICADO</div>
              <div className="text-gray-600 text-xs">Segurança Bancária</div>
            </div>
          </div>
        </div>

        {/* Bank Integration Logos (simulated) */}
        <div className="text-center mb-16">
          <div className="text-gray-500 text-lg font-medium mb-8">Integra com os principais bancos:</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-red-600 font-bold text-lg">Santander</div>
              <div className="text-xs text-gray-500">Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 font-bold text-lg">Banco do Brasil</div>
              <div className="text-xs text-gray-500">Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-bold text-lg">Caixa</div>
              <div className="text-xs text-gray-500">Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-purple-600 font-bold text-lg">Nubank</div>
              <div className="text-xs text-gray-500">Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-orange-500 font-bold text-lg">Inter</div>
              <div className="text-xs text-gray-500">Conectado</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-bold text-lg">+15 bancos</div>
              <div className="text-xs text-gray-500">E crescendo</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <button
            onClick={() => handleCTAClick('testimonials-bottom')}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-lg"
          >
            Começar minha transformação financeira
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Sem cartão • Sem compromisso • Resultados em 30 dias
          </p>
        </div>
      </div>
    </section>
  );
};