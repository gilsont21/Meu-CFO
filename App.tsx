import React, { useState, useEffect } from 'react';
import OnboardingForm from './components/OnboardingForm';
import ChatInterface from './components/ChatInterface';
import DashboardTab from './components/DashboardTab';
import GoalsTab from './components/GoalsTab';
import TransactionsTab from './components/TransactionsTab';
import SheetsTab from './components/SheetsTab';
import { FinancialProfile, Message, FinancialGoal, Transaction, GoalType, Debt } from './types';
import { initializeGemini, sendMessage, sendToolResponse } from './services/geminiService';
import { PieChart, MessageSquare, LayoutDashboard, Target, Receipt, Table } from 'lucide-react';

function App() {
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'goals' | 'transactions' | 'sheets'>('chat');
  
  // State for tabs
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const apiKey = process.env.API_KEY || '';
    if (apiKey) {
      initializeGemini(apiKey);
    } else {
      console.warn("API Key missing from environment variables.");
    }
  }, []);

  // TOOL HANDLERS
  const handleAddTransactionTool = (args: any): Transaction => {
    const newTrans: Transaction = {
      id: Date.now().toString(),
      type: args.type === 'expense' ? 'expense' : 'income',
      description: args.description,
      value: args.value,
      category: args.category || 'Geral',
      date: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTrans]);
    return newTrans;
  };

  const handleAddGoalTool = (args: any): FinancialGoal => {
    const newGoal: FinancialGoal = {
      id: Date.now().toString(),
      title: args.title,
      targetAmount: args.targetAmount,
      currentAmount: 0,
      deadline: args.deadline || ''
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  // Skip Handler - Create "Guest" Profile
  const handleSkipOnboarding = () => {
    const guestProfile: FinancialProfile = {
      monthlyIncome: 0,
      incomeVaries: false,
      fixedExpenses: 0,
      debts: [],
      currentCash: 0,
      mainGoal: GoalType.ORGANIZACAO,
      bankContext: 'Não informado'
    };
    setProfile(guestProfile);
    setHasProfile(true);
    
    // Add a welcome message encouraging setup via chat
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'model',
      text: "Bem-vindo ao modo rápido! Como pulei a configuração, seus dados estão zerados. Você pode me dizer 'Ganho 5000 por mês' ou 'Gastei 50 no almoço' para começar a alimentar o sistema.",
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  };

  const handleOnboardingSubmit = async (data: FinancialProfile) => {
    setProfile(data);
    setHasProfile(true);
    setIsLoading(true);

    // Dynamic Goals initialization based on specific path
    const defaultGoals: FinancialGoal[] = [];
    
    if (data.mainGoal === GoalType.SAIR_DO_VERMELHO) {
       defaultGoals.push({
         id: '1', title: 'Quitar Dívidas Menores', currentAmount: 0, targetAmount: 2000, deadline: ''
       });
    } else if (data.mainGoal === GoalType.INVESTIR_BOLSA) {
       defaultGoals.push({
         id: '1', title: 'Aporte Inicial', currentAmount: data.currentCash, targetAmount: 50000, deadline: ''
       });
    } else if (data.mainGoal === GoalType.INVESTIR_NEGOCIO) {
       defaultGoals.push({
         id: '1', title: 'Capital de Giro', currentAmount: data.currentCash, targetAmount: 10000, deadline: ''
       });
    } else {
       defaultGoals.push({
         id: '1', title: 'Reserva de Emergência', currentAmount: data.currentCash, targetAmount: data.monthlyIncome * 6, deadline: ''
       });
    }

    setGoals(defaultGoals);

    const debtDetails = data.debts.map(d => 
      `- ${d.description}: R$${d.totalValue} total, parcela de R$${d.monthlyInstallment}`
    ).join('\n');

    const prompt = `
Aqui estão meus dados iniciais para o diagnóstico:

1. Objetivo Principal: ${data.mainGoal} (Considere isso como prioridade absoluta)
2. Renda Líquida Mensal: R$ ${data.monthlyIncome} ${data.incomeVaries ? '(Varia)' : '(Fixa)'}
3. Gastos Fixos Totais: R$ ${data.fixedExpenses}
4. Caixa Atual (Disponível): R$ ${data.currentCash}
5. Contexto Bancário: ${data.bankContext || 'Não informado'}
6. Dívidas:
${debtDetails || 'Nenhuma dívida declarada.'}

Por favor, gere o DIAGNÓSTICO focado no meu objetivo principal (${data.mainGoal}).
    `;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: "Enviei meus dados financeiros. Aguardando diagnóstico.",
      timestamp: new Date()
    };
    setMessages([userMsg]);

    try {
      const { text } = await sendMessage(prompt);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "Olá! Recebi seus dados.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, audioBase64?: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text || (audioBase64 ? "Mensagem de áudio enviada" : ""),
      isAudio: !!audioBase64,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. Send Message (Text or Audio)
      const { text: responseText, functionCalls } = await sendMessage(text, audioBase64);
      
      let finalResponseText = responseText;
      let actionData: any = null;

      // 2. Handle Tool Calls
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          
          if (call.name === 'addTransaction') {
             const newTrans = handleAddTransactionTool(call.args);
             actionData = { type: 'transaction_added', data: newTrans };
             
             // Inform Model
             const confirmation = await sendToolResponse(call.name, call.id, { result: "Success" });
             if (confirmation) finalResponseText = confirmation;
             else finalResponseText = "Certo, já registrei.";
          }

          if (call.name === 'addGoal') {
             const newGoal = handleAddGoalTool(call.args);
             actionData = { type: 'goal_added', data: newGoal };
             
             const confirmation = await sendToolResponse(call.name, call.id, { result: "Success" });
             if (confirmation) finalResponseText = confirmation;
             else finalResponseText = "Meta criada com sucesso!";
          }
        }
      }

      // 3. Add Bot Message
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: finalResponseText || "Entendido.",
        timestamp: new Date(),
        actionData: actionData
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'model',
         text: "Desculpe, tive um problema ao processar. Tente novamente.",
         timestamp: new Date()
       }]);
    } finally {
      setIsLoading(false);
    }
  };

  // State handlers
  const addGoal = (g: FinancialGoal) => setGoals([...goals, g]);
  const removeGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));
  const updateGoal = (g: FinancialGoal) => setGoals(goals.map(goal => goal.id === g.id ? g : goal));

  const addTransaction = (t: Transaction) => setTransactions([...transactions, t]);
  const updateTransaction = (t: Transaction) => setTransactions(transactions.map(tr => tr.id === t.id ? t : tr));
  const removeTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

  // Debt Handlers (Profile Context)
  const addDebt = (d: Debt) => {
    if (!profile) return;
    setProfile({ ...profile, debts: [...profile.debts, d] });
  };
  const updateDebt = (d: Debt) => {
    if (!profile) return;
    setProfile({ ...profile, debts: profile.debts.map(debt => debt.id === d.id ? d : debt) });
  };
  const removeDebt = (id: string) => {
    if (!profile) return;
    setProfile({ ...profile, debts: profile.debts.filter(d => d.id !== id) });
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20 md:pb-0">
      {/* Header - Simplified */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <PieChart size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Meu CFO</h1>
            </div>
          </div>
          {/* Desktop Navigation */}
          {hasProfile && (
            <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'chat' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Chat</button>
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('goals')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'goals' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Metas</button>
              <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'transactions' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Lançamentos</button>
              <button onClick={() => setActiveTab('sheets')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'sheets' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Planilhas</button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl px-4 py-6 flex-1">
        {!hasProfile ? (
          <div className="mt-8">
            <OnboardingForm onSubmit={handleOnboardingSubmit} onSkip={handleSkipOnboarding} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className={activeTab === 'chat' ? 'block' : 'hidden'}>
               <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>

            {activeTab === 'dashboard' && profile && (
              <DashboardTab profile={profile} transactions={transactions} />
            )}

            {activeTab === 'goals' && (
              <GoalsTab goals={goals} onAddGoal={addGoal} onRemoveGoal={removeGoal} onUpdateGoal={updateGoal} />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab transactions={transactions} onAddTransaction={addTransaction} onRemoveTransaction={removeTransaction} />
            )}

            {activeTab === 'sheets' && profile && (
              <SheetsTab 
                transactions={transactions} 
                debts={profile.debts}
                onAddTransaction={addTransaction}
                onUpdateTransaction={updateTransaction}
                onDeleteTransaction={removeTransaction}
                onAddDebt={addDebt}
                onUpdateDebt={updateDebt}
                onDeleteDebt={removeDebt}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {hasProfile && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 py-2 px-6 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <MessageSquare size={20} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Chat</span>
           </button>
           <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Resumo</span>
           </button>
           <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Receipt size={20} strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Lançar</span>
           </button>
           <button onClick={() => setActiveTab('sheets')} className={`flex flex-col items-center gap-1 ${activeTab === 'sheets' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Table size={20} strokeWidth={activeTab === 'sheets' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Planilhas</span>
           </button>
        </div>
      )}
    </div>
  );
}

export default App;