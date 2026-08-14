import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-foreground-950/40" onClick={onClose} />
      <div className={`relative flex max-h-[90vh] w-full flex-col ${sizeClasses[size]} rounded-t-2xl bg-background-50 sm:rounded-2xl`}>
        <div className="flex items-start justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground-950">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-foreground-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-background-200 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}