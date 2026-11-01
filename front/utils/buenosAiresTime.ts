const BS_AS_TIMEZONE = 'America/Argentina/Buenos_Aires';

export interface BuenosAiresNow {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  totalMinutes: number;
  isoDate: string;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getBuenosAiresNow(date: Date = new Date()): BuenosAiresNow {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: BS_AS_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = part.value;
      }
    }

    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10);
    const day = parseInt(map.day, 10);
    const rawHour = parseInt(map.hour, 10);
    const hour = rawHour === 24 ? 0 : rawHour;
    const minute = parseInt(map.minute, 10);
    const weekday = WEEKDAY_INDEX[map.weekday] ?? date.getDay();

    return {
      year,
      month,
      day,
      weekday,
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
      isoDate: `${map.year}-${map.month}-${map.day}`,
    };
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = date.getHours();
    const minute = date.getMinutes();
    return {
      year,
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: date.getDay(),
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
      isoDate: `${year}-${month}-${day}`,
    };
  }
}

export interface StoreOpenStatus {
  isOpen: boolean;
  isWeekday: boolean;
  day: number;
  closesAt: string;
}

export function getStoreOpenStatus(date: Date = new Date()): StoreOpenStatus {
  const bsAs = getBuenosAiresNow(date);
  const isWeekday = bsAs.weekday >= 1 && bsAs.weekday <= 5;
  const openMinutes = isWeekday ? 7 * 60 + 30 : 8 * 60 + 30;
  const closeMinutes = isWeekday ? 21 * 60 : 20 * 60 + 30;
  const isOpen = bsAs.totalMinutes >= openMinutes && bsAs.totalMinutes < closeMinutes;

  return {
    isOpen,
    isWeekday,
    day: bsAs.weekday,
    closesAt: isWeekday ? '21:00' : '20:30',
  };
}

const ALL_RESERVATION_SLOTS = [
  '08:30',
  '09:30',
  '11:00',
  '12:30',
  '14:00',
  '15:30',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
];

export function getAvailableReservationSlots(selectedIsoDate: string): string[] {
  if (!selectedIsoDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedIsoDate)) {
    return ALL_RESERVATION_SLOTS;
  }

  const [y, m, d] = selectedIsoDate.split('-').map((n) => parseInt(n, 10));
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = utcNoon.getUTCDay();
  const isWeekend = weekday === 0 || weekday === 6;

  const bsAsNow = getBuenosAiresNow();
  const isToday = selectedIsoDate === bsAsNow.isoDate;

  return ALL_RESERVATION_SLOTS.filter((slot) => {
    const [slotH, slotM] = slot.split(':').map((n) => parseInt(n, 10));
    const slotMinutes = slotH * 60 + slotM;

    if (isWeekend && slotMinutes > 19 * 60) {
      return false;
    }

    if (isToday && slotMinutes <= bsAsNow.totalMinutes + 30) {
      return false;
    }

    return true;
  });
}
