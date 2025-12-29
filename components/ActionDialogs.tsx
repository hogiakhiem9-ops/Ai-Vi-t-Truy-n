import React, { useState, useEffect } from 'react';

// Confirm Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = "Xác nhận", cancelLabel = "Hủy", isDangerous = false, onConfirm, onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-serif font-bold text-ink-900 mb-2">{title}</h3>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-accent-600 hover:bg-accent-700'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Dialog
interface InputDialogProps {
  isOpen: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen, title, initialValue, placeholder, confirmLabel = "Lưu", cancelLabel = "Hủy", onConfirm, onClose
}) => {
  const [value, setValue] = useState(initialValue);

  // Update internal state when initialValue changes or dialog opens
  useEffect(() => {
    if (isOpen) {
        setValue(initialValue);
    }
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-serif font-bold text-ink-900 mb-4">{title}</h3>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-accent-600/20 focus:border-accent-600 outline-none text-sm mb-6 bg-paper-50"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!value.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};