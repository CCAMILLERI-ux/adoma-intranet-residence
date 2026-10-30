// Signalements de panne reçus par la résidence (déposés depuis la vue résident).
// Simulation : les statuts sont enregistrés sur ce navigateur ; aucun message n'est envoyé.

import { useState } from 'react'
import type { Report, ReportStatus, Residence } from '../../data/types'
import { useI18n } from '../../i18n'
import { useStore } from '../../lib/store'
import { Button, Callout, EmptyState, Icon, PageTitle } from '../../components/ui'

type Filter = 'tous' | ReportStatus
const FILTERS: Filter[] = ['tous', 'recu', 'en-cours', 'resolu']

export function newReportsCount(reports: Report[], residenceId: string): number {
  return reports.filter((r) => r.residenceId === residenceId && r.status === 'recu').length
}

export function ReportsAdmin({ residence }: { residence: Residence }) {
  const { t, dateTime } = useI18n()
  const { data, setReportStatus, notify } = useStore()
  const [filter, setFilter] = useState<Filter>('tous')
  const all = data.reports
    .filter((r) => r.residenceId === residence.id)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.createdAt.localeCompare(a.createdAt))
  const shown = filter === 'tous' ? all : all.filter((r) => r.status === filter)
  const count = (f: Filter) => (f === 'tous' ? all.length : all.filter((r) => r.status === f).length)

  const change = (r: Report, status: ReportStatus) => {
    setReportStatus(r.id, status)
    notify(`${r.reference} : statut « ${t(`status.${status}`)} ». Le résident voit ce statut dans son espace.`)
  }

  return (
    <>
      <PageTitle eyebrow={residence.name} lead="Les pannes signalées par les résidents depuis leur espace. Le statut que vous choisissez s’affiche aussi côté résident.">
        Signalements de panne
      </PageTitle>
      <Callout tone="neutral" title="Simulation">
        <p>Les signalements sont enregistrés sur ce navigateur. Aucun message n’est envoyé, aucun ticket n’est créé dans un outil de maintenance.</p>
      </Callout>

      <div className="filters" role="group" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'tous' ? 'Tous' : t(`status.${f}`)} <span className="filter__count">({count(f)})</span>
          </button>
        ))}
      </div>

      {shown.length ? (
        <ul className="admin-list plain-list">
          {shown.map((r) => (
            <li key={r.id} className={`admin-row admin-row--report ${r.urgent ? 'is-urgent' : ''}`}>
              <div className="admin-row__main">
                <div className="admin-row__meta">
                  <span className={`badge badge--report-${r.status}`}>{t(`status.${r.status}`)}</span>
                  {r.urgent && (
                    <span className="badge badge--urgent">
                      <Icon name="alert" size={14} />
                      Urgent
                    </span>
                  )}
                  <span className="muted small">{r.reference}</span>
                </div>
                <h3 className="admin-row__title">
                  {t(`cat.${r.category}`)} · Logement {r.unit}
                </h3>
                <p className="report-row__desc">« {r.description} »</p>
                <p className="admin-row__dates small">
                  Reçu le {dateTime(r.createdAt)}
                  {r.updatedAt !== r.createdAt && ` · mis à jour le ${dateTime(r.updatedAt)}`}
                  {r.mine && ' · déposé depuis la vue résident de ce navigateur'}
                </p>
              </div>
              <div className="admin-row__actions">
                {r.status === 'recu' && (
                  <Button size="sm" variant="secondary" icon="tool" onClick={() => change(r, 'en-cours')}>
                    Prendre en charge<span className="visually-hidden"> : {r.reference}</span>
                  </Button>
                )}
                {r.status !== 'resolu' && (
                  <Button size="sm" variant="secondary" icon="check" onClick={() => change(r, 'resolu')}>
                    Marquer comme résolu<span className="visually-hidden"> : {r.reference}</span>
                  </Button>
                )}
                {r.status === 'resolu' && (
                  <Button size="sm" variant="ghost" icon="undo" onClick={() => change(r, 'en-cours')}>
                    Rouvrir<span className="visually-hidden"> : {r.reference}</span>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucun signalement avec ce statut." />
      )}
    </>
  )
}
