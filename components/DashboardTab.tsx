import React from 'react';
import { FinancialProfile, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, Calendar, CheckCircle, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  transactions: Transaction[];
}

const DashboardTab: React.FC<Props> = ({ profile, transactions }) => {
  // --- Calculations ---

  // 1. Current Month Totals
  const currentMonthTransactions = transactions; // Simplification for demo: assuming all loaded transactions are relevant
  const variableIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
  const variableExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);

  // Total Income = Profile Income + Extra Variable Income
  const totalIncome = profile.monthlyIncome + variableIncome;
  // Total Expenses = Profile Fixed + Variable Expenses
  const totalExpenses = profile.fixedExpenses + variableExpenses;
  
  const balance = totalIncome - totalExpenses;
  const debtInstallments = profile.debts.reduce((acc, d) => acc + d.monthlyInstallment, 0);
  
  // 2. Health Score Logic (Score Lastro)
  // Max 100. 
  // - Deduct points for high debt commitment (> 30% of income)
  // - Deduct points for negative balance
  // - Add points for savings rate
  let healthScore = 80; // Base score
  const debtRatio = totalIncome > 0 ? (debtInstallments / totalIncome) : 0;
  
  if (balance < 0) healthScore -= 30;
  if (debtRatio > 0.3) healthScore -= 20;
  if (debtRatio > 0.5) healthScore -= 20;
  if (balance > (totalIncome * 0.2)) healthScore += 10;
  healthScore = Math.max(0, Math.min(100, healthScore));

  let scoreColor = 'bg-emerald-500';
  let scoreText = 'Saúde Financeira Ótima';
  let scoreReason = 'Você está vivendo dentro dos seus meios.';

  if (healthScore < 70) {
    scoreColor = 'bg-yellow-500';
    scoreText = 'Atenção Necessária';
    scoreReason = 'Seus gastos fixos ou dívidas estão consumindo muito da renda.';
  }
  if (healthScore < 40) {
    scoreColor = 'bg-red-500';
    scoreText = 'Estado Crítico';
    scoreReason = 'Você está gastando mais do que ganha. Ação imediata necessária.';
  }

  // 3. Top Categories
  const categoryMap: Record<string, number> = {};
  currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.value;
  });
  
  // Add fixed expenses as a category "Fixos" if not tracked individually
  if (profile.fixedExpenses > 0) {
    categoryMap['Gastos Fixos'] = profile.fixedExpenses;
  }

  const topCategories = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 4. Alerts
  const alerts = [];
  if (balance < 0) alerts.push({ type: 'critical', text: `Você está R$ ${Math.abs(balance).toLocaleString('pt-BR')} no vermelho este mês.` });
  if (debtRatio > 0.4) alerts.push({ type: 'warning', text: '40%+ da sua renda está comprometida com dívidas.' });
  if (variableExpenses > profile.monthlyIncome * 0.5) alerts.push({ type: 'warning', text: 'Gastos variáveis estão muito altos. Cuidado com o cartão.' });

  // 5. Timeline Data (Simulation)
  const daysInMonth = 30;
  const currentDay = new Date().getDate();
  const timelineEvents = [];
  
  // Add generic "billing dates" if we have fixed expenses
  if (profile.fixedExpenses > 0) {
    timelineEvents.push({ day: 5, type: 'bill', label: 'Aluguel/Contas', value: profile.fixedExpenses * 0.6 });
    timelineEvents.push({ day: 15, type: 'bill', label: 'Cartão', value: profile.fixedExpenses * 0.4 });
  }
  // Add recent transactions
  transactions.forEach(t => {
    const d = new Date(t.date).getDate();
    timelineEvents.push({ day: d, type: t.type === 'expense' ? 'expense' : 'income', label: t.description, value: t.value });
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. Health Score Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${scoreColor} opacity-20 rounded-full blur-3xl transform translate-x-10 -translate-y-10`}></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Score Lastro</p>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {healthScore}
              <span className={`text-sm px-2 py-1 rounded-md bg-white/10 font-medium ${scoreColor.replace('bg-', 'text-')}`}>
                {scoreText}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">{scoreReason}</p>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-white/10 flex items-center justify-center">
            {healthScore >= 70 ? <CheckCircle size={32} className="text-emerald-400" /> : <AlertTriangle size={32} className={healthScore < 40 ? "text-red-400" : "text-yellow-400"} />}
          </div>
        </div>
      </div>

      {/* 2. Monthly Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><ArrowUp size={16} /></div>
            <span className="text-xs text-slate-500 font-medium">Entradas</span>
          </div>
          <p className="text-lg font-bold text-slate-800">R$ {totalIncome.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-red-100 rounded-lg text-red-600"><ArrowDown size={16} /></div>
            <span className="text-xs text-slate-500 font-medium">Saídas</span>
          </div>
          <p className="text-lg font-bold text-slate-800">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      
      {/* Balance Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Saldo Disponível</span>
            <span className={`font-bold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>R$ {balance.toLocaleString('pt-BR')}</span>
         </div>
         <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            {totalIncome > 0 && (
                <div 
                  className={`h-full rounded-full ${balance >= 0 ? 'bg-slate-800' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, (totalExpenses / totalIncome) * 100)}%` }}
                ></div>
            )}
         </div>
         <p className="text-xs text-slate-400 mt-2 text-right">
            {totalIncome > 0 ? `${Math.round((totalExpenses / totalIncome) * 100)}% da renda consumida` : 'Sem renda registrada'}
         </p>
      </div>

      {/* 3. Proactive Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" /> Alertas do Copiloto
          </h3>
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg border-l-4 text-sm ${alert.type === 'critical' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
              {alert.text}
            </div>
          ))}
        </div>
      )}

      {/* 4. Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Top Categorias</h3>
          <div className="space-y-4">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold">R$ {cat.value.toLocaleString('pt-BR')}</span>
                    {/* Simulated Trend */}
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center">
                       <TrendingUp size={10} className="mr-0.5" /> {Math.floor(Math.random() * 20) + 5}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(cat.value / totalExpenses) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Timeline (Mini Calendar) */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" /> Linha do Tempo (Este Mês)
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 15 }, (_, i) => {
             const day = i + 1; // Showing first 15 days just for visual demo
             const event = timelineEvents.find(e => e.day === day);
             const isToday = day === currentDay;
             
             return (
               <div key={day} className={`flex-shrink-0 w-16 flex flex-col items-center ${isToday ? 'opacity-100' : 'opacity-60'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">{day === currentDay ? 'Hoje' : `Dia ${day}`}</span>
                  <div className={`w-full h-24 rounded-lg border flex flex-col justify-end p-1 relative ${isToday ? 'bg-slate-50 border-emerald-500 border-2' : 'bg-white border-slate-200'}`}>
                     {event && (
                       <div 
                          className={`w-full rounded text-[8px] p-1 truncate text-center text-white mb-1 ${event.type === 'income' ? 'bg-emerald-500' : event.type === 'bill' ? 'bg-slate-600' : 'bg-red-400'}`}
                          title={`${event.label}: R$ ${event.value}`}
                        >
                          {event.value > 1000 ? `${(event.value/1000).toFixed(1)}k` : event.value}
                       </div>
                     )}
                     {!event && <div className="w-full h-1 bg-slate-100 rounded mb-1"></div>}
                  </div>
               </div>
             );
          })}
        </div>
      </div>

    </div>
  );
};

export default DashboardTab;