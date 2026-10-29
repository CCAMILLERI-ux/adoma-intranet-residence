// Administration centrale : vue d'ensemble des résidences et campagnes communes.

import { useState } from 'react'
import type { Campaign } from '../../data/types'
import { addDays, formatShortDate, today } from '../../lib/dates'
import { href, type Route } from '../../lib/router'
import { newId, useStore } from '../../lib/store'
import { displayStatus, residentAlerts, residentEvents, residentNews } from '../../lib/visibility'
import { AdminShell } from '../../components/AdminShell'
import { ErrorSummary, Field, focusSoon } from '../../components/form'
import { Button, Callout, ConfirmDialog, EmptyState, PageTitle, StatusBadge, Stepper } from '../../components/ui'
import { CampaignDetail } from '../resident/details'
import { NewsCard, campaignAsFeed } from '../resident/cards'

const CATEGORIES = ['Énergie', 'Sécurité', 'Santé', 'Vie collective', 'Information']

export function CentralAdmin({ route }: { route: Route }) {
  const { data } = useStore()
  const link = (...path: string[]) => href({ residenceId: route.residenceId, view: 'central', path })
  const [page = '', id] = route.path
  const existing = data.campaigns.find((c) => c.id === id)

  let body
  if (page === 'nouvelle') body = <CampaignForm key="new" link={link} />
  else if (page === 'modifier' && existing) body = <CampaignForm key={id} link={link} existing={existing} />
  else body = <Overview link={link} />

  return (
    <AdminShell
      space="Administration centrale"
      context="Toutes les résidences"
      nav={[
        { href: link(), label: 'Vue d’ensemble', icon: 'globe', current: page === '' },
        { href: link('nouvelle'), label: 'Créer une campagne', icon: 'plus', current: page === 'nouvelle' },
      ]}
    >
      {body}
    </AdminShell>
  )
}

type Link = (...p: string[]) => string

