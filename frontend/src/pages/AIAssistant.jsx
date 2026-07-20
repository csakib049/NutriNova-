import { useState } from 'react';
import api from '../api/axios';

export default function AIAssistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'What should I eat if my glucose is high today?',
    'How many calories should I eat for weight loss?',
    'What are good diabetes-friendly meals?',
    'Give me a healthy snack idea',
  ];

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { question: query });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer, source: res.data.source }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process your question. Please try again.', source: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-4">AI Diet Assistant</h1>
      <p className="text-gray-500 mb-6">Ask me anything about diet, nutrition, and your health plan.</p>

      <div className="bg-white rounded-xl shadow-md mb-4 p-4 h-96 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-16">
            <p className="mb-4">Try asking:</p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleAsk(s)}
                  className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-green-50 text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm">{msg.content}</p>
              {msg.source && msg.source !== 'error' && (
                <span className="text-xs opacity-70 mt-1 block">{msg.source === 'ai' ? 'Powered by AI' : 'Rule-based'}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-100">
              <div className="animate-pulse flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask a question about diet or nutrition..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        <button onClick={() => handleAsk()} disabled={loading || !question.trim()}
          className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 disabled:opacity-50">
          Ask
        </button>
      </div>
    </div>
  );
}
