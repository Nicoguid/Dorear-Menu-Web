import React, { useState, useEffect, useId } from 'react';
import { Language, StoreSettings } from '../../db/types';
import { X, Users, Cake, Sparkles, MessageSquare, Coffee, Check } from 'lucide-react';
import { ModalDialog } from './ModalDialog';
import { getAvailableReservationSlots, getBuenosAiresNow } from '../utils/buenosAiresTime';
import {
  formatArsPrice,
  openWhatsAppChat,
  sanitizeWhatsAppInput,
} from '../utils/securityAndFormat';

interface GroupReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  settings: StoreSettings;
}

export const GroupReservationModal: React.FC<GroupReservationModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  settings,
}) => {
  const [guestsCount, setGuestsCount] = useState<number>(6);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('17:00');
  const [hostName, setHostName] = useState<string>('');
  const [hostPhone, setHostPhone] = useState<string>('');
  const [menuType, setMenuType] = useState<'tasting' | 'alacarte'>('tasting');
  const [addCake, setAddCake] = useState<boolean>(false);
  const [cakeDetails, setCakeDetails] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const titleId = useId();

  const todayStr = getBuenosAiresNow().isoDate;
  const availableSlots = getAvailableReservationSlots(date);

  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(time)) {
      setTime(availableSlots[0]);
    }
  }, [date, availableSlots, time]);

  if (!isOpen) return null;

  const handleSendReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const safeHostName = sanitizeWhatsAppInput(hostName, 80);
    const safeHostPhone = sanitizeWhatsAppInput(hostPhone, 30);
    const safeCakeDetails = sanitizeWhatsAppInput(cakeDetails, 120);
    const safeNotes = sanitizeWhatsAppInput(notes, 200);

    if (!safeHostName) {
      setErrorMsg(
        currentLang === 'es'
          ? 'Por favor ingresá el nombre de la persona que reserva.'
          : currentLang === 'en'
          ? 'Please enter the name for the reservation.'
          : 'Por favor, insira o nome para a reserva.'
      );
      return;
    }
    if (!date || date < todayStr) {
      setErrorMsg(
        currentLang === 'es'
          ? 'Por favor seleccioná una fecha válida.'
          : currentLang === 'en'
          ? 'Please select a valid date.'
          : 'Por favor, selecione uma data válida.'
      );
      return;
    }
    if (availableSlots.length === 0 || !availableSlots.includes(time)) {
      setErrorMsg(
        currentLang === 'es'
          ? 'No quedan horarios disponibles para la fecha seleccionada. Elegí otro día.'
          : currentLang === 'en'
          ? 'No available time slots left for the selected date. Please pick another day.'
          : 'Não há horários disponíveis para a data selecionada. Escolha outro dia.'
      );
      return;
    }

    setErrorMsg(null);

    let msg = '';
    if (currentLang === 'es') {
      msg = `¡Hola Dorear! 👋 Quiero consultar y coordinar una reserva para mesa grande:\n\n`;
      msg += `👥 Comensales: ${guestsCount} personas\n`;
      msg += `📅 Fecha: ${date}\n`;
      msg += `⏰ Horario: ${time} hs\n`;
      msg += `👤 A nombre de: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Teléfono: ${safeHostPhone}\n`;
      msg += `🍽️ Propuesta elegida: ${
        menuType === 'tasting'
          ? `Menú Merienda Degustación de Autor (${formatArsPrice(
              settings.groupMenuPricePerPerson
            )} por persona)`
          : 'A la carta libre'
      }\n`;
      if (addCake) {
        msg += `🎂 Torta Entera para Festejo: SÍ (${
          safeCakeDetails || 'A coordinar sabor y dedicatoria'
        })\n`;
      }
      if (safeNotes) {
        msg += `📝 Notas / Restricciones: ${safeNotes}\n`;
      }
      msg += `\n¿Tienen disponibilidad para prepararnos la mesa? ¡Muchas gracias! ✨`;
    } else if (currentLang === 'en') {
      msg = `Hello Dorear! 👋 I would like to request a large table reservation:\n\n`;
      msg += `👥 Party size: ${guestsCount} guests\n`;
      msg += `📅 Date: ${date}\n`;
      msg += `⏰ Time: ${time}\n`;
      msg += `👤 Reservation name: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Phone: ${safeHostPhone}\n`;
      msg += `🍽️ Option: ${
        menuType === 'tasting'
          ? `Signature Afternoon Tasting Menu (${formatArsPrice(
              settings.groupMenuPricePerPerson
            )} per guest)`
          : 'Open à la carte'
      }\n`;
      if (addCake) {
        msg += `🎂 Whole Cake for Celebration: YES (${safeCakeDetails || 'To coordinate'})\n`;
      }
      if (safeNotes) msg += `📝 Notes / Dietary: ${safeNotes}\n`;
      msg += `\nDo you have availability to arrange our table? Thank you! ✨`;
    } else {
      msg = `Olá Dorear! 👋 Gostaria de consultar uma reserva para mesa grande:\n\n`;
      msg += `👥 Pessoas: ${guestsCount} convidados\n`;
      msg += `📅 Data: ${date}\n`;
      msg += `⏰ Horário: ${time}\n`;
      msg += `👤 Nome: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Telefone: ${safeHostPhone}\n`;
      msg += `🍽️ Opção: ${
        menuType === 'tasting'
          ? `Menu Degustação Autoral (${formatArsPrice(
              settings.groupMenuPricePerPerson
            )} por pessoa)`
          : 'À la carte'
      }\n`;
      if (addCake) {
        msg += `🎂 Bolo Inteiro para Comemoração: SIM (${safeCakeDetails || 'A combinar'})\n`;
      }
      if (safeNotes) msg += `📝 Observações: ${safeNotes}\n`;
      msg += `\nVocês têm disponibilidade para preparar a mesa? Muito obrigado(a)! ✨`;
    }

    openWhatsAppChat(settings.whatsappNumber, msg);
    onClose();
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      panelClassName="w-full sm:max-w-lg bg-paper rounded-t-3xl sm:rounded-3xl border border-line shadow-modal max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
    >
      <div className="p-5 border-b border-line flex items-center justify-between bg-cream/60 shrink-0">
        <h2
          id={titleId}
          className="flex items-center gap-2.5 text-wine font-serif text-xl sm:text-2xl font-medium"
        >
          <Users size={22} className="text-gold" />
          <span>
            {currentLang === 'es' && 'Mesas Grandes & Festejos'}
            {currentLang === 'en' && 'Large Tables & Celebrations'}
            {currentLang === 'pt' && 'Mesas Grandes & Comemorações'}
          </span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-muted hover:text-ink rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSendReservation}
        className="p-5 overflow-y-auto space-y-5 text-ink text-sm"
      >
        <div className="bg-cream/70 p-3.5 rounded-2xl border border-line text-xs text-muted leading-relaxed">
          <p>
            {currentLang === 'es' &&
              'Nuestro espacio cuenta con 8 mesas. Para grupos de 5 o más comensales unimos y preparamos la mesa especialmente para que lleguen y disfruten sin esperas.'}
            {currentLang === 'en' &&
              'Our dining room has 8 tables. For parties of 5 or more guests, we join and arrange the tables in advance so you can arrive and enjoy without delays.'}
            {currentLang === 'pt' &&
              'Nosso salão conta com 8 mesas. Para grupos a partir de 5 pessoas, unimos e arrumamos a mesa com antecedência para você aproveitar sem esperas.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              {currentLang === 'es' && 'Personas'}
              {currentLang === 'en' && 'Guests'}
              {currentLang === 'pt' && 'Convidados'}
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
              className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-2 text-sm font-medium focus:border-gold outline-none"
            >
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
                <option key={n} value={n}>
                  {n}{' '}
                  {currentLang === 'es'
                    ? 'personas'
                    : currentLang === 'en'
                    ? 'guests'
                    : 'pessoas'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              {currentLang === 'es' && 'Fecha'}
              {currentLang === 'en' && 'Date'}
              {currentLang === 'pt' && 'Data'}
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-1.5 text-sm font-medium focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              {currentLang === 'es' && 'Horario'}
              {currentLang === 'en' && 'Time'}
              {currentLang === 'pt' && 'Horário'}
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={availableSlots.length === 0}
              className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-2 text-sm font-medium focus:border-gold outline-none disabled:opacity-50"
            >
              {availableSlots.length > 0 ? (
                availableSlots.map((t) => (
                  <option key={t} value={t}>
                    {t} hs
                  </option>
                ))
              ) : (
                <option value="">
                  {currentLang === 'es'
                    ? 'Sin horarios hoy'
                    : currentLang === 'en'
                    ? 'Closed for today'
                    : 'Sem horários hoje'}
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              {currentLang === 'es' && 'Nombre y Apellido'}
              {currentLang === 'en' && 'Host Name'}
              {currentLang === 'pt' && 'Nome do Responsável'}
            </label>
            <input
              type="text"
              maxLength={80}
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Ej. Camila Gómez"
              required
              className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-2 text-sm focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              {currentLang === 'es' && 'Teléfono / WhatsApp'}
              {currentLang === 'en' && 'Phone / WhatsApp'}
              {currentLang === 'pt' && 'Telefone / WhatsApp'}
            </label>
            <input
              type="tel"
              maxLength={30}
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
              placeholder="Ej. 11 2345-6789"
              className="w-full min-h-[42px] bg-cream border border-line rounded-xl px-3 py-2 text-sm focus:border-gold outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
            {currentLang === 'es' && 'Propuesta de Servicio'}
            {currentLang === 'en' && 'Service Format'}
            {currentLang === 'pt' && 'Formato do Serviço'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={menuType === 'tasting'}
              onClick={() => setMenuType('tasting')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-left ${
                menuType === 'tasting'
                  ? 'bg-wine/5 border-wine ring-1 ring-wine'
                  : 'bg-cream/40 border-line hover:border-gold/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif text-base font-semibold text-ink flex items-center gap-1.5">
                  <Sparkles size={16} className="text-gold" />
                  {currentLang === 'es' && 'Merienda Degustación'}
                  {currentLang === 'en' && 'Signature Tasting'}
                  {currentLang === 'pt' && 'Degustação Autoral'}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    menuType === 'tasting'
                      ? 'border-wine bg-wine text-white'
                      : 'border-muted/40'
                  }`}
                >
                  {menuType === 'tasting' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
              <div className="text-gold font-sans font-bold text-sm mb-1">
                {formatArsPrice(settings.groupMenuPricePerPerson)}{' '}
                <span className="text-[10px] text-muted font-normal">
                  {currentLang === 'es' && '/ por persona'}
                  {currentLang === 'en' && '/ per guest'}
                  {currentLang === 'pt' && '/ por pessoa'}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {currentLang === 'es' &&
                  'Infusión de especialidad + selección de pastelería de Agustina (cheesecakes, marquise) + tostones salados servidos listos al llegar.'}
                {currentLang === 'en' &&
                  'Specialty coffee/tea + assortment of Agustina’s signature pastries + savory tostones ready at your arrival.'}
                {currentLang === 'pt' &&
                  'Café especial + variedade de doces autorais + tostas salgadas servidas prontas na sua chegada.'}
              </p>
            </button>

            <button
              type="button"
              aria-pressed={menuType === 'alacarte'}
              onClick={() => setMenuType('alacarte')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-left ${
                menuType === 'alacarte'
                  ? 'bg-wine/5 border-wine ring-1 ring-wine'
                  : 'bg-cream/40 border-line hover:border-gold/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif text-base font-semibold text-ink flex items-center gap-1.5">
                  <Coffee size={16} className="text-gold" />
                  {currentLang === 'es' && 'Carta Abierta'}
                  {currentLang === 'en' && 'À la Carte'}
                  {currentLang === 'pt' && 'À la Carte'}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    menuType === 'alacarte'
                      ? 'border-wine bg-wine text-white'
                      : 'border-muted/40'
                  }`}
                >
                  {menuType === 'alacarte' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
              <div className="text-gold font-sans font-bold text-sm mb-1">
                {currentLang === 'es' && 'Consumo libre'}
                {currentLang === 'en' && 'Open order'}
                {currentLang === 'pt' && 'Consumo livre'}
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {currentLang === 'es' &&
                  'Mesa armada y lista. Cada invitado elige lo que desee de la carta en el momento.'}
                {currentLang === 'en' &&
                  'Table reserved and arranged. Guests order individually from the menu on arrival.'}
                {currentLang === 'pt' &&
                  'Mesa reservada e arrumada. Cada convidado escolhe do cardápio no momento.'}
              </p>
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-cream/50 rounded-2xl border border-line">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={addCake}
              onChange={(e) => setAddCake(e.target.checked)}
              className="w-4 h-4 rounded accent-wine cursor-pointer"
            />
            <span className="text-xs font-medium text-ink flex items-center gap-1.5">
              <Cake size={15} className="text-gold" />
              {currentLang === 'es' && '¿Desean sumar una Torta Entera para festejo?'}
              {currentLang === 'en' && 'Would you like to add a Whole Cake for a celebration?'}
              {currentLang === 'pt' && 'Desejam incluir um Bolo Inteiro para comemoração?'}
            </span>
          </label>

          {addCake && (
            <div className="mt-3 pl-6">
              <input
                type="text"
                maxLength={120}
                value={cakeDetails}
                onChange={(e) => setCakeDetails(e.target.value)}
                placeholder="Ej. Pavlova de Frutos Rojos / Vela y cartel de feliz cumple"
                className="w-full min-h-[38px] bg-cream border border-line rounded-xl px-3 py-1.5 text-xs focus:border-gold outline-none"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
            {currentLang === 'es' && 'Notas especiales o intolerancias'}
            {currentLang === 'en' && 'Special notes or dietary requirements'}
            {currentLang === 'pt' && 'Observações ou restrições alimentares'}
          </label>
          <textarea
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Hay 2 personas celíacas o requerimos espacio para cochecito..."
            className="w-full bg-cream border border-line rounded-xl px-3 py-2 text-xs focus:border-gold outline-none resize-none"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-2.5 bg-wine/10 text-wine rounded-xl text-xs font-medium text-center"
          >
            {errorMsg}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all text-sm"
          >
            <MessageSquare size={18} />
            <span>
              {currentLang === 'es' && 'Solicitar Reserva por WhatsApp'}
              {currentLang === 'en' && 'Request Reservation via WhatsApp'}
              {currentLang === 'pt' && 'Solicitar Reserva por WhatsApp'}
            </span>
          </button>
          <p className="text-[10px] text-muted text-center mt-2">
            {currentLang === 'es' &&
              'Las reservas de mesas grandes se confirman por WhatsApp con seña previa según disponibilidad.'}
            {currentLang === 'en' &&
              'Large table bookings are confirmed via WhatsApp with advance deposit.'}
            {currentLang === 'pt' &&
              'Reservas para grupos são confirmadas pelo WhatsApp mediante sinal.'}
          </p>
        </div>
      </form>
    </ModalDialog>
  );
};
