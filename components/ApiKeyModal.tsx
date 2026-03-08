import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

interface Props {
  onApiKeySubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<Props> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');

  // Check env on mount, but let user override or if env missing
  useEffect(() => {
    // In a real app we might handle this differently, but here we wait for user input
    // The prompt says "API key must be obtained from env", but for a pure frontend output 
    // without a backend server in this context, we often need to simulate or ask.
    // However, adhering strictly to the prompt guidelines: 
    // "Do not generate any UI elements... for entering or managing the API key. ... The application must not ask the user for it"
    // WAIT. The prompt says: "The API key must be obtained exclusively from the environment variable process.env.API_KEY... Do not generate any UI elements ... for entering or managing the API key."
    
    // CORRECTION: I must NOT ask the user. I must assume it is in process.env.API_KEY.
    // If I cannot read process.env in a browser (Vite/CRA), this might fail in a real local dev without setup. 
    // But I must follow the constraint.
    // I will modify the App logic to skip this modal and just use the env.
  }, []);

  return null; // Per instructions, do not show UI for this.
};

export default ApiKeyModal;
