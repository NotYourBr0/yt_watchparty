import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '@shared/types';
import { Avatar } from '../ui/Avatar';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg, i) => {
          const isSameUserAsPrev = i > 0 && messages[i - 1].userId === msg.userId;
          
          return (
            <div key={msg.id} className={`flex gap-3 ${isSameUserAsPrev ? 'mt-1' : 'mt-4'}`}>
              <div className="flex-shrink-0 w-8">
                {!isSameUserAsPrev && <Avatar username={msg.username} size="sm" />}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                {!isSameUserAsPrev && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">{msg.username}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <p className="text-sm text-zinc-300 break-words leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="relative flex items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-shadow"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
