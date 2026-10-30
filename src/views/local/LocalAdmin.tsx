// Administration de résidence : liste des contenus, création, publication, retrait, affiche.

import { useState } from 'react'
import type { DisplayStatus, LocalContent, Residence } from '../../data/types'
import { href, type Route } from '../../lib/router'
import { useStore } from '../../lib/store'
import { formatShortDate, today } from '../../lib/dates'
import { displayStatus, STATUS_LABELS, TEMPLATE_LABELS } from '../../lib/visibility'
import { AdminShell } from '../../components/AdminShell'
import { Button, Callout, ConfirmDialog, EmptyState, Icon, PageTitle, StatusBadge } from '../../components/ui'
import { ContentForm } from './ContentForm'
import { Poster } from './Poster'
import { ReportsAdmin, newReportsCount } from './ReportsAdmin'
import { participantCount } from '../resident/cards'

export function LocalAdmin({ route }: { route: Route }) {
  const { data } = useStore()
  const residence = data.residences.find((r) => r.id === route.residenceId)!
  const link = (...path: string[]) => href({ residenceId: residence.id, view: 'gestion', path })
  const [page = '', id] = route.path

  const newReports = newReportsCount(data.reports, residence.id)
  const find = (cid?: string) => data.contents.find((c) => c.id === cid && c.residenceId === residence.id)

  let body
  if (page === 'nouveau') body = <ContentForm key="new" residence={residence} link={link} />
  else if (page === 'modifier' && find(id)) body = <ContentForm key={id} residence={residence} link={link} existing={find(id)} />
  else if (page === 'publie' && find(id)) body = <Published content={find(id)!} residence={residence} link={link} />
  else if (page === 'affiche' && find(id)) return <Poster content={find(id)!} residence={residence} backHref={link()} />
  else if (page === 'signalements') body = <ReportsAdmin residence={residence} />
  else body = <Dashboard residence={residence} link={link} />

  return (
    <AdminShell
      space="Administration de résidence"
      context={residence.name}
      nav={[
        { href: link(), label: 'Tableau de bord', icon: 'doc', current: page === '' },
        { href: link('nouveau'), label: 'Créer une information', icon: 'plus', current: page === 'nouveau' },
        {
          href: link('signalements'),
          label: newReports ? `Signalements (${newReports} nouveau${newReports > 1 ? 'x' : ''})` : 'Signalements',
          icon: 'tool',
          current: page === 'signalements',
        },
        {
          href: href({ residenceId: residence.id, view: 'resident', path: [] }),
          label: 'Aperçu de l’espace résident',
          icon: 'eye',
          current: false,
        },
      ]}
    >
      {body}
    </AdminShell>
  )
}

type Link = (...path: string[]) => string
type Filter = 'tous' | DisplayStatus

