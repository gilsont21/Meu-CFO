import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { Plus, Target, Trash2, TrendingUp } from 'lucide-react';

interface Props {
  goals: FinancialGoal[];
  onAddGoal: (goal: FinancialGoal) => void;
  onRemoveGoal: (id: string) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
}

const GoalsTab: React.FC<Props> = ({ goals, onAddGoal, onRemoveGoal, onUpdateGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: ''
  });

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    onAddGoal({
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount || 0),
      deadline: newGoal.deadline
    });
    setIsAdding(false);
    setNewGoal({ title: '', targetAmount: 0, currentAmount: 0, deadline: '' });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="text-emerald-600" />
          Metas & Objetivos
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Adicionar Nova Meta</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Nome da meta (ex: Viagem, Carro)"
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
              value={newGoal.title}
              onChange={e => setNewGoal({...newGoal, title: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
               <input 
                type="number" 
                placeholder="Valor Alvo (R$)"
                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                value={newGoal.targetAmount || ''}
                onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})}
              />
               <input 
                type="number" 
                placeholder="Já guardado (R$)"
                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                value={newGoal.currentAmount || ''}
                onChange={e => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value)})}
              />
            </div>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-500"
              value={newGoal.deadline}
              onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setIsAdding(false)} className="text-slate-500 text-sm px-3 py-1">Cancelar</button>
              <button onClick={handleAdd} className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          return (
            <div key={goal.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-800">{goal.title}</h3>
                  {goal.deadline && <p className="text-xs text-slate-400">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>}
                </div>
                <button onClick={() => onRemoveGoal(goal.id)} className="text-slate-300 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                <span className="font-medium text-emerald-600">R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => onUpdateGoal({...goal, currentAmount: goal.currentAmount + 100})}
                  className="flex-1 py-1.5 text-xs bg-slate-50 text-slate-600 font-medium rounded-lg hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1"
                >
                  <TrendingUp size={12} /> +R$ 100
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">Nenhuma meta definida ainda.</p>
            <p className="text-xs text-slate-400">Defina um objetivo para começar a poupar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsTab;