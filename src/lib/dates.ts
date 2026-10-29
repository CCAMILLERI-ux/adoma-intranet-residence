import type { ISODate, Time } from '../data/types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function today(): ISODate {
  return toISODate(new Date())
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = parseISODate(date)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function parseISODate(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** « jeudi 30 octobre 2026 » */
export function formatLongDate(date: ISODate): string {
  if (!date) return ''
  return parseISODate(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « 30 oct. 2026 » */
export function formatShortDate(date: ISODate): string {
  if (!date) return ''
  return parseISODate(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDayMonth(date: ISODate): { day: string; month: string } {
  const d = parseISODate(date)
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
  }
}

export function formatTime(t: Time): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

/** Plage horaire lisible : « de 9 h à 12 h », « à partir de 9 h ». */
export function formatTimeRange(start: Time, end: Time): string {
  if (start && end) return `de ${formatTime(start)} à ${formatTime(end)}`
  if (start) return `à partir de ${formatTime(start)}`
  if (end) return `jusqu'à ${formatTime(end)}`
  return ''
}

/** Plage de dates lisible : « le jeudi 30 octobre 2026 » ou « du … au … ». */
export function formatDateRange(start: ISODate, end: ISODate): string {
  if (start && end && end !== start) return `du ${formatLongDate(start)} au ${formatLongDate(end)}`
  if (start) return `le ${formatLongDate(start)}`
  if (end) return `jusqu'au ${formatLongDate(end)}`
  return ''
}
