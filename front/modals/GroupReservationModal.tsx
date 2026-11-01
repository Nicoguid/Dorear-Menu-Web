import React, { useState, useEffect, useId } from 'react';
import { Language, StoreSettings } from '../../db/types';
import { X, Users, Cake, Sparkles, MessageSquare, Copy, CheckCheck, CreditCard } from 'lucide-react';
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
  const [addCake, setAddCake] = useState<boolean>(false);
  const [cakeDetails, setCakeDetails] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'alias' | 'cvu' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const titleId = useId();

  const handleCopy = (text: string, field: 'alias' | 'cvu') => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {}
  };

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
      msg = `¡Hola Dorear! 👋 Quiero coordinar una reserva para mesa grande:\n\n`;
      msg += `👥 Comensales: ${guestsCount} personas\n`;
      msg += `📅 Fecha: ${date}\n`;
      msg += `⏰ Horario: ${time} hs\n`;
      msg += `👤 A nombre de: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Teléfono: ${safeHostPhone}\n`;
      msg += `🍽️ Propuesta: Menú Fijo Merienda Degustación de Autor (${formatArsPrice(
        settings.groupMenuPricePerPerson || 25000
      )} por persona)\n`;
      msg += `💳 Seña: $25.000 (1 cubierto) a nombre de Agustina Belen Ramirez Giri\n`;
      if (addCake) {
        msg += `🎂 Torta Entera para Festejo: SÍ (${
          safeCakeDetails || 'A coordinar sabor y dedicatoria'
        })\n`;
      }
      if (safeNotes) {
        msg += `📝 Notas / Restricciones: ${safeNotes}\n`;
      }
      msg += `\nA continuación adjunto el comprobante de transferencia de la seña ($25.000) para confirmar la mesa. ¡Muchas gracias! ✨`;
    } else if (currentLang === 'en') {
      msg = `Hello Dorear! 👋 I would like to coordinate a large table reservation:\n\n`;
      msg += `👥 Party size: ${guestsCount} guests\n`;
      msg += `📅 Date: ${date}\n`;
      msg += `⏰ Time: ${time}\n`;
      msg += `👤 Reservation name: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Phone: ${safeHostPhone}\n`;
      msg += `🍽️ Option: Signature Tasting Fixed Menu (${formatArsPrice(
        settings.groupMenuPricePerPerson || 25000
      )} per guest)\n`;
      msg += `💳 Deposit: $25,000 ARS (1 guest cover deposit)\n`;
      if (addCake) {
        msg += `🎂 Whole Cake for Celebration: YES (${safeCakeDetails || 'To coordinate'})\n`;
      }
      if (safeNotes) msg += `📝 Notes / Dietary: ${safeNotes}\n`;
      msg += `\nI am attaching the transfer deposit receipt to confirm our reservation. Thank you! ✨`;
    } else {
      msg = `Olá Dorear! 👋 Gostaria de confirmar uma reserva para mesa grande:\n\n`;
      msg += `👥 Pessoas: ${guestsCount} convidados\n`;
      msg += `📅 Data: ${date}\n`;
      msg += `⏰ Horário: ${time}\n`;
      msg += `👤 Nome: ${safeHostName}\n`;
      if (safeHostPhone) msg += `📞 Telefone: ${safeHostPhone}\n`;
      msg += `🍽️ Opção: Menu Degustação Autoral Fixo (${formatArsPrice(
        settings.groupMenuPricePerPerson || 25000
      )} por pessoa)\n`;
      msg += `💳 Sinal: $25.000 ARS (equivalente a 1 pessoa)\n`;
      if (addCake) {
        msg += `🎂 Bolo Inteiro para Comemoração: SIM (${safeCakeDetails || 'A combinar'})\n`;
      }
      if (safeNotes) msg += `📝 Observações: ${safeNotes}\n`;
      msg += `\nEnvio em anexo o comprovante da transferência do sinal para confirmar a mesa. Muito obrigado(a)! ✨`;
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
              'Para grupos de 5 o más comensales unimos y preparamos la mesa especialmente para que lleguen y disfruten sin esperas.'}
            {currentLang === 'en' &&
              'For parties of 5 or more guests, we join and arrange the tables in advance so you can arrive and enjoy without delays.'}
            {currentLang === 'pt' &&
              'Para grupos a partir de 5 pessoas, unimos e arrumamos a mesa com antecedência para você aproveitar sem esperas.'}
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

        <div className="space-y-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
            {currentLang === 'es' && 'Propuesta de Servicio (Menú Fijo Exclusivo)'}
            {currentLang === 'en' && 'Service Format (Fixed Signature Tasting Menu)'}
            {currentLang === 'pt' && 'Formato do Serviço (Menu Degustação Fixo)'}
          </span>

          <div className="p-4 rounded-2xl border bg-wine/5 border-wine ring-1 ring-wine">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-base sm:text-lg font-semibold text-ink flex items-center gap-1.5">
                <Sparkles size={16} className="text-gold" />
                {currentLang === 'es' && 'Merienda Degustación de Autor'}
                {currentLang === 'en' && 'Signature Tasting Menu'}
                {currentLang === 'pt' && 'Menu Degustação Autoral'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-wine text-white text-[10px] font-sans font-semibold uppercase tracking-wider">
                {currentLang === 'es' && 'Menú Fijo'}
                {currentLang === 'en' && 'Fixed Menu'}
                {currentLang === 'pt' && 'Menu Fixo'}
              </span>
            </div>
            <div className="text-gold font-sans font-bold text-base mb-1.5">
              {formatArsPrice(settings.groupMenuPricePerPerson || 25000)}{' '}
              <span className="text-[11px] text-muted font-normal">
                {currentLang === 'es' && '/ por persona'}
                {currentLang === 'en' && '/ per guest'}
                {currentLang === 'pt' && '/ por pessoa'}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {currentLang === 'es' &&
                'Infusión de especialidad + selección de pastelería de Agustina (cheesecakes, marquise) + tostones salados servidos listos al llegar.'}
              {currentLang === 'en' &&
                'Specialty coffee/tea + assortment of Agustina’s signature pastries + savory tostones served ready at your arrival.'}
              {currentLang === 'pt' &&
                'Café especial + variedade de doces autorais + tostas salgadas servidas prontas na sua chegada.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-gold/40 bg-gold/5 space-y-3">
            <div className="flex items-center gap-2 text-wine font-sans font-semibold text-xs sm:text-sm">
              <CreditCard size={16} className="text-gold shrink-0" />
              <span>
                {currentLang === 'es' && 'Seña para reservar mesa grande (1 cubierto: $25.000)'}
                {currentLang === 'en' && 'Reservation deposit (1 guest cover: $25,000 ARS)'}
                {currentLang === 'pt' && 'Sinal para reserva (1 pessoa: $25.000 ARS)'}
              </span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              {currentLang === 'es' &&
                'Para reservar una mesa grande hay que señar la mesa con el valor de un cubierto ($25.000) a la siguiente cuenta y enviar el comprobante a WhatsApp:'}
              {currentLang === 'en' &&
                'To book a large table, a deposit equal to 1 guest cover ($25,000 ARS) is required to the following account. Send the receipt via WhatsApp:'}
              {currentLang === 'pt' &&
                'Para reservar uma mesa grande, é necessário sinalizar a reserva com o valor de 1 pessoa ($25.000 ARS) na conta abaixo e enviar o comprovante por WhatsApp:'}
            </p>

            <div className="bg-paper rounded-xl border border-line p-3 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5">
                <span className="text-muted text-[11px]">Alias:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink">dorear.99</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('dorear.99', 'alias')}
                    className="p-1 rounded-md text-gold hover:text-wine hover:bg-cream transition-colors text-[11px] flex items-center gap-1"
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
                <span className="text-muted text-[11px]">CVU:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink text-[11px] break-all">0000003100084058255377</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('0000003100084058255377', 'cvu')}
                    className="p-1 rounded-md text-gold hover:text-wine hover:bg-cream transition-colors text-[11px] flex items-center gap-1 shrink-0"
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
                <span className="text-muted text-[11px]">Titular:</span>
                <span className="font-medium text-ink">Agustina Belen Ramirez Giri</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted text-[11px]">Banco:</span>
                <span className="font-medium text-ink">Mercado Pago</span>
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
              'Las reservas de mesas grandes se confirman por WhatsApp tras enviar el comprobante de la seña ($25.000).'}
            {currentLang === 'en' &&
              'Large table bookings are confirmed via WhatsApp after sending the deposit receipt ($25,000 ARS).'}
            {currentLang === 'pt' &&
              'Reservas para grupos são confirmadas pelo WhatsApp após envio do comprovante do sinal ($25.000 ARS).'}
          </p>
        </div>
      </form>
    </ModalDialog>
  );
};
