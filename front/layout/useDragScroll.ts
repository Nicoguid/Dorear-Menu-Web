import { useEffect, useRef, useState } from 'react';
import type React from 'react';

/**
 * Fila horizontal que se desliza con el dedo (nativo), arrastrando con el mouse
 * o con la ruedita en la compu. La usan las categorías de la carta y del panel.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const moved = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    isMouseDown.current = true;
    moved.current = false;
    setIsDragging(true);
    startX.current = e.pageX - el.offsetLeft;
    startScroll.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!isMouseDown.current || !el) return;
    e.preventDefault();
    const walk = (e.pageX - el.offsetLeft - startX.current) * 1.5;
    if (Math.abs(walk) > 4) moved.current = true;
    el.scrollLeft = startScroll.current - walk;
  };

  const stop = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  // La ruedita del mouse mueve la fila de costado. Va con un listener nativo
  // no pasivo porque el onWheel de React es pasivo y no puede frenar el scroll
  // vertical de la página. En los extremos de la fila dejamos que la página siga.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return {
    ref,
    isDragging,
    /** true si el último gesto fue un arrastre: en ese caso ignoramos el click. */
    wasDrag: () => moved.current,
    handlers: { onMouseDown, onMouseMove, onMouseUp: stop, onMouseLeave: stop },
  };
}
