import React from 'react';
import { Language } from '../../db/types';
import { Lock, Wifi } from 'lucide-react';
import { BUSINESS_INFO } from '../../db/businessInfo';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenStaffModal: () => void;
  onOpenWifiModal: () => void;
}

const LANGUAGES: { id: Language; label: string; aria: string }[] = [
  { id: 'es', label: 'ES', aria: 'Español' },
  { id: 'en', label: 'EN', aria: 'English' },
  { id: 'pt', label: 'PT', aria: 'Português' },
];

const SUBTITLE: Record<Language, string> = {
  es: 'Pastelería de autor · Café de especialidad',
  en: 'Signature pastry · Specialty coffee',
  pt: 'Confeitaria autoral · Café especial',
};

const TAGLINE: Record<Language, string> = {
  es: 'Que espere todo, este ratito es tuyo',
  en: 'Let everything wait, this moment is yours',
  pt: 'Que tudo espere, este momento é seu',
};

/** Emblema de Agustina (cápsula con A, batidor y R) en versión compacta. */
const ArEmblem: React.FC = () => (
  <span
    className="w-7 h-12 border border-gold/80 rounded-full flex flex-col items-center justify-between py-1 text-gold-dark font-serif select-none shrink-0"
    aria-hidden="true"
  >
    <span className="font-semibold text-[9px] leading-none">A</span>
    <svg viewBox="0 0 60 100" className="w-3.5 h-5 stroke-current fill-none stroke-[3]">
      <ellipse cx="30" cy="32" rx="18" ry="25" />
      <ellipse cx="30" cy="32" rx="10" ry="25" />
      <path d="M30 7v62M12 33l18 36 18-36M26 69h8v23a4 4 0 0 1-8 0Z" />
    </svg>
    <span className="font-semibold text-[9px] leading-none">R</span>
  </span>
);

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  onOpenStaffModal,
  onOpenWifiModal,
}) => {
  return (
    <header className="relative w-full">
      <div className="max-w-xl mx-auto px-2 pt-[max(0.25rem,env(safe-area-inset-top))] flex flex-wrap items-center justify-between text-sm text-muted">
        <div className="flex items-center gap-1">
          <span className="pl-1.5 whitespace-nowrap text-[13px] max-[369px]:hidden">Puerto Madero</span>
          <button
            type="button"
            onClick={onOpenWifiModal}
            className="w-11 h-11 inline-flex items-center justify-center rounded-full text-gold-dark hover:bg-paper transition-colors"
            aria-label={{ es: 'Wi‑Fi de clientes', en: 'Guest Wi‑Fi', pt: 'Wi‑Fi para clientes' }[currentLang]}
            title="Wi‑Fi"
          >
            <Wifi size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end">
          <div
            role="group"
            aria-label="Idioma / Language / Idioma"
            className="flex items-center rounded-full p-0.5 bg-paper/80 border border-line"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                lang={lang.id}
                aria-pressed={currentLang === lang.id}
                aria-label={`${lang.label}, ${lang.aria}`}
                title={lang.aria}
                onClick={() => onSelectLang(lang.id)}
                className={`min-w-[40px] h-10 px-1 rounded-full text-[13px] font-semibold transition-colors ${
                  currentLang === lang.id ? 'bg-ink text-cream' : 'text-muted hover:text-ink'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>


          <a
            href={BUSINESS_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-11 inline-flex items-center justify-center text-gold-dark hover:text-wine transition-colors"
            aria-label={`Instagram ${BUSINESS_INFO.instagramHandle}`}
          >
            <svg className="w-[19px] h-[19px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={onOpenStaffModal}
            className="w-9 h-11 inline-flex items-center justify-center text-muted/50 hover:text-gold transition-colors"
            aria-label="Acceso personal"
          >
            <Lock size={13} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pt-2 pb-3 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <ArEmblem />
          <h1 translate="no" className="font-serif text-[min(2.6rem,12vw)] leading-none tracking-[0.2em] text-gold-dark font-normal pl-[0.2em]">
            DOREAR
          </h1>
        </div>

        <p className="text-sm text-muted mt-1.5 text-balance">{SUBTITLE[currentLang]}</p>

        <p className="font-serif italic text-[1.4rem] leading-snug text-ink mt-2 text-balance">
          {TAGLINE[currentLang]}
          {'\u00a0'}
          <span className="not-italic text-gold text-base" aria-hidden="true">
            ♥
          </span>
        </p>
        <p className="font-serif italic text-[17px] text-gold-dark leading-none mt-0.5">
          Agustina Ramírez
        </p>
      </div>
    </header>
  );
};
