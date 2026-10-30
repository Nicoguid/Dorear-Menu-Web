import { WeeklyDish } from './types';

export const WEEKLY_MENU_DISHES: WeeklyDish[] = [
  {
    dayNumber: 1,
    dayName: {
      es: 'Lunes',
      en: 'Monday',
      pt: 'Segunda',
    },
    title: {
      es: 'Pastas Caseras',
      en: 'Homemade Pasta',
      pt: 'Massas Caseiras',
    },
    description: {
      es: 'Malfatti · Ravioli · Canelones de calabaza, choclo y queso.',
      en: 'Malfatti, ravioli or pumpkin, corn & cheese cannelloni.',
      pt: 'Malfatti, ravioli ou canelones de abóbora, milho e queijo.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
    priceDineIn: 20000,
    priceTakeAway: 14000,
    dietary: [],
    allergens: ['tacc', 'lacteos', 'huevo'],
  },
  {
    dayNumber: 2,
    dayName: {
      es: 'Martes',
      en: 'Tuesday',
      pt: 'Terça',
    },
    title: {
      es: 'Risotto Milanés',
      en: 'Milanese Risotto',
      pt: 'Risoto Milanês',
    },
    description: {
      es: 'Cremoso risotto estilo milanés con azafrán.',
      en: 'Creamy saffron Milanese risotto.',
      pt: 'Risoto cremoso estilo milanês com açafrão.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=900&q=80',
    priceDineIn: 20000,
    priceTakeAway: 14000,
    dietary: ['sin_tacc'],
    allergens: ['lacteos'],
  },
  {
    dayNumber: 3,
    dayName: {
      es: 'Miércoles',
      en: 'Wednesday',
      pt: 'Quarta',
    },
    title: {
      es: 'Pechuguitas al Verdeo',
      en: 'Chicken in Scallion Cream',
      pt: 'Frango com Cebolinha e Creme',
    },
    description: {
      es: 'Pechuguitas de pollo al verdeo con guarnición.',
      en: 'Tender chicken breast in scallion cream sauce with side dish.',
      pt: 'Peito de frango ao molho de cebolinha com acompanhamento.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
    priceDineIn: 20000,
    priceTakeAway: 14000,
    dietary: ['sin_tacc'],
    allergens: ['lacteos'],
  },
  {
    dayNumber: 4,
    dayName: {
      es: 'Jueves',
      en: 'Thursday',
      pt: 'Quinta',
    },
    title: {
      es: 'Bondiola con Papas y Boniatos',
      en: 'Braised Pork with Sweet Potatoes',
      pt: 'Copa Lombo com Batatas',
    },
    description: {
      es: 'Bondiola braseada acompañada de papas y boniatos.',
      en: 'Slow-cooked pork shoulder served with roasted potatoes & sweet potatoes.',
      pt: 'Copa lombo assada servida com batatas e batata-doce.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    priceDineIn: 20000,
    priceTakeAway: 14000,
    dietary: ['sin_tacc', 'sin_lactosa'],
    allergens: [],
  },
  {
    dayNumber: 5,
    dayName: {
      es: 'Viernes',
      en: 'Friday',
      pt: 'Sexta',
    },
    title: {
      es: 'Milanesita Capresse',
      en: 'Caprese Milanesa',
      pt: 'Milanesa Caprese',
    },
    description: {
      es: 'Milanesa con mozzarella fundida, rodajas de tomate y albahaca.',
      en: 'Breaded beef cutlet topped with melted mozzarella, tomato and fresh basil.',
      pt: 'Milanesa gratinada com mussarela, tomate e manjericão fresco.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=80',
    priceDineIn: 20000,
    priceTakeAway: 14000,
    dietary: [],
    allergens: ['tacc', 'lacteos', 'huevo'],
  },
];
