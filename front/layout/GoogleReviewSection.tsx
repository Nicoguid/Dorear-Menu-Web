import React from 'react';
import { Language } from '../../db/types';
import { Star, ExternalLink } from 'lucide-react';
import { trackGoogleReviewClick } from '../utils/analytics';

interface GoogleReviewSectionProps {
  currentLang: Language;
}

export const GoogleReviewSection: React.FC<GoogleReviewSectionProps> = ({ currentLang }) => {
  return (
    <section className="w-full max-w-xl mx-auto px-4 my-8">
      <div className="bg-paper rounded-2xl border border-line p-5 text-center shadow-soft relative overflow-hidden">
        <div className="flex justify-center items-center gap-1.5 mb-2.5 text-gold">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={18} fill="currentColor" className="text-gold" />
          ))}
        </div>

        <h3 className="font-serif text-2xl text-ink font-medium">
          {currentLang === 'es' && '¿Disfrutaste tu ratito en Dorear?'}
          {currentLang === 'en' && 'Did you enjoy your time at Dorear?'}
          {currentLang === 'pt' && 'Gostou do seu momento na Dorear?'}
        </h3>

        <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
          {currentLang === 'es' && 'Tu opinión en Google nos ayuda un montón a seguir mejorando.'}
          {currentLang === 'en' && 'Your review on Google helps us keep improving.'}
          {currentLang === 'pt' && 'Sua avaliação no Google nos ajuda muito a continuar melhorando.'}
        </p>

        <a
          href="https://maps.google.com/?q=Dorear+Cafeteria+Puerto+Madero"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGoogleReviewClick()}
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-wine text-white text-xs font-medium hover:bg-wine-dark transition-all shadow-xs"
        >
          <span>
            {currentLang === 'es' && 'Dejar reseña en Google'}
            {currentLang === 'en' && 'Leave Google Review'}
            {currentLang === 'pt' && 'Avaliar no Google'}
          </span>
          <ExternalLink size={13} />
        </a>
      </div>
    </section>
  );
};
