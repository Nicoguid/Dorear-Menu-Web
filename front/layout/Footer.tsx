import React from 'react';
import { Language } from '../../db/types';
import { MapPin, Clock, ChevronDown } from 'lucide-react';
import { getStoreOpenStatus } from '../utils/buenosAiresTime';
import { BUSINESS_INFO, minutesToHHMM } from '../../db/businessInfo';

interface FooterProps {
  currentLang: Language;
  /** Si hay obras de arte con precio fijo en dólares (db/fixedPrices.ts). */
  hasUsdPrices?: boolean;
}

const T = {
  findUs: { es: 'Dónde estamos', en: 'Find us', pt: 'Onde estamos' },
  directions: { es: 'Cómo llegar en Google Maps', en: 'Directions on Google Maps', pt: 'Como chegar no Google Maps' },
  hours: { es: 'Horarios', en: 'Opening hours', pt: 'Horários' },
  weekdays: { es: 'Lunes a viernes', en: 'Monday to Friday', pt: 'Segunda a sexta' },
  weekend: { es: 'Sábados y domingos', en: 'Saturday and Sunday', pt: 'Sábado e domingo' },
  openNow: { es: 'Abierto ahora · cierra', en: 'Open now · closes', pt: 'Aberto agora · fecha' },
  closedNow: { es: 'Cerrado ahora', en: 'Closed now', pt: 'Fechado agora' },
  legalSummary: {
    es: 'Información legal y alérgenos',
    en: 'Legal and allergen information',
    pt: 'Informação legal e alérgenos',
  },
};

export const Footer: React.FC<FooterProps> = ({ currentLang, hasUsdPrices = false }) => {
  const status = getStoreOpenStatus();
  const { address, hours } = BUSINESS_INFO;
  const range = (h: { open: number; close: number; label: string }) =>
    currentLang === 'es' ? h.label : `${minutesToHHMM(h.open)}–${minutesToHHMM(h.close)}`;

  return (
    <footer className="w-full border-t border-line mt-10 pt-7 pb-28 text-muted text-base">
      <div className="max-w-xl mx-auto px-5 space-y-6">
        <div className="flex gap-3">
          <MapPin size={18} className="text-gold-dark mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-serif text-xl text-ink leading-tight">{T.findUs[currentLang]}</h2>
            <address className="not-italic leading-relaxed mt-0.5">
              {address.street}, {address.neighborhood}, CABA
            </address>
            <a
              href={BUSINESS_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-wine font-medium underline underline-offset-4 decoration-wine/30 hover:decoration-wine"
            >
              {T.directions[currentLang]}
            </a>
          </div>
        </div>

        <div className="flex gap-3">
          <Clock size={18} className="text-gold-dark mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-serif text-xl text-ink leading-tight">{T.hours[currentLang]}</h2>
            <p className="leading-relaxed mt-0.5">
              {T.weekdays[currentLang]}: {range(hours.weekday)}
              <br />
              {T.weekend[currentLang]}: {range(hours.weekend)}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
              <span
                className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-600' : 'bg-rose-500'}`}
                aria-hidden="true"
              />
              {status.isOpen ? (
                <span className="text-emerald-800">
                  {T.openNow[currentLang]} {status.closesAt} h
                </span>
              ) : (
                <span>{T.closedNow[currentLang]}</span>
              )}
            </p>
          </div>
        </div>

        <p>
          Instagram{' '}
          <a
            href={BUSINESS_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-wine font-medium underline underline-offset-4 decoration-wine/30 hover:decoration-wine"
          >
            {BUSINESS_INFO.instagramHandle}
          </a>
        </p>

        <details className="group rounded-2xl border border-line/80 bg-paper/50 text-sm leading-relaxed">
          <summary className="list-none cursor-pointer select-none px-4 min-h-[44px] flex items-center justify-between gap-2 text-sm text-ink">
            <span>{T.legalSummary[currentLang]}</span>
            <ChevronDown size={16} className="text-gold transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <p>
              {currentLang === 'es' &&
                `Todos los precios son finales, en pesos argentinos (ARS)${hasUsdPrices ? ' salvo las obras de arte, en dólares (USD)' : ''}, con IVA incluido. No cobramos recargo por pagar con medios electrónicos o transferencia. No cobramos servicio de mesa ni cubierto. La propina es voluntaria.`}
              {currentLang === 'en' &&
                `All prices are final, in Argentine pesos (ARS)${hasUsdPrices ? ' except artworks, in US dollars (USD)' : ''}, VAT included. No surcharge for electronic payments or bank transfers. No cover or table charge. Tipping is optional.`}
              {currentLang === 'pt' &&
                `Todos os preços são finais, em pesos argentinos (ARS)${hasUsdPrices ? ' exceto as obras de arte, em dólares (USD)' : ''}, com IVA incluído. Sem acréscimo para pagamentos eletrônicos ou transferência. Não cobramos taxa de serviço nem couvert. A gorjeta é opcional.`}
            </p>
            <p>
              <strong className="text-wine font-semibold">
                {currentLang === 'es' && 'Alérgenos y celiaquía: '}
                {currentLang === 'en' && 'Allergens and gluten: '}
                {currentLang === 'pt' && 'Alérgenos e doença celíaca: '}
              </strong>
              {currentLang === 'es' &&
                'En nuestro obrador artesanal se manipulan harinas de trigo, avena, cebada, centeno, frutos secos, lácteos y huevo. Si bien ofrecemos productos elaborados sin ingredientes con gluten, no podemos garantizar la ausencia total de contaminación cruzada (Ley 26.588). Consultá a nuestro equipo por intolerancias severas.'}
              {currentLang === 'en' &&
                'Our artisanal bakery handles wheat, oats, tree nuts, dairy, and eggs. While we offer items prepared without gluten ingredients, we cannot guarantee zero cross-contamination (Law 26,588). Please inform our staff about severe allergies.'}
              {currentLang === 'pt' &&
                'Nossa confeitaria artesanal manipula farinhas com glúten, castanhas, leite e ovos. Embora ofereçamos opções sem ingredientes com glúten, não podemos garantir a ausência de contaminação cruzada (Lei 26.588).'}
            </p>
            <p>
              Defensa y Protección al Consumidor CABA: línea gratuita 147 ·{' '}
              <a
                href="https://buenosaires.gob.ar/defensaconsumidor"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-wine break-all"
              >
                buenosaires.gob.ar/defensaconsumidor
              </a>
            </p>
            <p>
              {currentLang === 'es' &&
                'Privacidad: usamos Google Analytics, Microsoft Clarity y Vercel Analytics para ver, de forma anónima, cómo se usa la carta y mejorarla. No registramos lo que escribís en los formularios.'}
              {currentLang === 'en' &&
                'Privacy: we use Google Analytics, Microsoft Clarity and Vercel Analytics to see, anonymously, how the menu is used and improve it. We do not record what you type in forms.'}
              {currentLang === 'pt' &&
                'Privacidade: usamos o Google Analytics, o Microsoft Clarity e o Vercel Analytics para ver, de forma anônima, como o cardápio é usado e melhorá-lo. Não registramos o que você digita nos formulários.'}
            </p>
            <p className="italic">
              {currentLang === 'es' && 'Libro de quejas oficial a disposición en el local.'}
              {currentLang === 'en' && 'Official complaint book available on premises.'}
              {currentLang === 'pt' && 'Livro de reclamações oficial disponível no local.'}
            </p>
          </div>
        </details>

        <p className="text-center font-serif italic text-gold-dark text-lg pt-2">Sabores que enamoran</p>
      </div>
    </footer>
  );
};
