import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, AppMode, ChatSession, AppSettings } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmDialog, InputDialog } from './components/ActionDialogs';
import { ExportPreviewModal } from './components/ExportPreviewModal';
import { MODE_LABELS, MODE_DESCRIPTIONS, APP_NAME } from './constants';
import { Send, PenTool, Edit3, Layers, BookOpen, Settings, BarChart2, ChevronDown, Sparkles, Menu, Download } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ink_and_mind_sessions_v2';
const SETTINGS_STORAGE_KEY = 'ink_and_mind_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  writing: {
    tone: 'Neutral',
    pov: 'Default',
    responseLength: 'Medium',
    creativityLevel: 0.7,
    authorLevel: 'Professional',
    customInstructions: ''
  }
};

const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  title: 'Tác phẩm mới',
  messages: [{
    id: 'welcome-' + Date.now(),
    role: Role.MODEL,
    text: `Xin chào! Tôi là **${APP_NAME}**. Hãy mở phần Cài đặt để tùy chỉnh giọng văn, ngôi kể nếu cần, sau đó bắt đầu viết nhé!`,
    timestamp: Date.now(),
    modeUsed: AppMode.CREATIVE
  }],
  lastUpdated: Date.now()
});

const App: React.FC = () => {
  // --- STATE ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
     return sessions.length > 0 ? sessions[0].id : '';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          writing: { ...DEFAULT_SETTINGS.writing, ...parsed.writing }
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.CREATIVE);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // Dialog States
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [renameSession, setRenameSession] = useState<{id: string, title: string} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- DERIVED STATE ---
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSessionId]); 

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (!sessions.find(s => s.id === currentSessionId) && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);


  // --- HANDLERS ---

  const handleCreateSession = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Trigger Dialogs
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (sessions.length <= 1) {
      alert("Bạn cần giữ lại ít nhất một tác phẩm."); 
      return;
    }
    setDeleteSessionId(id);
  };

  const handleRenameClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const session = sessions.find(s => s.id === id);
    if (session) {
        setRenameSession({ id: session.id, title: session.title });
    }
  };

  const handleExportClick = () => {
      // Check if there is any content from AI
      const aiMessages = currentSession.messages.filter(m => m.role === Role.MODEL);
      if (aiMessages.length < 1) {
          alert("Chưa có nội dung để xuất bản.");
          return;
      }
      setShowExport(true);
  };

  // Action Logic
  const performDeleteSession = () => {
    if (!deleteSessionId) return;

    const id = deleteSessionId;
    const sessionIndex = sessions.findIndex(s => s.id === id);
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);

    if (currentSessionId === id) {
        const nextIndex = Math.max(0, sessionIndex - 1);
        if (newSessions[nextIndex]) {
            setCurrentSessionId(newSessions[nextIndex].id);
        } else {
            setCurrentSessionId(newSessions[0].id);
        }
    }
    setDeleteSessionId(null);
  };

  const performRenameSession = (newTitle: string) => {
      if (!renameSession) return;
      updateSession(renameSession.id, { title: newTitle });
      setRenameSession(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSession) return;

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    updateSession(currentSession.id, { 
        messages: updatedMessages,
        lastUpdated: Date.now()
    });
    
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(updatedMessages, userText, mode, settings.writing);
      
      const wordCount = responseText.trim().split(/\s+/).length;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now(),
        wordCount: wordCount,
        modeUsed: mode
      };

      let newTitle = currentSession.title;
      if (currentSession.messages.length <= 2 && currentSession.title === 'Tác phẩm mới') {
          newTitle = userText.split(' ').slice(0, 6).join(' ') + '...';
      }

      updateSession(currentSession.id, {
          messages: [...updatedMessages, botMessage],
          lastUpdated: Date.now(),
          title: newTitle
      });

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = (id: string, data: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => 
        session.id === id ? { ...session, ...data } : session
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeIcon = (m: AppMode) => {
    switch (m) {
      case AppMode.CREATIVE: return <PenTool size={18} />;
      case AppMode.EDITOR: return <Edit3 size={18} />;
      case AppMode.STRUCTURE: return <Layers size={18} />;
      case AppMode.READER: return <BookOpen size={18} />;
      case AppMode.UTILITY: return <Settings size={18} />;
      default: return <PenTool size={18} />;
    }
  };

  return (
    <div className="flex h-screen bg-paper-100 text-ink-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteClick}
        onRenameSession={handleRenameClick}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative transition-all">
        
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-stone-200 px-4 py-3 shadow-sm z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg">
                <Menu size={20} />
             </button>
            <div className="flex flex-col">
                <h1 className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={14} className="text-accent-600" /> {APP_NAME}
                </h1>
                <h2 className="text-lg font-serif font-bold text-ink-900 truncate max-w-[200px] sm:max-w-md">
                    {currentSession?.title || 'Tác phẩm mới'}
                </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
             <button 
                onClick={handleExportClick}
                className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
                title="Tổng hợp & Tải PDF"
            >
                <Download size={20} />
                <span className="text-sm font-medium hidden sm:inline">Tải PDF</span>
            </button>
            <div className="w-px h-6 bg-stone-200 mx-1"></div>
            <button 
                onClick={() => setShowAnalytics(true)}
                className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
                title="Thống kê"
            >
                <BarChart2 size={20} />
                <span className="text-sm font-medium hidden sm:inline">Thống kê</span>
            </button>
            <div className="w-px h-6 bg-stone-200 mx-1"></div>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
                title="Cài đặt"
            >
                <Settings size={20} />
                <span className="text-sm font-medium hidden sm:inline">Cài đặt</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-paper-100/50">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-6 animate-pulse">
                  <div className="flex max-w-[80%] gap-3">
                      <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                          <Sparkles size={16} className="text-white animate-spin" />
                      </div>
                      <div className="bg-paper-50 border border-stone-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="flex-shrink-0 bg-white border-t border-stone-200 p-4 relative z-10">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            
            {/* Mode Selector */}
            <div className="flex items-center justify-between">
                <div className="relative inline-block">
                    <button 
                        onClick={() => setShowModeSelector(!showModeSelector)}
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors border border-orange-200"
                    >
                        {getModeIcon(mode)}
                        <span>{MODE_LABELS[mode]}</span>
                        <ChevronDown size={14} className={`transform transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showModeSelector && (
                        <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowModeSelector(false)}
                        />
                        <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-20 overflow-hidden">
                            {Object.values(AppMode).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setMode(m);
                                        setShowModeSelector(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-paper-50 transition-colors ${mode === m ? 'bg-orange-50 border-l-4 border-accent-600' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className={`mt-0.5 ${mode === m ? 'text-accent-600' : 'text-stone-400'}`}>
                                        {getModeIcon(m)}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${mode === m ? 'text-ink-900' : 'text-stone-600'}`}>
                                            {MODE_LABELS[m]}
                                        </p>
                                        <p className="text-xs text-stone-400 mt-0.5 leading-tight">
                                            {MODE_DESCRIPTIONS[m]}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        </>
                    )}
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-1">
                    <span className="hidden sm:inline">Trình độ:</span>
                    <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-medium truncate max-w-[100px]">
                        {settings.writing.authorLevel === 'Custom' ? 'Tùy chỉnh' : settings.writing.authorLevel}
                    </span>
                </div>
            </div>

            {/* Text Input */}
            <div className="relative bg-white rounded-2xl border border-stone-300 shadow-sm focus-within:ring-2 focus-within:ring-accent-600/20 focus-within:border-accent-600 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Nhập yêu cầu...`}
                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-12 min-h-[50px] max-h-[150px] text-ink-900 placeholder:text-stone-400"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 disabled:opacity-50 disabled:hover:bg-accent-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-stone-400">
                AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Dialogs */}
      <AnalyticsPanel 
        isOpen={showAnalytics} 
        onClose={() => setShowAnalytics(false)} 
        messages={messages} 
      />
      
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <ExportPreviewModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        messages={messages}
        storyTitle={currentSession?.title || 'Tác phẩm mới'}
      />

      <ConfirmDialog
        isOpen={!!deleteSessionId}
        title="Xóa tác phẩm"
        message="Bạn có chắc chắn muốn xóa bộ truyện này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa vĩnh viễn"
        isDangerous={true}
        onConfirm={performDeleteSession}
        onClose={() => setDeleteSessionId(null)}
      />

      <InputDialog
        isOpen={!!renameSession}
        title="Đổi tên tác phẩm"
        initialValue={renameSession?.title || ''}
        placeholder="Nhập tên mới cho truyện..."
        onConfirm={performRenameSession}
        onClose={() => setRenameSession(null)}
      />

    </div>
  );
};

export default App;