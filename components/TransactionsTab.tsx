import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2, Zap, FileText, Repeat, ShoppingCart, Home, Car, Coffee, Heart, Smartphone, MoreHorizontal, Calendar } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onRemoveTransaction: (id: string) => void;
}

const CATEGORIES = [
  { id: 'Alimentação', icon: Coffee, label: 'Alimentação', color: 'bg-orange-100 text-orange-600' },
  { id: 'Transporte', icon: Car, label: 'Transporte', color: 'bg-blue-100 text-blue-600' },
  { id: 'Casa', icon: Home, label: 'Casa', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'Mercado', icon: ShoppingCart, label: 'Mercado', color: 'bg-green-100 text-green-600' },
  { id: 'Saúde', icon: Heart, label: 'Saúde', color: 'bg-red-100 text-red-600' },
  { id: 'Lazer', icon: Smartphone, label: 'Lazer', color: 'bg-purple-100 text-purple-600' },
  { id: 'Outros', icon: MoreHorizontal, label: 'Outros', color: 'bg-slate-100 text-slate-600' },
];

const TransactionsTab: React.FC<Props> = ({ transactions, onAddTransaction, onRemoveTransaction }) => {
  const [mode, setMode] = useState<'quick' | 'complete'>('quick');
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  
  // Common State
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Complete Mode State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('pix');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const getLastTransaction = () => transactions[transactions.length - 1];

  const handleQuickSubmit = (catId: string) => {
    if (!value) return;
    
    onAddTransaction({
      id: Date.now().toString(),
      type: entryType,
      value: parseFloat(value),
      date: date || new Date().toISOString(),
      category: catId,
      description: catId, // Default description in quick mode
      paymentMethod: 'pix' // Default
    });
    
    // Reset
    setValue('');
  };

  const handleCompleteSubmit = () => {
    if (!value || !description) return;

    onAddTransaction({
      id: Date.now().toString(),
      type: entryType,
      value: parseFloat(value),
      date: date || new Date().toISOString(),
      category: category,
      description: description,
      paymentMethod,
      isRecurring,
      notes
    });

    // Reset
    setValue('');
    setDescription('');
    setNotes('');
    setIsRecurring(false);
  };

  const repeatLast = () => {
    const last = getLastTransaction();
    if (!last) return;

    onAddTransaction({
      ...last,
      id: Date.now().toString(),
      date: new Date().toISOString() // Update to today
    });
  };

  // Totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20">
      {/* Mini Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
           <span className="text-[10px] text-slate-400 uppercase font-bold">Entradas</span>
           <p className="text-sm font-bold text-emerald-600">R$ {totalIncome.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
           <span className="text-[10px] text-slate-400 uppercase font-bold">Saídas</span>
           <p className="text-sm font-bold text-red-600">R$ {totalExpense.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
           <span className="text-[10px] text-slate-400 uppercase font-bold">Saldo</span>
           <p className={`text-sm font-bold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>R$ {balance.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Main Entry Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Mode Toggles */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setMode('quick')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${mode === 'quick' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Zap size={16} /> Rápido
          </button>
          <button 
            onClick={() => setMode('complete')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${mode === 'complete' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText size={16} /> Completo
          </button>
        </div>

        <div className="p-5 space-y-5">
           {/* Type Switcher */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setEntryType('expense')}
               className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${entryType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
             >
               Despesa
             </button>
             <button 
               onClick={() => setEntryType('income')}
               className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${entryType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
             >
               Receita
             </button>
           </div>

           {/* Value Input (Big) */}
           <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">R$</span>
             <input 
               type="number" 
               placeholder="0,00"
               value={value}
               onChange={e => setValue(e.target.value)}
               className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-slate-800 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition placeholder:text-slate-300"
               autoFocus={mode === 'quick'}
             />
           </div>
           
           {/* Date Picker (Common) */}
           <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
              <Calendar size={16} className="text-slate-400" />
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent text-sm text-slate-600 outline-none"
              />
           </div>

           {/* --- MODE SPECIFIC CONTENT --- */}
           
           {/* QUICK MODE */}
           {mode === 'quick' && (
             <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Selecione para Salvar</p>
                  {getLastTransaction() && (
                    <button onClick={repeatLast} className="text-xs flex items-center gap-1 text-emerald-600 font-medium hover:underline">
                      <Repeat size={12} /> Repetir último
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                   {CATEGORIES.map(cat => (
                     <button
                       key={cat.id}
                       onClick={() => handleQuickSubmit(cat.id)}
                       className="flex flex-col items-center gap-2 p-2 rounded-xl transition hover:bg-slate-50 active:scale-95 group"
                     >
                        <div className={`p-3 rounded-full ${cat.color} group-hover:brightness-95 transition shadow-sm`}>
                           <cat.icon size={20} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{cat.label}</span>
                     </button>
                   ))}
                </div>
                {!value && <p className="text-center text-xs text-slate-400 mt-2">Digite o valor acima para habilitar as categorias</p>}
             </div>
           )}

           {/* COMPLETE MODE */}
           {mode === 'complete' && (
             <div className="animate-fade-in space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                 <input 
                   type="text" 
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   placeholder="Ex: Almoço com equipe"
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg mt-1 outline-none focus:border-emerald-500"
                 />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg mt-1 outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pagamento</label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg mt-1 outline-none"
                    >
                      <option value="pix">Pix</option>
                      <option value="credit">Crédito</option>
                      <option value="debit">Débito</option>
                      <option value="cash">Dinheiro</option>
                    </select>
                 </div>
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Observações / Tags</label>
                 <input 
                   type="text" 
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                   placeholder="#ferias, reembolsavel..."
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg mt-1 outline-none focus:border-emerald-500"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   id="recurring"
                   checked={isRecurring}
                   onChange={e => setIsRecurring(e.target.checked)}
                   className="w-4 h-4 text-emerald-600 rounded"
                 />
                 <label htmlFor="recurring" className="text-sm text-slate-600">Repetir mensalmente</label>
               </div>

               <button 
                 onClick={handleCompleteSubmit}
                 disabled={!value || !description}
                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition disabled:opacity-50"
               >
                 Salvar Lançamento
               </button>
             </div>
           )}

        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 pl-1">Últimos Lançamentos</h3>
        {transactions.slice().reverse().map(t => (
          <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
              </div>
              <div>
                <p className="font-bold text-slate-800">{t.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                   <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                   <span>•</span>
                   <span>{t.category}</span>
                   {t.paymentMethod && (
                     <>
                      <span>•</span>
                      <span className="uppercase">{t.paymentMethod}</span>
                     </>
                   )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR')}
              </span>
              <button onClick={() => onRemoveTransaction(t.id)} className="text-slate-300 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <p className="text-sm">Nenhum lançamento ainda.</p>
             <p className="text-xs mt-1">Use os botões acima para adicionar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsTab;