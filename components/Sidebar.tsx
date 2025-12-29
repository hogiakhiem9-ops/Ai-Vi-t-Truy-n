import React from 'react';
import { ChatSession } from '../types';
import { MessageSquarePlus, Trash2, Book, ChevronLeft, Plus, Edit2 } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onToggle
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onToggle}
      />

      {/* Sidebar Container */}
      <div className={`fixed md:relative inset-y-0 left-0 bg-ink-900 text-stone-300 w-72 transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-ink-800">
          <div className="flex items-center gap-2 font-serif text-white">
            <Book size={20} />
            <span className="font-bold">Thư Viện Truyện</span>
          </div>
          <button onClick={onToggle} className="md:hidden p-1 text-stone-400">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onCreateSession();
              if (window.innerWidth < 768) onToggle();
            }}
            className="w-full flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-3 rounded-xl transition-colors font-medium shadow-lg shadow-accent-900/20"
          >
            <Plus size={18} />
            <span>Tác phẩm mới</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {sessions.length === 0 && (
             <div className="text-center text-stone-600 text-sm py-10 px-4">
                Chưa có tác phẩm nào. Hãy bắt đầu viết ngay!
             </div>
          )}
          
          {sessions.slice().sort((a, b) => b.lastUpdated - a.lastUpdated).map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onToggle();
              }}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                session.id === currentSessionId
                  ? 'bg-ink-800 text-white shadow-md'
                  : 'hover:bg-ink-800/50 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <MessageSquarePlus size={16} className={`flex-shrink-0 ${session.id === currentSessionId ? 'text-accent-500' : 'text-stone-600'}`} />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{session.title}</span>
                  <span className="truncate text-xs text-stone-500">
                    {new Date(session.lastUpdated).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameSession(session.id, e);
                    }}
                    className="p-1.5 text-stone-500 hover:text-accent-400 hover:bg-ink-900 rounded"
                    title="Đổi tên"
                >
                    <Edit2 size={13} className="pointer-events-none" />
                </button>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id, e);
                    }}
                    className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-ink-900 rounded"
                    title="Xóa"
                >
                    <Trash2 size={13} className="pointer-events-none" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-800 text-xs text-stone-500 text-center leading-relaxed">
          <p>Dev by <span className="text-stone-300 font-medium">Gia Khiem & GGAS</span></p>
          <p className="opacity-60 mt-0.5">Version: Beta v1</p>
        </div>
      </div>
    </>
  );
};