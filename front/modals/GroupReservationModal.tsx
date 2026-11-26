import React, { useState, useEffect, useId, useMemo } from 'react';
import { Language, StoreSettings } from '../../db/types';
import { X, Users, Cake, Sparkles, MessageSquare, Copy, CheckCheck, CreditCard } from 'lucide-react';
import { ModalDialog } from './ModalDialog';
import { getAvailableReservationSlots, getBuenosAiresNow } from '../utils/buenosAiresTime';
import {
  formatArsPrice,
  openWhatsAppChat,
  sanitizeWhatsAppInput,
} from '../utils/securityAndFormat';
import { trackWhatsAppClick } from '../utils/analytics';
import { BUSINESS_INFO } from '../../db/businessInfo';

const { depositAccount } = BUSINESS_INFO;

/** "2026-12-05" → "05/12/2026", como lo lee cualquiera en el chat. */
const toDisplayDate = (iso: string) => iso.split('-').reverse().join('/');

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
  const [addCake, setAddCake] = useState<boolean>(false);
  const [cakeDetails, setCakeDetails] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'alias' | 'cvu' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const titleId = useId();

  const handleCopy = (text: string, field: 'alias' | 'cvu') => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2500);
      })
      .catch(() => {
        // Sin permiso de portapapeles: el dato igual queda a la vista para copiarlo a mano.
      });
  };

  const todayStr = getBuenosAiresNow().isoDate;
  const availableSlots = useMemo(() => getAvailableReservationSlots(date), [date]);
  // La seña es el valor de un cubierto: sale del precio por persona que carga la dueña.
  const pricePerPerson = settings.groupMenuPricePerPerson;
  const deposit = formatArsPrice(pricePerPerson);

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
      msg = `¡Hola Dorear! 👋 Quiero coordinar una reserva para mesa grande:\n\n`;
      msg += `👥 Comensales: ${guestsCount} personas\n`;
      msg += `📅 Fecha: ${toDisplayDate(date)}\n`;
      msg += `⏰ Horario: ${time} hs\n`;
      msg += `👤 A nombre de: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Teléfono: ${safeHostPhone}\n`;
      msg += `🍽️ Propuesta: Menú Fijo Merienda Degustación de Autor (${deposit} por persona)\n`;
      msg += `💳 Seña: ${deposit} (1 cubierto) a nombre de ${depositAccount.holder}\n`;
      if (addCake) {
        msg += `🎂 Torta Entera para Festejo: SÍ (${
          safeCakeDetails || 'A coordinar sabor y dedicatoria'
        })\n`;
      }
      if (safeNotes) {
        msg += `📝 Notas / Restricciones: ${safeNotes}\n`;
      }
      msg += `\nA continuación adjunto el comprobante de transferencia de la seña (${deposit}) para confirmar la mesa. ¡Muchas gracias! ✨`;
    } else if (currentLang === 'en') {
      msg = `Hello Dorear! 👋 I would like to coordinate a large table reservation:\n\n`;
      msg += `👥 Party size: ${guestsCount} guests\n`;
      msg += `📅 Date: ${toDisplayDate(date)}\n`;
      msg += `⏰ Time: ${time}\n`;
      msg += `👤 Reservation name: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Phone: ${safeHostPhone}\n`;
      msg += `🍽️ Option: Signature Tasting Fixed Menu (${deposit} per guest)\n`;
      msg += `💳 Deposit: ${deposit} ARS (1 guest cover)\n`;
      if (addCake) {
        msg += `🎂 Whole Cake for Celebration: YES (${safeCakeDetails || 'To coordinate'})\n`;
      }
      if (safeNotes) msg += `📝 Notes / Dietary: ${safeNotes}\n`;
      msg += `\nI am attaching the transfer deposit receipt to confirm our reservation. Thank you! ✨`;
    } else {
      msg = `Olá Dorear! 👋 Gostaria de confirmar uma reserva para mesa grande:\n\n`;
      msg += `👥 Pessoas: ${guestsCount} convidados\n`;
      msg += `📅 Data: ${toDisplayDate(date)}\n`;
      msg += `⏰ Horário: ${time}\n`;
      msg += `👤 Nome: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Telefone: ${safeHostPhone}\n`;
      msg += `🍽️ Opção: Menu Degustação Autoral Fixo (${deposit} por pessoa)\n`;
      msg += `💳 Sinal: ${deposit} ARS (equivalente a 1 pessoa)\n`;
      if (addCake) {
        msg += `🎂 Bolo Inteiro para Comemoração: SIM (${safeCakeDetails || 'A combinar'})\n`;
      }
      if (safeNotes) msg += `📝 Observações: ${safeNotes}\n`;
      msg += `\nEnvio em anexo o comprovante da transferência do sinal para confirmar a mesa. Muito obrigado(a)! ✨`;
    }

    trackWhatsAppClick('group_reservation');
    openWhatsAppChat(settings.whatsappNumber, msg);
    onClose();
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      panelClassName="w-full sm:max-w-lg bg-paper/[0.97] rounded-t-[28px] sm:rounded-[28px] border border-white/70 shadow-modal max-h-[92vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] animate-sheet-up"
    >
      <div className="px-5 py-4 border-b border-line/70 flex items-center justify-between shrink-0">
        <h2
          id={titleId}
          className="flex items-center gap-2.5 text-ink font-serif text-[1.6rem] leading-tight font-medium"
        >
          <Users size={22} className="text-gold" />
          <span>
            {currentLang === 'es' && 'Festejos y mesas grandes'}
            {currentLang === 'en' && 'Celebrations and large tables'}
            {currentLang === 'pt' && 'Comemorações e mesas grandes'}
          </span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-muted hover:text-ink rounded-full transition-colors"
          aria-label={currentLang === 'es' ? 'Cerrar' : currentLang === 'en' ? 'Close' : 'Fechar'}
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSendReservation}
        className="p-5 overflow-y-auto space-y-5 text-ink text-sm"
      >
        <div className="bg-cream/70 p-3.5 rounded-2xl border border-line text-sm text-muted leading-relaxed">
          <p>
            {currentLang === 'es' &&
              'Para grupos de 5 o más comensales unimos y preparamos la mesa especialmente para que lleguen y disfruten sin esperas.'}
            {currentLang === 'en' &&
              'For parties of 5 or more guests, we join and arrange the tables in advance so you can arrive and enjoy without delays.'}
            {currentLang === 'pt' &&
              'Para grupos a partir de 5 pessoas, unimos e arrumamos a mesa com antecedência para você aproveitar sem esperas.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor={`${titleId}-guests`} className="block text-sm font-medium text-ink/80 mb-1">
              {currentLang === 'es' && 'Personas'}
              {currentLang === 'en' && 'Guests'}
              {currentLang === 'pt' && 'Convidados'}
            </label>
            <select
              id={`${titleId}-guests`}
              name="guests"
              value={guestsCount}
              onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
              className="w-full min-h-[48px] bg-cream border border-line rounded-xl px-3 py-2 text-base font-medium focus:border-gold outline-none"
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
            <label htmlFor={`${titleId}-date`} className="block text-sm font-medium text-ink/80 mb-1">
              {currentLang === 'es' && 'Fecha'}
              {currentLang === 'en' && 'Date'}
              {currentLang === 'pt' && 'Data'}
            </label>
            <input
              id={`${titleId}-date`}
              name="date"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full min-h-[48px] bg-cream border border-line rounded-xl px-3 py-1.5 text-base font-medium focus:border-gold outline-none"
            />
          </div>

          <div>
            <label htmlFor={`${titleId}-time`} className="block text-sm font-medium text-ink/80 mb-1">
              {currentLang === 'es' && 'Horario'}
              {currentLang === 'en' && 'Time'}
              {currentLang === 'pt' && 'Horário'}
            </label>
            <select
              id={`${titleId}-time`}
              name="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={availableSlots.length === 0}
              className="w-full min-h-[48px] bg-cream border border-line rounded-xl px-3 py-2 text-base font-medium focus:border-gold outline-none disabled:opacity-50"
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
            <label htmlFor={`${titleId}-name`} className="block text-sm font-medium text-ink/80 mb-1">
              {currentLang === 'es' && 'Nombre y Apellido'}
              {currentLang === 'en' && 'Host Name'}
              {currentLang === 'pt' && 'Nome do Responsável'}
            </label>
            <input
              id={`${titleId}-name`}
              name="name"
              autoComplete="name"
              type="text"
              maxLength={80}
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Ej. Camila Gómez"
              required
              className="w-full min-h-[48px] bg-cream border border-line rounded-xl px-3 py-2 text-base focus:border-gold outline-none"
            />
          </div>
          <div>
            <label htmlFor={`${titleId}-phone`} className="block text-sm font-medium text-ink/80 mb-1">
              {currentLang === 'es' && 'Teléfono / WhatsApp'}
              {currentLang === 'en' && 'Phone / WhatsApp'}
              {currentLang === 'pt' && 'Telefone / WhatsApp'}
            </label>
            <input
              id={`${titleId}-phone`}
              name="phone"
              autoComplete="tel"
              type="tel"
              maxLength={30}
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
              placeholder="Ej. 11 2345-6789"
              className="w-full min-h-[48px] bg-cream border border-line rounded-xl px-3 py-2 text-base focus:border-gold outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <span className="block text-sm font-medium text-ink/80">
            {currentLang === 'es' && 'Propuesta (menú fijo)'}
            {currentLang === 'en' && 'Format (fixed menu)'}
            {currentLang === 'pt' && 'Formato (menu fixo)'}
          </span>

          <div className="p-4 rounded-2xl border bg-wine/5 border-wine ring-1 ring-wine">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-base sm:text-lg font-semibold text-ink flex items-center gap-1.5">
                <Sparkles size={16} className="text-gold" />
                {currentLang === 'es' && 'Merienda Degustación de Autor'}
                {currentLang === 'en' && 'Signature Tasting Menu'}
                {currentLang === 'pt' && 'Menu Degustação Autoral'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-wine text-white text-sm font-sans font-semibold">
                {currentLang === 'es' && 'Menú Fijo'}
                {currentLang === 'en' && 'Fixed Menu'}
                {currentLang === 'pt' && 'Menu Fixo'}
              </span>
            </div>
            <div className="text-gold-dark font-sans font-bold text-base mb-1.5">
              {deposit}{' '}
              <span className="text-sm text-muted font-normal">
                {currentLang === 'es' && '/ por persona'}
                {currentLang === 'en' && '/ per guest'}
                {currentLang === 'pt' && '/ por pessoa'}
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {currentLang === 'es' &&
                'Infusión de especialidad + selección de pastelería de Agustina (cheesecakes, marquise) + tostones salados servidos listos al llegar.'}
              {currentLang === 'en' &&
                'Specialty coffee/tea + assortment of Agustina’s signature pastries + savory tostones served ready at your arrival.'}
              {currentLang === 'pt' &&
                'Café especial + variedade de doces autorais + tostas salgadas servidas prontas na sua chegada.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-gold/40 bg-gold/5 space-y-3">
            <div className="flex items-center gap-2 text-wine font-sans font-semibold text-sm sm:text-sm">
              <CreditCard size={16} className="text-gold shrink-0" />
              <span>
                {currentLang === 'es' && `Seña para reservar mesa grande (1 cubierto: ${deposit})`}
                {currentLang === 'en' && `Reservation deposit (1 guest cover: ${deposit} ARS)`}
                {currentLang === 'pt' && `Sinal para reserva (1 pessoa: ${deposit} ARS)`}
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {currentLang === 'es' &&
                `Para reservar una mesa grande hay que señar la mesa con el valor de un cubierto (${deposit}) a la siguiente cuenta y enviar el comprobante a WhatsApp:`}
              {currentLang === 'en' &&
                `To book a large table, a deposit equal to 1 guest cover (${deposit} ARS) is required to the following account. Send the receipt via WhatsApp:`}
              {currentLang === 'pt' &&
                `Para reservar uma mesa grande, é necessário sinalizar a reserva com o valor de 1 pessoa (${deposit} ARS) na conta abaixo e enviar o comprovante por WhatsApp:`}
            </p>

            <div className="bg-paper rounded-xl border border-line p-3 space-y-2 text-sm font-sans">
              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5">
                <span className="text-muted text-sm">Alias:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink">{depositAccount.alias}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(depositAccount.alias, 'alias')}
                    className="min-h-[44px] px-2.5 rounded-lg text-gold-dark hover:text-wine hover:bg-cream transition-colors text-sm flex items-center gap-1"
                    title="Copiar alias"
                  >
                    {copiedField === 'alias' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck size={13} /> ¡Copiado!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={13} /> Copiar
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5">
                <span className="text-muted text-sm">CVU:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink text-sm break-all">{depositAccount.cvu}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(depositAccount.cvu, 'cvu')}
                    className="min-h-[44px] px-2.5 rounded-lg text-gold-dark hover:text-wine hover:bg-cream transition-colors text-sm flex items-center gap-1 shrink-0"
                    title="Copiar CVU"
                  >
                    {copiedField === 'cvu' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck size={13} /> ¡Copiado!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={13} /> Copiar
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5">
                <span className="text-muted text-sm">Titular:</span>
                <span className="font-medium text-ink">{depositAccount.holder}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted text-sm">Banco:</span>
                <span className="font-medium text-ink">{depositAccount.bank}</span>
              </div>
            </div>
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
            <span className="text-sm font-medium text-ink flex items-center gap-1.5">
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
                aria-label={
                  currentLang === 'es'
                    ? 'Sabor y detalles de la torta'
                    : currentLang === 'en'
                    ? 'Cake flavor and details'
                    : 'Sabor e detalhes do bolo'
                }
                placeholder="Ej. Pavlova de frutos rojos / vela y cartel de feliz cumple…"
                className="w-full min-h-[44px] bg-cream border border-line rounded-xl px-3 py-1.5 text-base focus:border-gold outline-none"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor={`${titleId}-notes`} className="block text-sm font-medium text-ink/80 mb-1">
            {currentLang === 'es' && 'Notas especiales o intolerancias'}
            {currentLang === 'en' && 'Special notes or dietary requirements'}
            {currentLang === 'pt' && 'Observações ou restrições alimentares'}
          </label>
          <textarea
            id={`${titleId}-notes`}
            name="notes"
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Hay 2 personas celíacas o necesitamos lugar para un cochecito…"
            className="w-full bg-cream border border-line rounded-xl px-3 py-2 text-base focus:border-gold outline-none resize-none"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-2.5 bg-wine/10 text-wine rounded-xl text-sm font-medium text-center"
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
          <p className="text-[13px] text-muted text-center mt-2">
            {currentLang === 'es' &&
              `Las reservas de mesas grandes se confirman por WhatsApp tras enviar el comprobante de la seña (${deposit}).`}
            {currentLang === 'en' &&
              `Large table bookings are confirmed via WhatsApp after sending the deposit receipt (${deposit} ARS).`}
            {currentLang === 'pt' &&
              `Reservas para grupos são confirmadas pelo WhatsApp após envio do comprovante do sinal (${deposit} ARS).`}
          </p>
        </div>
      </form>
    </ModalDialog>
  );
};
