import type { MenuItem } from './types';

/**
 * Precios fijos en dólares, definidos en el código (no se editan desde el panel).
 *
 * Todo lo que esté en la categoría "Especiales" (cuadros pintados a mano) se muestra
 * a 690 USD, en el lugar del precio en pesos. Se busca por el id de la categoría, así
 * sigue funcionando aunque la dueña le cambie el nombre, y por nombre de la obra por
 * si la mueve de categoría.
 *
 * Decisión del local: la Res. 4/2025 pide exhibir el precio en pesos.
 */
const FIXED_USD_BY_CATEGORY_ID: Record<string, number> = {
  // Categoría "Especiales" (el id viene de cuando se llamaba "Cuadros de diseño…")
  'cat-cuadros-de-diseno-pintados-a-man-wyh6': 690,
};

const FIXED_USD_BY_NAME: Record<string, number> = {
  'cuadros de diseno pintados a mano': 690,
  'seleccion de obras exhibidas a la venta': 690,
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Devuelve el precio fijo en dólares del producto, o undefined si se cobra en pesos. */
export function getFixedUsdPrice(
  item: Pick<MenuItem, 'name' | 'categoryId'>
): number | undefined {
  return FIXED_USD_BY_CATEGORY_ID[item.categoryId] ?? FIXED_USD_BY_NAME[normalize(item.name.es)];
}
