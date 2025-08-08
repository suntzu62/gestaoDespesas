import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Monitor, Smartphone } from 'lucide-react';

export const InteractiveDemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Veja o BolsoZen em ação
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Descubra como milhares de brasileiros estão transformando suas vidas financeiras 
            com nossa plataforma intuitiva e poderosa.
          </p>
          
          {/* Device Toggle */}
          <div className="inline-flex bg-white rounded-lg p-1 shadow-lg mb-8">
            <button
              onClick={() => setCurrentView('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                currentView === 'desktop' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </button>
            <button
              onClick={() => setCurrentView('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                currentView === 'mobile' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </button>
          </div>
        </div>

        {/* Demo Container */}
        <div className="relative max-w-5xl mx-auto">
          <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
            currentView === 'mobile' ? 'max-w-sm mx-auto' : ''
          }`}>
            {/* Browser/Phone Frame */}
            <div className="bg-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              {currentView === 'desktop' && (
                <div className="flex-1 bg-white rounded px-3 py-1 mx-4 text-sm text-gray-600">
                  app.bolsozen.com/dashboard
                </div>
              )}
            </div>
            
            {/* Demo Content */}
            <div className="relative bg-gradient-to-br from-green-50 to-blue-50 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Budget Overview */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Orçamento Mensal</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planejado</span>
                      <span className="font-semibold">R$ 4.500,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gasto</span>
                      <span className="font-semibold text-orange-600">R$ 3.245,50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponível</span>
                      <span className="font-semibold text-green-600">R$ 1.254,50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Transações Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        🍕
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">iFood</div>
                        <div className="text-xs text-gray-500">Alimentação</div>
                      </div>
                      <div className="text-red-600 font-semibold">-R$ 35,90</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        💰
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Salário</div>
                        <div className="text-xs text-gray-500">Renda</div>
                      </div>
                      <div className="text-green-600 font-semibold">+R$ 4.500,00</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🚗
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Uber</div>
                        <div className="text-xs text-gray-500">Transporte</div>
                      </div>
                      <div className="text-red-600 font-semibold">-R$ 12,50</div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Metas</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Viagem Europa</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">R$ 6.500 / R$ 10.000</div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Emergência</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">R$ 1.500 / R$ 5.000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                  <h3 className="font-semibold">Insights da IA</h3>
                </div>
                <p className="text-purple-100 mb-3">
                  Você gastou 23% menos em entretenimento este mês! Continue assim para atingir sua meta de viagem 2 meses mais cedo.
                </p>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Ver mais insights
                </button>
              </div>
            </div>
          </div>

          {/* Play Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur rounded-lg px-6 py-3 shadow-lg">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </button>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">2:34 / 4:12</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para transformar suas finanças?
          </h3>
          <p className="text-gray-600 mb-8">
            Junte-se a mais de 50.000 brasileiros que já dominaram seu dinheiro
          </p>
          <button className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors">
            Começar Gratuitamente
          </button>
        </div>
      </div>
    </section>
  );
};