function Overview({ link }: { link: Link }) {
  const { data, setCampaignStatus, notify } = useStore()
  const now = today()
  const [withdrawing, setWithdrawing] = useState<Campaign | null>(null)
  const campaigns = [...data.campaigns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const names = (ids: string[]) =>
    ids.map((id) => data.residences.find((r) => r.id === id)?.name.replace('Résidence ', '')).join(' et ')

  return (
    <>
      <PageTitle
        eyebrow="Réseau de résidences (démonstration)"
        lead="Consultez les résidences et diffusez des campagnes communes. Chaque résidence garde ses propres informations locales."
      >
        Vue d’ensemble
      </PageTitle>
      <div className="action-row">
        <Button href={link('nouvelle')} icon="plus">
          Créer une campagne
        </Button>
      </div>

      <section aria-labelledby="res-title" className="stack-md">
        <h2 id="res-title">Résidences</h2>
        <ul className="card-grid card-grid--2 plain-list">
          {data.residences.map((r) => {
            const local = data.contents.filter((c) => c.residenceId === r.id)
            const stats = [
              { label: 'Actualités visibles', value: residentNews(data, r.id, now).filter((n) => n.kind === 'local').length },
              { label: 'Événements à venir', value: residentEvents(data, r.id, now).length },
              { label: 'Campagnes visibles', value: residentNews(data, r.id, now).filter((n) => n.kind === 'national').length },
              { label: 'Brouillons', value: local.filter((c) => c.status === 'brouillon').length },
              { label: 'Alertes actives', value: residentAlerts(data, r.id, now).length },
            ]
            return (
              <li key={r.id} className="card card--padded residence-card">
                <p className="eyebrow eyebrow--red">{r.kind}</p>
                <h3>{r.name}</h3>
                <p className="muted small">{r.address}</p>
                <dl className="stats">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="action-row">
                  <Button size="sm" variant="secondary" icon="eye" href={href({ residenceId: r.id, view: 'resident', path: [] })}>
                    Espace résident<span className="visually-hidden"> — {r.name}</span>
                  </Button>
                  <Button size="sm" variant="ghost" href={href({ residenceId: r.id, view: 'gestion', path: [] })}>
                    Administration locale<span className="visually-hidden"> — {r.name}</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="camp-title" className="stack-md">
        <h2 id="camp-title">Campagnes communes</h2>
        {campaigns.length ? (
          <ul className="admin-list plain-list">
            {campaigns.map((c) => {
              const status = displayStatus(c, now)
              return (
                <li key={c.id} className="admin-row admin-row--national">
                  <div className="admin-row__main">
                    <div className="admin-row__meta">
                      <StatusBadge status={status} />
                      <span className="muted small">{c.category}</span>
                    </div>
                    <h3 className="admin-row__title">{c.title}</h3>
                    <p className="small">Résidences ciblées : {names(c.residenceIds)}</p>
                    <p className="admin-row__dates small">
                      Publication : {formatShortDate(c.publishAt)} · Expiration : {c.expireAt ? formatShortDate(c.expireAt) : 'non définie'}
                    </p>
                  </div>
                  <div className="admin-row__actions">
                    <Button size="sm" variant="secondary" icon="edit" href={link('modifier', c.id)}>
                      Modifier<span className="visually-hidden"> : {c.title}</span>
                    </Button>
                    {(status === 'publie' || status === 'programme') && (
                      <Button size="sm" variant="ghost" icon="close" onClick={() => setWithdrawing(c)}>
                        Retirer<span className="visually-hidden"> : {c.title}</span>
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState title="Aucune campagne pour le moment." />
        )}
      </section>

      <ConfirmDialog
        open={!!withdrawing}
        title="Retirer cette campagne ?"
        confirmLabel="Oui, retirer"
        danger
        onCancel={() => setWithdrawing(null)}
        onConfirm={() => {
          if (!withdrawing) return
          setCampaignStatus(withdrawing.id, 'retire')
          notify(`Campagne « ${withdrawing.title} » retirée de toutes les résidences ciblées.`)
          setWithdrawing(null)
        }}
      >
        <p>« {withdrawing?.title} » disparaîtra des espaces résidents : {withdrawing && names(withdrawing.residenceIds)}.</p>
      </ConfirmDialog>
    </>
  )
}

const ENERGY_EXAMPLE = {
  category: 'Énergie',
  title: 'Réduire sa consommation d’énergie cet hiver',
  summary: 'Quelques gestes simples pour avoir chaud et dépenser moins d’énergie.',
  message:
    'L’hiver arrive. Quelques gestes simples permettent de consommer moins d’énergie :\n\n1. Réglez le chauffage à 19 °C dans la pièce principale. Baissez-le quand vous êtes absent.\n2. Fermez les volets et les rideaux la nuit.\n3. Éteignez les appareils au lieu de les laisser en veille.\n4. Ne couvrez pas les radiateurs et ne bouchez pas les aérations.\n\nUn radiateur ne chauffe pas ? Signalez-le à l’accueil de votre résidence.',
  contact: 'Accueil de votre résidence',
}

function emptyCampaign(residenceIds: string[]): Campaign {
  const now = new Date().toISOString()
  return {
    id: newId('campagne'),
    residenceIds,
    category: 'Information',
    title: '',
    summary: '',
    message: '',
    contact: '',
    publishAt: today(),
    expireAt: '',
    status: 'brouillon',
    createdAt: now,
    updatedAt: now,
  }
}

const LABELS: Record<string, string> = {
  title: 'Titre',
  summary: 'Résumé',
  message: 'Message',
  residences: 'Résidences ciblées',
  publishAt: 'Date de publication',
  expireAt: 'Date d’expiration',
}

function CampaignForm({ link, existing }: { link: Link; existing?: Campaign }) {
  const { data, saveCampaign, notify } = useStore()
  const [c, setC] = useState<Campaign>(() => existing ?? emptyCampaign(data.residences.map((r) => r.id)))
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof Campaign>(key: K, value: Campaign[K]) => {
    setC((prev) => ({ ...prev, [key]: value }))
    const k = key === 'residenceIds' ? 'residences' : (key as string)
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest)
  }

  const toggleResidence = (id: string, on: boolean) =>
    set('residenceIds', on ? [...c.residenceIds, id] : c.residenceIds.filter((x) => x !== id))

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!c.title.trim()) e.title = 'indiquez un titre.'
    if (!c.summary.trim()) e.summary = 'indiquez un résumé en une phrase.'
    if (!c.message.trim()) e.message = 'rédigez le message.'
    if (!c.residenceIds.length) e.residences = 'sélectionnez au moins une résidence.'
    if (!c.publishAt) e.publishAt = 'indiquez la date de publication.'
    if (!c.expireAt) e.expireAt = 'indiquez une date d’expiration.'
    else if (c.expireAt < c.publishAt) e.expireAt = 'la date d’expiration doit être après la date de publication.'
    return e
  }

  const targets = data.residences.filter((r) => c.residenceIds.includes(r.id))

  const publish = () => {
    // Ordre des résidences stable, quel que soit l'ordre des clics.
    const saved: Campaign = { ...c, residenceIds: targets.map((r) => r.id), status: 'publie' }
    saveCampaign(saved)
    notify(
      displayStatus(saved, today()) === 'programme'
        ? `Campagne programmée pour le ${formatShortDate(saved.publishAt)} : ${targets.map((r) => r.name).join(', ')}.`
        : `Campagne publiée dans : ${targets.map((r) => r.name).join(', ')}.`,
    )
    window.location.hash = link()
  }

  if (step === 'preview') {
    return (
      <div className="stack-lg">
        <PageTitle eyebrow={existing ? 'Modifier' : 'Créer'} lead="Vérifiez la campagne telle qu’elle apparaîtra dans chaque espace résident ciblé.">
          Prévisualisation de la campagne
        </PageTitle>
        <Stepper steps={['Saisie', 'Prévisualisation et publication']} current={1} />
        <div className="summary-box">
          <dl className="summary-list">
            <div>
              <dt>Résidences ciblées</dt>
              <dd>{targets.map((r) => r.name).join(', ')}</dd>
            </div>
            <div>
              <dt>Publication</dt>
              <dd>{formatShortDate(c.publishAt)}</dd>
            </div>
            <div>
              <dt>Expiration</dt>
              <dd>Après le {formatShortDate(c.expireAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="preview-grid">
          <section aria-labelledby="prev-card" className="stack-sm">
            <h2 id="prev-card" className="h4">
              Dans la liste des actualités
            </h2>
            {targets.map((r) => (
              <div key={r.id} className="preview-frame">
                <p className="preview-frame__label">{r.name}</p>
                <NewsCard item={campaignAsFeed(c)} />
              </div>
            ))}
          </section>
          <section aria-labelledby="prev-detail" className="stack-sm">
            <h2 id="prev-detail" className="h4">
              Page de détail
            </h2>
            <div className="preview-frame">
              <CampaignDetail campaign={c} headingLevel={2} />
            </div>
          </section>
        </div>
        <div className="action-row action-row--sticky">
          <Button icon="check" onClick={publish}>
            {existing?.status === 'publie' ? 'Publier les modifications' : `Publier dans ${targets.length > 1 ? `les ${targets.length} résidences` : '1 résidence'}`}
          </Button>
          <Button
            variant="secondary"
            icon="edit"
            onClick={() => {
              setStep('form')
              focusSoon('page-title')
            }}
          >
            Revenir au formulaire
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <PageTitle
        eyebrow={existing ? 'Modifier' : 'Créer'}
        lead="Une campagne commune s’affiche dans les résidences choisies, avec la mention « Campagne nationale ». Les résidences ne peuvent pas modifier son texte."
      >
        {existing ? 'Modifier une campagne' : 'Créer une campagne commune'}
      </PageTitle>
      <Stepper steps={['Saisie', 'Prévisualisation et publication']} current={0} />

      {!existing && (
        <div className="demo-hint">
          <p>
            <strong>Démonstration :</strong> remplir avec l’exemple « conseils pour réduire sa consommation d’énergie ».
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setC((prev) => ({ ...prev, ...ENERGY_EXAMPLE, expireAt: addDays(today(), 45) }))
              setErrors({})
              notify('Exemple de démonstration rempli. Vous pouvez modifier chaque champ.')
            }}
          >
            Utiliser l’exemple
          </Button>
        </div>
      )}

      <ErrorSummary errors={errors} labels={LABELS} />

      <form
        className="form stack-lg"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const errs = validate()
          setErrors(errs)
          if (Object.keys(errs).length) return focusSoon('error-summary')
          setStep('preview')
          focusSoon('page-title')
        }}
      >
        <fieldset className="form-section" aria-describedby={errors.residences ? 'residences-error' : undefined}>
          <legend>1. Résidences ciblées</legend>
          <div className="checkbox-group" id="residences" tabIndex={-1}>
            {data.residences.map((r) => (
              <label key={r.id} className="checkbox">
                <input type="checkbox" checked={c.residenceIds.includes(r.id)} onChange={(e) => toggleResidence(r.id, e.target.checked)} />
                <span>
                  {r.name} <span className="muted">— {r.kind}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.residences && (
            <p className="field__error" id="residences-error">
              Erreur : {errors.residences}
            </p>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Contenu de la campagne</legend>
          <Field id="category" label="Thème" required>
            {(p) => (
              <select {...p} className="input" value={c.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            )}
          </Field>
          <Field id="title" label="Titre" required error={errors.title}>
            {(p) => <input {...p} className="input" value={c.title} onChange={(e) => set('title', e.target.value)} maxLength={90} />}
          </Field>
          <Field id="summary" label="Résumé" required error={errors.summary} hint="Une phrase, affichée sur la carte de l’actualité.">
            {(p) => <input {...p} className="input" value={c.summary} onChange={(e) => set('summary', e.target.value)} maxLength={160} />}
          </Field>
          <Field id="message" label="Message" required error={errors.message} hint="Phrases courtes. Une idée par ligne.">
            {(p) => <textarea {...p} className="input input--message" rows={10} value={c.message} onChange={(e) => set('message', e.target.value)} />}
          </Field>
          <Field id="contact" label="Contact utile">
            {(p) => <input {...p} className="input" value={c.contact} onChange={(e) => set('contact', e.target.value)} />}
          </Field>
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Publication</legend>
          <div className="field-row">
            <Field id="publishAt" label="Date de publication" required error={errors.publishAt}>
              {(p) => <input {...p} type="date" className="input" value={c.publishAt} onChange={(e) => set('publishAt', e.target.value)} />}
            </Field>
            <Field id="expireAt" label="Date d’expiration" required error={errors.expireAt} hint="Dernier jour d’affichage.">
              {(p) => <input {...p} type="date" className="input" value={c.expireAt} onChange={(e) => set('expireAt', e.target.value)} />}
            </Field>
          </div>
        </fieldset>

        {existing && existing.status !== 'brouillon' && (
          <Callout tone="info" title="Modification d’une campagne existante">
            <p>Après publication, le nouveau texte remplace l’ancien dans toutes les résidences ciblées.</p>
          </Callout>
        )}

        <div className="action-row action-row--sticky">
          <Button type="submit" iconAfter="arrow">
            Prévisualiser avant publication
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!c.title.trim()) {
                setErrors({ title: 'indiquez un titre.' })
                return focusSoon('error-summary')
              }
              saveCampaign({ ...c, status: 'brouillon' })
              notify(`Brouillon de campagne enregistré : « ${c.title} ». Il n’est visible dans aucune résidence.`)
              window.location.hash = link()
            }}
          >
            Enregistrer le brouillon
          </Button>
          <Button variant="ghost" href={link()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
