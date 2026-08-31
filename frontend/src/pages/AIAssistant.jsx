import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot } from 'lucide-react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';

function TypingDots() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const reduce = useReducedMotion();
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = [
    'What should I eat if my glucose is high today?',
    'How many calories should I eat for weight loss?',
    'What are good diabetes-friendly meals?',
    'Give me a healthy snack idea',
    'What foods help lower blood sugar naturally?',
    'How much water should I drink daily?',
    'What is a balanced breakfast for diabetics?',
    'Which foods are high in protein and low in carbs?',
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
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">AI Diet Assistant</h1>
      </div>
      <p className="text-muted mb-6">Ask me anything about diet, nutrition, and your health plan.</p>

      <div ref={listRef} className="bg-surface rounded-xl shadow-md mb-4 p-4 h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.length === 0 && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-muted text-center py-16">
              <p className="mb-4">Try asking:</p>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleAsk(s)}
                    className="block w-full text-left p-2 bg-surface-alt rounded hover:bg-brand-soft text-sm">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={`${i}-${msg.role}`}
              initial={{ opacity: 0, x: reduce ? 0 : (msg.role === 'user' ? 20 : -20) }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-brand text-brand-contrast' : 'bg-surface-alt text-foreground'}`}>
                {msg.role === 'assistant' ? (
                  <div className="text-sm prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                {msg.source && msg.source !== 'error' && (
                  <span className="text-xs opacity-70 mt-1 block">{msg.source === 'gemini' ? 'Powered by Gemini' : msg.source === 'ai' ? 'Powered by AI' : 'Rule-based'}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {loading && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg bg-surface-alt">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask a question about diet or nutrition..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
        <button onClick={() => handleAsk()} disabled={loading || !question.trim()}
          className="bg-brand text-brand-contrast px-6 py-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
          Ask
        </button>
      </div>
    </div>
  );
}
