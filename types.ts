export enum GoalType {
  SAIR_DO_VERMELHO = 'A', // Was Sair do aperto
  ORGANIZACAO = 'B', // New: Organização das contas
  INVESTIR_BOLSA = 'C', // New: Investimento na bolsa
  INVESTIR_NEGOCIO = 'D', // New: Investimento em negócio
  OUTRO = 'E'
}

export interface Debt {
  id: string;
  description: string; // Nome/Título
  totalValue: number; // Saldo Total
  monthlyInstallment: number; // Parcela
  interestRate?: number; 
  dueDate?: string; // Vencimento
  debtType?: 'card' | 'loan' | 'overdraft' | 'other'; // Tipo
  tags?: string[];
}

export interface FinancialProfile {
  monthlyIncome: number;
  incomeVaries: boolean;
  fixedExpenses: number;
  debts: Debt[];
  currentCash: number;
  mainGoal: GoalType;
  bankContext?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  value: number;
  date: string;
  category: string;
  // Extended fields for Complete Mode
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
  tags?: string[];
  isRecurring?: boolean;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
  actionData?: {
    type: 'transaction_added' | 'goal_added';
    data: any;
  };
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}