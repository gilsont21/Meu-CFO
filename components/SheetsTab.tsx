import React, { useState } from 'react';
import { Transaction, Debt } from '../types';
import { Edit2, Trash2, Check, X, Plus, Table as TableIcon } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  debts: Debt[];
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (t: Transaction) => void;
  onUpdateDebt: (d: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onAddDebt: (d: Debt) => void;
}

const SheetsTab: React.FC<Props> = ({ 
  transactions, debts, 
  onUpdateTransaction, onDeleteTransaction, onAddTransaction,
  onUpdateDebt, onDeleteDebt, onAddDebt
}) => {
  const [activeTable, setActiveTable] = useState<'transactions' | 'debts'>('transactions');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRow, setTempRow] = useState<any>(null);

  // --- Helpers ---
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTempRow({ ...item });
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempRow(null);
  };

  const handleDelete = (id: string, type: 't' | 'd') => {
    if (confirm('Tem certeza que deseja excluir esta linha?')) {
      if (type === 't') onDeleteTransaction(id);
      else onDeleteDebt(id);
    }
  };

  const handleSave = (type: 't' | 'd') => {
    if (type === 't') {
       // Convert tags string to array if needed (simplified for input)
       const finalTrans = { ...tempRow };
       if (typeof finalTrans.tags === 'string') {
          finalTrans.tags = finalTrans.tags.split(',').map((s: string) => s.trim());
       }
       // If it's a new item (we handle "add" logic differently usually, but here likely update or add)
       onUpdateTransaction(finalTrans);
    } else {
       const finalDebt = { ...tempRow };
        if (typeof finalDebt.tags === 'string') {
          finalDebt.tags = finalDebt.tags.split(',').map((s: string) => s.trim());
       }
       onUpdateDebt(finalDebt);
    }
    setEditingId(null);
    setTempRow(null);
  };

  const handleAddNew = () => {
    const newId = Date.now().toString();
    if (activeTable === 'transactions') {
      const newT: Transaction = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        value: 0,
        category: 'Geral',
        description: 'Nova Transação',
        tags: []
      };
      onAddTransaction(newT);
      handleEdit(newT); // Enter edit mode immediately
    } else {
      const newD: Debt = {
        id: newId,
        description: 'Nova Dívida',
        totalValue: 0,
        monthlyInstallment: 0,
        debtType: 'card',
        dueDate: '1',
        tags: []
      };
      onAddDebt(newD);
      handleEdit(newD);
    }
  };

  const handleChange = (field: string, value: any) => {
    setTempRow((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- Renderers ---

  const renderTransactionTable = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Valor (R$)</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice().reverse().map(t => {
            const isEditing = editingId === t.id;
            const data = isEditing ? tempRow : t;
            
            return (
              <tr key={t.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input type="date" value={data.date.split('T')[0]} onChange={e => handleChange('date', e.target.value)} className="w-full border rounded p-1" />
                  ) : new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                     <select value={data.type} onChange={e => handleChange('type', e.target.value)} className="w-full border rounded p-1">
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                     </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {isEditing ? (
                    <input type="number" value={data.value} onChange={e => handleChange('value', parseFloat(e.target.value))} className="w-24 border rounded p-1" />
                  ) : t.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <input type="text" value={data.category} onChange={e => handleChange('category', e.target.value)} className="w-full border rounded p-1" />
                   ) : t.category}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <input type="text" value={data.description} onChange={e => handleChange('description', e.target.value)} className="w-full border rounded p-1" />
                   ) : t.description}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <input type="text" placeholder="sep. por vírgula" value={Array.isArray(data.tags) ? data.tags.join(', ') : data.tags} onChange={e => handleChange('tags', e.target.value)} className="w-full border rounded p-1" />
                   ) : (t.tags?.join(', ') || '-')}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleSave('t')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={16} /></button>
                      <button onClick={handleCancel} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(t)} className="text-slate-400 hover:text-blue-600 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(t.id, 't')} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderDebtsTable = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Saldo Total</th>
            <th className="px-4 py-3">Parcela</th>
            <th className="px-4 py-3">Dia Venc.</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {debts.map(d => {
            const isEditing = editingId === d.id;
            const data = isEditing ? tempRow : d;

            return (
              <tr key={d.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {isEditing ? (
                     <input type="text" value={data.description} onChange={e => handleChange('description', e.target.value)} className="w-full border rounded p-1" />
                   ) : d.description}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <select value={data.debtType || 'other'} onChange={e => handleChange('debtType', e.target.value)} className="w-full border rounded p-1">
                        <option value="card">Cartão</option>
                        <option value="loan">Empréstimo</option>
                        <option value="overdraft">Cheque Esp.</option>
                        <option value="other">Outros</option>
                     </select>
                   ) : (
                     d.debtType === 'card' ? 'Cartão' : d.debtType === 'loan' ? 'Empréstimo' : d.debtType === 'overdraft' ? 'Cheque Esp.' : 'Outros'
                   )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input type="number" value={data.totalValue} onChange={e => handleChange('totalValue', parseFloat(e.target.value))} className="w-24 border rounded p-1" />
                  ) : d.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                    <input type="number" value={data.monthlyInstallment} onChange={e => handleChange('monthlyInstallment', parseFloat(e.target.value))} className="w-24 border rounded p-1" />
                  ) : d.monthlyInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <input type="text" value={data.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} className="w-16 border rounded p-1" />
                   ) : d.dueDate || '-'}
                </td>
                <td className="px-4 py-3">
                   {isEditing ? (
                     <input type="text" placeholder="tags" value={Array.isArray(data.tags) ? data.tags.join(', ') : data.tags} onChange={e => handleChange('tags', e.target.value)} className="w-full border rounded p-1" />
                   ) : (d.tags?.join(', ') || '-')}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleSave('d')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={16} /></button>
                      <button onClick={handleCancel} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(d)} className="text-slate-400 hover:text-blue-600 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(d.id, 'd')} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {debts.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-slate-400">Nenhuma dívida registrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTable('transactions')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTable === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Transações
            </button>
            <button 
              onClick={() => setActiveTable('debts')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTable === 'debts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dívidas
            </button>
         </div>

         <button 
           onClick={handleAddNew}
           className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
         >
           <Plus size={16} /> Adicionar {activeTable === 'transactions' ? 'Linha' : 'Dívida'}
         </button>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
         {activeTable === 'transactions' ? renderTransactionTable() : renderDebtsTable()}
      </div>
    </div>
  );
};

export default SheetsTab;