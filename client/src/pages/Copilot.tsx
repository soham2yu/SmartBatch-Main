import React, { useState } from 'react';
import { useCopilot } from '@/hooks/use-smartbatch';
import { useActiveDataset } from '@/context/DatasetContext';
import { Bot, Send, User } from 'lucide-react';
import { motion } from 'framer-motion';

type Message = { role: 'user' | 'ai'; content: string };

export default function Copilot() {
  const { activeDatasetId } = useActiveDataset();
  const copilotMutation = useCopilot();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello operator. I am SmartBatch Copilot. Ask me about anomalies, parameter optimization, or general insights for the current dataset.' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setQuery('');

    try {
      const result = await copilotMutation.mutateAsync({ query: userQuery, datasetId: activeDatasetId });
      setMessages(prev => [...prev, { role: 'ai', content: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing that request.' }]);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2 text-white">AI Copilot</h2>
        <p className="text-muted-foreground mb-6">Conversational interface for manufacturing insights.</p>
      </div>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0 border
                ${msg.role === 'user' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-primary/20 border-primary/30'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              
              <div className={`
                p-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-black/40 border border-white/10 text-white rounded-tl-sm'}
              `}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {copilotMutation.isPending && (
             <div className="flex gap-4 max-w-[80%]">
               <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                 <Bot className="w-5 h-5 text-primary" />
               </div>
               <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex gap-2 items-center rounded-tl-sm">
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/10">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about optimizing yield..."
              className="w-full bg-black/40 border border-white/20 rounded-full py-4 pl-6 pr-16 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button 
              type="submit"
              disabled={copilotMutation.isPending || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
