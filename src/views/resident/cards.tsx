// Cartes partagées : vue résident, aperçus de l'administration.

import type { Campaign, LocalContent } from '../../data/types'
import type { FeedItem } from '../../lib/visibility'
import { useI18n } from '../../i18n'
import { useStore } from '../../lib/store'
import { Icon, ScopeTag } from '../../components/ui'
import { ListenButton } from '../../components/ListenButton'

export function excerpt(text: string, max = 150): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return flat.slice(0, flat.lastIndexOf(' ', max)).replace(/[,;:.]$/, '') + '…'
}

export function localSummary(c: LocalContent): string {
  return excerpt(c.description || c.message)
}

/** Texte lu par le lecteur vocal. */
export function spokenText(item: FeedItem): string {
  return item.kind === 'national'
    ? [item.campaign.summary, item.campaign.message].filter(Boolean).join('. ')
    : item.content.message || item.content.description
}

export function NewsCard({ item, to, listen }: { item: FeedItem; to?: string; listen?: boolean }) {
  const { t, shortDate } = useI18n()
  const isNational = item.kind === 'national'
  const category = isNational ? item.campaign.category : t(`tpl.${item.content.template}`)
  const title = isNational ? item.campaign.title : item.content.title
  const summary = isNational ? item.campaign.summary : localSummary(item.content)
  const Title = to ? 'a' : 'span'
  return (
    <article className={`news-card ${isNational ? 'news-card--national' : ''}`}>
      <div className="news-card__meta">
        <ScopeTag scope={isNational ? 'national' : 'local'} />
        <span className="news-card__category">{category}</span>
      </div>
      <h3 className="news-card__title">
        <Title href={to} className="news-card__link">
          {title}
        </Title>
      </h3>
      <p className="news-card__summary">{summary}</p>
      <div className="news-card__foot">
        <p className="news-card__date">{t('published', { date: shortDate(item.date) })}</p>
        {listen && <ListenButton id={`card-${item.id}`} title={title} text={spokenText(item)} compact />}
      </div>
    </article>
  )
}

export function EventCard({ event, to, registration }: { event: LocalContent; to?: string; registration?: boolean }) {
  const { shortDate, timeRange, dayMonth } = useI18n()
  const { day, month } = dayMonth(event.startDate)
  const Title = to ? 'a' : 'span'
  return (
    <article className="event-card">
      <div className="event-card__date" aria-hidden="true">
        <span className="event-card__day">{day}</span>
        <span className="event-card__month">{month}</span>
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">
          <Title href={to} className="news-card__link">
            {event.title}
          </Title>
        </h3>
        <p className="event-card__info">
          <Icon name="calendar" size={16} />
          <span>
            <time dateTime={event.startDate}>{shortDate(event.startDate)}</time>
            {event.startTime && `, ${timeRange(event.startTime, event.endTime)}`}
          </span>
        </p>
        {event.location && (
          <p className="event-card__info">
            <Icon name="pin" size={16} />
            {event.location}
          </p>
        )}
        {registration && <Registration event={event} compact />}
      </div>
    </article>
  )
}

/** Nombre d'inscrits affiché : inscrits fictifs de départ + le visiteur s'il s'est inscrit. */
export function participantCount(event: LocalContent, registered: boolean): number {
  return (event.participants ?? 0) + (registered ? 1 : 0)
}

/** Inscription simulée à un atelier, enregistrée sur ce navigateur. */
export function Registration({ event, compact }: { event: LocalContent; compact?: boolean }) {
  const { t, tn } = useI18n()
  const { data, toggleRegistration, notify } = useStore()
  const registered = !!data.registrations[event.id]
  const count = participantCount(event, registered)
  return (
    <div className={`registration ${compact ? 'registration--compact' : ''}`}>
      <p className="registration__count">
        <Icon name="people" size={16} />
        {tn('reg.count', count)}
        {registered && (
          <span className="registration__done">
            <Icon name="check" size={14} />
            {t('reg.done')}
          </span>
        )}
      </p>
      <button
        type="button"
        className={`btn btn--sm ${registered ? 'btn--secondary' : 'btn--primary'}`}
        onClick={() => {
          toggleRegistration(event.id)
          notify(t(registered ? 'reg.notice.off' : 'reg.notice.on', { title: event.title }))
        }}
      >
        <span>{registered ? t('reg.cancel') : t('reg.join')}</span>
        <span className="visually-hidden"> : {event.title}</span>
      </button>
      {!compact && <p className="registration__note">{t('reg.note')}</p>}
    </div>
  )
}

export function campaignAsFeed(c: Campaign): FeedItem {
  return { kind: 'national', id: c.id, date: c.publishAt, campaign: c }
}

export function contentAsFeed(c: LocalContent): FeedItem {
  return { kind: 'local', id: c.id, date: c.publishAt, content: c }
}
