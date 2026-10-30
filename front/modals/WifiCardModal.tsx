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
    if (navigator.clipboard) {
      navigator.clipboard.writeText(wifiPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      panelClassName="w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl border border-line p-6 shadow-modal overflow-hidden animate-fade-in text-center"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-muted hover:text-ink rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>
      </div>

      <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-3">
        <Wifi size={28} />
      </div>

      <h2 id={titleId} className="font-serif text-2xl sm:text-3xl text-ink font-medium">
        {currentLang === 'es' && 'Wi-Fi de Clientes'}
        {currentLang === 'en' && 'Guest Wi-Fi'}
        {currentLang === 'pt' && 'Wi-Fi para Clientes'}
      </h2>
      <p className="text-xs text-muted mt-1 font-sans">
        {currentLang === 'es' && 'Conectate y disfrutá este momento en Dorear'}
        {currentLang === 'en' && 'Connect and enjoy your moment at Dorear'}
        {currentLang === 'pt' && 'Conecte-se e aproveite seu momento na Dorear'}
      </p>

      <div className="mt-5 bg-cream/70 rounded-2xl border border-line p-4 text-left space-y-3 font-sans">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block">
            {currentLang === 'es' && 'Nombre de Red (SSID)'}
            {currentLang === 'en' && 'Network Name (SSID)'}
            {currentLang === 'pt' && 'Nome da Rede (SSID)'}
          </span>
          <span className="text-sm font-semibold text-ink font-mono">{wifiSSID}</span>
        </div>

        <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block">
              {currentLang === 'es' && 'Contraseña WPA2'}
              {currentLang === 'en' && 'WPA2 Password'}
              {currentLang === 'pt' && 'Senha WPA2'}
            </span>
            <span className="text-base font-semibold text-wine font-mono tracking-wide">
              {wifiPassword}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyPassword}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
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

      <div className="mt-4 text-[11px] text-muted italic font-serif">
        {currentLang === 'es' && 'Conexión exclusiva de alta velocidad para clientes en salón'}
        {currentLang === 'en' && 'Exclusive high-speed connection for dining room guests'}
        {currentLang === 'pt' && 'Conexão exclusiva de alta velocidade para clientes no salão'}
      </div>
    </ModalDialog>
  );
};
