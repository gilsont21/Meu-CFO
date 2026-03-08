import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, User, Bot, Loader2, Mic, StopCircle, ArrowDownCircle, ArrowUpCircle, Target, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
  messages: Message[];
  onSendMessage: (text: string, audioBase64?: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); 
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
           const base64String = (reader.result as string).split(',')[1];
           onSendMessage('', base64String);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Gasto') setInput('Adicionar gasto de R$ ');
    if (action === 'Receita') setInput('Adicionar receita de R$ ');
    if (action === 'Meta') setInput('Nova meta: ');
    if (action === 'Resumo') onSendMessage('Faça um resumo da minha situação atual.');
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim().startsWith('📌') || line.trim().startsWith('🚨') || line.trim().startsWith('🕳️') || line.trim().startsWith('🎯') || line.trim().startsWith('✅')) {
         return <p key={i} className="font-bold text-slate-900 mt-4 mb-2">{line}</p>;
      }
      if (line.trim().startsWith('- ')) {
         return <li key={i} className="ml-4 list-disc text-slate-700 mb-1">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i}/>;
      }
      return <p key={i} className="mb-2 text-slate-700 leading-relaxed">{line}</p>;
    });
  };

  const renderActionCard = (msg: Message) => {
    if (!msg.actionData) return null;

    if (msg.actionData.type === 'transaction_added') {
      const t = msg.actionData.data;
      const isExpense = t.type === 'expense';
      return (
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3 w-fit">
          <div className={`p-2 rounded-full ${isExpense ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isExpense ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">{isExpense ? 'Despesa Registrada' : 'Receita Registrada'}</p>
            <p className="font-bold text-slate-800">{t.description}</p>
            <p className={`font-mono font-medium ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
              R$ {t.value.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      );
    }

    if (msg.actionData.type === 'goal_added') {
      const g = msg.actionData.data;
      return (
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3 w-fit">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Nova Meta Criada</p>
            <p className="font-bold text-slate-800">{g.title}</p>
            <p className="text-sm text-slate-600">Alvo: R$ {g.targetAmount.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 shadow-sm rounded-tl-none'
                }`}>
                  <div className={msg.role === 'model' ? 'prose-sm' : ''}>
                    {msg.isAudio ? (
                      <div className="flex items-center gap-2 italic text-slate-300">
                        <Mic size={14} /> Áudio enviado
                      </div>
                    ) : (
                      msg.role === 'model' ? formatText(msg.text) : msg.text
                    )}
                  </div>
                </div>
              </div>
              {/* Render Action Card underneath the text bubble */}
              {renderActionCard(msg)}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start w-full">
             <div className="flex flex-row items-center gap-2 max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                   <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                   <Loader2 className="animate-spin text-emerald-600" size={18} />
                   <span className="text-slate-500 text-sm">
                     {isRecording ? "Processando áudio..." : "Analisando..."}
                   </span>
                </div>
             </div>
           </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => handleQuickAction('Gasto')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-100 whitespace-nowrap">
            <ArrowDownCircle size={14} /> Adicionar Gasto
          </button>
          <button onClick={() => handleQuickAction('Receita')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 border border-emerald-100 whitespace-nowrap">
             <ArrowUpCircle size={14} /> Adicionar Receita
          </button>
           <button onClick={() => handleQuickAction('Meta')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 border border-blue-100 whitespace-nowrap">
             <Target size={14} /> Criar Meta
          </button>
           <button onClick={() => handleQuickAction('Resumo')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 border border-slate-200 whitespace-nowrap">
             <DollarSign size={14} /> Resumo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* Mic Button */}
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isLoading}
            className={`p-3 rounded-xl transition shadow-sm flex-shrink-0 ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Segure para gravar"
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Gravando..." : "Digite ou fale..."}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition min-w-0"
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            disabled={isLoading || isRecording || !input.trim()}
            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-emerald-100 flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;