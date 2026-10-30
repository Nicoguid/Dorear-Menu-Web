import React from 'react';
import { Language } from '../../db/types';
import { MapPin } from 'lucide-react';
import { getStoreOpenStatus } from '../utils/buenosAiresTime';

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const status = getStoreOpenStatus();

  return (
    <footer className="w-full bg-cream border-t border-line mt-10 pb-16 pt-8 text-muted text-xs">
      <div className="max-w-xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div>
          <strong className="block text-gold text-[10px] tracking-widest uppercase mb-1.5 font-sans font-semibold">
            {currentLang === 'es' && 'Encontranos'}
            {currentLang === 'en' && 'Find us'}
            {currentLang === 'pt' && 'Onde estamos'}
          </strong>
          <p className="leading-relaxed">
            Rosario Vera Peñaloza 460
            <br />
            Puerto Madero, CABA
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Dorear+Rosario+Vera+Pe%C3%B1aloza+460+Puerto+Madero"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gold hover:text-wine font-medium text-[11px] mt-1.5 py-1 transition-colors underline"
          >
            <MapPin size={12} />
            <span>
              {currentLang === 'es' && 'Cómo llegar en Maps ↗'}
              {currentLang === 'en' && 'Open in Google Maps ↗'}
              {currentLang === 'pt' && 'Como chegar no Maps ↗'}
            </span>
          </a>
        </div>

        <div>
          <strong className="block text-gold text-[10px] tracking-widest uppercase mb-1.5 font-sans font-semibold">
            {currentLang === 'es' && 'Horarios'}
            {currentLang === 'en' && 'Hours'}
            {currentLang === 'pt' && 'Horários'}
          </strong>
          <p className="leading-relaxed">
            {currentLang === 'es' && 'Lunes a viernes · 7:30 a 21 h'}
            {currentLang === 'en' && 'Monday to Friday · 7:30 to 21 h'}
            {currentLang === 'pt' && 'Segunda a sexta · 7:30 às 21 h'}
            <br />
            {currentLang === 'es' && 'Sábados y domingos · 8:30 a 20:30 h'}
            {currentLang === 'en' && 'Saturday & Sunday · 8:30 to 20:30 h'}
            {currentLang === 'pt' && 'Sábado e domingo · 8:30 às 20:30 h'}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper border border-line text-[11px] font-medium font-sans">
            <span
              className={`w-2 h-2 rounded-full ${
                status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            {status.isOpen ? (
              <span className="text-emerald-800 font-semibold">
                {currentLang === 'es' && `Abierto ahora · Cierra ${status.closesAt} h`}
                {currentLang === 'en' &&
                  `Open now · Closes ${status.isWeekday ? '8:00 PM' : '7:00 PM'}`}
                {currentLang === 'pt' && `Aberto agora · Fecha ${status.closesAt} h`}
              </span>
            ) : (
              <span className="text-muted">
                {currentLang === 'es' && 'Cerrado ahora'}
                {currentLang === 'en' && 'Closed now'}
                {currentLang === 'pt' && 'Fechado agora'}
              </span>
            )}
          </div>
        </div>

        <div>
          <strong className="block text-gold text-[10px] tracking-widest uppercase mb-1.5 font-sans font-semibold">
            {currentLang === 'es' && 'Seguinos'}
            {currentLang === 'en' && 'Follow us'}
            {currentLang === 'pt' && 'Siga-nos'}
          </strong>
          <a
            href="https://www.instagram.com/dorearcafe.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors inline-block py-1"
          >
            @dorearcafe.ar ↗
          </a>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 mt-8 pt-6 border-t border-line/60 space-y-3 text-[11px] text-muted text-center sm:text-left leading-relaxed">
        <p>
          <strong className="text-ink font-semibold">
            {currentLang === 'es' && 'Información Legal y Comercial:'}
            {currentLang === 'en' && 'Legal & Commercial Notice:'}
            {currentLang === 'pt' && 'Informação Legal e Comercial:'}
          </strong>{' '}
          {currentLang === 'es' &&
            'Todos los precios son finales en pesos argentinos (ARS) con IVA incluido de contado. Sin recargos por medios de pago electrónicos o transferencias (Res. 7/2002). No se cobra servicio de mesa ni cubierto (Ley CABA Nº 4.407). La propina es enteramente optativa y voluntaria (Dec. 731/2024).'}
          {currentLang === 'en' &&
            'All prices are final in Argentine Pesos (ARS) with VAT included. No surcharges for card or electronic payments (Res. 7/2002). No cover charge applies (CABA Law 4,407). Gratuity is entirely optional (Dec. 731/2024).'}
          {currentLang === 'pt' &&
            'Todos os preços são finais em pesos argentinos (ARS) com IVA incluído. Sem acréscimos para pagamentos eletrônicos (Res. 7/2002). Não cobramos taxa de serviço (Lei CABA Nº 4.407). A gorjeta é opcional (Dec. 731/2024).'}
        </p>

        <p className="bg-cream/70 p-3 rounded-xl border border-line/70 text-[11px]">
          <strong className="text-wine font-semibold">
            {currentLang === 'es' && 'Aviso de Alérgenos & Celiaquía:'}
            {currentLang === 'en' && 'Allergen & Gluten Notice:'}
            {currentLang === 'pt' && 'Aviso de Alérgenos & Doença Celíaca:'}
          </strong>{' '}
          {currentLang === 'es' &&
            'En nuestro obrador artesanal se manipulan harinas de trigo, avena, cebada, centeno, frutos secos, lácteos y huevo. Si bien ofrecemos productos elaborados sin ingredientes con gluten, no podemos garantizar la ausencia total de contaminación cruzada (Ley Nac. 26.588 / Ley CABA 3.373). Consulte a nuestro equipo por intolerancias severas.'}
          {currentLang === 'en' &&
            'Our artisanal bakery handles wheat, oats, tree nuts, dairy, and eggs. While we offer items prepared without gluten ingredients, we cannot guarantee zero cross-contamination (Law 26,588). Please inform our staff about severe allergies.'}
          {currentLang === 'pt' &&
            'Nossa confeitaria artesanal manipula farinhas com glúten, castanhas, leite e ovos. Embora ofereçamos opções sem ingredientes com glúten, não podemos garantir a ausência de contaminação cruzada (Lei 26.588).'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted pt-1">
          <p>
            Defensa y Protección al Consumidor CABA: Línea gratuita 147 ·{' '}
            <a
              href="https://buenosaires.gob.ar/defensaconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-wine font-medium"
            >
              buenosaires.gob.ar/defensaconsumidor
            </a>
          </p>
          <p className="italic">
            {currentLang === 'es' && 'Libro de quejas oficial a disposición en el local'}
            {currentLang === 'en' && 'Official complaint book available on premises'}
            {currentLang === 'pt' && 'Livro de reclamações oficial disponível no local'}
          </p>
        </div>
      </div>

      <div className="text-center font-serif italic text-gold text-lg mt-8">
        Sabores que enamoran
      </div>
    </footer>
  );
};
