import React, { useState, useId } from 'react';
import { Language } from '../../db/types';
import { Wifi, X, Copy, Check } from 'lucide-react';
import { ModalDialog } from './ModalDialog';

interface WifiCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  wifiSSID: string;
  wifiPassword: string;
}

export const WifiCardModal: React.FC<WifiCardModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  wifiSSID,
  wifiPassword,
}) => {
  const [copied, setCopied] = useState(false);
  const titleId = useId();

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    navigator.clipboard
      ?.writeText(wifiPassword)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {
        // Sin permiso de portapapeles: la clave igual queda a la vista.
      });
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      panelClassName="w-full sm:max-w-md bg-paper/[0.97] rounded-t-[28px] sm:rounded-[28px] border border-white/70 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal overflow-hidden animate-sheet-up text-center"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 -mr-2 -mt-2 inline-flex items-center justify-center text-muted hover:text-ink rounded-full transition-colors"
          aria-label={currentLang === 'es' ? 'Cerrar' : currentLang === 'en' ? 'Close' : 'Fechar'}
        >
          <X size={20} />
        </button>
      </div>

      <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-3">
        <Wifi size={28} />
      </div>

      <h2 id={titleId} className="font-serif text-2xl sm:text-3xl text-ink font-medium">
        {currentLang === 'es' && 'Wi‑Fi de clientes'}
        {currentLang === 'en' && 'Guest Wi-Fi'}
        {currentLang === 'pt' && 'Wi-Fi para Clientes'}
      </h2>
      <p className="text-base text-muted mt-1 font-sans">
        {currentLang === 'es' && 'Conectate y disfrutá este momento en Dorear'}
        {currentLang === 'en' && 'Connect and enjoy your moment at Dorear'}
        {currentLang === 'pt' && 'Conecte-se e aproveite seu momento na Dorear'}
      </p>

      <div className="mt-5 bg-cream/70 rounded-2xl border border-line p-4 text-left space-y-3 font-sans">
        <div>
          <span className="text-sm text-muted block">
            {currentLang === 'es' && 'Nombre de la red'}
            {currentLang === 'en' && 'Network name'}
            {currentLang === 'pt' && 'Nome da rede'}
          </span>
          <span className="text-lg font-semibold text-ink">{wifiSSID}</span>
        </div>

        <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-3">
          <div>
            <span className="text-sm text-muted block">
              {currentLang === 'es' && 'Contraseña'}
              {currentLang === 'en' && 'Password'}
              {currentLang === 'pt' && 'Senha'}
            </span>
            <span data-clarity-mask="true" className="text-lg font-semibold text-wine tracking-wide break-all">
              {wifiPassword}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyPassword}
            className={`min-h-[44px] shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-medium transition-colors ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-paper border border-line text-ink hover:border-gold hover:text-gold'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>
                  {currentLang === 'es' && '¡Copiada!'}
                  {currentLang === 'en' && 'Copied!'}
                  {currentLang === 'pt' && 'Copiada!'}
                </span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>
                  {currentLang === 'es' && 'Copiar clave'}
                  {currentLang === 'en' && 'Copy password'}
                  {currentLang === 'pt' && 'Copiar senha'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 text-base text-muted italic font-serif">
        {currentLang === 'es' && 'Conexión exclusiva de alta velocidad para clientes en salón'}
        {currentLang === 'en' && 'Exclusive high-speed connection for dining room guests'}
        {currentLang === 'pt' && 'Conexão exclusiva de alta velocidade para clientes no salão'}
      </div>
    </ModalDialog>
  );
};
