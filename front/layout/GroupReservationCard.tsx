import React from 'react';
import { Language } from '../../db/types';
import { Users } from 'lucide-react';

interface GroupReservationCardProps {
  currentLang: Language;
  onOpenModal: () => void;
}

const T = {
  title: {
    es: 'Festejos y mesas grandes',
    en: 'Celebrations and large tables',
    pt: 'Comemorações e mesas grandes',
  },
  body: {
    es: 'Para grupos de 5 a 16 personas te preparamos la mesa con anticipación, con nuestra Merienda Degustación de autor (menú fijo).',
    en: 'For groups of 5 to 16 we set your table in advance with our signature Tasting Merienda (fixed menu).',
    pt: 'Para grupos de 5 a 16 pessoas preparamos a mesa com antecedência, com nosso lanche degustação autoral (menu fixo).',
  },
  cta: { es: 'Reservar mesa grande', en: 'Book a large table', pt: 'Reservar mesa grande' },
};

export const GroupReservationCard: React.FC<GroupReservationCardProps> = ({
  currentLang,
  onOpenModal,
}) => {
  return (
    <section className="max-w-xl mx-auto px-4 mt-8" aria-labelledby="group-card-title">
      <div className="glass rounded-[22px] p-5">
        <h2 id="group-card-title" className="font-serif text-[1.6rem] text-ink leading-tight">
          {T.title[currentLang]}
        </h2>
        <p className="text-base text-muted leading-relaxed mt-1.5">{T.body[currentLang]}</p>
        <button
          type="button"
          onClick={onOpenModal}
          className="mt-4 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-wine hover:bg-wine-dark text-white text-base font-semibold transition-colors"
        >
          <Users size={17} />
          <span>{T.cta[currentLang]}</span>
        </button>
      </div>
    </section>
  );
};
