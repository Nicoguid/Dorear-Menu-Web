import React from 'react';
import { Language } from '../../db/types';
import { Star, ExternalLink } from 'lucide-react';
import { trackGoogleReviewClick } from '../utils/analytics';
import { BUSINESS_INFO } from '../../db/businessInfo';

interface GoogleReviewSectionProps {
  currentLang: Language;
}

const T = {
  title: {
    es: '¿Disfrutaste tu ratito en Dorear?',
    en: 'Did you enjoy your time at Dorear?',
    pt: 'Gostou do seu momento na Dorear?',
  },
  body: {
    es: 'Tu opinión en Google nos ayuda un montón a seguir mejorando.',
    en: 'Your review on Google really helps us keep improving.',
    pt: 'Sua avaliação no Google nos ajuda muito a continuar melhorando.',
  },
  cta: { es: 'Dejar una reseña en Google', en: 'Leave a Google review', pt: 'Avaliar no Google' },
};

export const GoogleReviewSection: React.FC<GoogleReviewSectionProps> = ({ currentLang }) => {
  return (
    <section className="w-full max-w-xl mx-auto px-4 mt-4" aria-labelledby="review-title">
      <div className="rounded-[22px] border border-line bg-paper/60 p-5 text-center">
        <div className="flex justify-center gap-1 text-gold" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={17} fill="currentColor" />
          ))}
        </div>
        <h2 id="review-title" className="font-serif text-[1.45rem] text-ink mt-2 leading-tight">
          {T.title[currentLang]}
        </h2>
        <p className="text-base text-muted mt-1 leading-relaxed">{T.body[currentLang]}</p>
        <a
          href={BUSINESS_INFO.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGoogleReviewClick()}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 px-5 rounded-full border border-wine/40 text-wine text-base font-medium hover:bg-wine hover:text-white transition-colors"
        >
          <span>{T.cta[currentLang]}</span>
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};
