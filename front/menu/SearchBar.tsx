import React from 'react';
import { Search, X } from 'lucide-react';
import { Language } from '../../db/types';

interface SearchBarProps {
  value: string;
  currentLang: Language;
  onChange: (value: string) => void;
}

const PLACEHOLDER: Record<Language, string> = {
  es: 'Buscar (ej. flat white, torta, pasta)',
  en: 'Search (e.g. flat white, cake, pasta)',
  pt: 'Buscar (ex. flat white, bolo, massa)',
};

const LABEL: Record<Language, string> = {
  es: 'Buscar en la carta',
  en: 'Search the menu',
  pt: 'Buscar no cardápio',
};

const CLEAR: Record<Language, string> = {
  es: 'Borrar búsqueda',
  en: 'Clear search',
  pt: 'Limpar busca',
};

export const SearchBar: React.FC<SearchBarProps> = ({ value, currentLang, onChange }) => {
  return (
    <form role="search" className="px-4" onSubmit={(e) => e.preventDefault()}>
      <label className="liquid flex items-center gap-2 h-10 rounded-full pl-3.5 pr-1.5 text-muted focus-within:ring-2 focus-within:ring-gold/50">
        <Search size={16} aria-hidden="true" className="shrink-0" />
        <span className="sr-only">{LABEL[currentLang]}</span>
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') onChange('');
          }}
          placeholder={PLACEHOLDER[currentLang]}
          className="flex-1 min-w-0 bg-transparent text-base text-ink placeholder:text-muted/80 outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-white/60"
            aria-label={CLEAR[currentLang]}
          >
            <X size={17} />
          </button>
        )}
      </label>
    </form>
  );
};
