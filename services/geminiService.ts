import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let aiInstance: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// Definition for the Add Transaction Tool
const addTransactionTool: FunctionDeclaration = {
  name: 'addTransaction',
  description: 'Adiciona uma nova transação financeira (receita ou despesa) ao registro do usuário.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ['income', 'expense'],
        description: 'Tipo da transação: "income" para receitas/ganhos, "expense" para gastos/despesas.',
      },
      description: {
        type: Type.STRING,
        description: 'Descrição curta da transação (ex: Almoço, Uber, Salário).',
      },
      value: {
        type: Type.NUMBER,
        description: 'Valor numérico da transação.',
      },
      category: {
        type: Type.STRING,
        description: 'Categoria da transação (ex: Alimentação, Transporte, Lazer, Moradia, Salário).',
      },
    },
    required: ['type', 'description', 'value'],
  },
};

// Definition for Add Goal Tool
const addGoalTool: FunctionDeclaration = {
  name: 'addGoal',
  description: 'Cria uma nova meta financeira ou objetivo de poupança.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Título da meta (ex: Viagem, Carro Novo, Reserva).',
      },
      targetAmount: {
        type: Type.NUMBER,
        description: 'Valor total que se deseja alcançar.',
      },
      deadline: {
        type: Type.STRING,
        description: 'Data limite opcional (YYYY-MM-DD) se mencionada.',
      }
    },
    required: ['title', 'targetAmount'],
  },
};


export const initializeGemini = (apiKey: string) => {
  aiInstance = new GoogleGenAI({ apiKey });
};

export const createChatSession = (): Chat => {
  if (!aiInstance) throw new Error("Gemini not initialized");
  
  // Using gemini-2.5-flash-preview for better tool use and speed
  chatSession = aiInstance.chats.create({
    model: 'gemini-2.5-flash-preview', 
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: [{ functionDeclarations: [addTransactionTool, addGoalTool] }],
    },
  });
  return chatSession;
};

// Now returns an object that might contain text AND/OR function calls
export const sendMessage = async (messageText: string, audioBase64?: string) => {
  if (!chatSession) {
    createChatSession();
  }
  
  try {
    let result;
    
    if (audioBase64) {
      // If audio is provided, send it as a part
      result = await chatSession!.sendMessage({
        message: [
          { inlineData: { mimeType: 'audio/webm;codecs=opus', data: audioBase64 } }, // Standard browser recorder mime
          { text: messageText || "Transcreva este áudio e execute qualquer comando financeiro nele, ou responda à pergunta." }
        ]
      });
    } else {
      result = await chatSession!.sendMessage({ message: messageText });
    }

    // Extract text
    const text = result.text;

    // Extract function calls if any
    const functionCalls = result.candidates?.[0]?.content?.parts
      ?.filter(part => part.functionCall)
      .map(part => part.functionCall);

    return {
      text,
      functionCalls
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Erro ao conectar com a IA. Tente novamente." };
  }
};

// Helper to send tool response back to model (confirmation)
export const sendToolResponse = async (functionName: string, id: string, result: any) => {
  if (!chatSession) return;
  
  const response = await chatSession.sendMessage({
    message: [{
      functionResponse: {
        name: functionName,
        response: { result: result },
        id: id
      }
    }]
  });
  
  return response.text;
};
