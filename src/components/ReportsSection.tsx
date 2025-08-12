import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReportsSectionProps {
  currentDate: Date;
}

export function ReportsSection({ currentDate }: ReportsSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [balanceEvolution, setBalanceEvolution] = useState<any[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const fetchReportsData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');

    try {
      const [spending, evolution, comparison] = await Promise.all([
        financeQueries.getSpendingByCategory(user.id, currentMonth),
        financeQueries.getBalanceEvolution(user.id, 6),
        financeQueries.getBudgetVsActual(user.id, currentMonth),
      ]);

      setSpendingByCategory(spending);
      setBalanceEvolution(evolution);
      setBudgetVsActual(comparison);
    } catch (err: any) {
      console.error('Error fetching reports data:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [user?.id, currentMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          {label && <p className="font-medium text-gray-900">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            Valor: {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / spendingByCategory.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando relatórios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchReportsData}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Spending by Category - Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <PieChartIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Distribuição de Gastos por Categoria
          </h3>
        </div>
        
        {spendingByCategory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PieChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum gasto registrado para este mês</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Balance Evolution - Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Evolução do Saldo (Últimos 6 meses)
          </h3>
        </div>
        
        {balanceEvolution.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Dados insuficientes para gráfico de evolução</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Despesas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Saldo Líquido"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Budget vs Actual - Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Orçamento vs. Gasto Real
          </h3>
        </div>
        
        {budgetVsActual.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum orçamento definido para este mês</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="orçado" fill="#8B5CF6" name="Orçado" />
                <Bar dataKey="gasto" fill="#EF4444" name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}