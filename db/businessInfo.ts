/**
 * Datos fijos del local. Es la única fuente para el footer, el estado "Abierto ahora",
 * el JSON-LD que leen Google y los agentes de IA, y los archivos llms.txt / carta.md.
 * Si cambia un horario o la dirección, se cambia acá y nada más.
 */
export const BUSINESS_INFO = {
  name: 'DOREAR',
  legalName: 'Dorear · Pastelería de autor & Café de especialidad',
  description:
    'Cafetería de especialidad y pastelería de autor en Puerto Madero, Buenos Aires. Recetas caseras de la pastelera Agustina Ramírez: tortas, budines, desayunos, meriendas, brunch y pan de masa madre, con opciones sin TACC, veganas y sin lactosa.',
  founder: 'Agustina Ramírez',
  siteUrl: 'https://www.dorear.com.ar',
  address: {
    street: 'Rosario Vera Peñaloza 460',
    neighborhood: 'Puerto Madero',
    city: 'Ciudad Autónoma de Buenos Aires',
    region: 'CABA',
    country: 'AR',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Dorear+Rosario+Vera+Pe%C3%B1aloza+460+Puerto+Madero',
  reviewUrl: 'https://maps.google.com/?q=Dorear+Cafeteria+Puerto+Madero',
  instagramHandle: '@dorearcafe.ar',
  instagramUrl: 'https://www.instagram.com/dorearcafe.ar/',
  /** Cuenta para la seña de mesas grandes (se muestra en el formulario de reserva). */
  depositAccount: {
    alias: 'dorear.99',
    cvu: '0000003100084058255377',
    holder: 'Agustina Belen Ramirez Giri',
    bank: 'Mercado Pago',
  },
  /** Horarios en hora de Buenos Aires, en minutos desde las 00:00. */
  hours: {
    weekday: { open: 7 * 60 + 30, close: 21 * 60, label: '7:30 a 21 h' },
    weekend: { open: 8 * 60 + 30, close: 20 * 60 + 30, label: '8:30 a 20:30 h' },
  },
} as const;

export function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
