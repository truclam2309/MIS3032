import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';

export interface ConfirmDetail {
  label: string;
  value: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  details,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  irreversibleNote,
  onConfirm,
  onCancel











}: {open: boolean;title: string;description: string;details?: ConfirmDetail[];confirmLabel: string;cancelLabel?: string;tone?: 'primary' | 'danger';irreversibleNote?: string;onConfirm: () => void;onCancel: () => void;}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => confirmRef.current?.focus(), 60);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 bg-ink/30" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-description"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 4 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
          
            <header className="flex items-start gap-3 border-b border-line px-4 py-3.5">
              <h2 id="confirm-title" className="flex-1 text-sm font-semibold">
                {title}
              </h2>
              <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="rounded p-1 text-ink-subtle transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
              
                <XIcon className="h-4 w-4" />
              </button>
            </header>

            <div className="px-4 py-4">
              <p id="confirm-description" className="text-sm leading-relaxed text-ink-muted">
                {description}
              </p>

              {details && details.length > 0 ?
            <dl className="mt-3 divide-y divide-line/70 rounded border border-line bg-raised px-3">
                  {details.map((d) =>
              <div key={d.label} className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-xs text-ink-subtle">{d.label}</dt>
                      <dd className="max-w-[60%] text-right text-xs font-medium text-ink">{d.value}</dd>
                    </div>
              )}
                </dl> :
            null}

              {irreversibleNote ?
            <p className="mt-3 flex items-start gap-2 rounded border border-warn-200 bg-warn-50 px-2.5 py-2 text-xs leading-relaxed text-warn-700">
                  <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {irreversibleNote}
                </p> :
            null}
            </div>

            <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-raised px-4 py-3">
              <button
              type="button"
              onClick={onCancel}
              className="rounded border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-exp hover:bg-canvas hover:text-ink">
              
                {cancelLabel}
              </button>
              <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={`rounded px-3 py-2 text-sm font-semibold text-ink-invert transition-colors duration-150 ease-exp ${
              tone === 'danger' ? 'bg-danger-600 hover:bg-danger-700' : 'bg-brand-500 hover:bg-brand-600'}`
              }>
              
                {confirmLabel}
              </button>
            </footer>
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}