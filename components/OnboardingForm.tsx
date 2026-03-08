import React, { useState } from 'react';
import { FinancialProfile, GoalType, Debt } from '../types';
import { Plus, Trash2, ArrowRight, TrendingUp, ShieldAlert, PieChart, Briefcase, X } from 'lucide-react';

interface Props {
  onSubmit: (profile: FinancialProfile) => void;
  onSkip: () => void;
}

const OnboardingForm: React.FC<Props> = ({ onSubmit, onSkip }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<FinancialProfile>({
    monthlyIncome: 0,
    incomeVaries: false,
    fixedExpenses: 0,
    debts: [],
    currentCash: 0,
    mainGoal: GoalType.ORGANIZACAO, // Default
    bankContext: ''
  });

  const [currentDebt, setCurrentDebt] = useState<Debt>({
    id: '',
    description: '',
    totalValue: 0,
    monthlyInstallment: 0,
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const addDebt = () => {
    if (!currentDebt.description || currentDebt.totalValue <= 0) return;
    setProfile(prev => ({
      ...prev,
      debts: [...prev.debts, { ...currentDebt, id: Date.now().toString() }]
    }));
    setCurrentDebt({ id: '', description: '', totalValue: 0, monthlyInstallment: 0 });
  };

  const removeDebt = (id: string) => {
    setProfile(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };

  const handleSubmit = () => {
    onSubmit(profile);
  };

  // Helper to render Goal Cards
  const GoalCard = ({ type, icon: Icon, title, desc }: any) => (
    <button
      onClick={() => {
        setProfile({...profile, mainGoal: type});
        setTimeout(handleNext, 150); // Auto advance slightly
      }}
      className={`text-left w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 hover:shadow-md ${
        profile.mainGoal === type 
          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
          : 'border-slate-100 bg-white hover:border-emerald-200'
      }`}
    >
      <div className={`p-3 rounded-lg ${profile.mainGoal === type ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className={`font-bold ${profile.mainGoal === type ? 'text-emerald-900' : 'text-slate-800'}`}>{title}</h3>
        <p className="text-sm text-slate-500 mt-1 leading-snug">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto border border-slate-100 relative">
      {/* Skip Button */}
      <button 
        onClick={onSkip}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-1 transition"
      >
        Pular Configuração <X size={16} />
      </button>

      <div className="mb-6 pr-20">
        <div className="flex justify-between items-center text-sm font-medium text-slate-400 mb-2">
           <span>Diagnóstico Inicial</span>
           <span>Passo {step} de 4</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      {/* STEP 1: GOAL SELECTION (MOVED TO FRONT) */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Qual seu objetivo hoje?</h2>
            <p className="text-slate-600">Isso define como montarei seu plano.</p>
          </div>
          
          <div className="space-y-3">
            <GoalCard 
              type={GoalType.ORGANIZACAO} 
              icon={PieChart}
              title="Organização das Contas" 
              desc="Quero ter clareza para onde meu dinheiro vai e parar de desperdiçar."
            />
            <GoalCard 
              type={GoalType.SAIR_DO_VERMELHO} 
              icon={ShieldAlert}
              title="Sair do Vermelho" 
              desc="Estou com dívidas ou contas atrasadas e preciso de um plano de resgate."
            />
            <GoalCard 
              type={GoalType.INVESTIR_BOLSA} 
              icon={TrendingUp}
              title="Investir na Bolsa" 
              desc="Já tenho reserva e quero multiplicar meu patrimônio com ativos."
            />
            <GoalCard 
              type={GoalType.INVESTIR_NEGOCIO} 
              icon={Briefcase}
              title="Investir em Negócio" 
              desc="Quero preparar meu caixa para empreender ou expandir minha empresa."
            />
          </div>
        </div>
      )}

      {/* STEP 2: INCOME */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">Sua Renda</h2>
          <p className="text-slate-600">Para traçar a rota, preciso saber o ponto de partida.</p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Renda Mensal Líquida (Média)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">R$</span>
              <input 
                type="number" 
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0.00"
                value={profile.monthlyIncome || ''}
                onChange={e => setProfile({...profile, monthlyIncome: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
            <input 
              type="checkbox" 
              id="varies" 
              checked={profile.incomeVaries}
              onChange={e => setProfile({...profile, incomeVaries: e.target.checked})}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="varies" className="text-slate-700">Minha renda varia mês a mês</label>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Caixa Disponível Hoje</label>
             <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">R$</span>
              <input 
                type="number" 
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0.00"
                value={profile.currentCash || ''}
                onChange={e => setProfile({...profile, currentCash: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
             <button onClick={handlePrev} className="flex-1 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">Voltar</button>
             <button 
               onClick={handleNext}
               disabled={!profile.monthlyIncome}
               className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
             >
               Próximo
             </button>
          </div>
        </div>
      )}

      {/* STEP 3: EXPENSES & DEBT */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">Gastos e Dívidas</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total de Gastos Fixos (Aluguel, Contas...)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">R$</span>
              <input 
                type="number" 
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0.00"
                value={profile.fixedExpenses || ''}
                onChange={e => setProfile({...profile, fixedExpenses: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200">
            <div className="flex justify-between items-center">
               <span className="font-medium text-slate-700">Tem dívidas?</span>
               <span className="text-xs text-slate-400">Opcional</span>
            </div>
            <input 
              type="text" 
              placeholder="Nome (ex: Cartão Nubank)" 
              className="w-full px-3 py-2 border rounded-md"
              value={currentDebt.description}
              onChange={e => setCurrentDebt({...currentDebt, description: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="number" 
                placeholder="Total Devido (R$)" 
                className="w-full px-3 py-2 border rounded-md"
                value={currentDebt.totalValue || ''}
                onChange={e => setCurrentDebt({...currentDebt, totalValue: parseFloat(e.target.value)})}
              />
              <input 
                type="number" 
                placeholder="Parcela (R$)" 
                className="w-full px-3 py-2 border rounded-md"
                value={currentDebt.monthlyInstallment || ''}
                onChange={e => setCurrentDebt({...currentDebt, monthlyInstallment: parseFloat(e.target.value)})}
              />
            </div>
            <button 
              onClick={addDebt}
              className="w-full py-2 bg-emerald-600 text-white rounded-md font-medium text-sm hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Adicionar Dívida
            </button>
          </div>

           {profile.debts.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
               {profile.debts.map(debt => (
                 <div key={debt.id} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{debt.description}</p>
                      <p className="text-xs text-slate-500">R$ {debt.totalValue}</p>
                    </div>
                    <button onClick={() => removeDebt(debt.id)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button onClick={handlePrev} className="flex-1 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">Voltar</button>
            <button onClick={handleNext} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800">Próximo</button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL CONTEXT */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800">Últimos detalhes</h2>
          
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Onde você tem conta? (Bancos/Corretoras)</label>
             <input 
                type="text" 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: Nubank, Itaú, XP, Binance..."
                value={profile.bankContext}
                onChange={e => setProfile({...profile, bankContext: e.target.value})}
              />
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
             <h4 className="font-bold text-emerald-800 mb-1">Pronto para começar?</h4>
             <p className="text-sm text-emerald-700">Com base no seu objetivo de <strong>{profile.mainGoal === GoalType.SAIR_DO_VERMELHO ? 'Sair do Vermelho' : profile.mainGoal === GoalType.INVESTIR_BOLSA ? 'Investir na Bolsa' : 'Organizar as Contas'}</strong>, vou criar um plano personalizado.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handlePrev} className="flex-1 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">Voltar</button>
            <button 
              onClick={handleSubmit} 
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              Gerar Plano
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingForm;