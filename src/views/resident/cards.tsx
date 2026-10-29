// Cartes partagées : vue résident, aperçus de l'administration.

import type { Campaign, LocalContent } from '../../data/types'
import { formatDayMonth, formatShortDate, formatTimeRange } from '../../lib/dates'
import type { FeedItem } from '../../lib/visibility'
import { TEMPLATE_LABELS } from '../../lib/visibility'
import { Icon, ScopeTag } from '../../components/ui'

export function excerpt(text: string, max = 150): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return flat.slice(0, flat.lastIndexOf(' ', max)).replace(/[,;:.]$/, '') + '…'
}

export function localSummary(c: LocalContent): string {
  return excerpt(c.description || c.message)
}

export function NewsCard({ item, to }: { item: FeedItem; to?: string }) {
  const isNational = item.kind === 'national'
  const category = isNational ? item.campaign.category : TEMPLATE_LABELS[item.content.template]
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
      <p className="news-card__date">
        Publié le <time dateTime={item.date}>{formatShortDate(item.date)}</time>
      </p>
    </article>
  )
}

export function EventCard({ event, to }: { event: LocalContent; to?: string }) {
  const { day, month } = formatDayMonth(event.startDate)
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
            <time dateTime={event.startDate}>{formatShortDate(event.startDate)}</time>
            {event.startTime && `, ${formatTimeRange(event.startTime, event.endTime)}`}
          </span>
        </p>
        {event.location && (
          <p className="event-card__info">
            <Icon name="pin" size={16} />
            {event.location}
          </p>
        )}
      </div>
    </article>
  )
}

export function campaignAsFeed(c: Campaign): FeedItem {
  return { kind: 'national', id: c.id, date: c.publishAt, campaign: c }
}

export function contentAsFeed(c: LocalContent): FeedItem {
  return { kind: 'local', id: c.id, date: c.publishAt, content: c }
}
