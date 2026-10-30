import React from 'react';
import { Language } from '../../db/types';
import { Lock, Wifi } from 'lucide-react';

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

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  onOpenStaffModal,
  onOpenWifiModal,
}) => {
  return (
    <header className="w-full bg-cream">
      <div className="border-b border-line px-4 py-2.5 max-w-2xl mx-auto flex items-center justify-between text-[11px] text-muted tracking-wider uppercase font-sans">
        <div className="flex items-center gap-2 font-medium">
          <span>Puerto Madero</span>
          <span className="opacity-30">·</span>
          <button
            type="button"
            onClick={onOpenWifiModal}
            className="inline-flex items-center gap-1 text-gold hover:text-wine font-medium transition-colors lowercase tracking-normal"
            title="Wi-Fi de Clientes"
          >
            <Wifi size={11} className="text-gold" />
            <span className="capitalize">Wi-Fi</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Selector de idioma"
            className="flex items-center bg-paper rounded-full p-0.5 border border-line"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                aria-pressed={currentLang === lang.id}
                onClick={() => onSelectLang(lang.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  currentLang === lang.id
                    ? 'bg-wine text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
                aria-label={lang.aria}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <a
            href="https://www.instagram.com/dorearcafe.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-wine transition-colors flex items-center"
            title="Instagram @dorearcafe.ar"
            aria-label="Instagram"
          >
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={onOpenStaffModal}
            className="text-muted/60 hover:text-gold transition-colors p-1"
            title="Acceso Personal / Barra"
            aria-label="Acceso Personal"
          >
            <Lock size={13} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-8 pb-5 text-center max-w-xl mx-auto">
        <div className="w-11 h-20 border border-gold rounded-full mx-auto mb-4 flex flex-col items-center justify-between py-1.5 text-gold font-serif text-xs select-none">
          <span className="font-semibold text-[11px] tracking-widest">A</span>
          <svg
            viewBox="0 0 60 100"
            className="w-6 h-10 stroke-current fill-none stroke-[1.2]"
            aria-hidden="true"
          >
            <ellipse cx="30" cy="32" rx="18" ry="25" />
            <ellipse cx="30" cy="32" rx="10" ry="25" />
            <path d="M30 7v62M12 33l18 36 18-36M26 69h8v23a4 4 0 0 1-8 0Z" />
          </svg>
          <span className="font-semibold text-[11px] tracking-widest">R</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl tracking-[0.25em] text-gold font-normal uppercase pl-2">
          DOREAR
        </h1>

        <div className="text-[10px] tracking-[0.22em] text-gold uppercase mt-2.5 font-medium">
          {currentLang === 'es' && 'Pastelería de autor · Café de especialidad'}
          {currentLang === 'en' && 'Signature Pastry · Specialty Coffee'}
          {currentLang === 'pt' && 'Confeitaria Autoral · Café Especial'}
        </div>

        <div className="font-serif italic text-xl text-gold mt-1.5 opacity-90">
          Agustina Ramírez
        </div>

        <div className="text-gold text-xs my-2 select-none" aria-hidden="true">
          ♥
        </div>

        <p className="font-serif italic text-2xl text-ink leading-tight mt-3">
          {currentLang === 'es' && 'Que espere todo, este ratito es tuyo.'}
          {currentLang === 'en' && 'Let everything wait, this moment is yours.'}
          {currentLang === 'pt' && 'Que tudo espere, este momento é seu.'}
        </p>
      </div>
    </header>
  );
};
