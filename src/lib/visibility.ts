// Règles d'affichage : un résident ne voit que les contenus publiés,
// dont la date de publication est passée, non expirés, et destinés à sa résidence.

import type { AppData, Campaign, DisplayStatus, ISODate, LocalContent, ResidenceId, StoredStatus } from '../data/types'

interface Dated {
  status: StoredStatus
  publishAt: ISODate
  expireAt: ISODate
}

/** La date d'expiration est incluse : le contenu reste visible ce jour-là. */
export function displayStatus(item: Dated, now: ISODate): DisplayStatus {
  if (item.status === 'brouillon') return 'brouillon'
  if (item.status === 'retire') return 'retire'
  if (item.expireAt && item.expireAt < now) return 'expire'
  if (item.publishAt && item.publishAt > now) return 'programme'
  return 'publie'
}

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  brouillon: 'Brouillon',
  programme: 'Programmé',
  publie: 'Publié',
  expire: 'Expiré',
  retire: 'Retiré',
}

export function isVisible(item: Dated, now: ISODate): boolean {
  return displayStatus(item, now) === 'publie'
}

/** Élément affichable côté résident : contenu local ou campagne nationale. */
export type FeedItem =
  | { kind: 'local'; id: string; date: ISODate; content: LocalContent }
  | { kind: 'national'; id: string; date: ISODate; campaign: Campaign }

export function residentNews(data: AppData, residenceId: ResidenceId, now: ISODate): FeedItem[] {
  const local: FeedItem[] = data.contents
    .filter((c) => c.residenceId === residenceId && c.template !== 'evenement' && isVisible(c, now))
    .map((c) => ({ kind: 'local', id: c.id, date: c.publishAt, content: c }))
  const national: FeedItem[] = data.campaigns
    .filter((c) => c.residenceIds.includes(residenceId) && isVisible(c, now))
    .map((c) => ({ kind: 'national', id: c.id, date: c.publishAt, campaign: c }))
  return [...local, ...national].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}

/** Événements à venir (ou en cours), du plus proche au plus lointain. */
export function residentEvents(data: AppData, residenceId: ResidenceId, now: ISODate): LocalContent[] {
  return data.contents
    .filter(
      (c) =>
        c.residenceId === residenceId &&
        c.template === 'evenement' &&
        isVisible(c, now) &&
        (c.endDate || c.startDate) >= now,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.startTime.localeCompare(b.startTime))
}

export function residentAlerts(data: AppData, residenceId: ResidenceId, now: ISODate): LocalContent[] {
  return data.contents.filter((c) => c.residenceId === residenceId && c.important && isVisible(c, now))
}

export const TEMPLATE_LABELS: Record<LocalContent['template'], string> = {
  travaux: 'Intervention / travaux',
  pratique: 'Information pratique',
  evenement: 'Événement',
}
