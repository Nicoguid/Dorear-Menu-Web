import React, { useRef, useState, useEffect } from 'react';
import { Language, MenuCategory } from '../../db/types';

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
  const navRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategoryId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = navRef.current;
    if (!el) return;

    isMouseDownRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = navRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;

    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }

    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = navRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && e.deltaX === 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleClickCategory = (catId: string) => {
    if (!hasMovedRef.current) {
      onSelectCategory(catId);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-y border-line py-2 shadow-xs">
      <div className="relative max-w-xl mx-auto">
        <nav
          ref={navRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`px-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
          }}
          aria-label="Categorías"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClickCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-sans transition-all shrink-0 ${
                  isActive
                    ? 'bg-wine text-white font-medium shadow-xs scale-102'
                    : 'bg-paper text-muted border border-line hover:border-gold/60 hover:text-ink'
                }`}
                aria-pressed={isActive}
              >
                {cat.name[currentLang]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
