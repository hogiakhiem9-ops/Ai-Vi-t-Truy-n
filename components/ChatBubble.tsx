import React from 'react';
import { Message, Role } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-ink-800' : 'bg-accent-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`group relative p-4 rounded-2xl shadow-sm border ${
          isUser 
            ? 'bg-white border-gray-200 text-ink-900 rounded-tr-none' 
            : 'bg-paper-50 border-stone-200 text-ink-900 rounded-tl-none font-serif leading-relaxed'
        }`}>
          {/* Copy Button (only for AI) */}
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-opacity text-stone-500"
              title="Sao chép"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}

          {/* Text Rendering */}
          <div className={`markdown-content ${isUser ? 'font-sans' : ''}`}>
             {isUser ? (
                 <p className="whitespace-pre-wrap">{message.text}</p>
             ) : (
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 border-b pb-1 border-stone-300" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent-600 pl-4 italic text-stone-600 my-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-ink-900" {...props} />,
                        code: ({node, ...props}) => <code className="bg-stone-200 px-1 py-0.5 rounded text-sm font-mono text-pink-700" {...props} />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
             )}
          </div>
          
          {/* Metadata/Footer */}
          <div className="mt-2 text-xs text-stone-400 flex items-center justify-between">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.wordCount && !isUser && (
              <span className="ml-2 bg-stone-100 px-2 py-0.5 rounded-full">{message.wordCount} chữ</span>
            )}
            {message.modeUsed && !isUser && (
                <span className="ml-2 uppercase tracking-wider font-bold text-[10px] text-accent-700 opacity-70">
                    {message.modeUsed}
                </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};