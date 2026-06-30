import { type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div onClick={onClose} aria-hidden="true" />
      <div>
        <div>
          <h2 id="modal-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div>{children}</div>
        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}
