import { MenuCategory, MenuItem, ProductModifier } from './types';

export const MILK_MODIFIERS: ProductModifier[] = [
  {
    id: 'mod-leche-avena',
    name: {
      es: 'Leche de avena (Contiene TACC)',
      en: 'Oat milk (Contains gluten/TACC)',
      pt: 'Leite de aveia (Contém glúten/TACC)',
    },
    price: 900,
    invalidatesDietary: ['sin_tacc'],
    allergens: ['tacc'],
  },
  {
    id: 'mod-leche-almendras',
    name: {
      es: 'Leche de almendras',
      en: 'Almond milk',
      pt: 'Leite de amêndoas',
    },
    price: 1000,
    allergens: ['frutos_secos'],
  },
  {
    id: 'mod-leche-proteica',
    name: {
      es: 'Leche proteica',
      en: 'Protein milk',
      pt: 'Leite proteico',
    },
    price: 900,
    invalidatesDietary: ['vegano', 'sin_lactosa'],
    allergens: ['lacteos'],
  },
];

export const COFFEE_MODIFIERS: ProductModifier[] = [
  ...MILK_MODIFIERS,
  {
    id: 'mod-extra-shot',
    name: {
      es: 'Shot extra de café',
      en: 'Extra espresso shot',
      pt: 'Shot extra de café',
    },
    price: 1500,
  },
];

export const MEDIALUNA_MODIFIERS: ProductModifier[] = [
  {
    id: 'mod-medialuna-ddl-pastelera',
    name: {
      es: 'Rellena con dulce de leche o pastelera',
      en: 'Filled with dulce de leche or pastry cream',
      pt: 'Recheada com doce de leite ou creme',
    },
    price: 1500,
    invalidatesDietary: ['vegano', 'sin_lactosa'],
    allergens: ['lacteos'],
  },
  {
    id: 'mod-medialuna-jyq',
    name: {
      es: 'Con jamón y queso',
      en: 'With ham and cheese',
      pt: 'Com presunto e queijo',
    },
    price: 1500,
    invalidatesDietary: ['vegano', 'sin_lactosa'],
    allergens: ['lacteos'],
  },
];

