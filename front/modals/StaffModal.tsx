import React, { useState, useEffect, useId, useCallback } from 'react';
import { X, Lock, ShieldAlert } from 'lucide-react';
import { ModalDialog } from './ModalDialog';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'barista' | 'admin') => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (inputPin === '1234') {
        onLoginSuccess('barista');
        setPin('');
        onClose();
      } else if (inputPin === '8888') {
        onLoginSuccess('admin');
        setPin('');
        onClose();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 600);
      }
    },
    [onLoginSuccess, onClose]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + num;
        setError(false);
        if (next.length === 4) {
          verifyPin(next);
        }
        return next;
      });
    },
    [verifyPin]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleKeyPress, handleBackspace]);

  if (!isOpen) return null;

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      backdropClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      panelClassName="w-full max-w-xs bg-paper rounded-3xl border border-line p-6 shadow-modal text-center"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 id={titleId} className="flex items-center gap-2 text-wine font-serif text-lg">
          <Lock size={18} />
          <span>Acceso Personal</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink p-1 rounded-full"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-xs text-muted mb-4">
        Ingresá el PIN de 4 dígitos para acceder al modo operativo:
      </p>

      <div className="flex justify-center gap-3 my-4" aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border transition-all ${
              error
                ? 'border-wine bg-wine/30 animate-pulse'
                : pin.length > i
                ? 'bg-wine border-wine'
                : 'border-line bg-cream'
            }`}
          />
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="text-[11px] text-wine font-medium mb-3 flex items-center justify-center gap-1"
        >
          <ShieldAlert size={12} /> PIN incorrecto
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5 my-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyPress(digit)}
            className="py-3 rounded-xl bg-cream border border-line text-lg font-serif text-ink hover:bg-gold/15 active:scale-95 transition-all"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="py-3 rounded-xl bg-cream border border-line text-lg font-serif text-ink hover:bg-gold/15 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="py-3 rounded-xl bg-cream border border-line text-xs font-sans text-muted hover:text-ink active:scale-95 transition-all flex items-center justify-center"
        >
          Borrar
        </button>
      </div>
    </ModalDialog>
  );
};
