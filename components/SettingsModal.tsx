import React from 'react';
import { AppSettings, WritingTone, POV, ResponseLength, AuthorLevel } from '../types';
import { X, Sliders, Feather, Zap, GraduationCap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const handleWritingChange = (key: keyof AppSettings['writing'], value: any) => {
    onUpdateSettings({
      ...settings,
      writing: {
        ...settings.writing,
        [key]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-paper-50">
          <h2 className="text-xl font-serif font-bold text-ink-900 flex items-center gap-2">
            <Sliders size={20} className="text-accent-600" />
            Cài đặt Sáng tác
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: Writing Style */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Feather size={16} /> Phong cách & Giọng văn
            </h3>
            
            <div className="space-y-5">
              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">Giọng văn chủ đạo (Tone)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Neutral', 'Humorous', 'Dark', 'Romantic', 'Formal', 'Whimsical'] as WritingTone[]).map(tone => (
                    <button
                      key={tone}
                      onClick={() => handleWritingChange('tone', tone)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                        settings.writing.tone === tone
                          ? 'bg-accent-50 border-accent-600 text-accent-700 font-medium'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* POV */}
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">Ngôi kể (Point of View)</label>
                <select
                  value={settings.writing.pov}
                  onChange={(e) => handleWritingChange('pov', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 outline-none text-sm"
                >
                  <option value="Default">Mặc định (Tự do)</option>
                  <option value="First Person (I)">Ngôi thứ nhất (Tôi)</option>
                  <option value="Third Person Limited">Ngôi thứ ba (Giới hạn)</option>
                  <option value="Third Person Omniscient">Ngôi thứ ba (Toàn tri)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Section: Author Level */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap size={16} /> Trình độ Tác giả
            </h3>
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-2">
                    {(['Beginner', 'Professional', 'Legendary', 'Custom'] as AuthorLevel[]).map(level => (
                        <button
                            key={level}
                            onClick={() => handleWritingChange('authorLevel', level)}
                            className={`px-3 py-3 rounded-lg text-sm border text-left transition-all ${
                                settings.writing.authorLevel === level
                                ? 'bg-ink-900 border-ink-900 text-white font-medium shadow-md'
                                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                            }`}
                        >
                            <span className="block font-bold mb-0.5">
                                {level === 'Beginner' && 'Sơ cấp (Rõ ràng)'}
                                {level === 'Professional' && 'Chuyên nghiệp'}
                                {level === 'Legendary' && 'Đại văn hào'}
                                {level === 'Custom' && 'Tùy chỉnh'}
                            </span>
                        </button>
                    ))}
                 </div>
                 
                 {settings.writing.authorLevel === 'Custom' && (
                     <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-ink-900 mb-2">
                            Prompt hướng dẫn riêng của bạn
                        </label>
                        <textarea 
                            value={settings.writing.customInstructions}
                            onChange={(e) => handleWritingChange('customInstructions', e.target.value)}
                            placeholder="Ví dụ: Viết theo phong cách kiếm hiệp Kim Dung, sử dụng nhiều từ Hán Việt cổ..."
                            className="w-full px-4 py-3 rounded-lg border border-accent-300 bg-accent-50/50 focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 outline-none text-sm min-h-[100px]"
                        />
                        <p className="text-xs text-stone-500 mt-1">AI sẽ ưu tiên chỉ thị này hơn các cài đặt khác.</p>
                     </div>
                 )}
                 {settings.writing.authorLevel === 'Legendary' && (
                     <p className="text-xs text-stone-500 italic">Mô phỏng phong cách văn học phức tạp, giàu hình ảnh và ẩn dụ.</p>
                 )}
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Section 2: AI Configuration */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap size={16} /> Cấu hình Kỹ thuật
            </h3>

            <div className="space-y-5">
              {/* Creativity / Temperature */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-ink-900">Độ sáng tạo (Temperature)</label>
                  <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-mono">
                    {settings.writing.creativityLevel}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.writing.creativityLevel}
                  onChange={(e) => handleWritingChange('creativityLevel', parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-accent-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>Chính xác/Logic</span>
                  <span>Cân bằng</span>
                  <span>Phá cách</span>
                </div>
              </div>

              {/* Length Preference */}
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">Độ dài phản hồi</label>
                <div className="flex bg-stone-100 p-1 rounded-lg">
                  {(['Short', 'Medium', 'Long'] as ResponseLength[]).map(len => (
                    <button
                      key={len}
                      onClick={() => handleWritingChange('responseLength', len)}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
                        settings.writing.responseLength === len
                          ? 'bg-white text-ink-900 shadow-sm font-medium'
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-paper-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors font-medium text-sm"
          >
            Đã xong
          </button>
        </div>
      </div>
    </div>
  );
};