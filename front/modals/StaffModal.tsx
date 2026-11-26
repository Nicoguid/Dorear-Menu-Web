import React, { useState, useEffect, useId, useCallback } from 'react';
import { X, Lock, ShieldAlert, Clock } from 'lucide-react';
import { ModalDialog } from './ModalDialog';
import { setStaffSessionPin, StaffRole, verifyStaffPin } from '../utils/menuSync';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: StaffRole) => void;
}

const ATTEMPTS_STORAGE_KEY = 'dorear_pin_failed_attempts';
const LOCKOUT_STORAGE_KEY = 'dorear_pin_lockout_until';

function getStoredLockout(): { attempts: number; lockoutUntil: number } {
  try {
    const rawAttempts = sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
    const rawLockout = sessionStorage.getItem(LOCKOUT_STORAGE_KEY);
    const attempts = rawAttempts ? parseInt(rawAttempts, 10) || 0 : 0;
    const lockoutUntil = rawLockout ? parseInt(rawLockout, 10) || 0 : 0;
    return { attempts, lockoutUntil };
  } catch {
    return { attempts: 0, lockoutUntil: 0 };
  }
}

function recordFailedAttempt(): { remainingSeconds: number; attempts: number } {
  try {
    const { attempts } = getStoredLockout();
    const nextAttempts = attempts + 1;
    sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, String(nextAttempts));

    // Cooldown progresivo pero accesible:
    // Intentos 1 a 3: Sin cooldown (margen para equivocación o tipeo rápido)
    // Intento 4: 30 segundos
    // Intento 5: 45 segundos
    // Intento 6+: 60 segundos
    let cooldownSeconds = 0;
    if (nextAttempts >= 6) {
      cooldownSeconds = 60;
    } else if (nextAttempts === 5) {
      cooldownSeconds = 45;
    } else if (nextAttempts >= 4) {
      cooldownSeconds = 30;
    }

    if (cooldownSeconds > 0) {
      const lockoutUntil = Date.now() + cooldownSeconds * 1000;
      sessionStorage.setItem(LOCKOUT_STORAGE_KEY, String(lockoutUntil));
      return { remainingSeconds: cooldownSeconds, attempts: nextAttempts };
    }

    return { remainingSeconds: 0, attempts: nextAttempts };
  } catch {
    return { remainingSeconds: 0, attempts: 0 };
  }
}

function clearLockout(): void {
  try {
    sessionStorage.removeItem(ATTEMPTS_STORAGE_KEY);
    sessionStorage.removeItem(LOCKOUT_STORAGE_KEY);
  } catch {}
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const titleId = useId();

  const isLockedOut = cooldownRemaining > 0;

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
      setServerError(null);
      setIsVerifying(false);
      return;
    }
    const { lockoutUntil } = getStoredLockout();
    const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
    setCooldownRemaining(remaining);
  }, [isOpen]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const verifyPin = useCallback(
    async (inputPin: string) => {
      const { lockoutUntil } = getStoredLockout();
      if (Date.now() < lockoutUntil) {
        setPin('');
        return;
      }

      setIsVerifying(true);
      setServerError(null);
      // El PIN se verifica en la base de datos, que también cuenta los intentos fallidos.
      const { role, error: verifyError } = await verifyStaffPin(inputPin);
      if (role) {
        clearLockout();
        setStaffSessionPin(inputPin);
        onLoginSuccess(role);
        setPin('');
        setIsVerifying(false);
        onClose();
        return;
      }

      setIsVerifying(false);
      if (verifyError) {
        // Sin conexión o bloqueo de la base por demasiados intentos: no cuenta como error de PIN.
        setServerError(verifyError);
        setTimeout(() => setPin(''), 600);
        return;
      }
      setError(true);
      const { remainingSeconds } = recordFailedAttempt();
      if (remainingSeconds > 0) {
        setCooldownRemaining(remainingSeconds);
      }
      setTimeout(() => setPin(''), 600);
    },
    [onLoginSuccess, onClose]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      if (isLockedOut || isVerifying) return;
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
    [verifyPin, isLockedOut, isVerifying]
  );

  const handleBackspace = useCallback(() => {
    if (isLockedOut || isVerifying) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, [isLockedOut, isVerifying]);

  useEffect(() => {
    if (!isOpen || isLockedOut || isVerifying) return;
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
  }, [isOpen, handleKeyPress, handleBackspace, isLockedOut, isVerifying]);

  if (!isOpen) return null;

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      backdropClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      panelClassName="w-full max-w-xs bg-paper rounded-3xl border border-line p-6 shadow-modal text-center"
    >
      <div data-clarity-mask="true">
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
              isLockedOut
                ? 'border-amber-400 bg-amber-100'
                : error
                ? 'border-wine bg-wine/30 animate-pulse'
                : pin.length > i
                ? 'bg-wine border-wine'
                : 'border-line bg-cream'
            }`}
          />
        ))}
      </div>

      {isLockedOut ? (
        <div
          role="alert"
          className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 text-xs mb-3 space-y-1 text-center animate-fade-in"
        >
          <div className="font-semibold flex items-center justify-center gap-1.5 text-amber-800">
            <Clock size={14} className="text-amber-700 animate-spin" />
            Acceso temporalmente pausado
          </div>
          <p className="text-[11px] text-muted">
            Varios intentos incorrectos. Por seguridad, esperá{' '}
            <span className="font-mono font-bold text-wine">{cooldownRemaining}s</span> para volver a intentar.
          </p>
        </div>
      ) : serverError ? (
        <p role="alert" className="text-sm text-wine font-medium mb-3">
          {serverError}
        </p>
      ) : error ? (
        <p
          role="alert"
          className="text-[11px] text-wine font-medium mb-3 flex items-center justify-center gap-1"
        >
          <ShieldAlert size={12} /> PIN incorrecto
        </p>
      ) : isVerifying ? (
        <p className="text-[11px] text-gold font-medium mb-3 flex items-center justify-center gap-1 animate-pulse">
          Verificando...
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2.5 my-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={isLockedOut || isVerifying}
            onClick={() => handleKeyPress(digit)}
            className={`py-3 rounded-xl border text-lg font-serif transition-all ${
              isLockedOut || isVerifying
                ? 'bg-cream/50 border-line/50 text-muted/40 cursor-not-allowed'
                : 'bg-cream border-line text-ink hover:bg-gold/15 active:scale-95'
            }`}
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          disabled={isLockedOut || isVerifying}
          onClick={() => handleKeyPress('0')}
          className={`py-3 rounded-xl border text-lg font-serif transition-all ${
            isLockedOut || isVerifying
              ? 'bg-cream/50 border-line/50 text-muted/40 cursor-not-allowed'
              : 'bg-cream border-line text-ink hover:bg-gold/15 active:scale-95'
          }`}
        >
          0
        </button>
        <button
          type="button"
          disabled={isLockedOut || isVerifying}
          onClick={handleBackspace}
          className={`py-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-center ${
            isLockedOut || isVerifying
              ? 'bg-cream/50 border-line/50 text-muted/40 cursor-not-allowed'
              : 'bg-cream border-line text-muted hover:text-ink active:scale-95'
          }`}
        >
          Borrar
        </button>
      </div>
      </div>
    </ModalDialog>
  );
};
