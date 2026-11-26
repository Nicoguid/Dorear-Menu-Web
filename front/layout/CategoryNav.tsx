import React, { useEffect } from 'react';
import { Language, MenuCategory } from '../../db/types';
import { useDragScroll } from './useDragScroll';

interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  currentLang: Language;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  currentLang,
  onSelectCategory,
}) => {
  const { ref: navRef, isDragging, wasDrag, handlers } = useDragScroll<HTMLElement>();

  // Centra la categoría activa moviendo solo la fila. No usamos scrollIntoView porque
  // Chrome lo toma como nuevo punto de partida del Tab: el primer Tab saltaba el
  // header, el buscador y los filtros.
  useEffect(() => {
    const nav = navRef.current;
    const activeBtn = nav?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!nav || !activeBtn) return;
    const left = activeBtn.offsetLeft - (nav.clientWidth - activeBtn.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeCategoryId, navRef]);

  const handleClickCategory = (catId: string) => {
    if (!wasDrag()) onSelectCategory(catId);
  };

  return (
    <nav
      ref={navRef}
      {...handlers}
      className={`relative px-4 py-1.5 -my-1.5 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorX: 'contain',
      }}
      aria-label={
        currentLang === 'es' ? 'Categorías de la carta' : currentLang === 'en' ? 'Menu categories' : 'Categorias do cardápio'
      }
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleClickCategory(cat.id)}
            className={`whitespace-nowrap h-9 px-3.5 rounded-full text-[15px] font-sans transition-[background,color,box-shadow] shrink-0 ${
              isActive ? 'liquid-wine font-medium' : 'liquid text-ink/85 hover:text-ink'
            }`}
            aria-pressed={isActive}
          >
            {cat.name[currentLang] || cat.name.es}
          </button>
        );
      })}
    </nav>
  );
};
