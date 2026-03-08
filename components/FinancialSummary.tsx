import React from 'react';
import { FinancialProfile } from '../types';
import { GOAL_LABELS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface Props {
  profile: FinancialProfile;
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

const FinancialSummary: React.FC<Props> = ({ profile }) => {
  // Safe formatting for currency
  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const balance = profile.monthlyIncome - profile.fixedExpenses;
  const debtTotal = profile.debts.reduce((acc, curr) => acc + curr.totalValue, 0);
  const debtMonthly = profile.debts.reduce((acc, curr) => acc + curr.monthlyInstallment, 0);
  
  const pieData = [
    { name: 'Renda', value: profile.monthlyIncome },
    { name: 'Despesas Fixas', value: profile.fixedExpenses },
    { name: 'Parcelas Dívida', value: debtMonthly },
  ];
  
  // Filter out zero values for cleaner chart
  const activePieData = pieData.filter(d => d.value > 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-2">📊</span>
        Raio-X Financeiro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Saldo Mensal Estimado</p>
            <p className={`text-2xl font-bold ${balance - debtMonthly >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatBRL(balance - debtMonthly)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              (Renda - Fixos - Parcelas)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-500 font-semibold">Dívida Total</p>
                <p className="text-lg font-bold text-slate-700">{formatBRL(debtTotal)}</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-500 font-semibold">Caixa Disponível</p>
                <p className="text-lg font-bold text-slate-700">{formatBRL(profile.currentCash)}</p>
             </div>
          </div>

          <div className="p-3 border border-dashed border-slate-300 rounded-lg">
             <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Objetivo Atual</p>
             <p className="text-md font-medium text-slate-700">{GOAL_LABELS[profile.mainGoal]}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatBRL(value)} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;