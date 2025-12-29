import React from 'react';
import { Message, Role } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface AnalyticsPanelProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ messages, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Filter only AI messages for statistics
  const data = messages
    .filter(m => m.role === Role.MODEL && m.wordCount && m.wordCount > 0)
    .map((m, index) => ({
      name: `Mục ${index + 1}`,
      words: m.wordCount || 0,
    }));

  const totalWords = data.reduce((acc, curr) => acc + curr.words, 0);
  const avgWords = data.length > 0 ? Math.round(totalWords / data.length) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-paper-50">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink-900">Thống kê Phiên làm việc</h2>
            <p className="text-sm text-stone-500">Tiến độ sáng tác của bạn</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              Chưa có dữ liệu thống kê. Hãy bắt đầu viết truyện!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-paper-50 p-4 rounded-lg border border-stone-200">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Tổng số chữ (AI)</p>
                  <p className="text-3xl font-bold text-accent-600 mt-1">{totalWords.toLocaleString()}</p>
                </div>
                <div className="bg-paper-50 p-4 rounded-lg border border-stone-200">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Trung bình/Mục</p>
                  <p className="text-3xl font-bold text-ink-800 mt-1">{avgWords.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <p className="text-sm font-semibold mb-4 text-stone-700">Biểu đồ số lượng từ theo lượt</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#78716c'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#78716c'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f5f5f4'}}
                    />
                    <Bar dataKey="words" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d97706' : '#b45309'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};