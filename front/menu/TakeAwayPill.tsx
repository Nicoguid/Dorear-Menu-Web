import React from 'react';
import { Language } from '../../db/types';
import { MessageSquare } from 'lucide-react';

interface TakeAwayPillProps {
  currentLang: Language;
  onClick: () => void;
}

const LABEL: Record<Language, string> = {
  es: 'Pedir para llevar',
  en: 'Order for pickup',
  pt: 'Pedir para levar',
};

/**
 * Botón de pedido por WhatsApp, siempre visible abajo a la derecha (al alcance del
 * pulgar). El footer deja espacio al final (pb-28) para que nunca tape lo último.
 */
export const TakeAwayPill: React.FC<TakeAwayPillProps> = ({ currentLang, onClick }) => (
  <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl flex justify-end pointer-events-none px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
    <button
      type="button"
      onClick={onClick}
      aria-label={`${LABEL[currentLang]} (WhatsApp)`}
      className="liquid-green pointer-events-auto min-h-[44px] inline-flex items-center gap-1.5 px-4 rounded-full text-[15px] font-semibold"
    >
      <MessageSquare size={16} aria-hidden="true" />
      <span>{LABEL[currentLang]}</span>
    </button>
  </div>
);
