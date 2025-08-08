import React from 'react';
import { BookOpen, Video, Users, Download, ArrowRight, Clock, Star } from 'lucide-react';

export const EducationalResourcesSection = () => {
  const resources = [
    {
      type: 'article',
      title: 'Orçamento Base Zero: Guia Completo para Brasileiros',
      description: 'Aprenda a técnica que revolucionou o controle financeiro mundial, adaptada à realidade brasileira.',
      duration: '8 min de leitura',
      category: 'Orçamento',
      image: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: true
    },
    {
      type: 'video',
      title: 'Como Usar o Pix para Controlar Gastos',
      description: 'Vídeo prático mostrando como integrar transações Pix ao seu planejamento financeiro.',
      duration: '12 min',
      category: 'Tecnologia',
      image: 'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: false
    },
    {
      type: 'guide',
      title: 'Planilha de Controle Financeiro (Download Grátis)',
      description: 'Template profissional para quem está começando no controle financeiro.',
      duration: 'Download',
      category: 'Ferramentas',
      image: 'https://images.pexels.com/photos/6863515/pexels-photo-6863515.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: false
    },
    {
      type: 'webinar',
      title: 'Workshop: Metas Financeiras que Funcionam',
      description: 'Aprenda a definir e alcançar suas metas financeiras usando técnicas comprovadas.',
      duration: '45 min',
      category: 'Metas',
      image: 'https://images.pexels.com/photos/7821513/pexels-photo-7821513.jpeg?auto=compress&cs=tinysrgb&w=400',
      popular: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'guide': return <Download className="w-5 h-5" />;
      case 'webinar': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Artigo';
      case 'video': return 'Vídeo';
      case 'guide': return 'Guia';
      case 'webinar': return 'Workshop';
      default: return 'Conteúdo';
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Academia Financeira BolsoZen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Conteúdo gratuito e de qualidade para você dominar suas finanças. 
            Artigos, vídeos, planilhas e workshops criados por especialistas.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
              Todos
            </button>
            <button className="bg-white text-gray-600 px-6 py-2 rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors">
              Orçamento
            </button>
            <button className="bg-white text-gray-600 px-6 py-2 rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors">
              Investimentos
            </button>
            <button className="bg-white text-gray-600 px-6 py-2 rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors">
              Metas
            </button>
            <button className="bg-white text-gray-600 px-6 py-2 rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors">
              Tecnologia
            </button>
          </div>
        </div>

        {/* Featured Resources */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative">
                <img 
                  src={resource.image} 
                  alt={resource.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    {getIcon(resource.type)}
                    {getTypeLabel(resource.type)}
                  </span>
                  {resource.popular && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {resource.duration}
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-green-600 text-sm font-medium mb-2">{resource.category}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-medium text-sm group-hover:underline">
                    Ler mais
                  </span>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Receba conteúdo exclusivo toda semana
          </h3>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Dicas práticas, planilhas gratuitas e novidades do mundo financeiro 
            direto na sua caixa de entrada. Sem spam, apenas conteúdo de qualidade.
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap">
              Inscrever-se
            </button>
          </div>
          
          <p className="text-green-200 text-sm mt-4">
            📧 +15.000 pessoas já recebem nossas dicas semanais
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
            <div className="text-gray-600">Artigos publicados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Vídeos tutoriais</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
            <div className="text-gray-600">Planilhas gratuitas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
            <div className="text-gray-600">Workshops mensais</div>
          </div>
        </div>
      </div>
    </section>
  );
};