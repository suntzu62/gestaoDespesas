import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, PiggyBank, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetData {
  income: string;
  rent: string;
  food: string;
  transport: string;
  entertainment: string;
  others: string;
}

export const BudgetSimulator = () => {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    income: '',
    rent: '',
    food: '',
    transport: '',
    entertainment: '',
    others: ''
  });
  const [results, setResults] = useState<{
    totalExpenses: number;
    available: number;
    savingsPercentage: number;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    calculateBudget();
  }, [budgetData]);

  const calculateBudget = () => {
    const income = parseFloat(budgetData.income.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const expenses = [
      budgetData.rent,
      budgetData.food,
      budgetData.transport,
      budgetData.entertainment,
      budgetData.others
    ].reduce((total, expense) => {
      const value = parseFloat(expense.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      return total + value;
    }, 0);

    const available = income - expenses;
    const savingsPercentage = income > 0 ? (available / income) * 100 : 0;

    let recommendation = '';
    if (savingsPercentage >= 20) {
      recommendation = 'Excelente! Você tem uma ótima taxa de poupança.';
    } else if (savingsPercentage >= 10) {
      recommendation = 'Bom início! Tente aumentar sua poupança para 20%.';
    } else if (savingsPercentage >= 0) {
      recommendation = 'Atenção! Sua poupança está baixa. Revise seus gastos.';
    } else {
      recommendation = 'Alerta! Você está gastando mais do que ganha.';
    }

    setResults({
      totalExpenses: expenses,
      available,
      savingsPercentage,
      recommendation
    });
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return numericValue ? formattedValue : '';
  };

  const handleInputChange = (field: keyof BudgetData, value: string) => {
    const formatted = formatCurrency(value);
    setBudgetData(prev => ({ ...prev, [field]: formatted }));
  };

  const getSavingsIcon = () => {
    if (!results) return <Calculator className="w-6 h-6" />;
    if (results.savingsPercentage >= 20) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (results.savingsPercentage >= 10) return <TrendingUp className="w-6 h-6 text-blue-600" />;
    if (results.savingsPercentage >= 0) return <PiggyBank className="w-6 h-6 text-yellow-600" />;
    return <AlertTriangle className="w-6 h-6 text-red-600" />;
  };

  const getSavingsColor = () => {
    if (!results) return 'text-gray-600';
    if (results.savingsPercentage >= 20) return 'text-green-600';
    if (results.savingsPercentage >= 10) return 'text-blue-600';
    if (results.savingsPercentage >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simule seu orçamento
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra quanto você poderia economizar usando o método de orçamento base zero do BolsoZen
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-green-600" />
                Seus dados financeiros
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renda mensal líquida
                  </label>
                  <input
                    type="text"
                    value={budgetData.income}
                    onChange={(e) => handleInputChange('income', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: R$ 5.000,00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moradia
                    </label>
                    <input
                      type="text"
                      value={budgetData.rent}
                      onChange={(e) => handleInputChange('rent', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="R$ 1.200,00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alimentação
                    </label>
                    <input
                      type="text"
                      value={budgetData.food}
                      onChange={(e) => handleInputChange('food', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="R$ 800,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transporte
                    </label>
                    <input
                      type="text"
                      value={budgetData.transport}
                      onChange={(e) => handleInputChange('transport', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="R$ 300,00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entretenimento
                    </label>
                    <input
                      type="text"
                      value={budgetData.entertainment}
                      onChange={(e) => handleInputChange('entertainment', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="R$ 200,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outros gastos
                  </label>
                  <input
                    type="text"
                    value={budgetData.others}
                    onChange={(e) => handleInputChange('others', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="R$ 500,00"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                {getSavingsIcon()}
                Seu potencial de economia
              </h3>

              {results && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-gray-600">Total de gastos</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {results.totalExpenses.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-gray-600">Disponível</div>
                      <div className={`text-2xl font-bold ${getSavingsColor()}`}>
                        {results.available.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Taxa de poupança</span>
                      <span className={`text-2xl font-bold ${getSavingsColor()}`}>
                        {results.savingsPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          results.savingsPercentage >= 20 ? 'bg-green-500' :
                          results.savingsPercentage >= 10 ? 'bg-blue-500' :
                          results.savingsPercentage >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, results.savingsPercentage))}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Recomendação:</h4>
                    <p className="text-gray-600 mb-4">{results.recommendation}</p>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Com o BolsoZen você poderia:</h5>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Automatizar categorização de gastos</li>
                        <li>• Receber alertas antes de estourar o orçamento</li>
                        <li>• Definir metas inteligentes de economia</li>
                        <li>• Acompanhar progresso em tempo real</li>
                      </ul>
                    </div>
                  </div>

                  <button className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors">
                    Criar Meu Orçamento Grátis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};