import React from 'react';
import { Language } from '../../db/types';
import { Users, Sparkles } from 'lucide-react';

interface GroupReservationCardProps {
  currentLang: Language;
  onOpenModal: () => void;
}

export const GroupReservationCard: React.FC<GroupReservationCardProps> = ({
  currentLang,
  onOpenModal,
}) => {
  return (
    <section className="max-w-xl mx-auto px-5 my-8">
      <div className="bg-paper rounded-3xl border border-line p-6 shadow-soft relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-gold text-[11px] uppercase tracking-widest font-semibold font-sans mb-1.5">
              <Sparkles size={13} />
              {currentLang === 'es' && 'Celebraciones & Encuentros'}
              {currentLang === 'en' && 'Celebrations & Gatherings'}
              {currentLang === 'pt' && 'Comemorações & Encontros'}
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl text-ink font-medium leading-snug">
              {currentLang === 'es' && 'Festejos y Mesas Grandes'}
              {currentLang === 'en' && 'Large Tables & Celebrations'}
              {currentLang === 'pt' && 'Mesas Grandes & Comemorações'}
            </h3>

            <p className="text-xs sm:text-sm text-muted leading-relaxed mt-2">
              {currentLang === 'es' &&
                'Para grupos de 5 a 16 comensales, preparamos y reservamos tu mesa con anticipación con nuestra propuesta exclusiva de Merienda Degustación de autor (menú fijo).'}
              {currentLang === 'en' &&
                'For parties of 5 to 16 guests, we arrange and prepare your table in advance with our exclusive signature tasting menu (fixed menu).'}
              {currentLang === 'pt' &&
                'Para grupos de 5 a 16 pessoas, preparamos sua mesa com antecedência com nossa proposta exclusiva de menu degustação autoral (menu fixo).'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-wine hover:bg-wine-dark text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-xs shrink-0"
          >
            <Users size={15} />
            <span>
              {currentLang === 'es' && 'Reservar Mesa Grande ↗'}
              {currentLang === 'en' && 'Book Large Table ↗'}
              {currentLang === 'pt' && 'Reservar Mesa ↗'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
