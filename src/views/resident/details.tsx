// Fiches détaillées. Utilisées par la vue résident et par les prévisualisations
// de l'administration : ce que l'on prévisualise est exactement ce qui sera affiché.

import type { ReactNode } from 'react'
import type { Campaign, LocalContent } from '../../data/types'
import { useI18n } from '../../i18n'
import { Callout, Icon, RichText, ScopeTag, Tag } from '../../components/ui'
import { ListenButton } from '../../components/ListenButton'
import { Registration } from './cards'

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

interface ResidentOptions {
  /** Lecteur vocal (vue résident). */
  listen?: boolean
  /** Inscription aux ateliers (vue résident). */
  registration?: boolean
}

export function ContentDetail({
  content,
  headingLevel = 1,
  listen,
  registration,
}: { content: LocalContent; headingLevel?: 1 | 2 } & ResidentOptions) {
  const { t, longDate, dateRange, timeRange } = useI18n()
  const H = headingLevel === 1 ? 'h1' : 'h2'
  const when = [dateRange(content.startDate, content.endDate), timeRange(content.startTime, content.endTime)]
    .filter(Boolean)
    .join(', ')
  const isEvent = content.template === 'evenement'
  return (
    <article className="detail">
      <div className="detail__meta">
        <ScopeTag scope="local" />
        <Tag>{t(`tpl.${content.template}`)}</Tag>
        {content.important && <Tag>{t('home.alert.label')}</Tag>}
      </div>
      <H className="detail__title" id={headingLevel === 1 ? 'page-title' : undefined} tabIndex={headingLevel === 1 ? -1 : undefined}>
        {content.title || 'Titre à compléter'}
      </H>
      {content.publishAt && <p className="detail__date">{t('published', { date: longDate(content.publishAt) })}</p>}
      {listen && <ListenButton id={`detail-${content.id}`} title={content.title} text={content.message || content.description} />}
      {(when || content.location) && (
        <dl className="info-list">
          {when && (
            <InfoRow icon="calendar" label={isEvent ? t('detail.whenEvent') : t('detail.when')}>
              {when.charAt(0).toUpperCase() + when.slice(1)}
            </InfoRow>
          )}
          {content.location && (
            <InfoRow icon="pin" label={t('detail.where')}>
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
      {isEvent && registration && <Registration event={content} />}
      {isEvent && content.participation && (
        <Callout tone="info" title={t('detail.participate')} icon="people">
          <p>{content.participation}</p>
        </Callout>
      )}
      {content.contact && (
        <div className="detail__contact">
          <p className="detail__contact-label">{t('detail.contact')}</p>
          <p>{content.contact}</p>
        </div>
      )}
    </article>
  )
}

export function CampaignDetail({
  campaign,
  headingLevel = 1,
  listen,
}: { campaign: Campaign; headingLevel?: 1 | 2 } & ResidentOptions) {
  const { t, longDate } = useI18n()
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
      {campaign.publishAt && <p className="detail__date">{t('published', { date: longDate(campaign.publishAt) })}</p>}
      {listen && (
        <ListenButton
          id={`detail-${campaign.id}`}
          title={campaign.title}
          text={[campaign.summary, campaign.message].filter(Boolean).join('. ')}
        />
      )}
      {campaign.summary && <p className="lead">{campaign.summary}</p>}
      {campaign.message ? <RichText text={campaign.message} /> : <p className="muted">Le message n’est pas encore rédigé.</p>}
      {campaign.contact && (
        <div className="detail__contact">
          <p className="detail__contact-label">{t('detail.contact')}</p>
          <p>{campaign.contact}</p>
        </div>
      )}
      <p className="detail__source">{t('detail.source')}</p>
    </article>
  )
}
