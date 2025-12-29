import React, { useState, useEffect, useRef } from 'react';
import { Message, Role } from '../types';
import { X, FileText, CheckSquare, Square, Download, Trash2, RefreshCcw, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  storyTitle: string;
}

interface ExportItem {
  id: string;
  text: string;
  isIncluded: boolean;
  wordCount: number;
}

// Global declaration for html2pdf
declare const html2pdf: any;

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({ isOpen, onClose, messages, storyTitle }) => {
  const [items, setItems] = useState<ExportItem[]>([]);
  const [metadata, setMetadata] = useState({
    title: storyTitle,
    genre: 'Chưa phân loại',
    intro: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize items when modal opens
  useEffect(() => {
    if (isOpen) {
      setMetadata(prev => ({ ...prev, title: storyTitle }));
      
      const aiMessages = messages
        .filter(m => m.role === Role.MODEL)
        .map(m => {
          const wordCount = m.wordCount || m.text.trim().split(/\s+/).length;
          // Heuristic: Auto-include if > 50 words, otherwise assume it's chitchat
          const isRelevant = wordCount > 50; 
          return {
            id: m.id,
            text: m.text,
            isIncluded: isRelevant,
            wordCount: wordCount
          };
        });
      setItems(aiMessages);
    }
  }, [isOpen, messages, storyTitle]);

  const toggleInclude = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isIncluded: !item.isIncluded } : item
    ));
  };

  const handleDownloadPDF = () => {
    if (!previewRef.current) return;
    setIsGenerating(true);

    const element = previewRef.current;
    const opt = {
      margin: [15, 15, 15, 15], // mm
      filename: `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Using the global html2pdf library added in index.html
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save().then(() => {
            setIsGenerating(false);
            onClose();
        }).catch((err: any) => {
            console.error(err);
            alert("Lỗi khi tạo PDF. Vui lòng thử lại.");
            setIsGenerating(false);
        });
    } else {
        alert("Thư viện tạo PDF chưa tải xong. Vui lòng đợi giây lát hoặc tải lại trang.");
        setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-100 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink-900 flex items-center gap-2">
              <FileText size={20} className="text-accent-600" />
              Xuất bản PDF
            </h2>
            <p className="text-sm text-stone-500">Chọn lọc nội dung và xem trước trước khi tải về</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: Controls & List */}
            <div className="w-1/3 min-w-[300px] border-r border-stone-200 bg-white flex flex-col overflow-hidden">
                
                {/* Metadata Form */}
                <div className="p-4 border-b border-stone-100 space-y-3 bg-paper-50">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Thông tin tác phẩm</h3>
                    <input 
                        type="text" 
                        value={metadata.title}
                        onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                        placeholder="Tên truyện"
                        className="w-full px-3 py-2 rounded border border-stone-300 text-sm font-bold text-ink-900"
                    />
                     <input 
                        type="text" 
                        value={metadata.genre}
                        onChange={(e) => setMetadata({...metadata, genre: e.target.value})}
                        placeholder="Thể loại"
                        className="w-full px-3 py-2 rounded border border-stone-300 text-sm"
                    />
                    <textarea
                        value={metadata.intro}
                        onChange={(e) => setMetadata({...metadata, intro: e.target.value})}
                        placeholder="Giới thiệu ngắn..."
                        className="w-full px-3 py-2 rounded border border-stone-300 text-sm h-16 resize-none"
                    />
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                     <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        Chọn đoạn chat để ghép ({items.filter(i => i.isIncluded).length}/{items.length})
                     </h3>
                     {items.length === 0 && <p className="text-stone-400 text-sm italic">Không có nội dung AI nào.</p>}
                     
                     {items.map((item, idx) => (
                         <div 
                            key={item.id}
                            onClick={() => toggleInclude(item.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                                item.isIncluded 
                                ? 'bg-accent-50 border-accent-200 shadow-sm' 
                                : 'bg-stone-50 border-transparent opacity-60 hover:opacity-100'
                            }`}
                         >
                            <button className={`mt-0.5 ${item.isIncluded ? 'text-accent-600' : 'text-stone-400'}`}>
                                {item.isIncluded ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-stone-500">Đoạn #{idx + 1}</span>
                                    <span className="text-[10px] bg-stone-200 px-1.5 rounded text-stone-600">{item.wordCount} từ</span>
                                </div>
                                <p className="text-xs text-ink-900 line-clamp-2 leading-relaxed">
                                    {item.text}
                                </p>
                                {!item.isIncluded && (
                                    <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                                        <Trash2 size={10} /> Đã loại bỏ
                                    </span>
                                )}
                            </div>
                         </div>
                     ))}
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 bg-stone-200/50 p-6 overflow-y-auto flex justify-center">
                <div 
                    ref={previewRef}
                    className="bg-white w-[210mm] min-h-[297mm] shadow-lg p-[15mm] text-ink-900 flex flex-col"
                    style={{ fontSize: '12pt', lineHeight: '1.6' }}
                >
                    {/* Rendered PDF Content */}
                    <div className="flex-1">
                        <div className="text-center mb-8 pb-4 border-b-2 border-black">
                            <h1 className="text-3xl font-serif font-bold mb-2 uppercase">{metadata.title}</h1>
                            <p className="italic text-stone-600 mb-4">{metadata.genre}</p>
                            {metadata.intro && (
                                <div className="text-sm bg-stone-50 p-4 rounded text-left italic border-l-4 border-stone-300">
                                    {metadata.intro}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {items.filter(i => i.isIncluded).map((item, idx) => (
                                <div key={item.id} className="markdown-pdf-content">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                            h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-3 text-justify indent-8" {...props} />, // Indent for literary feel
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-stone-300 pl-4 italic my-4" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4" {...props} />,
                                        }}
                                    >
                                        {item.text}
                                    </ReactMarkdown>
                                    {idx < items.filter(i => i.isIncluded).length - 1 && (
                                        <div className="w-1/3 mx-auto h-px bg-stone-200 my-6 print:hidden"></div>
                                    )}
                                </div>
                            ))}
                            {items.filter(i => i.isIncluded).length === 0 && (
                                <div className="text-center text-stone-400 py-20 border-2 border-dashed border-stone-200 rounded-xl">
                                    <Eye size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Chưa chọn nội dung nào để hiển thị.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* PDF Footer Credit */}
                    <div className="mt-12 pt-6 border-t border-stone-300 text-center text-[10px] text-stone-400">
                        <p>Ink & Mind (Beta v1) - Developed by Gia Khiem & GGAS</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-stone-200 flex justify-end gap-3 flex-shrink-0">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
            >
                Hủy bỏ
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating || items.filter(i => i.isIncluded).length === 0}
                className="px-6 py-2.5 rounded-xl bg-ink-900 text-white font-medium hover:bg-ink-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
                {isGenerating ? (
                    <>
                        <RefreshCcw size={20} className="animate-spin" /> Đang tạo PDF...
                    </>
                ) : (
                    <>
                        <Download size={20} /> Tải xuống PDF
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};