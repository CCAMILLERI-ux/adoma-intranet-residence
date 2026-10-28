// Fiches détaillées. Utilisées par la vue résident et par les prévisualisations
// de l'administration : ce que l'on prévisualise est exactement ce qui sera affiché.

import type { Campaign, LocalContent } from '../../data/types'
import type { ReactNode } from 'react'
import { formatDateRange, formatLongDate, formatTimeRange } from '../../lib/dates'
import { TEMPLATE_LABELS } from '../../lib/visibility'
import { Callout, Icon, RichText, ScopeTag, Tag } from '../../components/ui'

function InfoRow({ icon, label, children }: { icon: Parameters<typeof Icon>[0]['name']; label: string; children: ReactNode }) {
  return (
    <div className="info-row">
      <dt>
        <Icon name={icon} size={18} />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  )
}

export function ContentDetail({ content, headingLevel = 1 }: { content: LocalContent; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? 'h1' : 'h2'
  const when = [formatDateRange(content.startDate, content.endDate), formatTimeRange(content.startTime, content.endTime)]
    .filter(Boolean)
    .join(', ')
  const isEvent = content.template === 'evenement'
  return (
    <article className="detail">
      <div className="detail__meta">
        <ScopeTag scope="local" />
        <Tag>{TEMPLATE_LABELS[content.template]}</Tag>
        {content.important && <Tag>Information importante</Tag>}
      </div>
      <H className="detail__title" id={headingLevel === 1 ? 'page-title' : undefined} tabIndex={headingLevel === 1 ? -1 : undefined}>
        {content.title || 'Titre à compléter'}
      </H>
      {content.publishAt && (
        <p className="detail__date">
          Publié le <time dateTime={content.publishAt}>{formatLongDate(content.publishAt)}</time>
        </p>
      )}
      {(when || content.location) && (
        <dl className="info-list">
          {when && (
            <InfoRow icon="calendar" label={isEvent ? 'Date et horaires' : 'Quand'}>
              {when.charAt(0).toUpperCase() + when.slice(1)}
            </InfoRow>
          )}
          {content.location && (
            <InfoRow icon="pin" label="Lieu">
              {content.location}
            </InfoRow>
          )}
        </dl>
      )}
      {content.message ? (
        <RichText text={content.message} />
      ) : (
        <p className="muted">Le message n’est pas encore rédigé.</p>
      )}
      {isEvent && content.participation && (
        <Callout tone="info" title="Comment participer ?" icon="people">
          <p>{content.participation}</p>
          <p className="small">Pas d’inscription en ligne : passez par le contact indiqué.</p>
        </Callout>
      )}
      {content.contact && (
        <div className="detail__contact">
          <p className="detail__contact-label">Contact utile</p>
          <p>{content.contact}</p>
        </div>
      )}
    </article>
  )
}

export function CampaignDetail({ campaign, headingLevel = 1 }: { campaign: Campaign; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <article className="detail detail--national">
      <div className="detail__meta">
        <ScopeTag scope="national" />
        {campaign.category && <Tag>{campaign.category}</Tag>}
      </div>
      <H className="detail__title" id={headingLevel === 1 ? 'page-title' : undefined} tabIndex={headingLevel === 1 ? -1 : undefined}>
        {campaign.title || 'Titre à compléter'}
      </H>
      {campaign.publishAt && (
        <p className="detail__date">
          Publié le <time dateTime={campaign.publishAt}>{formatLongDate(campaign.publishAt)}</time>
        </p>
      )}
      {campaign.summary && <p className="lead">{campaign.summary}</p>}
      {campaign.message ? <RichText text={campaign.message} /> : <p className="muted">Le message n’est pas encore rédigé.</p>}
      {campaign.contact && (
        <div className="detail__contact">
          <p className="detail__contact-label">Contact utile</p>
          <p>{campaign.contact}</p>
        </div>
      )}
      <p className="detail__source">Information diffusée par l’administration centrale dans plusieurs résidences.</p>
    </article>
  )
}