function Dashboard({ residence, link }: { residence: Residence; link: Link }) {
  const { data, setContentStatus, notify } = useStore()
  const now = today()
  const [filter, setFilter] = useState<Filter>('tous')
  const [withdrawing, setWithdrawing] = useState<LocalContent | null>(null)

  const contents = data.contents
    .filter((c) => c.residenceId === residence.id)
    .map((c) => ({ c, status: displayStatus(c, now) }))
    .sort((a, b) => b.c.updatedAt.localeCompare(a.c.updatedAt))
  const counts = contents.reduce<Record<string, number>>((acc, { status }) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }), {})
  const visible = filter === 'tous' ? contents : contents.filter((x) => x.status === filter)
  const campaigns = data.campaigns.filter((c) => c.residenceIds.includes(residence.id))
  const residentLink = (...p: string[]) => href({ residenceId: residence.id, view: 'resident', path: p })

  const filters: Filter[] = ['tous', 'publie', 'programme', 'brouillon', 'expire', 'retire']

  return (
    <>
      <PageTitle eyebrow={residence.name} lead="Publiez les informations locales de votre résidence. Elles s’affichent uniquement dans cette résidence.">
        Tableau de bord
      </PageTitle>

      {newReportsCount(data.reports, residence.id) > 0 && (
        <div className="alert-banner">
          <span className="alert-banner__icon">
            <Icon name="tool" />
          </span>
          <div>
            <p className="alert-banner__label">Signalements de panne</p>
            <p className="alert-banner__title">
              {newReportsCount(data.reports, residence.id)} nouveau
              {newReportsCount(data.reports, residence.id) > 1 ? 'x signalements à traiter' : ' signalement à traiter'}
            </p>
          </div>
          <a className="alert-banner__link" href={link('signalements')}>
            Voir les signalements
            <Icon name="arrow" size={18} />
          </a>
        </div>
      )}
      <div className="action-row">
        <Button href={link('nouveau')} icon="plus">
          Créer une information
        </Button>
        <Button href={residentLink()} variant="secondary" icon="eye">
          Aperçu de l’espace résident
        </Button>
      </div>

      <section aria-labelledby="local-title" className="stack-md">
        <h2 id="local-title">Informations de la résidence</h2>
        <div className="filters" role="group" aria-label="Filtrer par statut">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className="filter"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'tous' ? 'Tous' : STATUS_LABELS[f]} <span className="filter__count">({f === 'tous' ? contents.length : (counts[f] ?? 0)})</span>
            </button>
          ))}
        </div>

        {visible.length ? (
          <ul className="admin-list plain-list">
            {visible.map(({ c, status }) => (
              <li key={c.id} className="admin-row">
                <div className="admin-row__main">
                  <div className="admin-row__meta">
                    <StatusBadge status={status} />
                    <span className="muted small">{TEMPLATE_LABELS[c.template]}</span>
                    {c.important && <span className="muted small">· Bandeau d’accueil</span>}
                    {c.template === 'evenement' && (
                      <span className="muted small">
                        · {participantCount(c, !!data.registrations[c.id])} inscrit
                        {participantCount(c, !!data.registrations[c.id]) > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="admin-row__title">{c.title || 'Sans titre'}</h3>
                  <p className="admin-row__dates small">
                    Publication : {c.publishAt ? formatShortDate(c.publishAt) : 'non définie'} · Expiration :{' '}
                    {c.expireAt ? formatShortDate(c.expireAt) : 'non définie'}
                  </p>
                </div>
                <div className="admin-row__actions">
                  <Button size="sm" variant="secondary" icon="edit" href={link('modifier', c.id)}>
                    Modifier<span className="visually-hidden"> : {c.title}</span>
                  </Button>
                  <Button size="sm" variant="secondary" icon="print" href={link('affiche', c.id)}>
                    Affiche<span className="visually-hidden"> : {c.title}</span>
                  </Button>
                  {(status === 'publie' || status === 'programme') && (
                    <Button size="sm" variant="ghost" icon="close" onClick={() => setWithdrawing(c)}>
                      Retirer<span className="visually-hidden"> : {c.title}</span>
                    </Button>
                  )}
                  {status === 'publie' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="eye"
                      href={residentLink(c.template === 'evenement' ? 'agenda' : 'actualites', c.id)}
                    >
                      Voir<span className="visually-hidden"> : {c.title}</span>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Aucun contenu avec ce statut." />
        )}
      </section>

      <section aria-labelledby="national-title" className="stack-md">
        <h2 id="national-title">Campagnes nationales diffusées ici</h2>
        <Callout tone="neutral" title="Gérées par l’administration centrale">
          <p>Le texte des campagnes nationales n’est pas modifiable depuis la résidence.</p>
        </Callout>
        {campaigns.length ? (
          <ul className="admin-list plain-list">
            {campaigns.map((c) => {
              const status = displayStatus(c, now)
              return (
                <li key={c.id} className="admin-row admin-row--national">
                  <div className="admin-row__main">
                    <div className="admin-row__meta">
                      <StatusBadge status={status} />
                      <span className="muted small">Campagne nationale · {c.category}</span>
                    </div>
                    <h3 className="admin-row__title">{c.title}</h3>
                    <p className="admin-row__dates small">
                      Publication : {formatShortDate(c.publishAt)} · Expiration : {c.expireAt ? formatShortDate(c.expireAt) : 'non définie'}
                    </p>
                  </div>
                  <div className="admin-row__actions">
                    {status === 'publie' && (
                      <Button size="sm" variant="ghost" icon="eye" href={residentLink('actualites', c.id)}>
                        Voir<span className="visually-hidden"> : {c.title}</span>
                      </Button>
                    )}
                    <span className="small muted">
                      <Icon name="info" size={16} /> Lecture seule
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState title="Aucune campagne nationale pour cette résidence." />
        )}
      </section>

      <ConfirmDialog
        open={!!withdrawing}
        title="Retirer cette information ?"
        confirmLabel="Oui, retirer"
        danger
        onCancel={() => setWithdrawing(null)}
        onConfirm={() => {
          if (!withdrawing) return
          setContentStatus(withdrawing.id, 'retire')
          notify(`« ${withdrawing.title} » est retirée. Elle n’apparaît plus dans l’espace résident.`)
          setWithdrawing(null)
        }}
      >
        <p>
          « {withdrawing?.title} » ne sera plus visible par les résidents. Vous pourrez la modifier et la publier à
          nouveau plus tard.
        </p>
      </ConfirmDialog>
    </>
  )
}

function Published({ content, residence, link }: { content: LocalContent; residence: Residence; link: Link }) {
  const status = displayStatus(content, today())
  const residentPath = content.template === 'evenement' ? 'agenda' : 'actualites'
  return (
    <div className="stack-lg reading">
      <PageTitle eyebrow={residence.name}>
        {status === 'programme' ? 'Information programmée' : 'Information publiée'}
      </PageTitle>
      <Callout tone="success" title={content.title}>
        <p>
          {status === 'programme'
            ? `Elle sera visible dans l’espace résident à partir du ${formatShortDate(content.publishAt)}, uniquement pour ${residence.name}.`
            : `Elle est visible dans l’espace résident de ${residence.name}, et seulement dans cette résidence.`}
        </p>
        {content.expireAt && <p>Elle disparaîtra automatiquement après le {formatShortDate(content.expireAt)}.</p>}
      </Callout>
      <div className="action-row">
        <Button href={link('affiche', content.id)} icon="print">
          Préparer l’affiche à imprimer
        </Button>
        {status === 'publie' && (
          <Button
            href={href({ residenceId: residence.id, view: 'resident', path: [residentPath, content.id] })}
            variant="secondary"
            icon="eye"
          >
            Voir dans l’espace résident
          </Button>
        )}
        <Button href={link()} variant="ghost" icon="back">
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}