export const CATEGORIES: MenuCategory[] = [
  {
    "id": "cat-0",
    "order": 1,
    "name": {
      "es": "Café de especialidad",
      "en": "Specialty Coffee",
      "pt": "Café Especial"
    },
    "description": {
      "es": "Tu pausa, preparada con dedicación.",
      "en": "Expertly dialed-in daily espresso bar.",
      "pt": "Sua pausa preparada com dedicação."
    }
  },
  {
    "id": "cat-8",
    "order": 2,
    "name": {
      "es": "Café frío & Bebidas",
      "en": "Iced Coffee & Drinks",
      "pt": "Café Gelado & Bebidas"
    },
    "description": {
      "es": "Para refrescar tu día.",
      "en": "To refresh your day.",
      "pt": "Para refrescar seu dia."
    }
  },
  {
    "id": "cat-6",
    "order": 3,
    "name": {
      "es": "Jugos & Licuados",
      "en": "Juices & Smoothies",
      "pt": "Sucos & Vitaminas"
    },
    "description": {
      "es": "Frescos, simples y llenos de sabor.",
      "en": "Fresh, simple and full of flavor.",
      "pt": "Frescos, naturais e cheios de sabor."
    }
  },
  {
    "id": "cat-1",
    "order": 4,
    "name": {
      "es": "Desayunos & Meriendas",
      "en": "Breakfast & Afternoon",
      "pt": "Café da Manhã & Lanches"
    },
    "description": {
      "es": "Pequeños placeres, a cualquier hora.",
      "en": "Little pleasures, any time of day.",
      "pt": "Pequenos prazeres a qualquer hora."
    }
  },
  {
    "id": "cat-2",
    "order": 5,
    "name": {
      "es": "Tortas y Budines",
      "en": "Cakes & Pastries",
      "pt": "Bolos & Confeitaria"
    },
    "description": {
      "es": "Pastelería de autor. Elaboración artesanal.",
      "en": "Artisan recipes crafted daily by Agustina.",
      "pt": "Confeitaria autoral e artesanal."
    }
  },
  {
    "id": "cat-3",
    "order": 6,
    "name": {
      "es": "Delicias & Pastas",
      "en": "Lunch & Fresh Pasta",
      "pt": "Almoço & Massas Frescas"
    },
    "description": {
      "es": "Algo rico para seguir tu día.",
      "en": "Wholesome homemade meals and salads.",
      "pt": "Comida caseira para o seu dia."
    }
  },
  {
    "id": "cat-5",
    "order": 7,
    "name": {
      "es": "Brunch para compartir",
      "en": "Brunch to Share",
      "pt": "Brunch para Compartilhar"
    },
    "description": {
      "es": "Un ratito para disfrutar de a dos.",
      "en": "A special moment made for two.",
      "pt": "Um momento especial a dois."
    }
  },
  {
    "id": "cat-4",
    "order": 8,
    "name": {
      "es": "Masa madre",
      "en": "Artisan Sourdough",
      "pt": "Fermentação Natural"
    },
    "description": {
      "es": "Pan con tiempo y fermentación lenta.",
      "en": "Slow-fermented artisan sourdough breads.",
      "pt": "Pães artesanais de fermentação lenta."
    }
  },
  {
    "id": "4f24fe3d-5b26-4275-9414-4b6b6ef7bd08",
    "order": 9,
    "name": {
      "es": "Otros Sándwiches",
      "en": "Specialty Sandwiches",
      "pt": "Sanduíches Especiais"
    },
    "description": {
      "es": "Sándwiches especiales y focaccias.",
      "en": "House bagels and Roman focaccias.",
      "pt": "Bagels artesanais e focaccias romanas."
    }
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    "id": "item-0-0",
    "categoryId": "cat-0",
    "name": {
      "es": "Ristretto",
      "en": "Ristretto",
      "pt": "Ristretto"
    },
    "description": {
      "es": "",
      "en": "Short and concentrated 20ml extraction.",
      "pt": "Extração curta e concentrada de 20ml."
    },
    "price": 4200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-0-1",
    "categoryId": "cat-0",
    "name": {
      "es": "Espresso",
      "en": "Espresso",
      "pt": "Espresso"
    },
    "description": {
      "es": "",
      "en": "Single shot calibrated daily.",
      "pt": "Extração simples calibrada no dia."
    },
    "price": 4200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-0-2",
    "categoryId": "cat-0",
    "name": {
      "es": "Espresso doble",
      "en": "Double Espresso",
      "pt": "Espresso duplo"
    },
    "description": {
      "es": "",
      "en": "Double espresso shot.",
      "pt": "Duplo shot de espresso."
    },
    "price": 4700,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-0-3",
    "categoryId": "cat-0",
    "name": {
      "es": "Café americano",
      "en": "Americano",
      "pt": "Café americano"
    },
    "description": {
      "es": "",
      "en": "Double espresso diluted with hot water.",
      "pt": "Duplo shot de espresso com água quente."
    },
    "price": 4500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-0-4",
    "categoryId": "cat-0",
    "name": {
      "es": "Cortado",
      "en": "Cortado",
      "pt": "Cortado"
    },
    "description": {
      "es": "",
      "en": "Espresso with a dash of warm milk.",
      "pt": "Espresso com um toque de leite quente."
    },
    "price": 4900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": COFFEE_MODIFIERS
  },
  {
    "id": "item-0-5",
    "categoryId": "cat-0",
    "name": {
      "es": "Flat white",
      "en": "Flat White",
      "pt": "Flat White"
    },
    "description": {
      "es": "",
      "en": "Double ristretto with velvety steamed milk.",
      "pt": "Duplo ristretto com leite vaporizado sedoso."
    },
    "price": 6200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": COFFEE_MODIFIERS
  },
  {
    "id": "item-0-6",
    "categoryId": "cat-0",
    "name": {
      "es": "Capuchino",
      "en": "Cappuccino",
      "pt": "Capuchino"
    },
    "description": {
      "es": "",
      "en": "Espresso, steamed milk and creamy foam.",
      "pt": "Espresso, leite e espuma cremosa."
    },
    "price": 5900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": COFFEE_MODIFIERS
  },
  {
    "id": "item-0-7",
    "categoryId": "cat-0",
    "name": {
      "es": "Latte",
      "en": "Caffè Latte",
      "pt": "Café Latte"
    },
    "description": {
      "es": "",
      "en": "Espresso with silky steamed milk.",
      "pt": "Espresso com leite vaporizado."
    },
    "price": 6200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": COFFEE_MODIFIERS
  },
  {
    "id": "item-0-8",
    "categoryId": "cat-0",
    "name": {
      "es": "Café bombón",
      "en": "Café Bombón",
      "pt": "Café Bombom"
    },
    "description": {
      "es": "Espresso con generosa medida de leche condensada.",
      "en": "Espresso layered with sweet condensed milk.",
      "pt": "Espresso com generosa dose de leite condensado."
    },
    "price": 6000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "bd7df34d-764d-4913-9661-3960a220cdf9",
    "categoryId": "cat-0",
    "name": {
      "es": "Espresso con crema chantilly",
      "en": "Espresso with Chantilly Cream",
      "pt": "Espresso com Chantilly"
    },
    "description": {
      "es": "",
      "en": "Espresso topped with homemade Chantilly whipped cream.",
      "pt": "Espresso coroado com chantilly artesanal."
    },
    "price": 6500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "b3f85d48-d5f6-436b-a483-d1b3db6db5a8",
    "categoryId": "cat-0",
    "name": {
      "es": "Matcha latte",
      "en": "Matcha Latte",
      "pt": "Matcha Latte"
    },
    "description": {
      "es": "Shot de matcha batido con leche.",
      "en": "Ceremonial green matcha whisked with milk.",
      "pt": "Chá verde matcha batido com leite."
    },
    "price": 6500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": MILK_MODIFIERS
  },
  {
    "id": "fb988921-b7e8-4ed3-8af9-ab7f92899011",
    "categoryId": "cat-0",
    "name": {
      "es": "Espresso Tonic",
      "en": "Espresso Tonic",
      "pt": "Espresso Tônica"
    },
    "description": {
      "es": "Shot de espresso, agua tónica, hielo y piel de naranja.",
      "en": "Espresso shot, tonic water, ice and orange peel.",
      "pt": "Dose de espresso, água tônica e casca de laranja."
    },
    "price": 7500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "7558dd08-7976-4197-9f6a-bdc65576b561",
    "categoryId": "cat-0",
    "name": {
      "es": "Mocaccino",
      "en": "Mocaccino",
      "pt": "Mocaccino"
    },
    "description": {
      "es": "Shot de espresso, chocolate y leche cremada.",
      "en": "Espresso shot, artisan chocolate and steamed milk.",
      "pt": "Espresso, chocolate artesanal e leite vaporizado."
    },
    "price": 7000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "6137a280-7a67-4ef1-8bab-90f8592ed531",
    "categoryId": "cat-0",
    "name": {
      "es": "Submarino",
      "en": "Submarino Hot Chocolate",
      "pt": "Chocolate Quente Submarino"
    },
    "description": {
      "es": "Leche caliente con barra de chocolate Águila.",
      "en": "Steamed hot milk with an Águila chocolate bar.",
      "pt": "Leite bem quente com barra de chocolate Águila."
    },
    "price": 6000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "16abd6cd-53d6-4aee-920d-735e78352f95",
    "categoryId": "cat-0",
    "name": {
      "es": "Adicionales",
      "en": "Milk Options & Extras",
      "pt": "Adicionais & Leite Vegetal"
    },
    "description": {
      "es": "Leche de almendras ($1.000) · Leche de avena ($900) · Leche proteica ($900) · Shot extra ($1.500).",
      "en": "Almond milk ($1,000) · Oat milk ($900) · Protein milk ($900) · Extra shot ($1,500).",
      "pt": "Leite de amêndoas ($1.000) · Leite de aveia ($900) · Leite proteico ($900) · Dose extra ($1.500)."
    },
    "price": 1500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1556742049-0a67c57750c9?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "cb57bde3-7b20-4ec3-a1af-5c0e067cafae",
    "categoryId": "cat-0",
    "name": {
      "es": "Tés en hebras",
      "en": "Loose Leaf Tea",
      "pt": "Chás em Folhas"
    },
    "description": {
      "es": "Variedad de tés seleccionados.",
      "en": "Curated selection of loose leaf teas.",
      "pt": "Variedade de chás selecionados."
    },
    "price": 4500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-8-0",
    "categoryId": "cat-8",
    "name": {
      "es": "Agua mineral / con gas",
      "en": "Still / Sparkling Water",
      "pt": "Água sem Gás / com Gás"
    },
    "description": {
      "es": "Botella de 500 ml.",
      "en": "500 ml bottle.",
      "pt": "Garrafa de 500 ml."
    },
    "price": 2900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-8-1",
    "categoryId": "cat-8",
    "name": {
      "es": "Gaseosas línea Coca-Cola",
      "en": "Coca-Cola Sodas",
      "pt": "Refrigerantes Coca-Cola"
    },
    "description": {
      "es": "Botella de 500 ml.",
      "en": "500 ml bottle.",
      "pt": "Garrafa de 500 ml."
    },
    "price": 4800,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "c8261434-0d9b-4888-9ab8-538302a6c914",
    "categoryId": "cat-8",
    "name": {
      "es": "Iced Matcha",
      "en": "Iced Matcha",
      "pt": "Iced Matcha"
    },
    "description": {
      "es": "Shot de matcha batido con leche y hielo.",
      "en": "Matcha shot whisked with cold milk and ice.",
      "pt": "Matcha batido com leite gelado e pedras de gelo."
    },
    "price": 6500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": MILK_MODIFIERS
  },
  {
    "id": "7eab702b-c3a5-43bb-a4df-ef9b8cc40155",
    "categoryId": "cat-8",
    "name": {
      "es": "Iced coffee",
      "en": "Iced Coffee",
      "pt": "Café Gelado"
    },
    "description": {
      "es": "Shot de espresso doble, agua y hielo.",
      "en": "Double espresso shot with cold water and ice.",
      "pt": "Shot duplo de espresso com água gelada e gelo."
    },
    "price": 4200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "1e193241-2123-4d62-802c-1c2c7e92567b",
    "categoryId": "cat-8",
    "name": {
      "es": "Iced latte",
      "en": "Iced Latte",
      "pt": "Iced Latte"
    },
    "description": {
      "es": "Shot de espresso con leche fría y hielo.",
      "en": "Espresso shot with cold milk and clear ice.",
      "pt": "Shot de espresso com leite frio e gelo."
    },
    "price": 6200,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": COFFEE_MODIFIERS
  },
  {
    "id": "0d372ac2-2a8d-4185-8efe-f84b37e24b23",
    "categoryId": "cat-8",
    "name": {
      "es": "Frappé Dorear",
      "en": "Dorear Signature Frappé",
      "pt": "Frappé Dorear Especial"
    },
    "description": {
      "es": "Espresso, leche, hielo, syrup a elección y crema chantilly.",
      "en": "Espresso, milk, ice, syrup (vanilla, caramel or chocolate) and Chantilly cream.",
      "pt": "Espresso, leite, gelo, calda a escolha e creme chantilly."
    },
    "price": 10000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "item-6-0",
    "categoryId": "cat-6",
    "name": {
      "es": "Licuado proteico ENA Sport",
      "en": "ENA Protein Smoothie",
      "pt": "Vitamina Proteica ENA"
    },
    "description": {
      "es": "Leche proteica, scoop de proteína vainilla ENA, banana y hielo.",
      "en": "High-protein milk, vanilla ENA protein scoop, banana and ice.",
      "pt": "Leite proteico, dose de proteína de baunilha ENA, banana e gelo."
    },
    "price": 9500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "item-6-1",
    "categoryId": "cat-6",
    "name": {
      "es": "Licuado de frutos rojos",
      "en": "Berry Smoothie",
      "pt": "Vitamina de Frutas Vermelhas"
    },
    "description": {
      "es": "A base de leche a elección o agua con mix de frutos rojos.",
      "en": "Made with choice of milk or water blended with mixed berries.",
      "pt": "À base de leite à escolha ou água batido com frutas vermelhas."
    },
    "price": 7900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": MILK_MODIFIERS
  },
  {
    "id": "item-6-2",
    "categoryId": "cat-6",
    "name": {
      "es": "Licuado de banana",
      "en": "Banana Smoothie",
      "pt": "Vitamina de Banana"
    },
    "description": {
      "es": "A base de leche a elección y banana.",
      "en": "Made with choice of milk blended with fresh banana.",
      "pt": "À base de leite à escolha batido com banana fresca."
    },
    "price": 6900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "modifiers": MILK_MODIFIERS
  },
  {
    "id": "item-6-3",
    "categoryId": "cat-6",
    "name": {
      "es": "Limonada con menta y jengibre",
      "en": "Mint & Ginger Lemonade",
      "pt": "Limonada com Hortelã e Gengibre"
    },
    "description": {
      "es": "Jugo natural de limón, menta fresca y jengibre. Vaso individual ($5.000) o jarra ($12.000).",
      "en": "Fresh squeezed lemon, mint and ginger. Single glass ($5,000) or sharing pitcher ($12,000).",
      "pt": "Suco natural de limão, hortelã e gengibre. Copo individual ($5.000) ou jarra ($12.000)."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "ed980491-d4bf-41c8-a8c7-ed5ffe875fb0",
    "categoryId": "cat-6",
    "name": {
      "es": "Jugo de naranja exprimido",
      "en": "Fresh Squeezed Orange Juice",
      "pt": "Suco de Laranja Espremido"
    },
    "description": {
      "es": "Vaso de 480 ml exprimido al momento.",
      "en": "Freshly squeezed 480 ml glass.",
      "pt": "Copo de 480 ml espremido na hora."
    },
    "price": 5900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-1-0",
    "categoryId": "cat-1",
    "name": {
      "es": "Sfogliatella",
      "en": "Neapolitan Sfogliatella",
      "pt": "Sfogliatella Napolitana"
    },
    "description": {
      "es": "Hojaldre tradicional italiano relleno de crema pastelera.",
      "en": "Traditional crispy layered Italian pastry filled with pastry cream.",
      "pt": "Folhado tradicional italiano recheado com creme de confeiteiro."
    },
    "price": 4000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-1-3",
    "categoryId": "cat-1",
    "name": {
      "es": "Medialunas de manteca",
      "en": "Traditional Butter Medialunas",
      "pt": "Meias-Luas de Manteiga"
    },
    "description": {
      "es": "Medialuna artesanal. Con dulce de leche o pastelera (+$1.500) · Con jamón y queso (+$1.500).",
      "en": "Artisan butter pastry. With dulce de leche or pastry cream (+$1,500) · With ham and cheese (+$1,500).",
      "pt": "Folhado de manteiga. Com doce de leite ou creme (+$1.500) · Com presunto e queijo (+$1.500)."
    },
    "price": 2900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
    "modifiers": MEDIALUNA_MODIFIERS
  },
  {
    "id": "item-1-5",
    "categoryId": "cat-1",
    "name": {
      "es": "Alfajor de maicena",
      "en": "Cornstarch Alfajor",
      "pt": "Alfajor de Maisena"
    },
    "description": {
      "es": "Relleno de dulce de leche repostero y coco rallado.",
      "en": "Stuffed with artisan dulce de leche and shredded coconut.",
      "pt": "Recheado com doce de leite e coco ralado."
    },
    "price": 3900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "item-1-6",
    "categoryId": "cat-1",
    "name": {
      "es": "Cookie de chocolate y sal marina",
      "en": "Dark Chocolate & Sea Salt Cookie",
      "pt": "Cookie de Chocolate e Flor de Sal"
    },
    "description": {
      "es": "",
      "en": "Soft baked cookie with 70% dark chocolate and sea salt.",
      "pt": "Massa macia com chocolate 70% e flor de sal."
    },
    "price": 6000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-1-7",
    "categoryId": "cat-1",
    "name": {
      "es": "Tostón de masa madre con palta",
      "en": "Sourdough Avocado Toast",
      "pt": "Torrada de Fermentação Natural com Abacate"
    },
    "description": {
      "es": "Hogaza de masa madre con palta pisada, huevo revuelto y semillas.",
      "en": "Toasted sourdough with smashed avocado, scrambled eggs and seeds.",
      "pt": "Pão de fermentação natural com abacate, ovos mexidos e sementes."
    },
    "price": 8000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_lactosa"
    ]
  },
  {
    "id": "item-1-8",
    "categoryId": "cat-1",
    "name": {
      "es": "Bowl de yogurt griego",
      "en": "Greek Yogurt & Granola Bowl",
      "pt": "Bowl de Iogurte Grego com Granola"
    },
    "description": {
      "es": "Con granola casera crocante y frutas de estación.",
      "en": "With homemade crunchy granola and seasonal fruit.",
      "pt": "Com granola caseira crocante e frutas da estação."
    },
    "price": 9000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-1-9",
    "categoryId": "cat-1",
    "name": {
      "es": "Bowl de helado natural",
      "en": "Natural Berry Sorbet Bowl",
      "pt": "Bowl de Sorvete Natural de Frutas"
    },
    "description": {
      "es": "A base de frutos rojos y banana con arándanos naturales.",
      "en": "Wild berry and banana blend topped with fresh blueberries.",
      "pt": "Base de frutas vermelhas e banana com mirtilos frescos."
    },
    "price": 8000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "f1284a69-7614-4eff-bd05-6db8b0513e85",
    "categoryId": "cat-1",
    "name": {
      "es": "Huevos revueltos",
      "en": "Scrambled Eggs on Toast",
      "pt": "Ovos Mexidos na Torrada"
    },
    "description": {
      "es": "3 huevos revueltos con jamón natural, queso y tostada de pan con semillas.",
      "en": "3 scrambled eggs with artisan ham, cheese and seeded sourdough toast.",
      "pt": "3 ovos mexidos com presunto, queijo e torrada de pão com sementes."
    },
    "price": 8500,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "fffaa787-594b-4c37-bd42-a65d3ab5f3c0",
    "categoryId": "cat-1",
    "name": {
      "es": "Tostado de chipá",
      "en": "Grilled Chipá Cheese Sandwich",
      "pt": "Tostex de Chipá com Queijo e Presunto"
    },
    "description": {
      "es": "Relleno de queso Dambo y lomito con hierbas.",
      "en": "Baked cheese bread filled with melted dambo cheese and cured pork.",
      "pt": "Pão de queijo chipá recheado com queijo dambo e lombo defumado."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "5fa61efe-f352-4892-bbca-8ae78fe86cb5",
    "categoryId": "cat-1",
    "name": {
      "es": "Pan de campo de masa madre tostado",
      "en": "Toasted Country Sourdough Bread",
      "pt": "Pão Rústico de Fermentação Natural"
    },
    "description": {
      "es": "",
      "en": "Served with artisan jam, dulce de leche and cream cheese.",
      "pt": "Servido com geléia artesanal, doce de leite e cream cheese."
    },
    "price": 10000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-2-0",
    "categoryId": "cat-2",
    "name": {
      "es": "Porción de torta argentina",
      "en": "Argentine Dulce de Leche Cake",
      "pt": "Torta Argentina com Doce de Leite"
    },
    "description": {
      "es": "Masa suave sablée rellena de dulce de leche y nueces pecán.",
      "en": "Tender sablée pastry layered with dulce de leche and pecan nuts.",
      "pt": "Massa sablée macia recheada com doce de leite e nozes pecã."
    },
    "price": 9000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80",
    "allergens": [
      "frutos_secos",
      "tacc",
      "lacteos"
    ]
  },
  {
    "id": "item-2-2",
    "categoryId": "cat-2",
    "name": {
      "es": "Red velvet",
      "en": "Classic Red Velvet Cake",
      "pt": "Bolo Red Velvet Tradicional"
    },
    "description": {
      "es": "",
      "en": "Moist red velvet sponge with cream cheese frosting.",
      "pt": "Massa aveludada com frosting de cream cheese."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-2-3",
    "categoryId": "cat-2",
    "name": {
      "es": "Torta de frutilla con crema",
      "en": "Strawberry & Cream Cake",
      "pt": "Torta de Morango com Chantilly"
    },
    "description": {
      "es": "",
      "en": "Light sponge layered with fresh strawberries and chantilly.",
      "pt": "Pão de ló leve, morangos frescos e creme chantilly."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-2-4",
    "categoryId": "cat-2",
    "name": {
      "es": "Carrot cake",
      "en": "Spiced Carrot Cake",
      "pt": "Bolo de Cenoura com Nozes"
    },
    "description": {
      "es": "",
      "en": "Moist spiced carrot cake with toasted walnuts and cream cheese.",
      "pt": "Massa úmida de cenoura com nozes e cobertura de cream cheese."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80",
    "allergens": [
      "frutos_secos",
      "tacc",
      "lacteos"
    ]
  },
  {
    "id": "item-2-5",
    "categoryId": "cat-2",
    "name": {
      "es": "Tortas del día",
      "en": "Daily Cakes (Ask Barista)",
      "pt": "Bolos do Dia (Consulte a Vitrine)"
    },
    "description": {
      "es": "Consultá las opciones especiales en nuestro exhibidor.",
      "en": "Ask our team for today freshly baked specials on display.",
      "pt": "Consulte as opções frescas do dia em nossa vitrine."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "ed7dc9ad-4241-4112-94df-ba1bf58dd1fd",
    "categoryId": "cat-2",
    "name": {
      "es": "Porción de budín de limón y amapola",
      "en": "Lemon & Poppy Seed Loaf",
      "pt": "Bolo de Limão com Sementes de Papoula"
    },
    "description": {
      "es": "",
      "en": "Moist citrus crumb with delicate lemon glaze.",
      "pt": "Massa fofa com calda cítrica de limão e papoula."
    },
    "price": 6000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "6063c964-312c-455d-880e-802906493af3",
    "categoryId": "cat-2",
    "name": {
      "es": "Porción de budín con chips de chocolate (x2)",
      "en": "Chocolate Chip Loaf Slices (x2)",
      "pt": "Fatias de Bolo com Gotas de Chocolate (x2)"
    },
    "description": {
      "es": "",
      "en": "Two slices packed with dark chocolate chips.",
      "pt": "Duas fatias recheadas com gotas de chocolate meio amargo."
    },
    "price": 7000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "b01afb85-5fc1-4991-ac3f-fd8883c027af",
    "categoryId": "cat-2",
    "name": {
      "es": "Torta Devil's",
      "en": "Devil's Food Cake",
      "pt": "Torta Devil's de Chocolate"
    },
    "description": {
      "es": "Torta húmeda de doble chocolate rellena de ganache.",
      "en": "Rich moist double chocolate cake with velvety ganache.",
      "pt": "Bolo úmido de puro chocolate recheado com ganache."
    },
    "price": 9000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "9793a560-a36b-4a6c-976c-293491b1be6d",
    "categoryId": "cat-2",
    "name": {
      "es": "Suspiro de nuez",
      "en": "Flourless Walnut Meringue Cake",
      "pt": "Suspiro de Nozes Sem Glúten"
    },
    "description": {
      "es": "Base crujiente de nuez sin harina, dulce de leche y crema chantilly.",
      "en": "Flourless walnut meringue layered with dulce de leche and chantilly.",
      "pt": "Base crocante de nozes sem farinha, doce de leite e chantilly."
    },
    "price": 10000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ],
    "allergens": [
      "frutos_secos",
      "lacteos",
      "huevo"
    ]
  },
  {
    "id": "item-3-0",
    "categoryId": "cat-3",
    "name": {
      "es": "Ensalada César",
      "en": "Chicken Caesar Salad",
      "pt": "Salada Caesar com Frango"
    },
    "description": {
      "es": "Lechuga, pollo grillado, aderezo césar casero, parmesano y crutones.",
      "en": "Romaine lettuce, grilled chicken, house Caesar dressing, parmesan and croutons.",
      "pt": "Alface, frango grelhado, molho Caesar caseiro, parmesão e croutons."
    },
    "price": 19000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-3-1",
    "categoryId": "cat-3",
    "name": {
      "es": "Ensalada de zanahoria y atún",
      "en": "Tuna & Carrot Salad",
      "pt": "Salada de Cenoura e Atum"
    },
    "description": {
      "es": "Base de lechuga fresca, zanahoria rallada, atún y huevo.",
      "en": "Fresh lettuce base, shredded carrots, tuna and boiled egg.",
      "pt": "Alface fresca, cenoura ralada, atum e ovo cozido."
    },
    "price": 19000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc",
      "sin_lactosa"
    ]
  },
  {
    "id": "item-3-2",
    "categoryId": "cat-3",
    "name": {
      "es": "Omelette de jamón y queso",
      "en": "Ham & Cheese Omelette",
      "pt": "Omelete de Presunto e Queijo"
    },
    "description": {
      "es": "Con jamón natural cocido y queso fundido.",
      "en": "Folded with artisan ham and melted cheese.",
      "pt": "Com presunto cozido e queijo derretido."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "item-3-3",
    "categoryId": "cat-3",
    "name": {
      "es": "Omelette de queso y tomate",
      "en": "Tomato & Cheese Omelette",
      "pt": "Omelete de Queijo e Tomate"
    },
    "description": {
      "es": "Relleno de queso derretido y rodajas de tomate fresco.",
      "en": "Stuffed with melted cheese and fresh tomato slices.",
      "pt": "Recheado com queijo derretido e fatias de tomate fresco."
    },
    "price": 11000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_tacc"
    ]
  },
  {
    "id": "824dd0e2-9d59-4bd3-8b4c-439b034e5fc3",
    "categoryId": "cat-3",
    "name": {
      "es": "Raviolones de calabaza y mascarpone",
      "en": "Pumpkin & Mascarpone Ravioloni",
      "pt": "Ravioloni de Abóbora e Mascarpone"
    },
    "description": {
      "es": "Acompañados de una suave crema azafranada.",
      "en": "Tossed in a delicate saffron cream sauce.",
      "pt": "Servidos com suave molho cremoso ao açafrão."
    },
    "price": 19000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "a27f6c13-1503-430f-919e-7a3791cb187f",
    "categoryId": "cat-3",
    "name": {
      "es": "Tortelletini veganos",
      "en": "Vegan Tortelletini",
      "pt": "Tortelletini Vegano"
    },
    "description": {
      "es": "Con crema vegetal o salsa rosa a elección.",
      "en": "Plant-based stuffed pasta with vegan cream or pink tomato sauce.",
      "pt": "Massa recheada vegetal com molho branco ou rosé."
    },
    "price": 17000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "vegano",
      "sin_lactosa"
    ]
  },
  {
    "id": "ee170c66-32ab-4aaf-bfaf-795824a05e95",
    "categoryId": "cat-3",
    "name": {
      "es": "Panzotti de puerro y queso azul",
      "en": "Leek & Blue Cheese Panzotti",
      "pt": "Panzotti de Alho-Poró e Gorgonzola"
    },
    "description": {
      "es": "Con salsa a elección: crema, salsa roja o salsa rosa.",
      "en": "Served with your choice of cream, red or pink tomato sauce.",
      "pt": "Com molho à escolha: creme, molho vermelho ou rosé."
    },
    "price": 19000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "66f26a65-39b7-46b4-800e-03476d926d91",
    "categoryId": "cat-3",
    "name": {
      "es": "Agnolotti de roast beef",
      "en": "Roast Beef Agnolotti",
      "pt": "Agnolotti de Carne Assada"
    },
    "description": {
      "es": "Rellenos de roast beef braseado, con salsa a elección: crema, salsa roja o salsa rosa.",
      "en": "Stuffed with slow-cooked roast beef with choice of sauce.",
      "pt": "Recheados com carne assada lentamente com molho à escolha."
    },
    "price": 20000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "fb5f04df-a2ed-4e1c-a62c-b948d426334e",
    "categoryId": "cat-3",
    "name": {
      "es": "Maccheroni con manteca y queso",
      "en": "Butter & Parmesan Maccheroni",
      "pt": "Maccheroni na Manteiga e Queijo"
    },
    "description": {
      "es": "Con manteca, crema y queso parmesano.",
      "en": "Fresh pasta with golden butter, light cream and aged parmesan.",
      "pt": "Massa fresca com manteiga dourada, creme e queijo parmesão."
    },
    "price": 18000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-5-0",
    "categoryId": "cat-5",
    "name": {
      "es": "Nuestro brunch para compartir",
      "en": "Signature Brunch for Two",
      "pt": "Nosso Brunch para Dois"
    },
    "description": {
      "es": "2 infusiones, 2 jugos o limonadas, 2 medialunas, 2 tostados, 2 alfajores, 2 scones, budín y torta.",
      "en": "2 coffees, 2 juices or lemonades, 2 medialunas, 2 toasts, 2 alfajores, 2 scones, loaf and cake.",
      "pt": "2 cafés, 2 sucos ou limonadas, 2 meias-luas, 2 tostex, 2 alfajores, 2 scones, bolo e torta."
    },
    "price": 39900,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "c30cbed9-7b2d-48bd-80c0-1942445060f7",
    "categoryId": "cat-5",
    "name": {
      "es": "Brunch saludable salado",
      "en": "Savory Healthy Brunch",
      "pt": "Brunch Saudável Salgado"
    },
    "description": {
      "es": "2 infusiones a elección, 2 limonadas y 2 tostones de masa madre con palta.",
      "en": "2 hot drinks, 2 fresh lemonades and 2 sourdough avocado toasts.",
      "pt": "2 cafés ou chás, 2 limonadas e 2 torradas de fermentação natural com abacate."
    },
    "price": 25000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
    "dietary": [
      "sin_lactosa"
    ]
  },
  {
    "id": "fc8478b8-e9f1-4b93-964e-961100322384",
    "categoryId": "cat-5",
    "name": {
      "es": "Brunch saludable dulce",
      "en": "Sweet Healthy Brunch",
      "pt": "Brunch Saudável Doce"
    },
    "description": {
      "es": "2 infusiones a elección, 1 bowl de yogurt griego y 1 bowl de helado de fruta con granola.",
      "en": "2 hot drinks, 1 Greek yogurt bowl with fruit and 1 natural berry sorbet bowl.",
      "pt": "2 cafés, 1 bowl de iogurte grego com frutas e 1 bowl de frutas com granola."
    },
    "price": 20000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-4-0",
    "categoryId": "cat-4",
    "name": {
      "es": "Tostado de jamón y queso individual",
      "en": "Artisan Grilled Ham & Cheese",
      "pt": "Tostex de Presunto e Queijo Artesanal"
    },
    "description": {
      "es": "Pan de campo de masa madre, jamón natural cocido, queso fundido y aceite de oliva.",
      "en": "Rustic sourdough bread, artisan ham, melted cheese and extra virgin olive oil.",
      "pt": "Pão rústico de fermentação lenta, presunto cozido, queijo derretido e azeite."
    },
    "price": 8000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-4-1",
    "categoryId": "cat-4",
    "name": {
      "es": "Ciabatta con jamón crudo y rúcula",
      "en": "Prosciutto & Arugula Ciabatta",
      "pt": "Ciabatta com Presunto Cru e Rúcula"
    },
    "description": {
      "es": "Jamón crudo, queso Dambo, rúcula, parmesano y aceite de oliva.",
      "en": "Prosciutto, melted dambo cheese, baby arugula and olive oil.",
      "pt": "Presunto cru curado, queijo dambo, rúcula fresca e azeite de oliva."
    },
    "price": 13000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "item-4-2",
    "categoryId": "cat-4",
    "name": {
      "es": "Ciabatta de pollo y vegetales",
      "en": "Chicken & Roasted Veggie Ciabatta",
      "pt": "Ciabatta de Frango com Vegetais"
    },
    "description": {
      "es": "Ciabatta de masa madre con rodajas de pechuga de pollo, tomates cherry, morrón asado y queso.",
      "en": "Tender chicken breast, cherry tomatoes, roasted bell peppers and melted cheese.",
      "pt": "Peito de frango grelhado, tomates cereja, pimentões assados e queijo."
    },
    "price": 12000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "233b9f6b-4b71-4b9f-b17e-5a6a50d38920",
    "categoryId": "cat-4",
    "name": {
      "es": "Tostado de pan de molde con semillas",
      "en": "Seeded Loaf Toast with Smoked Pork",
      "pt": "Torrada de Pão de Forma com Lombo"
    },
    "description": {
      "es": "Rebanadas de pan de molde con semillas, relleno de lomito ahumado, queso fundido, aceite de oliva y sal marina.",
      "en": "Seeded whole bread slices filled with smoked pork cutlet and melted cheese.",
      "pt": "Pão de forma com sementes recheado com lombo defumado e queijo derretido."
    },
    "price": 6000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "fbe9dec8-5c5f-4aa7-a1c4-6246be43cb51",
    "categoryId": "4f24fe3d-5b26-4275-9414-4b6b6ef7bd08",
    "name": {
      "es": "Bagel de jamón crudo y rúcula",
      "en": "Prosciutto & Cream Cheese Bagel",
      "pt": "Bagel com Presunto Cru e Rúcula"
    },
    "description": {
      "es": "Queso Finlandia, jamón crudo y rúcula fresca.",
      "en": "Toasted seeded bagel with cream cheese, prosciutto and fresh arugula.",
      "pt": "Bagel tostado com cream cheese, presunto cru e folhas de rúcula."
    },
    "price": 10000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "349b1911-fd57-4a6d-aa28-b182505b010f",
    "categoryId": "4f24fe3d-5b26-4275-9414-4b6b6ef7bd08",
    "name": {
      "es": "Pala romana de jamón crudo reserva",
      "en": "Focaccia Pala Romana with Prosciutto (500g)",
      "pt": "Pala Romana com Presunto Cru Reserva (500g)"
    },
    "description": {
      "es": "Sándwich de 500g en focaccia romana, relleno con jamón crudo reserva Las Dinas, rúcula, parmesano y queso crema.",
      "en": "Crispy 500g focaccia with reserve prosciutto, arugula, parmesan and cream cheese.",
      "pt": "Focaccia artesanal de 500g com presunto cru reserva, rúcula, parmesão e cream cheese."
    },
    "price": 23000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  },
  {
    "id": "e671ef4d-2643-4ae3-95ae-37d5bd89bce2",
    "categoryId": "4f24fe3d-5b26-4275-9414-4b6b6ef7bd08",
    "name": {
      "es": "Pala romana de cerdo ahumado",
      "en": "Focaccia Pala Romana with Smoked Pork (500g)",
      "pt": "Pala Romana com Lombo Defumado e Pesto (500g)"
    },
    "description": {
      "es": "Sándwich de 500g en focaccia romana, con pata de cerdo ahumada Las Dinas, queso Dambo, pesto y queso crema.",
      "en": "Crispy 500g focaccia with smoked pork, dambo cheese, basil pesto and cream cheese.",
      "pt": "Focaccia artesanal de 500g com lombo defumado, queijo dambo, pesto e cream cheese."
    },
    "price": 19000,
    "available": true,
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
  }
];

