import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export type ConfirmationModalVariant = 'danger' | 'warning' | 'primary' | 'success';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationModalVariant;
  isLoading?: boolean;
  hasInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDefaultValue?: string;
  inputRequired?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning',
  isLoading = false,
  hasInput = false,
  inputLabel,
  inputPlaceholder,
  inputDefaultValue = '',
  inputRequired = false,
}) => {
  const { isBengali } = useLanguage();
  const [inputValue, setInputValue] = useState(inputDefaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(inputDefaultValue);
    }
  }, [isOpen, inputDefaultValue]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasInput && inputRequired && !inputValue.trim()) {
      return;
    }
    onConfirm(hasInput ? inputValue : undefined);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: Trash2,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
        };
      case 'primary':
        return {
          icon: ShieldAlert,
          iconColor: 'text-brand',
          iconBg: 'bg-brand-soft border-brand/20 text-brand-ink',
          confirmBtn: 'bg-brand hover:bg-brand-strong text-white shadow-md shadow-brand/20',
        };
      case 'warning':
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20',
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  const resolvedConfirmText =
    confirmText || (isBengali ? 'নিশ্চিত করুন' : 'Confirm');
  const resolvedCancelText =
    cancelText || (isBengali ? 'বাতিল' : 'Cancel');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="mb-card max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 shadow-2xl border border-line">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBg}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <h3
              id="confirm-modal-title"
              className="text-base font-black text-ink leading-tight"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-ink-3 hover:text-ink cursor-pointer p-1 rounded-lg hover:bg-elev transition-colors disabled:opacity-40"
            aria-label={isBengali ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message body */}
        <div className="text-xs sm:text-sm text-ink-2 leading-relaxed">
          {message}
        </div>

        {/* Optional Form with input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {hasInput && (
            <div className="space-y-1.5 pt-1">
              {inputLabel && (
                <label className="block text-xs font-bold text-ink">
                  {inputLabel}
                </label>
              )}
              <textarea
                rows={3}
                required={inputRequired}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="mb-input text-xs w-full"
                autoFocus
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-line bg-elev hover:bg-card text-ink-2 cursor-pointer transition-colors disabled:opacity-40"
            >
              {resolvedCancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading || (hasInput && inputRequired && !inputValue.trim())}
              className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50 ${styles.confirmBtn}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{resolvedConfirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationModal;
